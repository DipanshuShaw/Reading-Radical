"""Bounded retry with exponential backoff, for *transient* connection problems only."""
from __future__ import annotations

import logging
import time
from typing import Callable, TypeVar

from logging_config import log_event

T = TypeVar("T")
log = logging.getLogger("etl.retry")

# Class names (not imports) so this works for any driver: sqlite3, PyMySQL, psycopg, SQLAlchemy wrappers.
_TRANSIENT_NAMES = {
    "OperationalError", "InterfaceError", "TimeoutError", "ConnectionError", "ConnectionRefusedError",
    "ConnectionResetError", "ConnectionAbortedError", "BrokenPipeError", "ReadTimeout", "PoolTimeout",
}


def is_transient_error(exc: BaseException) -> bool:
    """True for connection-level failures worth retrying; False for validation/schema/programming errors."""
    seen: set[int] = set()
    stack: list[BaseException | None] = [exc]
    while stack:
        current = stack.pop()
        if current is None or id(current) in seen:
            continue
        seen.add(id(current))
        if any(c.__name__ in _TRANSIENT_NAMES for c in type(current).__mro__):
            return True
        stack.extend([getattr(current, "orig", None), current.__cause__])
    return False


def retry_call(
    fn: Callable[[], T],
    *,
    attempts: int,
    base_delay: float,
    is_transient: Callable[[BaseException], bool] = is_transient_error,
    sleep: Callable[[float], None] = time.sleep,
    description: str = "operation",
) -> T:
    """Call ``fn`` up to ``attempts`` times; only transient errors are retried, then the last one is raised."""
    for attempt in range(1, attempts + 1):
        try:
            return fn()
        except Exception as exc:  # noqa: BLE001 - classified below
            if attempt >= attempts or not is_transient(exc):
                raise
            delay = base_delay * (2 ** (attempt - 1))
            log_event(log, logging.WARNING, "transient_error_retrying", operation=description,
                      attempt=attempt, max_attempts=attempts, delay_seconds=delay, error_type=type(exc).__name__)
            sleep(delay)
    raise AssertionError("unreachable")  # pragma: no cover
