import asyncpg
import os
from contextlib import asynccontextmanager
from urllib.parse import urlparse
import socket

DATABASE_URL = os.environ.get("DATABASE_URL")


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

async def execute_pg_write(query, *args):
    conn = await asyncpg.connect(get_database_url())
    try:
        await conn.execute(query, *args)
    finally:
        await conn.close()

async def execute_pg_one(query, *args):
    conn = await asyncpg.connect(get_database_url())
    try:
        return await conn.fetchrow(query, *args)
    finally:
        await conn.close()

@asynccontextmanager
async def get_pg_connection():
    conn = await asyncpg.connect(get_database_url())
    try:
        yield conn
    finally:
        await conn.close()


async def check_database_health():
    postgres_status = {"status": "unhealthy"}
    try:
        conn = await asyncpg.connect(get_database_url())
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
            conn = await asyncpg.connect(get_database_url())
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
