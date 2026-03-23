import asyncio
import os
import sys
import hashlib

backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_dir)

from database.db_config import db_manager, execute_pg_write, execute_pg_one

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = os.environ.get('PASSWORD_SALT', 'gjc_default_salt_change_in_production')
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

async def test_pg_register():
    print("Testing Postgres connection...")
    await db_manager.init_postgres()
    
    if not db_manager.pg_available:
        print("PG not available.")
        return
        
    try:
        print("Executing ALTER TABLE users...")
        await execute_pg_write("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
            ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
            ALTER TABLE users ALTER COLUMN mongo_user_id DROP NOT NULL;
        """)
        
        print("Executing CREATE TABLE user_sessions...")
        await execute_pg_write("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)

        print("Testing exist check...")
        test_email = "test500@example.com"
        existing = await execute_pg_one("SELECT id FROM users WHERE email = $1", test_email)
        print("Existing:", existing)
        
        print("Executing INSERT users...")
        hashed_pw = hash_password("1234")
        pg_user_id = await execute_pg_one("""
            INSERT INTO users (email, name, password_hash, role, account_type, is_active, is_verified)
            VALUES ($1, $2, $3, $4::user_role, $5, $6, $7) RETURNING id
        """, test_email, "Test Name", hashed_pw, "CANDIDATE", "candidate", True, False)
        
        print(f"User created: {pg_user_id}")
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error: {e}")
    finally:
        await db_manager.close()

if __name__ == "__main__":
    asyncio.run(test_pg_register())
