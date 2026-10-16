"""Configuration loaded from environment variables (and an optional data-engineering/.env file).

Secrets never appear in ``repr()``/logs, and validation errors name the missing variables, never their values.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Mapping

PIPELINE_NAME = "reading_radical_reviews"
ENV_FILE = Path(__file__).resolve().parent / ".env"
_SSLMODES = {"disable", "allow", "prefer", "require", "verify-ca", "verify-full"}


class ConfigError(ValueError):
    """Raised when required configuration is missing or invalid."""


@dataclass(frozen=True)
class SourceConfig:
    """Operational MySQL database (read-only usage)."""

    host: str
    port: int
    user: str
    password: str = field(repr=False)
    database: str
    ssl: bool = False
    ssl_ca: str | None = field(default=None, repr=False)


@dataclass(frozen=True)
class WarehouseConfig:
    """Analytical PostgreSQL warehouse. Either ``url`` or the individual parts are set."""

    host: str | None = None
    port: int = 5432
    user: str | None = None
    password: str | None = field(default=None, repr=False)
    database: str | None = None
    sslmode: str = "prefer"
    url: str | None = field(default=None, repr=False)


@dataclass(frozen=True)
class PipelineSettings:
    batch_size: int = 500
    settle_seconds: int = 60
    max_retries: int = 3
    retry_base_delay: float = 1.0
    connect_timeout: int = 10
    statement_timeout_ms: int = 60_000
    stale_run_hours: int = 6
    log_level: str = "INFO"
    pipeline_name: str = PIPELINE_NAME


@dataclass(frozen=True)
class AppConfig:
    source: SourceConfig
    warehouse: WarehouseConfig
    settings: PipelineSettings


def _int(env: Mapping[str, str], name: str, default: int, lo: int, hi: int, errors: list[str]) -> int:
    raw = env.get(name)
    if raw is None or raw == "":
        return default
    try:
        value = int(raw)
    except ValueError:
        errors.append(f"{name} must be an integer")
        return default
    if not lo <= value <= hi:
        errors.append(f"{name} must be between {lo} and {hi}")
    return value


def _float(env: Mapping[str, str], name: str, default: float, lo: float, hi: float, errors: list[str]) -> float:
    raw = env.get(name)
    if raw is None or raw == "":
        return default
    try:
        value = float(raw)
    except ValueError:
        errors.append(f"{name} must be a number")
        return default
    if not lo <= value <= hi:
        errors.append(f"{name} must be between {lo} and {hi}")
    return value


def load_config(env: Mapping[str, str] | None = None, *, use_dotenv: bool = True) -> AppConfig:
    """Build and validate the configuration.

    ``env`` defaults to ``os.environ`` (after loading ``data-engineering/.env`` if present; real environment
    variables win over the file). Raises :class:`ConfigError` listing *all* problems at once.
    """
    if env is None:
        if use_dotenv and ENV_FILE.exists():
            from dotenv import load_dotenv  # local import: optional dependency for tests

            load_dotenv(ENV_FILE, override=False)
        env = os.environ

    errors: list[str] = []

    missing_src = [n for n in ("DB_HOST", "DB_USER", "DB_NAME") if not env.get(n)]
    if missing_src:
        errors.append("missing source variables: " + ", ".join(missing_src))
    src_port = _int(env, "DB_PORT", 3306, 1, 65535, errors)
    ssl_ca = env.get("DB_SSL_CA") or None
    source = SourceConfig(
        host=env.get("DB_HOST", ""),
        port=src_port,
        user=env.get("DB_USER", ""),
        password=env.get("DB_PASS", ""),
        database=env.get("DB_NAME", ""),
        ssl=(env.get("DB_SSL", "").lower() == "true") or bool(ssl_ca),
        ssl_ca=ssl_ca.replace("\\n", "\n") if ssl_ca else None,
    )

    url = env.get("WAREHOUSE_URL") or None
    sslmode = env.get("WAREHOUSE_SSLMODE", "prefer")
    if sslmode not in _SSLMODES:
        errors.append("WAREHOUSE_SSLMODE must be one of: " + ", ".join(sorted(_SSLMODES)))
    if url:
        if not url.startswith(("postgresql://", "postgresql+psycopg://", "postgres://")):
            errors.append("WAREHOUSE_URL must be a PostgreSQL URL")
        warehouse = WarehouseConfig(url=url, sslmode=sslmode)
    else:
        missing_wh = [n for n in ("WAREHOUSE_HOST", "WAREHOUSE_USER", "WAREHOUSE_PASSWORD", "WAREHOUSE_NAME") if not env.get(n)]
        if missing_wh:
            errors.append("missing warehouse variables: " + ", ".join(missing_wh) + " (or set WAREHOUSE_URL)")
        warehouse = WarehouseConfig(
            host=env.get("WAREHOUSE_HOST"),
            port=_int(env, "WAREHOUSE_PORT", 5432, 1, 65535, errors),
            user=env.get("WAREHOUSE_USER"),
            password=env.get("WAREHOUSE_PASSWORD"),
            database=env.get("WAREHOUSE_NAME"),
            sslmode=sslmode,
        )

    settings = PipelineSettings(
        batch_size=_int(env, "ETL_BATCH_SIZE", 500, 1, 10_000, errors),
        settle_seconds=_int(env, "ETL_SETTLE_SECONDS", 60, 0, 86_400, errors),
        max_retries=_int(env, "ETL_MAX_RETRIES", 3, 1, 10, errors),
        retry_base_delay=_float(env, "ETL_RETRY_BASE_DELAY", 1.0, 0.0, 60.0, errors),
        connect_timeout=_int(env, "ETL_CONNECT_TIMEOUT", 10, 1, 300, errors),
        statement_timeout_ms=_int(env, "ETL_STATEMENT_TIMEOUT_MS", 60_000, 1_000, 3_600_000, errors),
        log_level=env.get("ETL_LOG_LEVEL", "INFO").upper(),
    )
    if settings.log_level not in {"DEBUG", "INFO", "WARNING", "ERROR"}:
        errors.append("ETL_LOG_LEVEL must be DEBUG, INFO, WARNING or ERROR")

    if errors:
        raise ConfigError("Invalid configuration: " + "; ".join(errors))
    return AppConfig(source=source, warehouse=warehouse, settings=settings)
