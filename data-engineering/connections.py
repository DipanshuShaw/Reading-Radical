"""Database access.

The rest of the pipeline only depends on the tiny :class:`Database` / :class:`Connection` protocols below
(named ``:param`` placeholders, plain dict rows). ``SqlAlchemyDatabase`` is the production implementation
for MySQL (source) and PostgreSQL (warehouse); tests plug in a SQLite stand-in with the same interface.
SQLAlchemy and the drivers are imported lazily, so unit tests do not need them installed.
"""
from __future__ import annotations

import contextlib
import ssl
from dataclasses import dataclass
from typing import Any, ContextManager, Iterator, Mapping, Protocol, Sequence

from config import PipelineSettings, SourceConfig, WarehouseConfig


@dataclass
class Result:
    rows: list[dict[str, Any]]
    rowcount: int = 0

    def scalar(self) -> Any:
        return next(iter(self.rows[0].values())) if self.rows else None


class Connection(Protocol):
    def execute(self, sql: str, params: Mapping[str, Any] | None = None) -> Result: ...
    def executemany(self, sql: str, rows: Sequence[Mapping[str, Any]]) -> None: ...


class Database(Protocol):
    def begin(self) -> ContextManager[Connection]:
        """Open a transaction: commits when the block exits normally, rolls back on any exception."""

    def close(self) -> None: ...


class _SAConnection:
    def __init__(self, conn: Any) -> None:
        self._conn = conn

    def execute(self, sql: str, params: Mapping[str, Any] | None = None) -> Result:
        from sqlalchemy import text

        res = self._conn.execute(text(sql), dict(params or {}))
        rows = [dict(r._mapping) for r in res] if res.returns_rows else []
        return Result(rows=rows, rowcount=res.rowcount if res.rowcount is not None else 0)

    def executemany(self, sql: str, rows: Sequence[Mapping[str, Any]]) -> None:
        if rows:
            from sqlalchemy import text

            self._conn.execute(text(sql), [dict(r) for r in rows])


class SqlAlchemyDatabase:
    """Production :class:`Database` backed by a SQLAlchemy engine (one pooled engine per database)."""

    def __init__(self, engine: Any) -> None:
        self._engine = engine

    @contextlib.contextmanager
    def begin(self) -> Iterator[Connection]:
        with self._engine.begin() as conn:  # commit on success, rollback on exception
            yield _SAConnection(conn)

    def close(self) -> None:
        self._engine.dispose()


def build_source_database(cfg: SourceConfig, settings: PipelineSettings) -> SqlAlchemyDatabase:
    """MySQL source. Session time zone is pinned to UTC so TIMESTAMP values are read deterministically."""
    from sqlalchemy import create_engine
    from sqlalchemy.engine import URL

    url = URL.create("mysql+pymysql", username=cfg.user, password=cfg.password, host=cfg.host,
                     port=cfg.port, database=cfg.database, query={"charset": "utf8mb4"})
    connect_args: dict[str, Any] = {
        "connect_timeout": settings.connect_timeout,
        "read_timeout": max(30, settings.statement_timeout_ms // 1000),
        "write_timeout": max(30, settings.statement_timeout_ms // 1000),
        "init_command": "SET time_zone = '+00:00'",
    }
    if cfg.ssl:
        connect_args["ssl"] = ssl.create_default_context(cadata=cfg.ssl_ca) if cfg.ssl_ca else ssl.create_default_context()
    engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True, pool_recycle=1800)
    return SqlAlchemyDatabase(engine)


def build_warehouse_database(cfg: WarehouseConfig, settings: PipelineSettings) -> SqlAlchemyDatabase:
    """PostgreSQL warehouse (psycopg 3)."""
    from sqlalchemy import create_engine
    from sqlalchemy.engine import URL, make_url

    if cfg.url:
        url = make_url(cfg.url).set(drivername="postgresql+psycopg")
    else:
        url = URL.create("postgresql+psycopg", username=cfg.user, password=cfg.password,
                         host=cfg.host, port=cfg.port, database=cfg.database)
    connect_args = {
        "connect_timeout": settings.connect_timeout,
        "sslmode": cfg.sslmode,
        "options": f"-c statement_timeout={settings.statement_timeout_ms}",
    }
    engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
    return SqlAlchemyDatabase(engine)


def ping(db: Database) -> None:
    """Cheap connectivity check; raises the driver's exception on failure."""
    with db.begin() as conn:
        conn.execute("SELECT 1")
