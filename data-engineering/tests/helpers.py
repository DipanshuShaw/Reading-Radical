"""Test support: SQLite stand-ins for the source (MySQL) and the warehouse (PostgreSQL), failure injection.

The warehouse stand-in is built from the REAL schema.sql (two vendor keywords translated), so primary keys,
foreign keys, unique and check constraints are the real ones. PostgreSQL-specific behaviour (types, TIMESTAMPTZ
semantics) is NOT covered by these tests - see README "Testing" for running against real databases.
"""
from __future__ import annotations

import contextlib
import sqlite3
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any, Iterator, Mapping, Sequence

from connections import Result
from load import SCHEMA_PATH, init_schema

sqlite3.register_adapter(datetime, lambda d: d.isoformat(sep=" "))
sqlite3.register_adapter(date, lambda d: d.isoformat())

FIXED_NOW = datetime(2026, 10, 15, 12, 0, 0, tzinfo=timezone.utc)

SOURCE_DDL = """
CREATE TABLE books (
  book_id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, author TEXT, description TEXT, cover_image TEXT, genre TEXT);
CREATE TABLE reviews (
  review_id INTEGER PRIMARY KEY AUTOINCREMENT, book_id INTEGER, user_id INTEGER,
  reviewer TEXT, comment TEXT, rating INTEGER, created_at TIMESTAMP);
"""  # deliberately WITHOUT NOT NULL / FK: lets tests create the dirty rows the pipeline must quarantine


def pg_to_sqlite(sql: str) -> str:
    return sql.replace("BIGSERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT").replace("TIMESTAMPTZ", "TIMESTAMP")


class _Conn:
    def __init__(self, raw: sqlite3.Connection) -> None:
        self._raw = raw

    def execute(self, sql: str, params: Mapping[str, Any] | None = None) -> Result:
        cur = self._raw.execute(sql, dict(params or {}))
        rows = [dict(r) for r in cur.fetchall()] if cur.description else []
        return Result(rows=rows, rowcount=cur.rowcount)

    def executemany(self, sql: str, rows: Sequence[Mapping[str, Any]]) -> None:
        if rows:
            self._raw.executemany(sql, [dict(r) for r in rows])


class SqliteDatabase:
    """Implements the pipeline's Database protocol on SQLite (explicit BEGIN/COMMIT/ROLLBACK)."""

    def __init__(self) -> None:
        self.raw = sqlite3.connect(":memory:", isolation_level=None, check_same_thread=False)
        self.raw.row_factory = sqlite3.Row
        self.raw.execute("PRAGMA foreign_keys = ON")

    @contextlib.contextmanager
    def begin(self) -> Iterator[_Conn]:
        self.raw.execute("BEGIN")
        try:
            yield _Conn(self.raw)
        except BaseException:
            self.raw.execute("ROLLBACK")
            raise
        else:
            self.raw.execute("COMMIT")

    def close(self) -> None:
        self.raw.close()

    # ----- convenience for tests
    def query(self, sql: str, params: Mapping[str, Any] | None = None) -> list[dict[str, Any]]:
        with self.begin() as c:
            return c.execute(sql, params).rows

    def scalar(self, sql: str, params: Mapping[str, Any] | None = None) -> Any:
        rows = self.query(sql, params)
        return next(iter(rows[0].values())) if rows else None


def make_warehouse() -> SqliteDatabase:
    db = SqliteDatabase()
    init_schema(db, pg_to_sqlite(Path(SCHEMA_PATH).read_text(encoding="utf-8")))
    return db


def make_source() -> SqliteDatabase:
    db = SqliteDatabase()
    with db.begin() as c:
        for stmt in [s for s in SOURCE_DDL.split(";") if s.strip()]:
            c.execute(stmt)
    return db


def add_book(src: SqliteDatabase, title="Dune", author="Frank Herbert", genre="Sci-Fi") -> int:
    with src.begin() as c:
        c.execute("INSERT INTO books (title, author, genre) VALUES (:t, :a, :g)", {"t": title, "a": author, "g": genre})
        return c.execute("SELECT MAX(book_id) AS id FROM books").scalar()


def add_review(src: SqliteDatabase, book_id=1, rating=5, comment="Great read", reviewer="Reader",
               created_at="2026-10-01 10:00:00") -> int:
    with src.begin() as c:
        c.execute(
            "INSERT INTO reviews (book_id, reviewer, comment, rating, created_at) VALUES (:b, :r, :c, :s, :t)",
            {"b": book_id, "r": reviewer, "c": comment, "s": rating, "t": created_at},
        )
        return c.execute("SELECT MAX(review_id) AS id FROM reviews").scalar()


class InjectedFailure(Exception):
    """A permanent (non-transient) failure used to simulate a broken warehouse transaction."""


class OperationalError(Exception):  # name matches DB-API drivers, so retry.is_transient_error treats it as transient
    pass


class FailingDatabase:
    """Wraps a database; raises ``error`` on the Nth statement whose SQL contains ``needle``."""

    def __init__(self, inner: SqliteDatabase, needle: str, on_call: int = 1,
                 error: type[Exception] = InjectedFailure, times: int = 1) -> None:
        self.inner, self.needle, self.on_call, self.error = inner, needle, on_call, error
        self.calls = 0
        self.remaining = times
        self.armed = True

    @contextlib.contextmanager
    def begin(self) -> Iterator[Any]:
        with self.inner.begin() as conn:
            yield _FailingConn(conn, self)

    def close(self) -> None:
        self.inner.close()


class _FailingConn:
    def __init__(self, conn: _Conn, owner: FailingDatabase) -> None:
        self._conn, self._o = conn, owner

    def _maybe_fail(self, sql: str) -> None:
        o = self._o
        if o.armed and o.needle in sql:
            o.calls += 1
            if o.calls >= o.on_call and o.remaining > 0:
                o.remaining -= 1
                raise o.error("simulated failure")

    def execute(self, sql, params=None):
        self._maybe_fail(sql)
        return self._conn.execute(sql, params)

    def executemany(self, sql, rows):
        self._maybe_fail(sql)
        return self._conn.executemany(sql, rows)
