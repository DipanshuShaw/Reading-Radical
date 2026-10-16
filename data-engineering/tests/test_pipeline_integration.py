"""Integration tests: the real pipeline code end-to-end against SQLite stand-ins for MySQL and PostgreSQL.

Covered here: orchestration, SQL statements (ON CONFLICT upserts, keyset paging), transactions, checkpoints,
quarantine. NOT covered here: real MySQL/PostgreSQL behaviour (drivers, types, TIMESTAMPTZ) - see README.
"""
import unittest
from dataclasses import replace

import checkpoints as cp
from config import PipelineSettings
from pipeline import run_pipeline
from tests.helpers import (
    FIXED_NOW, FailingDatabase, OperationalError, add_book, add_review, make_source, make_warehouse,
)

SETTINGS = PipelineSettings(batch_size=2, settle_seconds=60, max_retries=3, retry_base_delay=0.0)


def run(src, wh, **kw):
    kw.setdefault("now", lambda: FIXED_NOW)
    kw.setdefault("sleep", lambda s: None)
    return run_pipeline(src, wh, kw.pop("settings", SETTINGS), **kw)


class Base(unittest.TestCase):
    def setUp(self):
        self.src, self.wh = make_source(), make_warehouse()
        self.b1 = add_book(self.src, "Dune", "Frank Herbert", "Sci-Fi")
        self.b2 = add_book(self.src, "Emma", "Jane Austen", "Romance")

    def seed_reviews(self, n=5):
        return [add_review(self.src, book_id=self.b1 if i % 2 else self.b2, rating=(i % 5) + 1,
                           created_at=f"2026-10-0{1 + i % 3} 10:00:00") for i in range(n)]

    def facts(self):
        return self.wh.scalar("SELECT COUNT(*) FROM fact_reviews")

    def checkpoint(self):
        return cp.get_checkpoint(self.wh, SETTINGS.pipeline_name)

    def quarantine_rows(self):
        return self.wh.query("SELECT * FROM etl_quarantine ORDER BY quarantine_id")


class FullLoad(Base):
    def test_full_initial_load(self):
        ids = self.seed_reviews(5)
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success", s.error)
        self.assertEqual((self.facts(), self.checkpoint()), (5, max(ids)))
        self.assertEqual(s.batches_committed, 3)  # 5 rows / batch_size 2
        self.assertEqual(self.wh.scalar("SELECT COUNT(*) FROM dim_book"), 2)
        self.assertGreaterEqual(self.wh.scalar("SELECT COUNT(*) FROM dim_date"), 1)
        self.assertEqual(s.warnings, [])  # source count == warehouse count
        # star schema joins resolve
        avg = self.wh.query("SELECT b.genre, AVG(f.rating) a FROM fact_reviews f JOIN dim_book b USING (book_key) GROUP BY b.genre")
        self.assertEqual({r["genre"] for r in avg}, {"Sci-Fi", "Romance"})
        run_row = cp.get_run(self.wh, s.run_id)
        self.assertEqual((run_row["status"], run_row["records_loaded"], run_row["records_rejected"]), ("success", 5 + 2, 0))

    def test_empty_source(self):
        empty_src = make_source()
        s = run(empty_src, self.wh)
        self.assertEqual(s.status, "success", s.error)
        self.assertEqual((self.facts(), self.checkpoint(), s.records_extracted, s.batches_committed), (0, 0, 0, 0))
        self.assertEqual(self.wh.scalar("SELECT COUNT(*) FROM etl_quarantine"), 0)


class Incremental(Base):
    def test_second_run_processes_only_new_reviews(self):
        self.seed_reviews(3)
        first = run(self.src, self.wh)
        self.assertEqual(first.records_extracted, 2 + 3)  # 2 books + 3 reviews
        new_ids = [add_review(self.src, book_id=self.b1, rating=3, created_at="2026-10-05 08:00:00") for _ in range(2)]
        second = run(self.src, self.wh)
        self.assertEqual(second.status, "success", second.error)
        self.assertEqual(second.records_extracted, 2 + 2)  # books re-read (cheap, unchanged) + only the 2 new reviews
        self.assertEqual((self.facts(), self.checkpoint()), (5, max(new_ids)))

    def test_run_with_nothing_new_changes_nothing(self):
        self.seed_reviews(3)
        run(self.src, self.wh)
        before = self.wh.query("SELECT source_review_id, load_run_id FROM fact_reviews ORDER BY 1")
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success")
        self.assertEqual(self.wh.query("SELECT source_review_id, load_run_id FROM fact_reviews ORDER BY 1"), before)

    def test_settle_window_defers_very_recent_reviews(self):
        self.seed_reviews(2)
        late = add_review(self.src, book_id=self.b1, created_at="2026-10-15 11:59:30")  # 30s before FIXED_NOW
        run(self.src, self.wh)
        self.assertEqual((self.facts(), self.checkpoint() < late), (2, True))
        s = run(self.src, self.wh, settings=replace(SETTINGS, settle_seconds=0))
        self.assertEqual((s.status, self.facts(), self.checkpoint()), ("success", 3, late))

    def test_changed_book_attributes_update_dimension_without_new_rows(self):
        self.seed_reviews(2)
        run(self.src, self.wh)
        with self.src.begin() as c:
            c.execute("UPDATE books SET genre = 'Classic' WHERE book_id = :b", {"b": self.b1})
        run(self.src, self.wh)
        self.assertEqual(self.wh.scalar("SELECT genre FROM dim_book WHERE source_book_id = :b", {"b": self.b1}), "Classic")
        self.assertEqual(self.wh.scalar("SELECT COUNT(*) FROM dim_book"), 2)


class Idempotency(Base):
    def test_rerunning_everything_creates_no_duplicates(self):
        self.seed_reviews(5)
        run(self.src, self.wh)
        snapshot = self.wh.query("SELECT source_review_id, book_key, date_key, rating, review_length FROM fact_reviews ORDER BY 1")
        for _ in range(2):
            s = run(self.src, self.wh, full=True)  # re-reads every review from id 1
            self.assertEqual(s.status, "success", s.error)
        self.assertEqual(self.wh.query("SELECT source_review_id, book_key, date_key, rating, review_length FROM fact_reviews ORDER BY 1"), snapshot)
        self.assertEqual(self.wh.scalar("SELECT COUNT(*) FROM dim_book"), 2)
        self.assertEqual(self.checkpoint(), 5)

    def test_reprocessing_the_same_batch_directly(self):
        self.seed_reviews(2)
        run(self.src, self.wh)
        again = run(self.src, self.wh, full=True, max_batches=1)
        self.assertEqual(again.status, "success", again.error)
        self.assertEqual(self.facts(), 2)


class Quarantine(Base):
    def test_invalid_records_are_quarantined_and_checkpoint_moves_past_them(self):
        good = add_review(self.src, book_id=self.b1, rating=5)
        bad_rating = add_review(self.src, book_id=self.b1, rating=9, comment="private opinion", reviewer="Alice Example")
        bad_book = add_review(self.src, book_id=999, rating=3)
        no_text = add_review(self.src, book_id=self.b2, rating=3, comment=None)
        bad_date = add_review(self.src, book_id=self.b2, rating=3, created_at="0000-00-00 00:00:00")  # MySQL zero-date
        null_date = add_review(self.src, book_id=self.b2, rating=3, created_at=None)
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success", s.error)
        self.assertEqual(self.facts(), 1)
        self.assertEqual(self.checkpoint(), null_date)
        got = {(r["source_id"], r["reason"]) for r in self.quarantine_rows()}
        self.assertEqual(got, {
            (str(bad_rating), "rating_out_of_range"), (str(bad_book), "book_not_found"),
            (str(no_text), "missing_required"), (str(bad_date), "invalid_timestamp"), (str(null_date), "missing_required"),
        })
        for r in self.quarantine_rows():
            self.assertEqual((r["source_table"], r["run_id"]), ("reviews", s.run_id))
            self.assertIsNotNone(r["detected_at"])
        self.assertEqual(cp.get_run(self.wh, s.run_id)["records_rejected"], 5)
        self.assertEqual(s.warnings, [])  # 6 source rows == 1 fact + 5 quarantined
        _ = good

    def test_no_personal_data_reaches_the_warehouse(self):
        add_review(self.src, book_id=self.b1, rating=9, comment="top secret opinion", reviewer="Alice Example")
        add_review(self.src, book_id=self.b1, rating=4, comment="another private text", reviewer="Bob Example")
        run(self.src, self.wh)
        dump = ""
        for table in ("fact_reviews", "etl_quarantine", "etl_run", "dim_book", "etl_checkpoint"):
            dump += repr(self.wh.query(f"SELECT * FROM {table}"))
        for secret in ("secret opinion", "Alice", "Bob", "private text"):
            self.assertNotIn(secret, dump)

    def test_rejected_record_is_resolved_when_source_is_fixed_and_reloaded(self):
        rid = add_review(self.src, book_id=self.b1, rating=9)
        run(self.src, self.wh)
        self.assertIsNone(self.quarantine_rows()[0]["resolved_at"])
        with self.src.begin() as c:
            c.execute("UPDATE reviews SET rating = 4 WHERE review_id = :i", {"i": rid})
        run(self.src, self.wh, full=True)
        self.assertEqual(self.facts(), 1)
        self.assertIsNotNone(self.quarantine_rows()[0]["resolved_at"])

    def test_quarantine_is_not_duplicated_on_rerun(self):
        add_review(self.src, book_id=self.b1, rating=9)
        run(self.src, self.wh)
        run(self.src, self.wh, full=True)
        self.assertEqual(len(self.quarantine_rows()), 1)

    def test_invalid_book_is_quarantined_and_its_reviews_are_rejected(self):
        with self.src.begin() as c:
            c.execute("INSERT INTO books (title, author, genre) VALUES ('', 'No Title', 'X')")
            bad_book = c.execute("SELECT MAX(book_id) AS i FROM books").scalar()
        add_review(self.src, book_id=bad_book, rating=4)
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success", s.error)
        reasons = {(r["source_table"], r["reason"]) for r in self.quarantine_rows()}
        self.assertEqual(reasons, {("books", "missing_required"), ("reviews", "book_rejected")})
        self.assertEqual((self.facts(), self.wh.scalar("SELECT COUNT(*) FROM dim_book")), (0, 2))


class FailureAndRecovery(Base):
    def test_failed_warehouse_transaction_rolls_back_everything_and_keeps_checkpoint(self):
        self.seed_reviews(4)
        broken = FailingDatabase(self.wh, "INSERT INTO etl_checkpoint", on_call=1)
        s = run(self.src, broken)
        self.assertEqual(s.status, "failed")
        self.assertEqual((self.facts(), self.checkpoint()), (0, 0))  # facts of the failed batch were rolled back too
        row = cp.get_run(self.wh, s.run_id)
        self.assertEqual((row["status"], row["batches_committed"]), ("failed", 0))
        self.assertIsNotNone(row["error"])

    def test_checkpoint_does_not_advance_when_failure_happens_after_loading_facts(self):
        self.seed_reviews(5)
        broken = FailingDatabase(self.wh, "INSERT INTO etl_checkpoint", on_call=2)  # fail while committing batch 2
        s = run(self.src, broken)
        self.assertEqual(s.status, "partial")
        self.assertEqual(s.batches_committed, 1)
        self.assertEqual(self.checkpoint(), 2)   # only batch 1 (review ids 1-2) is committed progress
        self.assertEqual(self.facts(), 2)        # batch-2 facts were written in the failed transaction -> rolled back
        self.assertEqual(cp.get_run(self.wh, s.run_id)["status"], "partial")

    def test_recovery_after_partial_run_completes_without_duplicates(self):
        ids = self.seed_reviews(5)
        broken = FailingDatabase(self.wh, "INSERT INTO etl_checkpoint", on_call=2)
        self.assertEqual(run(self.src, broken).status, "partial")
        s = run(self.src, self.wh)  # same warehouse, healthy now
        self.assertEqual(s.status, "success", s.error)
        self.assertEqual((self.facts(), self.checkpoint()), (5, max(ids)))
        self.assertEqual(self.wh.scalar("SELECT COUNT(DISTINCT source_review_id) FROM fact_reviews"), 5)
        statuses = [r["status"] for r in self.wh.query("SELECT status FROM etl_run ORDER BY started_at, rowid")]
        self.assertEqual(statuses, ["partial", "success"])

    def test_failure_between_extract_and_load_leaves_checkpoint_untouched(self):
        self.seed_reviews(3)
        broken = FailingDatabase(self.wh, "INSERT INTO fact_reviews", on_call=1)
        s = run(self.src, broken)
        self.assertEqual((s.status, self.facts(), self.checkpoint()), ("failed", 0, 0))
        self.assertEqual(run(self.src, self.wh).status, "success")
        self.assertEqual(self.facts(), 3)

    def test_transient_error_is_retried_and_batch_counted_once(self):
        self.seed_reviews(3)
        flaky = FailingDatabase(self.wh, "INSERT INTO fact_reviews", on_call=1, error=OperationalError, times=1)
        s = run(self.src, flaky)
        self.assertEqual(s.status, "success", s.error)
        self.assertEqual((self.facts(), self.checkpoint()), (3, 3))
        self.assertEqual(cp.get_run(self.wh, s.run_id)["records_loaded"], 2 + 3)

    def test_persistent_transient_errors_stop_after_bounded_retries(self):
        self.seed_reviews(3)
        down = FailingDatabase(self.wh, "INSERT INTO fact_reviews", on_call=1, error=OperationalError, times=99)
        s = run(self.src, down)
        self.assertEqual(s.status, "failed")
        self.assertEqual(down.calls, SETTINGS.max_retries)

    def test_source_schema_mismatch_is_permanent_and_recorded(self):
        with self.src.begin() as c:
            c.execute("ALTER TABLE reviews RENAME COLUMN rating TO stars")
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "failed")
        self.assertEqual(self.checkpoint(), 0)

    def test_abandoned_running_run_is_closed_on_next_start(self):
        with self.wh.begin() as c:
            c.execute("INSERT INTO etl_run (run_id, pipeline_name, mode, status, started_at) "
                      "VALUES ('old', :p, 'incremental', 'running', '2026-10-01 00:00:00')", {"p": SETTINGS.pipeline_name})
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success")
        self.assertEqual(cp.get_run(self.wh, "old")["status"], "failed")
        self.assertTrue(any("abandoned" in w for w in s.warnings))


class Reconciliation(Base):
    def test_deleted_source_rows_are_reported_not_hidden(self):
        self.seed_reviews(4)
        run(self.src, self.wh)
        with self.src.begin() as c:
            c.execute("DELETE FROM reviews WHERE review_id = 2")
        s = run(self.src, self.wh)
        self.assertEqual(s.status, "success")
        self.assertTrue(any("reconciliation mismatch" in w for w in s.warnings))
        self.assertEqual(self.facts(), 4)  # documented limitation: deletes are not propagated


if __name__ == "__main__":
    unittest.main()
