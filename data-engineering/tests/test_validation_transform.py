"""Unit tests: validation rules and deterministic transformations (no database)."""
import unittest
from datetime import datetime, timedelta, timezone

from tests.helpers import FIXED_NOW
from transform import ReviewContext, clean_label, date_dim_row, transform_books, transform_reviews
from validation import (
    Reason, SchemaMismatchError, duplicate_positions, parse_timestamp, validate_rating,
)


def review(**over):
    row = {"review_id": 1, "book_id": 10, "rating": 4, "comment": "Loved it", "has_reviewer": 1,
           "created_at": datetime(2026, 10, 1, 9, 30, 0)}
    row.update(over)
    return row


def ctx(**over):
    base = dict(now=FIXED_NOW, source_book_ids=frozenset({10, 11}), rejected_book_ids=frozenset(), book_keys={10: 100, 11: 101})
    base.update(over)
    return ReviewContext(**base)


def reasons(result):
    return [r.issue.reason for r in result.rejected]


class ValidReviews(unittest.TestCase):
    def test_valid_review_becomes_fact_row(self):
        res = transform_reviews([review()], ctx())
        self.assertEqual(res.rejected, [])
        fact = res.valid[0]
        self.assertEqual((fact.source_review_id, fact.book_key, fact.rating, fact.review_length), (1, 100, 4, 8))
        self.assertEqual(fact.date_key, 20261001)
        self.assertEqual(fact.reviewed_at, datetime(2026, 10, 1, 9, 30, tzinfo=timezone.utc))

    def test_all_ratings_1_to_5_accepted(self):
        for r in range(1, 6):
            self.assertIsNone(validate_rating(r))

    def test_transformation_is_deterministic(self):
        rows = [review(review_id=i, rating=(i % 5) + 1) for i in range(1, 30)]
        self.assertEqual(transform_reviews(rows, ctx()), transform_reviews(list(rows), ctx()))

    def test_comment_is_measured_not_altered(self):
        res = transform_reviews([review(comment="  spaced   text \n")], ctx())
        self.assertEqual(res.valid[0].review_length, len("  spaced   text \n"))


class InvalidRatings(unittest.TestCase):
    def test_out_of_range(self):
        for bad in (0, 6, -1, 100):
            self.assertEqual(validate_rating(bad).reason, Reason.RATING_OUT_OF_RANGE, bad)

    def test_wrong_types_are_rejected_not_coerced(self):
        for bad in (4.5, 4.0, "5", True, False, b"5"):
            self.assertEqual(validate_rating(bad).reason, Reason.INVALID_RATING_TYPE, repr(bad))

    def test_null_rating_is_missing_required(self):
        self.assertEqual(validate_rating(None).reason, Reason.MISSING_REQUIRED)

    def test_invalid_rating_row_is_rejected_with_reason(self):
        res = transform_reviews([review(rating=9)], ctx())
        self.assertEqual(res.valid, [])
        self.assertEqual(reasons(res), [Reason.RATING_OUT_OF_RANGE])


class MissingRequired(unittest.TestCase):
    def test_each_required_field(self):
        cases = {"comment": None, "has_reviewer": 0, "book_id": None, "created_at": None}
        for field, value in cases.items():
            res = transform_reviews([review(**{field: value})], ctx())
            self.assertEqual(res.valid, [], field)
            self.assertIn(Reason.MISSING_REQUIRED, reasons(res), field)

    def test_whitespace_only_comment_is_missing(self):
        self.assertIn(Reason.MISSING_REQUIRED, reasons(transform_reviews([review(comment="   \n")], ctx())))

    def test_missing_column_is_a_schema_error_not_a_quarantine(self):
        bad = review()
        del bad["rating"]
        with self.assertRaises(SchemaMismatchError):
            transform_reviews([bad], ctx())

    def test_non_positive_ids(self):
        self.assertIn(Reason.INVALID_ID, reasons(transform_reviews([review(review_id=0)], ctx())))
        self.assertIn(Reason.INVALID_ID, reasons(transform_reviews([review(book_id="x")], ctx())))


class Timestamps(unittest.TestCase):
    def test_naive_is_utc_aware_is_converted(self):
        naive, _ = parse_timestamp(datetime(2026, 1, 2, 3, 4, 5), FIXED_NOW)
        self.assertEqual(naive, datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc))
        ist = timezone(timedelta(hours=5, minutes=30))
        aware, _ = parse_timestamp(datetime(2026, 1, 2, 8, 34, 5, tzinfo=ist), FIXED_NOW)
        self.assertEqual(aware, datetime(2026, 1, 2, 3, 4, 5, tzinfo=timezone.utc))

    def test_iso_strings_parse(self):
        ts, issue = parse_timestamp("2026-10-01 10:00:00", FIXED_NOW)
        self.assertIsNone(issue)
        self.assertEqual(ts.hour, 10)
        ts2, _ = parse_timestamp("2026-10-01T10:00:00Z", FIXED_NOW)
        self.assertEqual(ts, ts2)

    def test_invalid_timestamps(self):
        for bad in ("not a date", "0000-00-00 00:00:00", 12345, datetime(1999, 12, 31), FIXED_NOW + timedelta(days=30)):
            ts, issue = parse_timestamp(bad, FIXED_NOW)
            self.assertIsNone(ts, repr(bad))
            self.assertEqual(issue.reason, Reason.INVALID_TIMESTAMP, repr(bad))


class DuplicatesAndReferences(unittest.TestCase):
    def test_duplicate_positions(self):
        self.assertEqual(duplicate_positions([1, 2, 1, 3, 2, 1]), {2, 4, 5})
        self.assertEqual(duplicate_positions([None, None]), set())

    def test_duplicate_review_ids_in_a_batch(self):
        res = transform_reviews([review(review_id=5), review(review_id=5, rating=1)], ctx())
        self.assertEqual([f.source_review_id for f in res.valid], [5])
        self.assertEqual(reasons(res), [Reason.DUPLICATE_ID])

    def test_unknown_book_is_referential_failure(self):
        res = transform_reviews([review(book_id=999)], ctx())
        self.assertEqual(reasons(res), [Reason.BOOK_NOT_FOUND])

    def test_review_of_rejected_book(self):
        res = transform_reviews([review(book_id=11)], ctx(rejected_book_ids=frozenset({11})))
        self.assertEqual(reasons(res), [Reason.BOOK_REJECTED])

    def test_rejections_never_carry_personal_data(self):
        res = transform_reviews([review(rating=9, comment="my secret opinion")], ctx())
        blob = repr(res.rejected)
        self.assertNotIn("secret", blob)
        self.assertEqual(set(res.rejected[0].details), {"book_id", "rating", "created_at"})


class Books(unittest.TestCase):
    def test_labels_normalised_and_unknown_genre(self):
        res = transform_books([{"book_id": 1, "title": "  The   Hobbit ", "author": "J.R.R.  Tolkien", "genre": None}])
        b = res.valid[0]
        self.assertEqual((b.title, b.author, b.genre), ("The Hobbit", "J.R.R. Tolkien", "Unknown"))
        self.assertEqual(len(b.row_hash), 64)

    def test_missing_title_rejected_and_tracked(self):
        res = transform_books([{"book_id": 2, "title": " ", "author": "A", "genre": "X"}])
        self.assertEqual(res.valid, [])
        self.assertEqual(res.rejected_ids, {2})
        self.assertEqual(res.source_ids, {2})

    def test_hash_changes_when_attributes_change(self):
        a = transform_books([{"book_id": 1, "title": "A", "author": "B", "genre": "C"}]).valid[0].row_hash
        b = transform_books([{"book_id": 1, "title": "A", "author": "B", "genre": "D"}]).valid[0].row_hash
        self.assertNotEqual(a, b)

    def test_clean_label_unicode(self):
        self.assertEqual(clean_label("Cafe\u0301"), "Caf\u00e9")  # NFC


class DateDimension(unittest.TestCase):
    def test_attributes(self):
        row = date_dim_row(datetime(2026, 10, 17).date())  # a Saturday
        self.assertEqual((row["date_key"], row["quarter"], row["month_name"], row["day_of_week"], row["is_weekend"]),
                         (20261017, 4, "October", 6, True))
        self.assertFalse(date_dim_row(datetime(2026, 10, 15).date())["is_weekend"])


if __name__ == "__main__":
    unittest.main()
