-- Example analytical queries and verification queries for the Reading Radical warehouse (PostgreSQL).
-- Only standard SQL is used, so they also run on the SQLite stand-in used by the test-suite.

-- ===== Analytics =============================================================================

-- A1. Average rating and number of reviews per genre
SELECT b.genre,
       COUNT(*)                    AS reviews,
       ROUND(AVG(f.rating), 2)     AS avg_rating
FROM fact_reviews f
JOIN dim_book b ON b.book_key = f.book_key
GROUP BY b.genre
ORDER BY reviews DESC, b.genre;

-- A2. Monthly review volume and average rating (trend)
SELECT d.year, d.month_number, d.month_name,
       COUNT(*)                    AS reviews,
       ROUND(AVG(f.rating), 2)     AS avg_rating
FROM fact_reviews f
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY d.year, d.month_number, d.month_name
ORDER BY d.year, d.month_number;

-- A3. Top-rated books that have at least 2 reviews
SELECT b.title, b.author, b.genre,
       COUNT(*)                    AS reviews,
       ROUND(AVG(f.rating), 2)     AS avg_rating
FROM fact_reviews f
JOIN dim_book b ON b.book_key = f.book_key
GROUP BY b.book_key, b.title, b.author, b.genre
HAVING COUNT(*) >= 2
ORDER BY avg_rating DESC, reviews DESC, b.title
LIMIT 10;

-- A4. Rating distribution
SELECT rating, COUNT(*) AS reviews
FROM fact_reviews
GROUP BY rating
ORDER BY rating;

-- A5. Reviews per quarter and genre
SELECT d.year, d.quarter, b.genre, COUNT(*) AS reviews
FROM fact_reviews f
JOIN dim_date d ON d.date_key = f.date_key
JOIN dim_book b ON b.book_key = f.book_key
GROUP BY d.year, d.quarter, b.genre
ORDER BY d.year, d.quarter, reviews DESC;

-- A6. Weekend vs weekday activity and average review length
SELECT d.is_weekend, COUNT(*) AS reviews, ROUND(AVG(f.review_length), 1) AS avg_review_chars
FROM fact_reviews f
JOIN dim_date d ON d.date_key = f.date_key
GROUP BY d.is_weekend;

-- ===== Verification ==========================================================================

-- V1. Row counts of every warehouse table
SELECT 'fact_reviews' AS table_name, COUNT(*) AS row_count FROM fact_reviews
UNION ALL SELECT 'dim_book', COUNT(*) FROM dim_book
UNION ALL SELECT 'dim_date', COUNT(*) FROM dim_date
UNION ALL SELECT 'etl_quarantine (open)', COUNT(*) FROM etl_quarantine WHERE resolved_at IS NULL;

-- V2. Duplicate source ids (must return no rows)
SELECT source_review_id, COUNT(*) AS copies
FROM fact_reviews
GROUP BY source_review_id
HAVING COUNT(*) > 1;

-- V3. Orphaned facts (must return no rows; foreign keys already prevent this)
SELECT f.source_review_id
FROM fact_reviews f
LEFT JOIN dim_book b ON b.book_key = f.book_key
LEFT JOIN dim_date d ON d.date_key = f.date_key
WHERE b.book_key IS NULL OR d.date_key IS NULL;

-- V4. Current checkpoint (last committed source review_id)
SELECT pipeline_name, last_review_id, last_run_id, updated_at FROM etl_checkpoint;

-- V5. Most recent runs
SELECT run_id, mode, status, records_extracted, records_loaded, records_rejected, batches_committed,
       started_at, finished_at
FROM etl_run
ORDER BY started_at DESC
LIMIT 10;

-- V6. Open quarantine entries by reason
SELECT source_table, reason, COUNT(*) AS records
FROM etl_quarantine
WHERE resolved_at IS NULL
GROUP BY source_table, reason
ORDER BY records DESC;

-- V7. Source-to-target check: compare this number with
--       SELECT COUNT(*) FROM reviews WHERE review_id <= <checkpoint>;   (run on MySQL)
SELECT (SELECT COUNT(*) FROM fact_reviews) + (SELECT COUNT(DISTINCT source_id) FROM etl_quarantine
        WHERE source_table = 'reviews' AND resolved_at IS NULL AND reason <> 'duplicate_id') AS expected_source_rows;
