"""Unit tests: configuration, retry, logging, SQL splitting and the schema contract with the Express app."""
import io
import json
import logging
import re
import unittest
from pathlib import Path

import logging_config
from config import ConfigError, load_config
from load import split_sql_statements
from retry import is_transient_error, retry_call
from tests.helpers import InjectedFailure, OperationalError, make_warehouse

REPO = Path(__file__).resolve().parents[2]
GOOD_ENV = {
    "DB_HOST": "src", "DB_USER": "u", "DB_PASS": "super-secret-src", "DB_NAME": "rr",
    "WAREHOUSE_HOST": "wh", "WAREHOUSE_USER": "w", "WAREHOUSE_PASSWORD": "super-secret-wh", "WAREHOUSE_NAME": "dw",
}


class Config(unittest.TestCase):
    def test_valid_config_and_defaults(self):
        cfg = load_config(GOOD_ENV)
        self.assertEqual((cfg.source.port, cfg.warehouse.port, cfg.settings.batch_size), (3306, 5432, 500))

    def test_missing_variables_are_listed_without_values(self):
        with self.assertRaises(ConfigError) as ctx:
            load_config({"DB_PASS": "leaky-value"})
        msg = str(ctx.exception)
        for name in ("DB_HOST", "DB_USER", "DB_NAME", "WAREHOUSE_HOST", "WAREHOUSE_PASSWORD"):
            self.assertIn(name, msg)
        self.assertNotIn("leaky-value", msg)

    def test_secrets_not_in_repr(self):
        cfg = load_config(GOOD_ENV)
        self.assertNotIn("super-secret", repr(cfg))

    def test_invalid_numbers_rejected(self):
        for env in ({"ETL_BATCH_SIZE": "0"}, {"ETL_BATCH_SIZE": "abc"}, {"DB_PORT": "99999"}, {"ETL_MAX_RETRIES": "0"}):
            with self.assertRaises(ConfigError, msg=str(env)):
                load_config({**GOOD_ENV, **env})

    def test_warehouse_url_alternative(self):
        env = {k: v for k, v in GOOD_ENV.items() if not k.startswith("WAREHOUSE_")}
        cfg = load_config({**env, "WAREHOUSE_URL": "postgresql+psycopg://u:p@h:5432/d"})
        self.assertNotIn("p@h", repr(cfg))
        with self.assertRaises(ConfigError):
            load_config({**env, "WAREHOUSE_URL": "mysql://u:p@h/d"})

    def test_ssl_ca_escapes_expanded(self):
        cfg = load_config({**GOOD_ENV, "DB_SSL_CA": "A\\nB"})
        self.assertTrue(cfg.source.ssl)
        self.assertEqual(cfg.source.ssl_ca, "A\nB")


class Retry(unittest.TestCase):
    def test_transient_error_is_retried_with_backoff_then_succeeds(self):
        calls, sleeps = [], []

        def flaky():
            calls.append(1)
            if len(calls) < 3:
                raise OperationalError("connection lost")
            return "ok"

        self.assertEqual(retry_call(flaky, attempts=3, base_delay=1.0, sleep=sleeps.append), "ok")
        self.assertEqual((len(calls), sleeps), (3, [1.0, 2.0]))

    def test_gives_up_after_bounded_attempts(self):
        calls = []

        def always():
            calls.append(1)
            raise ConnectionError("down")

        with self.assertRaises(ConnectionError):
            retry_call(always, attempts=3, base_delay=0, sleep=lambda s: None)
        self.assertEqual(len(calls), 3)

    def test_permanent_errors_are_not_retried(self):
        calls = []

        def broken():
            calls.append(1)
            raise InjectedFailure("bad")

        with self.assertRaises(InjectedFailure):
            retry_call(broken, attempts=5, base_delay=0, sleep=lambda s: None)
        self.assertEqual(len(calls), 1)

    def test_wrapped_driver_errors_are_detected(self):
        wrapper = Exception("sqlalchemy wrapper")
        wrapper.orig = OperationalError("inner")
        self.assertTrue(is_transient_error(wrapper))
        self.assertFalse(is_transient_error(ValueError("x")))


class Logging(unittest.TestCase):
    def test_json_lines_with_run_id_and_redaction(self):
        stream = io.StringIO()
        logging_config.configure_logging("INFO", stream)
        logging_config.set_run_id("run-123")
        logging_config.log_event(logging.getLogger("etl.test"), logging.INFO, "hello", rows=3, password="p", comment="text")
        logging_config.set_run_id(None)
        payload = json.loads(stream.getvalue().strip())
        self.assertEqual((payload["event"], payload["run_id"], payload["rows"]), ("hello", "run-123", 3))
        self.assertEqual((payload["password"], payload["comment"]), ("<redacted>", "<redacted>"))


class SqlAndSchema(unittest.TestCase):
    def test_split_sql_statements(self):
        sql = "-- c1\nCREATE TABLE a (x INT); -- c2\nCREATE INDEX i ON a (x);\n"
        self.assertEqual(split_sql_statements(sql), ["CREATE TABLE a (x INT)", "CREATE INDEX i ON a (x)"])

    def test_schema_is_idempotent(self):
        db = make_warehouse()
        from load import SCHEMA_PATH, init_schema
        from tests.helpers import pg_to_sqlite
        init_schema(db, pg_to_sqlite(Path(SCHEMA_PATH).read_text(encoding="utf-8")))  # second run must not fail

    def test_warehouse_constraints_are_enforced(self):
        import sqlite3
        db = make_warehouse()
        with db.begin() as c:
            c.execute("INSERT INTO etl_run (run_id, pipeline_name, mode, status) VALUES ('r','p','full','running')")
            c.execute("INSERT INTO dim_book (source_book_id,title,author,genre,row_hash) VALUES (1,'t','a','g','h')")
            c.execute("INSERT INTO dim_date VALUES (20261001,'2026-10-01',1,10,'October',4,2026,4,0)")
        base = "INSERT INTO fact_reviews (source_review_id,book_key,date_key,reviewed_at,rating,review_length,load_run_id) VALUES "
        bad = {
            "rating 9": base + "(1,1,20261001,'2026-10-01',9,1,'r')",
            "missing book": base + "(2,77,20261001,'2026-10-01',3,1,'r')",
            "missing date": base + "(3,1,19990101,'2026-10-01',3,1,'r')",
        }
        for label, sql in bad.items():
            with self.assertRaises(sqlite3.IntegrityError, msg=label):
                with db.begin() as c:
                    c.execute(sql)
        with self.assertRaises(sqlite3.IntegrityError):  # duplicate source_book_id
            with db.begin() as c:
                c.execute("INSERT INTO dim_book (source_book_id,title,author,genre,row_hash) VALUES (1,'t','a','g','h')")

    def test_pipeline_expectations_match_the_express_app_schema(self):
        """If server/sql/schema.sql changes columns the pipeline reads, fail loudly here."""
        schema = REPO / "server" / "sql" / "schema.sql"
        if not schema.exists():
            self.skipTest("server/sql/schema.sql not found")
        text = schema.read_text(encoding="utf-8")

        def columns(table):
            body = re.search(rf"CREATE TABLE IF NOT EXISTS {table} \((.*?)\n\);", text, re.S).group(1)
            return {line.split()[0] for line in body.splitlines() if line.strip() and not line.strip().startswith(("CONSTRAINT", "INDEX"))}

        self.assertTrue({"review_id", "book_id", "rating", "comment", "reviewer", "created_at"} <= columns("reviews"))
        self.assertTrue({"book_id", "title", "author", "genre"} <= columns("books"))
        import extract
        for table, cols in (("reviews", ("review_id", "book_id", "rating", "comment", "reviewer", "created_at")),):
            for c in cols:
                self.assertIn(c, extract.SQL_REVIEWS_PAGE)


if __name__ == "__main__":
    unittest.main()
