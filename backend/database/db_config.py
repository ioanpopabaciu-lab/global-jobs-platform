import asyncpg
import os
from contextlib import asynccontextmanager

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres.mxsgkgokjsgurlnprjff:your_supabase_password_here@aws-0-eu-west-1.pooler.supabase.com:6543/postgres")

async def execute_pg_write(query, *args):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        await conn.execute(query, *args)
    finally:
        await conn.close()

async def execute_pg_one(query, *args):
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        return await conn.fetchrow(query, *args)
    finally:
        await conn.close()

@asynccontextmanager
async def get_pg_connection():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()


async def check_database_health():
    postgres_status = {"status": "unhealthy"}
    try:
        conn = await asyncpg.connect(DATABASE_URL)
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
            conn = await asyncpg.connect(DATABASE_URL)
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
