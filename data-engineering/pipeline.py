"""ETL orchestration and command line.

    python pipeline.py run               # init schema (idempotent) + incremental load from the checkpoint
    python pipeline.py run --full        # re-read everything from review_id 1 (safe: upserts are idempotent)
    python pipeline.py init-db           # only create the warehouse tables
    python pipeline.py status            # last run, checkpoint, open quarantine entries

Exit codes: 0 success, 1 run failed/partial, 2 configuration or connection setup error.
"""
from __future__ import annotations

import argparse
import logging
import sys
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Callable

import checkpoints as cp
from config import AppConfig, ConfigError, PipelineSettings, load_config
from connections import Database, build_source_database, build_warehouse_database, ping
from extract import count_source_reviews_upto, extract_books, extract_reviews_batch
from load import init_schema, load_book_keys, load_books, load_review_batch
from logging_config import configure_logging, log_event, set_run_id
from retry import retry_call
from transform import BookResult, ReviewContext, transform_books, transform_reviews
from validation import SchemaMismatchError

log = logging.getLogger("etl.pipeline")


@dataclass
class RunSummary:
    run_id: str
    status: str = cp.RUNNING
    mode: str = "incremental"
    records_extracted: int = 0
    records_loaded: int = 0
    records_rejected: int = 0
    batches_committed: int = 0
    last_review_id: int = 0
    warnings: list[str] = field(default_factory=list)
    error: str | None = None


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _sync_books(source: Database, warehouse: Database, run_id: str, settings: PipelineSettings) -> BookResult:
    """Copy the (small) books dimension: read all pages, validate, upsert in one transaction."""
    def attempt() -> BookResult:
        rows: list[dict] = []
        for page in extract_books(source, settings.batch_size):
            rows.extend(page)
        result = transform_books(rows)
        load_books(warehouse, run_id, result, extracted=len(rows))
        return result

    return retry_call(attempt, attempts=settings.max_retries, base_delay=settings.retry_base_delay,
                      description="sync_books")


def _reconcile(source: Database, warehouse: Database, upto: int) -> str | None:
    """Source rows up to the checkpoint should equal loaded facts + distinct open review rejections."""
    source_count = count_source_reviews_upto(source, upto)
    with warehouse.begin() as conn:
        facts = int(conn.execute("SELECT COUNT(*) AS n FROM fact_reviews WHERE source_review_id <= :u", {"u": upto}).scalar() or 0)
        rejected = int(conn.execute(
            "SELECT COUNT(DISTINCT source_id) AS n FROM etl_quarantine WHERE source_table = 'reviews' AND resolved_at IS NULL AND reason <> 'duplicate_id'",
            {}).scalar() or 0)
    if source_count != facts + rejected:
        return (f"reconciliation mismatch up to review_id {upto}: source={source_count}, "
                f"warehouse facts={facts} + quarantined={rejected}. Possible causes: reviews deleted in the source, "
                f"a late-committing insert behind the checkpoint (run with --full to repair).")
    return None


def run_pipeline(
    source: Database,
    warehouse: Database,
    settings: PipelineSettings,
    *,
    full: bool = False,
    max_batches: int | None = None,
    now: Callable[[], datetime] = utcnow,
    sleep: Callable[[float], None] = time.sleep,
) -> RunSummary:
    """Run the whole ETL. Never raises for pipeline errors: the outcome is in ``RunSummary.status``."""
    run_id = str(uuid.uuid4())
    summary = RunSummary(run_id=run_id, mode="full" if full else "incremental")
    set_run_id(run_id)
    started = now()
    try:
        init_schema(warehouse)
        abandoned = cp.start_run(warehouse, run_id, settings.pipeline_name, summary.mode, settings.stale_run_hours, started)
        if abandoned:
            summary.warnings.append(f"closed {abandoned} abandoned earlier run(s)")
        log_event(log, logging.INFO, "run_started", mode=summary.mode, batch_size=settings.batch_size)

        books = _sync_books(source, warehouse, run_id, settings)
        book_keys = load_book_keys(warehouse)
        ctx = ReviewContext(now=started, source_book_ids=frozenset(books.source_ids),
                            rejected_book_ids=frozenset(books.rejected_ids), book_keys=book_keys)
        cutoff = started - timedelta(seconds=settings.settle_seconds)

        committed_checkpoint = cp.get_checkpoint(warehouse, settings.pipeline_name)
        after_id = 0 if full else committed_checkpoint
        batches = 0
        while max_batches is None or batches < max_batches:
            def one_batch() -> int | None:
                rows = extract_reviews_batch(source, after_id, cutoff, settings.batch_size)
                if not rows:
                    return None
                batch_last = max(r["review_id"] for r in rows)
                result = transform_reviews(rows, ctx)
                load_review_batch(warehouse, run_id=run_id, pipeline_name=settings.pipeline_name,
                                  result=result, extracted=len(rows), batch_last_id=batch_last)
                log_event(log, logging.INFO, "batch_committed", extracted=len(rows), loaded=len(result.valid),
                          rejected=len(result.rejected), checkpoint=batch_last)
                return batch_last

            batch_last = retry_call(one_batch, attempts=settings.max_retries, base_delay=settings.retry_base_delay,
                                    sleep=sleep, description="review_batch")
            if batch_last is None:
                break
            after_id = batch_last
            batches += 1

        final_checkpoint = cp.get_checkpoint(warehouse, settings.pipeline_name)
        warning = _reconcile(source, warehouse, final_checkpoint)
        if warning:
            summary.warnings.append(warning)
            log_event(log, logging.WARNING, "reconciliation_warning", detail=warning)
        summary.status, summary.last_review_id = cp.SUCCESS, final_checkpoint
        cp.finish_run(warehouse, run_id, cp.SUCCESS, last_review_id=final_checkpoint,
                      warnings="; ".join(summary.warnings) or None)
    except Exception as exc:  # noqa: BLE001 - recorded, then reported through the summary
        summary.error = f"{type(exc).__name__}: {str(exc)[:300]}" if isinstance(exc, SchemaMismatchError) else type(exc).__name__
        log_event(log, logging.ERROR, "run_failed", error_type=type(exc).__name__,
                  permanent=isinstance(exc, SchemaMismatchError))
        try:
            committed = cp.batches_committed(warehouse, run_id)
            checkpoint = cp.get_checkpoint(warehouse, settings.pipeline_name)
            summary.status = cp.PARTIAL if committed > 0 else cp.FAILED
            summary.last_review_id = checkpoint
            cp.finish_run(warehouse, run_id, summary.status, last_review_id=checkpoint,
                          warnings="; ".join(summary.warnings) or None, error=summary.error)
        except Exception:  # noqa: BLE001 - the warehouse itself is unreachable
            summary.status = cp.FAILED
            log_event(log, logging.ERROR, "run_status_not_recorded")
    finally:
        try:
            run = cp.get_run(warehouse, run_id)
        except Exception:  # noqa: BLE001
            run = None
        if run:
            summary.records_extracted = run["records_extracted"]
            summary.records_loaded = run["records_loaded"]
            summary.records_rejected = run["records_rejected"]
            summary.batches_committed = run["batches_committed"]
        log_event(log, logging.INFO, "run_finished", status=summary.status, extracted=summary.records_extracted,
                  loaded=summary.records_loaded, rejected=summary.records_rejected,
                  batches=summary.batches_committed, checkpoint=summary.last_review_id)
        set_run_id(None)
    return summary


def _print_status(warehouse: Database, settings: PipelineSettings) -> None:
    with warehouse.begin() as conn:
        last = conn.execute("SELECT * FROM etl_run ORDER BY started_at DESC LIMIT 1").rows
        open_q = conn.execute(
            "SELECT source_table, reason, COUNT(*) AS n FROM etl_quarantine WHERE resolved_at IS NULL "
            "GROUP BY source_table, reason ORDER BY source_table, reason").rows
    print(f"checkpoint (last committed review_id): {cp.get_checkpoint(warehouse, settings.pipeline_name)}")
    if last:
        r = last[0]
        print(f"last run: {r['run_id']} status={r['status']} extracted={r['records_extracted']} "
              f"loaded={r['records_loaded']} rejected={r['records_rejected']} batches={r['batches_committed']}")
        if r.get("warnings"):
            print(f"  warnings: {r['warnings']}")
        if r.get("error"):
            print(f"  error: {r['error']}")
    else:
        print("no runs yet")
    print("open quarantine entries:", ", ".join(f"{q['source_table']}/{q['reason']}={q['n']}" for q in open_q) or "none")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="pipeline", description="Reading Radical MySQL -> PostgreSQL ETL")
    sub = parser.add_subparsers(dest="command", required=True)
    run_p = sub.add_parser("run", help="run the ETL (initialises the schema first)")
    run_p.add_argument("--full", action="store_true", help="re-read all reviews from the beginning")
    run_p.add_argument("--batch-size", type=int, help="override ETL_BATCH_SIZE")
    run_p.add_argument("--max-batches", type=int, help="stop after N batches (useful for testing)")
    sub.add_parser("init-db", help="create warehouse tables only")
    sub.add_parser("status", help="show checkpoint, last run and quarantine summary")
    args = parser.parse_args(argv)

    try:
        cfg: AppConfig = load_config()
    except ConfigError as exc:
        print(f"Configuration error: {exc}", file=sys.stderr)
        return 2
    configure_logging(cfg.settings.log_level)
    settings = cfg.settings
    if getattr(args, "batch_size", None):
        from dataclasses import replace
        settings = replace(settings, batch_size=args.batch_size)

    source = warehouse = None
    try:
        warehouse = build_warehouse_database(cfg.warehouse, settings)
        retry_call(lambda: ping(warehouse), attempts=settings.max_retries, base_delay=settings.retry_base_delay,
                   description="warehouse_ping")
        if args.command == "init-db":
            init_schema(warehouse)
            print("warehouse schema ready")
            return 0
        if args.command == "status":
            init_schema(warehouse)
            _print_status(warehouse, settings)
            return 0
        source = build_source_database(cfg.source, settings)
        retry_call(lambda: ping(source), attempts=settings.max_retries, base_delay=settings.retry_base_delay,
                   description="source_ping")
        summary = run_pipeline(source, warehouse, settings, full=args.full, max_batches=args.max_batches)
        print(f"run {summary.run_id}: {summary.status} | extracted={summary.records_extracted} "
              f"loaded={summary.records_loaded} rejected={summary.records_rejected} "
              f"batches={summary.batches_committed} checkpoint={summary.last_review_id}")
        for w in summary.warnings:
            print("warning:", w)
        if summary.error:
            print("error:", summary.error)
        return 0 if summary.status == cp.SUCCESS else 1
    except ModuleNotFoundError as exc:
        print(f"Missing Python package '{exc.name}'. Run: pip install -r requirements.txt", file=sys.stderr)
        return 2
    except Exception as exc:  # noqa: BLE001 - connection setup problems
        print(f"Could not connect or initialise: {type(exc).__name__} (check host/port/credentials; secrets are not printed)",
              file=sys.stderr)
        return 2
    finally:
        for db in (source, warehouse):
            if db is not None:
                db.close()


if __name__ == "__main__":
    sys.exit(main())
