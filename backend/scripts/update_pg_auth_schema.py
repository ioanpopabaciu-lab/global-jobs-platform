import sys
import asyncio
from pathlib import Path

# Add backend directory to path
backend_dir = str(Path(__file__).resolve().parent.parent)
sys.path.insert(0, backend_dir)
try:
    from database.db_config import db_manager, execute_pg_write
except ImportError as e:
    print(f"Error importing modules: {e}")
    sys.exit(1)

async def update_pg_schema():
    print("Connecting to PostgreSQL...")
    await db_manager.init_postgres()
    
    if not db_manager.pg_available:
        print("Failed to connect to PostgreSQL.")
        sys.exit(1)
        
    print("Updating schema...")
    try:
        await execute_pg_write("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255),
        ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
        """)

        await execute_pg_write("""
        ALTER TABLE users ALTER COLUMN mongo_user_id DROP NOT NULL;
        """)
        
        # Also create a session table in PG if it doesn't exist
        await execute_pg_write("""
        CREATE TABLE IF NOT EXISTS user_sessions (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """)
        
        print("Schema updated successfully for PostgreSQL Auth! 🎉")
    except Exception as e:
        print(f"Schema update failed: {e}")
    finally:
        await db_manager.close()

if __name__ == "__main__":
    asyncio.run(update_pg_schema())
