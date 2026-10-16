"""Reusable validation rules (pure functions - no database access).

The business rules mirror the Express API (server/routes/reviews.mjs): rating is an integer 1-5, and
reviewer name and review text are required. The MySQL column itself only enforces NOT NULL, so rows written
outside the API (manual edits, imports) can violate the rules - that is what this layer catches.
"""
from __future__ import annotations

import enum
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any, Iterable, Mapping

RATING_MIN, RATING_MAX = 1, 5
EARLIEST_TIMESTAMP = datetime(2000, 1, 1, tzinfo=timezone.utc)
CLOCK_SKEW = timedelta(days=1)

REVIEW_COLUMNS = ("review_id", "book_id", "rating", "comment", "has_reviewer", "created_at")
BOOK_COLUMNS = ("book_id", "title", "author", "genre")


class SchemaMismatchError(Exception):
    """The source returned different columns than the pipeline expects. Permanent: never retried."""


class Reason(str, enum.Enum):
    MISSING_REQUIRED = "missing_required"
    INVALID_ID = "invalid_id"
    INVALID_RATING_TYPE = "invalid_rating_type"
    RATING_OUT_OF_RANGE = "rating_out_of_range"
    INVALID_TIMESTAMP = "invalid_timestamp"
    DUPLICATE_ID = "duplicate_id"
    BOOK_NOT_FOUND = "book_not_found"
    BOOK_REJECTED = "book_rejected"


@dataclass(frozen=True)
class Issue:
    reason: Reason
    field: str
    detail: str


def check_columns(row: Mapping[str, Any], expected: Iterable[str], table: str) -> None:
    missing = [c for c in expected if c not in row]
    if missing:
        raise SchemaMismatchError(f"{table}: source result is missing columns {missing}")


def is_valid_id(value: Any) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and value > 0


def is_blank(value: Any) -> bool:
    return value is None or (isinstance(value, str) and value.strip() == "")


def validate_rating(value: Any) -> Issue | None:
    """Strict: a real integer in 1..5. Booleans, floats, strings and NULL are rejected, never coerced."""
    if value is None:
        return Issue(Reason.MISSING_REQUIRED, "rating", "rating is NULL")
    if isinstance(value, bool) or not isinstance(value, int):
        return Issue(Reason.INVALID_RATING_TYPE, "rating", f"expected integer, got {type(value).__name__}")
    if not RATING_MIN <= value <= RATING_MAX:
        return Issue(Reason.RATING_OUT_OF_RANGE, "rating", f"{value} not in {RATING_MIN}..{RATING_MAX}")
    return None


def parse_timestamp(value: Any, now: datetime) -> tuple[datetime | None, Issue | None]:
    """Normalise to timezone-aware UTC. Naive values are taken as UTC (the source session is pinned to UTC)."""
    if value is None:
        return None, Issue(Reason.MISSING_REQUIRED, "created_at", "created_at is NULL")
    if isinstance(value, str):
        try:
            value = datetime.fromisoformat(value.strip().replace("Z", "+00:00"))
        except ValueError:
            return None, Issue(Reason.INVALID_TIMESTAMP, "created_at", "not a valid ISO timestamp")
    if not isinstance(value, datetime):
        return None, Issue(Reason.INVALID_TIMESTAMP, "created_at", f"unexpected type {type(value).__name__}")
    ts = value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value.astimezone(timezone.utc)
    if ts < EARLIEST_TIMESTAMP or ts > now + CLOCK_SKEW:
        return None, Issue(Reason.INVALID_TIMESTAMP, "created_at", "timestamp outside plausible range")
    return ts, None


def validate_review_fields(
    row: Mapping[str, Any],
    *,
    now: datetime,
    source_book_ids: set[int],
    rejected_book_ids: set[int],
) -> tuple[list[Issue], datetime | None]:
    """All rule violations for one review row (empty list = valid) plus its parsed UTC timestamp."""
    issues: list[Issue] = []

    if not is_valid_id(row.get("review_id")):
        issues.append(Issue(Reason.INVALID_ID, "review_id", "review_id is not a positive integer"))

    book_id = row.get("book_id")
    if book_id is None:
        issues.append(Issue(Reason.MISSING_REQUIRED, "book_id", "book_id is NULL"))
    elif not is_valid_id(book_id):
        issues.append(Issue(Reason.INVALID_ID, "book_id", "book_id is not a positive integer"))
    elif book_id in rejected_book_ids:
        issues.append(Issue(Reason.BOOK_REJECTED, "book_id", "referenced book failed validation"))
    elif book_id not in source_book_ids:
        issues.append(Issue(Reason.BOOK_NOT_FOUND, "book_id", "referenced book does not exist"))

    rating_issue = validate_rating(row.get("rating"))
    if rating_issue:
        issues.append(rating_issue)

    if is_blank(row.get("comment")):
        issues.append(Issue(Reason.MISSING_REQUIRED, "comment", "review text is empty"))
    if not row.get("has_reviewer"):
        issues.append(Issue(Reason.MISSING_REQUIRED, "reviewer", "reviewer name is empty"))

    ts, ts_issue = parse_timestamp(row.get("created_at"), now)
    if ts_issue:
        issues.append(ts_issue)
    return issues, ts


def validate_book_fields(row: Mapping[str, Any]) -> list[Issue]:
    issues: list[Issue] = []
    if not is_valid_id(row.get("book_id")):
        issues.append(Issue(Reason.INVALID_ID, "book_id", "book_id is not a positive integer"))
    for column in ("title", "author"):
        if is_blank(row.get(column)):
            issues.append(Issue(Reason.MISSING_REQUIRED, column, f"{column} is empty"))
    return issues


def duplicate_positions(ids: Iterable[Any]) -> set[int]:
    """Indexes of repeated ids (every occurrence after the first)."""
    seen: set[Any] = set()
    dupes: set[int] = set()
    for index, value in enumerate(ids):
        if value is None:
            continue
        if value in seen:
            dupes.add(index)
        seen.add(value)
    return dupes
