"""Checkpoint and run tracking in the warehouse.

The checkpoint is only ever advanced *inside the same transaction* that loads the batch, so it always
represents committed progress and can never run ahead of the data.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from connections import Connection, Database

RUNNING, SUCCESS, PARTIAL, FAILED = "running", "success", "partial", "failed"


def get_checkpoint(db: Database, pipeline_name: str) -> int:
    with db.begin() as conn:
        value = conn.execute(
            "SELECT last_review_id FROM etl_checkpoint WHERE pipeline_name = :p", {"p": pipeline_name}
        ).scalar()
    return int(value) if value is not None else 0


def advance_checkpoint(conn: Connection, pipeline_name: str, last_review_id: int, run_id: str) -> None:
    """Monotonic upsert (a lower id never overwrites a higher one). Call inside the batch transaction."""
    conn.execute(
        """
        INSERT INTO etl_checkpoint (pipeline_name, last_review_id, last_run_id, updated_at)
        VALUES (:p, :last_id, :run_id, CURRENT_TIMESTAMP)
        ON CONFLICT (pipeline_name) DO UPDATE SET
            last_review_id = EXCLUDED.last_review_id,
            last_run_id = EXCLUDED.last_run_id,
            updated_at = CURRENT_TIMESTAMP
        WHERE etl_checkpoint.last_review_id < EXCLUDED.last_review_id
        """,
        {"p": pipeline_name, "last_id": last_review_id, "run_id": run_id},
    )


def start_run(db: Database, run_id: str, pipeline_name: str, mode: str, stale_hours: int, now: datetime) -> int:
    """Register the run and close out runs that were abandoned (process killed) long ago. Returns #abandoned."""
    stale_before = (now - timedelta(hours=stale_hours)).astimezone(timezone.utc)
    with db.begin() as conn:
        abandoned = conn.execute(
            """
            UPDATE etl_run
            SET status = CASE WHEN batches_committed > 0 THEN 'partial' ELSE 'failed' END,
                finished_at = CURRENT_TIMESTAMP,
                error = 'abandoned: process ended before the run finished'
            WHERE pipeline_name = :p AND status = 'running' AND started_at < :stale_before
            """,
            {"p": pipeline_name, "stale_before": stale_before},
        ).rowcount
        conn.execute(
            "INSERT INTO etl_run (run_id, pipeline_name, mode, status) VALUES (:id, :p, :mode, 'running')",
            {"id": run_id, "p": pipeline_name, "mode": mode},
        )
    return abandoned


def add_counters(conn: Connection, run_id: str, *, extracted: int, loaded: int, rejected: int, batch: bool) -> None:
    conn.execute(
        """
        UPDATE etl_run SET
            records_extracted = records_extracted + :extracted,
            records_loaded = records_loaded + :loaded,
            records_rejected = records_rejected + :rejected,
            batches_committed = batches_committed + :batch
        WHERE run_id = :id
        """,
        {"id": run_id, "extracted": extracted, "loaded": loaded, "rejected": rejected, "batch": 1 if batch else 0},
    )


def batches_committed(db: Database, run_id: str) -> int:
    with db.begin() as conn:
        return int(conn.execute("SELECT batches_committed FROM etl_run WHERE run_id = :id", {"id": run_id}).scalar() or 0)


def finish_run(db: Database, run_id: str, status: str, *, last_review_id: int | None,
               warnings: str | None = None, error: str | None = None) -> None:
    with db.begin() as conn:
        conn.execute(
            """
            UPDATE etl_run SET status = :status, finished_at = CURRENT_TIMESTAMP,
                   last_review_id = :last_id, warnings = :warnings, error = :error
            WHERE run_id = :id
            """,
            {"id": run_id, "status": status, "last_id": last_review_id, "warnings": warnings, "error": error},
        )


def get_run(db: Database, run_id: str) -> dict[str, Any] | None:
    with db.begin() as conn:
        rows = conn.execute("SELECT * FROM etl_run WHERE run_id = :id", {"id": run_id}).rows
    return rows[0] if rows else None
