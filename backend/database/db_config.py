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


async def connect_pg():
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

    raw_pg_ssl_no_verify = os.environ.get("PG_SSL_NO_VERIFY", "")
    pg_ssl_no_verify = raw_pg_ssl_no_verify.strip().lower() in {"1", "true", "yes", "on"}
    logger.info(
        "Postgres connect: host=%s port=%s db=%s ssl_no_verify=%s raw_PG_SSL_NO_VERIFY=%r",
        host,
        port,
        database,
        pg_ssl_no_verify,
        raw_pg_ssl_no_verify,
    )
    if pg_ssl_no_verify:
        ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
    else:
        ssl_context = ssl.create_default_context(cafile=certifi.where())

    try:
        return await asyncpg.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl=ssl_context,
        )
    except Exception as e:
        logger.exception(
            "Postgres connect failed: host=%s port=%s db=%s exc_type=%s exc=%r",
            host,
            port,
            database,
            type(e).__name__,
            e,
        )
        raise

async def execute_pg_write(query, *args):
    conn = await connect_pg()
    try:
        await conn.execute(query, *args)
    finally:
        await conn.close()

async def execute_pg_one(query, *args):
    conn = await connect_pg()
    try:
        return await conn.fetchrow(query, *args)
    finally:
        await conn.close()

@asynccontextmanager
async def get_pg_connection():
    conn = await connect_pg()
    try:
        yield conn
    finally:
        await conn.close()


async def check_database_health():
    postgres_status = {"status": "unhealthy"}
    try:
        conn = await connect_pg()
        try:
            await conn.execute("SELECT 1")
            postgres_status = {"status": "healthy"}
        finally:
            await conn.close()
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
            conn = await connect_pg()
            try:
                await conn.execute("SELECT 1")
                self._pg_available = True
            finally:
                await conn.close()
        except Exception:
            self._pg_available = False
        
    async def close(self):
        pass
        
db_manager = DummyDBManager()
