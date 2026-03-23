import asyncpg
import os

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

# Provide a dummy db_manager with no mongo_available so legacy imports don't crash immediately
class DummyDBManager:
    @property
    def mongo_available(self):
        return False
        
    async def init_all(self):
        pass
        
    async def close(self):
        pass
        
db_manager = DummyDBManager()
