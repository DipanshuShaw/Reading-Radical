-- Reading Radical analytical warehouse (PostgreSQL). Idempotent: safe to run on every start.
-- Kept deliberately simple (no vendor-specific syntax beyond BIGSERIAL/TIMESTAMPTZ) so the test-suite can
-- translate it to SQLite and exercise the real constraints.
--
-- STAR SCHEMA
--   fact_reviews --(book_key)--> dim_book
--   fact_reviews --(date_key)--> dim_date
-- Pipeline bookkeeping: etl_run, etl_checkpoint, etl_quarantine (not part of the star).

-- ---------------------------------------------------------------------------------------------
-- dim_date: one row per calendar day (UTC) on which at least one review was written (loaded on demand).
-- date_key is the smart key YYYYMMDD.
CREATE TABLE IF NOT EXISTS dim_date (
  date_key      INTEGER PRIMARY KEY,
  full_date     DATE NOT NULL UNIQUE,
  day_of_month  SMALLINT NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
  month_number  SMALLINT NOT NULL CHECK (month_number BETWEEN 1 AND 12),
  month_name    VARCHAR(9) NOT NULL,
  quarter       SMALLINT NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year          SMALLINT NOT NULL,
  day_of_week   SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),  -- ISO: 1 = Monday
  is_weekend    BOOLEAN NOT NULL
);

-- ---------------------------------------------------------------------------------------------
-- dim_book: one row per book (Type 1: attributes are overwritten when the source changes).
-- source_book_id traces each row back to MySQL books.book_id. Missing genre is stored as 'Unknown'.
CREATE TABLE IF NOT EXISTS dim_book (
  book_key         BIGSERIAL PRIMARY KEY,
  source_book_id   BIGINT NOT NULL UNIQUE,
  title            VARCHAR(255) NOT NULL,
  author           VARCHAR(255) NOT NULL,
  genre            VARCHAR(50) NOT NULL DEFAULT 'Unknown',
  row_hash         CHAR(64) NOT NULL,             -- sha256 of the attributes, used to skip unchanged rows
  first_loaded_at  TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------------------------
-- pipeline run log. status: running -> success | partial | failed
--   success = every batch committed;  partial = some batches committed, then an error;  failed = none committed.
CREATE TABLE IF NOT EXISTS etl_run (
  run_id            VARCHAR(36) PRIMARY KEY,
  pipeline_name     VARCHAR(64) NOT NULL,
  mode              VARCHAR(16) NOT NULL CHECK (mode IN ('incremental', 'full')),
  status            VARCHAR(16) NOT NULL CHECK (status IN ('running', 'success', 'partial', 'failed')),
  started_at        TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at       TIMESTAMPTZ,
  records_extracted INTEGER NOT NULL DEFAULT 0,
  records_loaded    INTEGER NOT NULL DEFAULT 0,
  records_rejected  INTEGER NOT NULL DEFAULT 0,
  batches_committed INTEGER NOT NULL DEFAULT 0,
  last_review_id    BIGINT,
  warnings          TEXT,
  error             TEXT
);

-- ---------------------------------------------------------------------------------------------
-- fact_reviews. GRAIN: one row per review written on the site (= one row of MySQL reviews).
--   source_review_id  stable identifier = reviews.review_id (primary key => idempotent upserts)
--   rating            measure, 1-5 (average/count/distribution are computed in queries, not stored)
--   review_length     measure, number of characters in the review text (the text itself is NOT copied)
-- Reviewer names and review text are intentionally not stored in the warehouse.
CREATE TABLE IF NOT EXISTS fact_reviews (
  source_review_id  BIGINT PRIMARY KEY,
  book_key          BIGINT NOT NULL REFERENCES dim_book (book_key),
  date_key          INTEGER NOT NULL REFERENCES dim_date (date_key),
  reviewed_at       TIMESTAMPTZ NOT NULL,
  rating            SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_length     INTEGER NOT NULL CHECK (review_length >= 0),
  load_run_id       VARCHAR(36) NOT NULL REFERENCES etl_run (run_id),
  loaded_at         TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS ix_fact_reviews_book ON fact_reviews (book_key);
CREATE INDEX IF NOT EXISTS ix_fact_reviews_date ON fact_reviews (date_key);

-- ---------------------------------------------------------------------------------------------
-- checkpoint = highest source review_id whose batch has been COMMITTED in the warehouse.
CREATE TABLE IF NOT EXISTS etl_checkpoint (
  pipeline_name   VARCHAR(64) PRIMARY KEY,
  last_review_id  BIGINT NOT NULL DEFAULT 0,
  last_run_id     VARCHAR(36) REFERENCES etl_run (run_id),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------------------------------
-- rejected source records. Only non-personal diagnostic fields go in `details` (never names/e-mails/review text).
CREATE TABLE IF NOT EXISTS etl_quarantine (
  quarantine_id  BIGSERIAL PRIMARY KEY,
  source_table   VARCHAR(50) NOT NULL,
  source_id      VARCHAR(64),
  reason         VARCHAR(64) NOT NULL,
  reason_detail  VARCHAR(255),
  details        TEXT,
  run_id         VARCHAR(36) NOT NULL REFERENCES etl_run (run_id),
  detected_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at    TIMESTAMPTZ,
  UNIQUE (source_table, source_id, reason)
);
CREATE INDEX IF NOT EXISTS ix_quarantine_open ON etl_quarantine (source_table, resolved_at);
