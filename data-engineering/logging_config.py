"""Structured (JSON-lines) logging with the current pipeline run id attached to every record."""
from __future__ import annotations

import contextvars
import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

_run_id: contextvars.ContextVar[str | None] = contextvars.ContextVar("etl_run_id", default=None)
_SENSITIVE = ("password", "secret", "token", "dsn", "url", "ssl_ca", "comment", "reviewer", "email")


def set_run_id(run_id: str | None) -> None:
    _run_id.set(run_id)


def get_run_id() -> str | None:
    return _run_id.get()


def _redact(fields: dict[str, Any]) -> dict[str, Any]:
    return {k: ("<redacted>" if any(s in k.lower() for s in _SENSITIVE) else v) for k, v in fields.items()}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": datetime.fromtimestamp(record.created, timezone.utc).isoformat(timespec="milliseconds"),
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
            "run_id": get_run_id(),
        }
        payload.update(_redact(getattr(record, "fields", {}) or {}))
        if record.exc_info:
            # exception *type* only: driver messages can echo connection strings
            payload["exc_type"] = record.exc_info[0].__name__ if record.exc_info[0] else None
        return json.dumps(payload, default=str, ensure_ascii=False)


def configure_logging(level: str = "INFO", stream=None) -> None:
    handler = logging.StreamHandler(stream or sys.stderr)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger("etl")
    root.handlers[:] = [handler]
    root.setLevel(level)
    root.propagate = False


def log_event(logger: logging.Logger, level: int, event: str, **fields: Any) -> None:
    """``log_event(log, logging.INFO, "batch_committed", rows=500)``"""
    logger.log(level, event, extra={"fields": fields})
