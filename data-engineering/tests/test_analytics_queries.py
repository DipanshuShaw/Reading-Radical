import unittest

from load import split_sql_statements
from pathlib import Path
from pipeline import run_pipeline
from config import PipelineSettings
from tests.helpers import FIXED_NOW, add_book, add_review, make_source, make_warehouse

SQL = Path(__file__).resolve().parents[1] / "sql" / "analytics_queries.sql"


class AnalyticsQueries(unittest.TestCase):
    def test_every_query_runs_and_gives_sensible_results(self):
        src, wh = make_source(), make_warehouse()
        b = add_book(src, "Dune", "Frank Herbert", "Sci-Fi")
        for r, day in [(5, 1), (3, 2), (4, 3)]:
            add_review(src, book_id=b, rating=r, created_at=f"2026-10-0{day} 10:00:00")
        s = run_pipeline(src, wh, PipelineSettings(batch_size=10), now=lambda: FIXED_NOW)
        self.assertEqual(s.status, "success", s.error)
        statements = split_sql_statements(SQL.read_text(encoding="utf-8"))
        self.assertGreaterEqual(len(statements), 12)
        results = [wh.query(stmt) for stmt in statements]  # every statement must execute
        by_genre = results[0]
        self.assertEqual((by_genre[0]["genre"], by_genre[0]["reviews"], by_genre[0]["avg_rating"]), ("Sci-Fi", 3, 4.0))
        self.assertEqual(results[7], [])  # V2 duplicates
        self.assertEqual(results[8], [])  # V3 orphans


if __name__ == "__main__":
    unittest.main()
