import asyncpg
import certifi
import logging
import os
import socket
import ssl
from contextlib import asynccontextmanager
from urllib.parse import quote_plus, unquote, urlparse

logger = logging.getLogger("db_config")

# Pool creat exclusiv la startup (fără inițializare lazy)
_pool: asyncpg.Pool | None = None
_auth_schema_ensured = False

_config_source_logged = False


def _log_database_config_source(*, uses_database_url: bool) -> None:
    """O singură linie la pornire: sursa config; nicio parolă în log."""
    global _config_source_logged
    if _config_source_logged:
        return
    _config_source_logged = True
    if uses_database_url:
        logger.info("Using DATABASE_URL for database connection")
    else:
        logger.info("Building database connection from POSTGRES_* variables")


def get_database_url() -> str:
    """
    a) DATABASE_URL setat și nevid → îl folosește
    b) altfel construiește din POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD
    """
    database_url = (os.environ.get("DATABASE_URL") or "").strip()
    if database_url:
        _log_database_config_source(uses_database_url=True)
        parsed = urlparse(database_url)
        host = parsed.hostname
        if not host:
            raise RuntimeError("DATABASE_URL is invalid (missing hostname)")

        try:
            socket.getaddrinfo(host, None)
        except socket.gaierror as e:
            raise RuntimeError(f"DATABASE_URL hostname cannot be resolved: {host}") from e

        return database_url

    # Variabile discrete (Railway poate seta fie DATABASE_URL, fie acestea)
    host = (os.environ.get("POSTGRES_HOST") or "").strip()
    user = (os.environ.get("POSTGRES_USER") or "").strip()
    port = (os.environ.get("POSTGRES_PORT") or "").strip() or "5432"
    dbname = (os.environ.get("POSTGRES_DB") or "").strip() or "postgres"
    password = os.environ.get("POSTGRES_PASSWORD")

    missing: list[str] = []
    if not host:
        missing.append("POSTGRES_HOST")
    if not user:
        missing.append("POSTGRES_USER")
    if password is None:
        missing.append("POSTGRES_PASSWORD")
    if not port:
        missing.append("POSTGRES_PORT")
    if not dbname:
        missing.append("POSTGRES_DB")

    if missing:
        raise RuntimeError(
            "Database configuration missing. Set DATABASE_URL or POSTGRES_* variables."
            f" Missing: {', '.join(missing)}."
        )

    _log_database_config_source(uses_database_url=False)
    built = (
        f"postgresql://{quote_plus(user)}:{quote_plus(password)}"
        f"@{host}:{port}/{dbname}"
    )

    parsed = urlparse(built)
    res_host = parsed.hostname
    if not res_host:
        raise RuntimeError("Database configuration missing. Set DATABASE_URL or POSTGRES_* variables.")

    try:
        socket.getaddrinfo(res_host, None)
    except socket.gaierror as e:
        raise RuntimeError(
            f"POSTGRES_HOST hostname cannot be resolved: {res_host}"
        ) from e

    return built


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


async def _ensure_auth_tables_once() -> None:
    global _auth_schema_ensured
    if _auth_schema_ensured:
        return
    try:
        from auth_routes import create_auth_tables

        await create_auth_tables()
        _auth_schema_ensured = True
        logger.info("Schema auth PostgreSQL verificată (create_auth_tables).")
    except Exception as e:
        logger.exception("create_auth_tables după conectare Postgres: %s", e)
        raise


async def init_pool() -> None:
    """Creează pool-ul la startup. Eșecul oprește aplicația (fără fallback silențios)."""
    global _pool
    if _pool is not None:
        return

    database_url = get_database_url()
    parsed = urlparse(database_url)

    host = parsed.hostname
    port = parsed.port or 5432
    user = unquote(parsed.username) if parsed.username else None
    raw_pw = parsed.password
    password = unquote(raw_pw) if raw_pw is not None else None
    database = (parsed.path or "").lstrip("/") or "postgres"

    if not host or not user or password is None:
        raise RuntimeError("Database configuration missing. Set DATABASE_URL or POSTGRES_* variables.")

    has_ipv4 = False
    try:
        infos = socket.getaddrinfo(host, port, family=socket.AF_INET, type=socket.SOCK_STREAM)
        has_ipv4 = bool(infos)
    except socket.gaierror:
        has_ipv4 = False

    if not has_ipv4:
        raise RuntimeError(
            f"DATABASE_URL hostname has no IPv4 address: {host}. "
            "Railway often lacks IPv6 egress; use the Supabase pooler hostname "
            "(aws-0-<region>.pooler.supabase.com) or any IPv4-capable Postgres endpoint."
        )

    logger.info(
        "Postgres create_pool: host=%s port=%s db=%s",
        host,
        port,
        database,
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
            min_size=1,
            max_size=10,
            statement_cache_size=0,
        )
    except Exception as e:
        logger.exception(
            "PostgreSQL create_pool failed: host=%s port=%s db=%s",
            host,
            port,
            database,
        )
        raise RuntimeError(
            "Failed to connect to PostgreSQL. Check credentials, DATABASE_URL / POSTGRES_*, and network."
        ) from e

    logger.info("Postgres pool creat cu succes.")
    await _ensure_auth_tables_once()


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError(
            "PostgreSQL pool is not initialized. Application startup did not complete database setup."
        )
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

    return {
        "postgres": postgres_status,
    }


class DBManager:
    def __init__(self):
        self._pg_available = True

    @property
    def pg_available(self):
        return self._pg_available

    async def init_all(self):
        await init_pool()
        self._pg_available = True

    async def close(self):
        global _pool
        if _pool is not None:
            await _pool.close()
            _pool = None


db_manager = DBManager()
