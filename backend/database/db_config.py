"""
GJC Platform - Database Configuration
Hybrid Architecture: PostgreSQL + MongoDB

PostgreSQL: Transactional data (placements, visas, relocations, invoices)
MongoDB: Profile data (users, candidates, employers, documents)
"""

import os
from typing import Optional
from contextlib import asynccontextmanager

# PostgreSQL async driver
import asyncpg

# MongoDB async driver (already in use)
from motor.motor_asyncio import AsyncIOMotorClient

# Pydantic for validation
from pydantic import BaseModel
from datetime import datetime

# =====================================================
# CONFIGURATION
# =====================================================

class DatabaseConfig:
    """Database configuration from environment variables"""
    
    # PostgreSQL
    POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", 5432))
    POSTGRES_DB = os.environ.get("POSTGRES_DB", "gjc_platform")
    POSTGRES_USER = os.environ.get("POSTGRES_USER", "gjc_admin")
    POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "gjc_secure_2024!")
    
    # MongoDB (existing)
    MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
    MONGO_DB = os.environ.get("DB_NAME", "gjc_platform")
    
    @classmethod
    def postgres_dsn(cls) -> str:
        return f"postgresql://{cls.POSTGRES_USER}:{cls.POSTGRES_PASSWORD}@{cls.POSTGRES_HOST}:{cls.POSTGRES_PORT}/{cls.POSTGRES_DB}"


# =====================================================
# CONNECTION POOLS
# =====================================================

class DatabaseManager:
    """Manages both PostgreSQL and MongoDB connections"""
    
    _instance: Optional["DatabaseManager"] = None
    _pg_pool: Optional[asyncpg.Pool] = None
    _mongo_client: Optional[AsyncIOMotorClient] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def init_postgres(self):
        """Initialize PostgreSQL connection pool"""
        if self._pg_pool is None:
            self._pg_pool = await asyncpg.create_pool(
                DatabaseConfig.postgres_dsn(),
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            print("✓ PostgreSQL connection pool initialized")
        return self._pg_pool
    
    async def init_mongodb(self):
        """Initialize MongoDB client"""
        if self._mongo_client is None:
            self._mongo_client = AsyncIOMotorClient(DatabaseConfig.MONGO_URL)
            # Test connection
            await self._mongo_client.admin.command('ping')
            print("✓ MongoDB connection initialized")
        return self._mongo_client
    
    async def init_all(self):
        """Initialize all database connections"""
        await self.init_postgres()
        await self.init_mongodb()
        return self
    
    @property
    def pg_pool(self) -> asyncpg.Pool:
        if self._pg_pool is None:
            raise RuntimeError("PostgreSQL pool not initialized. Call init_postgres() first.")
        return self._pg_pool
    
    @property
    def mongo(self) -> AsyncIOMotorClient:
        if self._mongo_client is None:
            raise RuntimeError("MongoDB client not initialized. Call init_mongodb() first.")
        return self._mongo_client
    
    @property
    def mongo_db(self):
        """Get the MongoDB database"""
        return self.mongo[DatabaseConfig.MONGO_DB]
    
    async def close(self):
        """Close all connections"""
        if self._pg_pool:
            await self._pg_pool.close()
            self._pg_pool = None
        if self._mongo_client:
            self._mongo_client.close()
            self._mongo_client = None
        print("✓ Database connections closed")


# Global database manager
db_manager = DatabaseManager()


# =====================================================
# HELPER FUNCTIONS
# =====================================================

@asynccontextmanager
async def get_pg_connection():
    """Get a PostgreSQL connection from the pool"""
    async with db_manager.pg_pool.acquire() as conn:
        yield conn


async def execute_pg_query(query: str, *args):
    """Execute a PostgreSQL query"""
    async with get_pg_connection() as conn:
        return await conn.fetch(query, *args)


async def execute_pg_one(query: str, *args):
    """Execute a PostgreSQL query and return one row"""
    async with get_pg_connection() as conn:
        return await conn.fetchrow(query, *args)


async def execute_pg_val(query: str, *args):
    """Execute a PostgreSQL query and return one value"""
    async with get_pg_connection() as conn:
        return await conn.fetchval(query, *args)


# =====================================================
# MONGODB COLLECTIONS (Reference)
# =====================================================

def get_mongo_collections():
    """Get references to MongoDB collections"""
    db = db_manager.mongo_db
    return {
        "users": db.users,
        "candidate_profiles": db.candidate_profiles,
        "employer_profiles": db.employer_profiles,
        "agency_profiles": db.agency_profiles,
        "documents": db.documents,
        "leads": db.leads,
        "notifications": db.notifications,
        "chat_history": db.chat_history,
    }


# =====================================================
# SYNC UTILITIES
# =====================================================

async def sync_user_to_postgres(mongo_user: dict) -> str:
    """
    Sync a MongoDB user to PostgreSQL users table.
    Returns the PostgreSQL UUID.
    """
    role_mapping = {
        "candidate": "CANDIDATE",
        "employer": "COMPANY",
        "agency": "AGENCY",
        "admin": "ADMIN"
    }
    
    role = role_mapping.get(mongo_user.get("account_type", "candidate"), "CANDIDATE")
    mongo_id = str(mongo_user.get("_id", mongo_user.get("user_id", "")))
    email = mongo_user.get("email", "")
    
    query = """
        INSERT INTO users (mongo_user_id, email, role, is_active)
        VALUES ($1, $2, $3::user_role, $4)
        ON CONFLICT (mongo_user_id) DO UPDATE SET
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            updated_at = NOW()
        RETURNING id::text
    """
    
    async with get_pg_connection() as conn:
        result = await conn.fetchval(query, mongo_id, email, role, True)
        return result


async def sync_candidate_to_postgres(mongo_profile: dict, pg_user_id: str, agency_pg_id: str = None) -> str:
    """Sync a MongoDB candidate profile to PostgreSQL"""
    query = """
        INSERT INTO candidates (user_id, mongo_profile_id, agency_id, full_name, nationality, is_available)
        VALUES ($1::uuid, $2, $3::uuid, $4, $5, $6)
        ON CONFLICT (mongo_profile_id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            nationality = EXCLUDED.nationality,
            is_available = EXCLUDED.is_available,
            updated_at = NOW()
        RETURNING id::text
    """
    
    full_name = f"{mongo_profile.get('first_name', '')} {mongo_profile.get('last_name', '')}".strip()
    nationality = mongo_profile.get("nationality", "")[:3] if mongo_profile.get("nationality") else None
    mongo_id = str(mongo_profile.get("profile_id", mongo_profile.get("_id", "")))
    
    async with get_pg_connection() as conn:
        result = await conn.fetchval(
            query, 
            pg_user_id, 
            mongo_id, 
            agency_pg_id, 
            full_name or None,
            nationality,
            True
        )
        return result


async def sync_company_to_postgres(mongo_profile: dict, pg_user_id: str) -> str:
    """Sync a MongoDB employer profile to PostgreSQL companies table"""
    query = """
        INSERT INTO companies (user_id, mongo_profile_id, name, cui, country, is_verified)
        VALUES ($1::uuid, $2, $3, $4, $5, $6)
        ON CONFLICT (mongo_profile_id) DO UPDATE SET
            name = EXCLUDED.name,
            cui = EXCLUDED.cui,
            is_verified = EXCLUDED.is_verified,
            updated_at = NOW()
        RETURNING id::text
    """
    
    mongo_id = str(mongo_profile.get("profile_id", mongo_profile.get("_id", "")))
    
    async with get_pg_connection() as conn:
        result = await conn.fetchval(
            query,
            pg_user_id,
            mongo_id,
            mongo_profile.get("company_name", "Unknown"),
            mongo_profile.get("company_cui", ""),
            "RO",
            mongo_profile.get("status") == "validated"
        )
        return result
