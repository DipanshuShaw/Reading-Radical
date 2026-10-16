"""Deterministic transformations: raw source rows -> warehouse rows + rejections.

Same input rows and same context (including ``now``) always give the same output. Nothing is dropped
silently and nothing is invented: a row is either transformed or returned as a :class:`Rejection`.
Review text is only measured (length); reviewer names are never read.
"""
from __future__ import annotations

import calendar
import hashlib
import json
import re
import unicodedata
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Mapping, Sequence

from validation import (
    BOOK_COLUMNS, REVIEW_COLUMNS, Issue, Reason, check_columns, duplicate_positions,
    validate_book_fields, validate_review_fields,
)

UNKNOWN = "Unknown"
_WS = re.compile(r"\s+")


def clean_label(value: Any, default: str | None = None) -> str | None:
    """Metadata text (title/author/genre): NFC-normalise, trim, collapse whitespace. Case is preserved."""
    if value is None:
        return default
    text = _WS.sub(" ", unicodedata.normalize("NFC", str(value))).strip()
    return text or default


@dataclass(frozen=True)
class Rejection:
    source_table: str
    source_id: str | None
    issue: Issue
    details: Mapping[str, Any] = field(default_factory=dict)  # non-personal diagnostics only


@dataclass(frozen=True)
class DimBookRow:
    source_book_id: int
    title: str
    author: str
    genre: str
    row_hash: str


@dataclass(frozen=True)
class FactRow:
    source_review_id: int
    source_book_id: int
    book_key: int
    date_key: int
    reviewed_at: datetime
    rating: int
    review_length: int


@dataclass
class BookResult:
    valid: list[DimBookRow] = field(default_factory=list)
    rejected: list[Rejection] = field(default_factory=list)
    source_ids: set[int] = field(default_factory=set)
    rejected_ids: set[int] = field(default_factory=set)


@dataclass
class ReviewResult:
    valid: list[FactRow] = field(default_factory=list)
    rejected: list[Rejection] = field(default_factory=list)


@dataclass(frozen=True)
class ReviewContext:
    now: datetime
    source_book_ids: frozenset[int]
    rejected_book_ids: frozenset[int]
    book_keys: Mapping[int, int]  # source book id -> warehouse book_key


def book_hash(title: str, author: str, genre: str) -> str:
    return hashlib.sha256(json.dumps([title, author, genre], ensure_ascii=False).encode("utf-8")).hexdigest()


def transform_books(rows: Sequence[Mapping[str, Any]]) -> BookResult:
    result = BookResult()
    for row in rows:
        check_columns(row, BOOK_COLUMNS, "books")
    dupes = duplicate_positions(r["book_id"] for r in rows)
    for index, row in enumerate(rows):
        book_id = row["book_id"]
        sid = str(book_id) if book_id is not None else None
        if isinstance(book_id, int):
            result.source_ids.add(book_id)
        if index in dupes:
            result.rejected.append(Rejection("books", sid, Issue(Reason.DUPLICATE_ID, "book_id", "book_id repeated in source")))
            continue
        issues = validate_book_fields(row)
        if issues:
            if isinstance(book_id, int):
                result.rejected_ids.add(book_id)
            result.rejected.extend(Rejection("books", sid, i) for i in issues)
            continue
        title = clean_label(row["title"]) or ""
        author = clean_label(row["author"]) or ""
        genre = clean_label(row["genre"], UNKNOWN) or UNKNOWN
        result.valid.append(DimBookRow(book_id, title, author, genre, book_hash(title, author, genre)))
    return result


def date_key_for(ts: datetime) -> int:
    return ts.year * 10000 + ts.month * 100 + ts.day


def date_dim_row(d: date) -> dict[str, Any]:
    """Calendar attributes for dim_date (English names, independent of the machine locale)."""
    return {
        "date_key": d.year * 10000 + d.month * 100 + d.day,
        "full_date": d,
        "day_of_month": d.day,
        "month_number": d.month,
        "month_name": calendar.month_name[d.month],
        "quarter": (d.month - 1) // 3 + 1,
        "year": d.year,
        "day_of_week": d.isoweekday(),
        "is_weekend": d.isoweekday() >= 6,
    }


def _safe_details(row: Mapping[str, Any]) -> dict[str, Any]:
    """Diagnostics for the quarantine table. Deliberately excludes reviewer name and review text."""
    created = row.get("created_at")
    return {
        "book_id": row.get("book_id") if isinstance(row.get("book_id"), (int, type(None))) else str(row.get("book_id")),
        "rating": row.get("rating") if isinstance(row.get("rating"), (int, float, type(None))) else str(row.get("rating")),
        "created_at": created.isoformat() if isinstance(created, datetime) else (None if created is None else str(created)),
    }


def transform_reviews(rows: Sequence[Mapping[str, Any]], ctx: ReviewContext) -> ReviewResult:
    result = ReviewResult()
    for row in rows:
        check_columns(row, REVIEW_COLUMNS, "reviews")
    dupes = duplicate_positions(r["review_id"] for r in rows)
    for index, row in enumerate(rows):
        review_id = row["review_id"]
        sid = str(review_id) if review_id is not None else None
        details = _safe_details(row)
        if index in dupes:
            result.rejected.append(Rejection("reviews", sid, Issue(Reason.DUPLICATE_ID, "review_id", "review_id repeated in batch"), details))
            continue
        issues, ts = validate_review_fields(
            row, now=ctx.now, source_book_ids=set(ctx.source_book_ids), rejected_book_ids=set(ctx.rejected_book_ids)
        )
        book_key = ctx.book_keys.get(row.get("book_id")) if not issues else None
        if not issues and book_key is None:
            issues.append(Issue(Reason.BOOK_NOT_FOUND, "book_id", "book missing from warehouse dimension"))
        if issues:
            result.rejected.extend(Rejection("reviews", sid, i, details) for i in issues)
            continue
        assert ts is not None and book_key is not None
        result.valid.append(FactRow(
            source_review_id=review_id,
            source_book_id=row["book_id"],
            book_key=book_key,
            date_key=date_key_for(ts),
            reviewed_at=ts,
            rating=row["rating"],
            review_length=len(row["comment"]),
        ))
    return result
