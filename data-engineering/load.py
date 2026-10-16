"""Warehouse loading: schema initialisation, upserts, quarantine and the atomic per-batch commit."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Sequence

from checkpoints import add_counters, advance_checkpoint
from connections import Connection, Database
from transform import (
    BookResult, DimBookRow, FactRow, Rejection, ReviewResult, date_dim_row,
)

SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"


def split_sql_statements(sql: str) -> list[str]:
    """Split a script on ';' after removing ``--`` comments (the schema contains no ';' inside strings)."""
    without_comments = re.sub(r"--[^\n]*", "", sql)
    return [s.strip() for s in without_comments.split(";") if s.strip()]


def init_schema(db: Database, script: str | None = None) -> None:
    """Create the warehouse tables if they do not exist (idempotent). One transaction for the whole script."""
    statements = split_sql_statements(script if script is not None else SCHEMA_PATH.read_text(encoding="utf-8"))
    with db.begin() as conn:
        for statement in statements:
            conn.execute(statement)


# --------------------------------------------------------------------------- dimensions

SQL_UPSERT_BOOK = """
INSERT INTO dim_book (source_book_id, title, author, genre, row_hash)
VALUES (:source_book_id, :title, :author, :genre, :row_hash)
ON CONFLICT (source_book_id) DO UPDATE SET
    title = EXCLUDED.title, author = EXCLUDED.author, genre = EXCLUDED.genre,
    row_hash = EXCLUDED.row_hash, updated_at = CURRENT_TIMESTAMP
WHERE dim_book.row_hash <> EXCLUDED.row_hash
"""

SQL_UPSERT_DATE = """
INSERT INTO dim_date (date_key, full_date, day_of_month, month_number, month_name, quarter, year, day_of_week, is_weekend)
VALUES (:date_key, :full_date, :day_of_month, :month_number, :month_name, :quarter, :year, :day_of_week, :is_weekend)
ON CONFLICT (date_key) DO NOTHING
"""


def upsert_books(conn: Connection, rows: Sequence[DimBookRow]) -> None:
    conn.executemany(SQL_UPSERT_BOOK, [
        {"source_book_id": r.source_book_id, "title": r.title, "author": r.author, "genre": r.genre, "row_hash": r.row_hash}
        for r in rows
    ])


def ensure_dates(conn: Connection, facts: Sequence[FactRow]) -> None:
    days = sorted({f.reviewed_at.date() for f in facts})
    conn.executemany(SQL_UPSERT_DATE, [date_dim_row(d) for d in days])


def load_book_keys(db: Database) -> dict[int, int]:
    """source book id -> surrogate book_key."""
    with db.begin() as conn:
        rows = conn.execute("SELECT source_book_id, book_key FROM dim_book").rows
    return {int(r["source_book_id"]): int(r["book_key"]) for r in rows}


# --------------------------------------------------------------------------- quarantine

SQL_QUARANTINE = """
INSERT INTO etl_quarantine (source_table, source_id, reason, reason_detail, details, run_id)
VALUES (:source_table, :source_id, :reason, :reason_detail, :details, :run_id)
ON CONFLICT (source_table, source_id, reason) DO NOTHING
"""

SQL_RESOLVE = """
UPDATE etl_quarantine SET resolved_at = CURRENT_TIMESTAMP
WHERE source_table = :source_table AND source_id = :source_id AND resolved_at IS NULL
"""


def quarantine(conn: Connection, run_id: str, rejections: Sequence[Rejection]) -> None:
    """Durably record rejected records (first detection wins; re-detections are ignored)."""
    conn.executemany(SQL_QUARANTINE, [
        {
            "source_table": r.source_table,
            "source_id": r.source_id,
            "reason": r.issue.reason.value,
            "reason_detail": f"{r.issue.field}: {r.issue.detail}"[:255],
            "details": json.dumps(dict(r.details), sort_keys=True) if r.details else None,
            "run_id": run_id,
        }
        for r in rejections
    ])


def resolve_quarantine(conn: Connection, source_table: str, ids: Sequence[int]) -> None:
    """Mark earlier rejections as resolved once the same record loads successfully."""
    conn.executemany(SQL_RESOLVE, [{"source_table": source_table, "source_id": str(i)} for i in ids])


# --------------------------------------------------------------------------- facts

SQL_UPSERT_FACT = """
INSERT INTO fact_reviews (source_review_id, book_key, date_key, reviewed_at, rating, review_length, load_run_id)
VALUES (:source_review_id, :book_key, :date_key, :reviewed_at, :rating, :review_length, :load_run_id)
ON CONFLICT (source_review_id) DO UPDATE SET
    book_key = EXCLUDED.book_key, date_key = EXCLUDED.date_key, reviewed_at = EXCLUDED.reviewed_at,
    rating = EXCLUDED.rating, review_length = EXCLUDED.review_length,
    load_run_id = EXCLUDED.load_run_id, loaded_at = CURRENT_TIMESTAMP
"""


def upsert_facts(conn: Connection, run_id: str, facts: Sequence[FactRow]) -> None:
    conn.executemany(SQL_UPSERT_FACT, [
        {
            "source_review_id": f.source_review_id, "book_key": f.book_key, "date_key": f.date_key,
            "reviewed_at": f.reviewed_at, "rating": f.rating, "review_length": f.review_length,
            "load_run_id": run_id,
        }
        for f in facts
    ])


# --------------------------------------------------------------------------- atomic units of work

def load_books(db: Database, run_id: str, result: BookResult, extracted: int) -> None:
    """Dimension sync in ONE transaction: upserts + quarantine + counters."""
    with db.begin() as conn:
        upsert_books(conn, result.valid)
        resolve_quarantine(conn, "books", [b.source_book_id for b in result.valid])
        quarantine(conn, run_id, result.rejected)
        add_counters(conn, run_id, extracted=extracted, loaded=len(result.valid),
                     rejected=len({r.source_id for r in result.rejected}), batch=False)


def load_review_batch(
    db: Database, *, run_id: str, pipeline_name: str, result: ReviewResult, extracted: int, batch_last_id: int,
) -> None:
    """Load one batch atomically.

    Facts, dates, quarantine rows, run counters and the checkpoint are written in a single transaction:
    either all of them are committed or none are. The checkpoint therefore only ever points at data that
    is durably in the warehouse (rejected rows count as processed because they are durably quarantined).
    """
    with db.begin() as conn:
        ensure_dates(conn, result.valid)
        upsert_facts(conn, run_id, result.valid)
        resolve_quarantine(conn, "reviews", [f.source_review_id for f in result.valid])
        quarantine(conn, run_id, result.rejected)
        add_counters(conn, run_id, extracted=extracted, loaded=len(result.valid),
                     rejected=len({r.source_id for r in result.rejected}), batch=True)
        advance_checkpoint(conn, pipeline_name, batch_last_id, run_id)
