import asyncpg
import certifi
import logging
import os
import socket
import ssl
from contextlib import asynccontextmanager
from urllib.parse import urlparse

DATABASE_URL = os.environ.get("DATABASE_URL")

logger = logging.getLogger("db_config")

# Pool global — inițializat o singură dată la startup
_pool: asyncpg.Pool | None = None


def get_database_url() -> str:
    database_url = os.environ.get("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")

    parsed = urlparse(database_url)
    host = parsed.hostname
    if not host:
        raise RuntimeError("DATABASE_URL is invalid (missing hostname)")

    try:
        socket.getaddrinfo(host, None)
    except socket.gaierror as e:
        raise RuntimeError(f"DATABASE_URL hostname cannot be resolved: {host}") from e

    return database_url


def _build_ssl_context() -> ssl.SSLContext:
    raw = os.environ.get("PG_SSL_NO_VERIFY", "")
    no_verify = raw.strip().lower() in {"1", "true", "yes", "on"}
    if no_verify:
        ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
    else:
        ctx = ssl.create_default_context(cafile=certifi.where())
    return ctx


async def init_pool() -> None:
    """Creat pool-ul la startup. Apelat din DummyDBManager.init_all()."""
    global _pool
    if _pool is not None:
        return
    database_url = get_database_url()
    parsed = urlparse(database_url)

    host = parsed.hostname
    port = parsed.port or 5432
    user = parsed.username
    password = parsed.password
    database = (parsed.path or "").lstrip("/") or "postgres"

    if not host or not user or password is None:
        raise RuntimeError("DATABASE_URL is invalid (missing user/password/hostname)")

    has_ipv4 = False
    try:
        infos = socket.getaddrinfo(host, port, family=socket.AF_INET, type=socket.SOCK_STREAM)
        has_ipv4 = bool(infos)
    except socket.gaierror:
        has_ipv4 = False

    if not has_ipv4:
        raise RuntimeError(
            f"DATABASE_URL hostname has no IPv4 address: {host}. "
            "Railway often lacks IPv6 egress; use the Supabase pooler hostname (aws-0-<region>.pooler.supabase.com) "
            "or any IPv4-capable Postgres endpoint."
        )

    logger.info(
        "Postgres create_pool: host=%s port=%s db=%s",
        host, port, database,
    )
    ssl_context = _build_ssl_context()

    try:
        _pool = await asyncpg.create_pool(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl=ssl_context,
            min_size=2,
            max_size=10,
            statement_cache_size=0,
        )
        logger.info("Postgres pool creat cu succes.")
    except Exception as e:
        logger.exception(
            "Postgres create_pool failed: host=%s port=%s db=%s exc_type=%s exc=%r",
            host, port, database, type(e).__name__, e,
        )
        raise


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Pool-ul Postgres nu a fost inițializat. Apelează init_pool() la startup.")
    return _pool


async def execute_pg_write(query, *args):
    async with get_pool().acquire() as conn:
        await conn.execute(query, *args)


async def execute_pg_one(query, *args):
    async with get_pool().acquire() as conn:
        return await conn.fetchrow(query, *args)


@asynccontextmanager
async def get_pg_connection():
    async with get_pool().acquire() as conn:
        yield conn


async def check_database_health():
    postgres_status = {"status": "unhealthy"}
    try:
        async with get_pool().acquire() as conn:
            await conn.execute("SELECT 1")
        postgres_status = {"status": "healthy"}
    except Exception as e:
        postgres_status = {"status": "unhealthy", "error": str(e)}

    mongodb_status = {"status": "unhealthy"}
    try:
        mongodb_status = {"status": "available" if db_manager.mongo_available else "unavailable"}
    except Exception as e:
        mongodb_status = {"status": "unhealthy", "error": str(e)}

    return {
        "postgres": postgres_status,
        "mongodb": mongodb_status,
    }


# Provide a dummy db_manager with no mongo_available so legacy imports don't crash immediately
class DummyDBManager:
    def __init__(self):
        self._pg_available = True

    @property
    def mongo_available(self):
        return False

    @property
    def pg_available(self):
        return self._pg_available

    async def init_all(self):
        try:
            await init_pool()
            self._pg_available = True
        except Exception:
            self._pg_available = False

    async def close(self):
        global _pool
        if _pool is not None:
            await _pool.close()
            _pool = None


db_manager = DummyDBManager()
