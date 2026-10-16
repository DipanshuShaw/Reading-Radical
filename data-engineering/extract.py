"""Batch extraction from the operational MySQL database (read-only, parameterised, keyset-paginated).

Every query uses only ANSI-compatible SQL with named parameters, so memory use is bounded by the batch size
and the same statements work against the SQLite stand-in used in tests.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any, Iterator

from connections import Database
from validation import BOOK_COLUMNS, REVIEW_COLUMNS, check_columns

SQL_BOOKS_PAGE = """
SELECT book_id, title, author, genre
FROM books
WHERE book_id > :after
ORDER BY book_id
LIMIT :limit
"""

# NULL created_at rows are included on purpose so they get quarantined instead of being skipped forever.
# reviewer is reduced to a presence flag so personal names never enter the pipeline.
SQL_REVIEWS_PAGE = """
SELECT review_id, book_id, rating, comment,
       CASE WHEN reviewer IS NULL OR TRIM(reviewer) = '' THEN 0 ELSE 1 END AS has_reviewer,
       created_at
FROM reviews
WHERE review_id > :after
  AND (created_at IS NULL OR created_at <= :cutoff)
ORDER BY review_id
LIMIT :limit
"""

SQL_REVIEW_COUNT_UPTO = "SELECT COUNT(*) AS n FROM reviews WHERE review_id <= :upto"


def _naive_utc(ts: datetime) -> datetime:
    """MySQL session is pinned to UTC; send a naive UTC value without microseconds."""
    return ts.replace(tzinfo=None, microsecond=0)


def extract_books(db: Database, batch_size: int) -> Iterator[list[dict[str, Any]]]:
    """Yield the books table in pages (each page is its own short read transaction)."""
    after = 0
    while True:
        with db.begin() as conn:
            rows = conn.execute(SQL_BOOKS_PAGE, {"after": after, "limit": batch_size}).rows
        if not rows:
            return
        check_columns(rows[0], BOOK_COLUMNS, "books")
        yield rows
        last = rows[-1]["book_id"]
        if not isinstance(last, int):
            return
        after = last


def extract_reviews_batch(db: Database, after_id: int, cutoff: datetime, limit: int) -> list[dict[str, Any]]:
    """Next ``limit`` reviews with ``review_id > after_id`` that are older than ``cutoff`` (the settle window)."""
    with db.begin() as conn:
        rows = conn.execute(
            SQL_REVIEWS_PAGE, {"after": after_id, "cutoff": _naive_utc(cutoff), "limit": limit}
        ).rows
    if rows:
        check_columns(rows[0], REVIEW_COLUMNS, "reviews")
    return rows


def count_source_reviews_upto(db: Database, upto_id: int) -> int:
    with db.begin() as conn:
        return int(conn.execute(SQL_REVIEW_COUNT_UPTO, {"upto": upto_id}).scalar() or 0)
