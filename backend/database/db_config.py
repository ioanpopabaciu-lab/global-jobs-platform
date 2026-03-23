"""
GJC Platform - Database Configuration
Hybrid Architecture: PostgreSQL + MongoDB

PostgreSQL: Transactional data (placements, visas, relocations, invoices)
MongoDB: Profile data (users, candidates, employers, documents)
"""

import os
import logging
from typing import Optional
from contextlib import asynccontextmanager

# PostgreSQL async driver
import asyncpg

# MongoDB async driver (already in use)
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger("db_config")
logger.setLevel(logging.INFO)

# =====================================================
# CONFIGURATION
# =====================================================

class DatabaseConfig:
    """Database configuration from environment variables"""
    
    # PostgreSQL (Supabase Default if not in ENV)
    POSTGRES_HOST = os.environ.get("POSTGRES_HOST", "aws-0-eu-west-1.pooler.supabase.com")
    POSTGRES_PORT = int(os.environ.get("POSTGRES_PORT", 6543))
    POSTGRES_DB = os.environ.get("POSTGRES_DB", "postgres")
    POSTGRES_USER = os.environ.get("POSTGRES_USER", "postgres.mxsgkgokjsgurlnprjff")
    POSTGRES_PASSWORD = os.environ.get("POSTGRES_PASSWORD", "your_supabase_password_here")
    
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
    _initialized: bool = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    async def init_postgres(self) -> Optional[asyncpg.Pool]:
        """Initialize PostgreSQL connection pool"""
        if self._pg_pool is not None:
            return self._pg_pool
        
        try:
            self._pg_pool = await asyncpg.create_pool(
                DatabaseConfig.postgres_dsn(),
                min_size=2,
                max_size=10,
                command_timeout=60
            )
            logger.info("✓ PostgreSQL connection pool initialized")
            return self._pg_pool
        except Exception as e:
            logger.error(f"✗ PostgreSQL connection failed: {e}")
            logger.warning("PostgreSQL features will be disabled")
            return None
    
    async def init_mongodb(self) -> Optional[AsyncIOMotorClient]:
        """Initialize MongoDB client"""
        if self._mongo_client is not None:
            return self._mongo_client
        
        try:
            self._mongo_client = AsyncIOMotorClient(
                DatabaseConfig.MONGO_URL,
                serverSelectionTimeoutMS=2000
            )
            # Test connection
            await self._mongo_client.admin.command('ping')
            logger.info("✓ MongoDB connection initialized")
            return self._mongo_client
        except Exception as e:
            logger.error(f"✗ MongoDB connection failed: {e}")
            return None
    
    async def init_all(self) -> "DatabaseManager":
        """Initialize all database connections"""
        if self._initialized:
            return self
        
        await self.init_mongodb()
        await self.init_postgres()
        self._initialized = True
        return self
    
    @property
    def pg_pool(self) -> Optional[asyncpg.Pool]:
        """Get PostgreSQL pool (may be None if not available)"""
        return self._pg_pool
    
    @property
    def pg_available(self) -> bool:
        """Check if PostgreSQL is available"""
        return self._pg_pool is not None
    
    @property
    def mongo_available(self) -> bool:
        """Check if MongoDB is available"""
        return self._mongo_client is not None
    
    @property
    def mongo(self) -> Optional[AsyncIOMotorClient]:
        """Get MongoDB client"""
        return self._mongo_client
    
    @property
    def mongo_db(self):
        """Get the MongoDB database"""
        if self._mongo_client is None:
            raise RuntimeError("MongoDB client not initialized")
        return self._mongo_client[DatabaseConfig.MONGO_DB]
    
    async def close(self):
        """Close all connections"""
        if self._pg_pool:
            await self._pg_pool.close()
            self._pg_pool = None
            logger.info("PostgreSQL connections closed")
        if self._mongo_client:
            self._mongo_client.close()
            self._mongo_client = None
            logger.info("MongoDB connections closed")
        self._initialized = False


# Global database manager
db_manager = DatabaseManager()


# =====================================================
# HELPER FUNCTIONS
# =====================================================

@asynccontextmanager
async def get_pg_connection():
    """Get a PostgreSQL connection from the pool"""
    if not db_manager.pg_available:
        raise RuntimeError("PostgreSQL not available. Initialize database first.")
    
    async with db_manager.pg_pool.acquire() as conn:
        yield conn


async def execute_pg_query(query: str, *args):
    """Execute a PostgreSQL query and return multiple rows"""
    if not db_manager.pg_available:
        raise RuntimeError("PostgreSQL not available")
    
    async with get_pg_connection() as conn:
        return await conn.fetch(query, *args)


async def execute_pg_one(query: str, *args):
    """Execute a PostgreSQL query and return one row"""
    if not db_manager.pg_available:
        raise RuntimeError("PostgreSQL not available")
    
    async with get_pg_connection() as conn:
        return await conn.fetchrow(query, *args)


async def execute_pg_val(query: str, *args):
    """Execute a PostgreSQL query and return one value"""
    if not db_manager.pg_available:
        raise RuntimeError("PostgreSQL not available")
    
    async with get_pg_connection() as conn:
        return await conn.fetchval(query, *args)


async def execute_pg_write(query: str, *args):
    """Execute a PostgreSQL INSERT/UPDATE/DELETE query"""
    if not db_manager.pg_available:
        raise RuntimeError("PostgreSQL not available")
    
    async with get_pg_connection() as conn:
        return await conn.execute(query, *args)


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

async def sync_user_to_postgres(mongo_user: dict) -> Optional[str]:
    """
    Sync a MongoDB user to PostgreSQL users table.
    Returns the PostgreSQL UUID or None if PostgreSQL is unavailable.
    """
    if not db_manager.pg_available:
        logger.warning("PostgreSQL not available, skipping user sync")
        return None
    
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
    
    try:
        async with get_pg_connection() as conn:
            result = await conn.fetchval(query, mongo_id, email, role, True)
            return result
    except Exception as e:
        logger.error(f"Failed to sync user to PostgreSQL: {e}")
        return None


async def sync_candidate_to_postgres(
    mongo_profile: dict, 
    pg_user_id: str, 
    agency_pg_id: str = None
) -> Optional[str]:
    """Sync a MongoDB candidate profile to PostgreSQL"""
    if not db_manager.pg_available:
        return None
    
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
    
    try:
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
    except Exception as e:
        logger.error(f"Failed to sync candidate to PostgreSQL: {e}")
        return None


async def sync_company_to_postgres(mongo_profile: dict, pg_user_id: str) -> Optional[str]:
    """Sync a MongoDB employer profile to PostgreSQL companies table"""
    if not db_manager.pg_available:
        return None
    
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
    
    try:
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
    except Exception as e:
        logger.error(f"Failed to sync company to PostgreSQL: {e}")
        return None


# =====================================================
# HEALTH CHECK
# =====================================================

async def check_database_health() -> dict:
    """Check health of all database connections"""
    health = {
        "postgres": {"status": "unavailable", "error": None},
        "mongodb": {"status": "unavailable", "error": None}
    }
    
    # Check PostgreSQL
    if db_manager.pg_available:
        try:
            async with get_pg_connection() as conn:
                await conn.fetchval("SELECT 1")
            health["postgres"]["status"] = "healthy"
        except Exception as e:
            health["postgres"]["status"] = "error"
            health["postgres"]["error"] = str(e)
    
    # Check MongoDB
    if db_manager.mongo:
        try:
            await db_manager.mongo.admin.command('ping')
            health["mongodb"]["status"] = "healthy"
        except Exception as e:
            health["mongodb"]["status"] = "error"
            health["mongodb"]["error"] = str(e)
    
    return health
