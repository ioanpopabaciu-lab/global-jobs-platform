"""
Authentication routes for GJC SaaS Platform
Supports both JWT email/password auth and Google OAuth via Emergent Auth
"""
from fastapi import APIRouter, HTTPException, Response, Request, Depends
from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
import httpx
import hashlib
import secrets
import resend
import asyncio
import os
import uuid
from typing import Optional, List

from models import (
    UserBase, UserCreate, UserLogin, UserResponse, UserSession,
    TokenResponse, PasswordResetRequest, PasswordReset
)
from anaf_service import lookup_company_anaf, RECRUITMENT_INDUSTRIES

# Database will be injected
db = None

def set_database(database):
    global db
    db = database

async def create_auth_tables():
    from database.db_config import execute_pg_write
    await execute_pg_write("""
        CREATE TABLE IF NOT EXISTS email_verification_tokens (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(64) UNIQUE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used_at TIMESTAMP WITH TIME ZONE
        )
    """)

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = os.environ.get('PASSWORD_SALT', 'gjc_default_salt_change_in_production')
    return hashlib.sha256(f"{password}{salt}".encode()).hexdigest()

def generate_session_token() -> str:
    """Generate secure session token"""
    return secrets.token_urlsafe(32)

async def get_current_user(request: Request) -> dict:
    """Get current user from session token (cookie or header)"""
    # Try cookie first
    session_token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if not session_token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    from database.db_config import execute_pg_one, execute_pg_write
    
    # Find session
    session_row = await execute_pg_one(
        "SELECT user_id, expires_at FROM user_sessions WHERE session_token = $1",
        session_token
    )
    
    if not session_row:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_row["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        await execute_pg_write("DELETE FROM user_sessions WHERE session_token = $1", session_token)
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_row = await execute_pg_one(
        "SELECT id, email, name, role, account_type, is_active FROM users WHERE id = $1",
        session_row["user_id"]
    )
    
    if not user_row:
        raise HTTPException(status_code=401, detail="User not found")
    
    if not user_row.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account deactivated")
    
    return {
        "user_id": str(user_row["id"]),
        "email": user_row["email"],
        "name": user_row["name"],
        "role": user_row["role"].lower() if user_row["role"] else "candidate",
        "account_type": user_row["account_type"] or (user_row["role"].lower() if user_row["role"] else "candidate"),
        "is_active": user_row["is_active"]
    }

def require_role(allowed_roles: list):
    """Dependency to check user role"""
    async def check_role(request: Request):
        user = await get_current_user(request)
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return check_role


@auth_router.get("/me")
async def me(request: Request):
    """Return current authenticated user"""
    return await get_current_user(request)

# ==================== ANAF COMPANY LOOKUP ====================

class CUILookupRequest(BaseModel):
    cui: str

class EmployerRegisterRequest(BaseModel):
    email: str
    password: str
    # Company data from ANAF
    cui: str
    company_name: str
    company_address: str
    numar_reg_com: Optional[str] = None
    cod_caen: Optional[str] = None
    denumire_caen: Optional[str] = None
    is_vat_payer: Optional[bool] = False
    data_infiintare: Optional[str] = None
    # Contact person data
    contact_name: str
    contact_position: str
    contact_phone: str
    contact_email: str
    # Additional info
    employees_count: Optional[int] = 0
    recruitment_industries: Optional[List[str]] = []


@auth_router.post("/lookup-company")
async def lookup_company(data: CUILookupRequest):
    """
    Lookup company information from ANAF by CUI
    Public endpoint - no authentication required
    """
    result = await lookup_company_anaf(data.cui)
    return result


@auth_router.get("/recruitment-industries")
async def get_recruitment_industries():
    """Get list of available recruitment industries"""
    return {"industries": RECRUITMENT_INDUSTRIES}


@auth_router.post("/register/employer", response_model=TokenResponse)
async def register_employer(data: EmployerRegisterRequest, response: Response):
    """
    Register new employer with company data from ANAF lookup
    This is a specialized registration flow for employers
    """
    # Check if email exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja înregistrat")
    
    # Check if company CUI already registered
    existing_company = await db.employer_profiles.find_one({"company_cui": data.cui}, {"_id": 0})
    if existing_company:
        raise HTTPException(status_code=400, detail="Această companie este deja înregistrată pe platformă")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.contact_name,
        "password_hash": hash_password(data.password),
        "role": "employer",
        "account_type": "employer",
        "picture": None,
        "is_active": True,
        "is_verified": False,
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Check if this is a manual entry (ANAF unavailable)
    is_manual_entry = not data.cod_caen or data.company_name == ''
    
    # Create employer profile with company data
    profile_id = f"emp_{uuid.uuid4().hex[:12]}"
    profile_doc = {
        "profile_id": profile_id,
        "user_id": user_id,
        "status": "pending_verification" if is_manual_entry else "draft",
        "verification_source": "manual" if is_manual_entry else "anaf",
        
        # Company data from ANAF
        "company_name": data.company_name,
        "company_cui": data.cui,
        "company_j_number": data.numar_reg_com,
        "address": data.company_address,
        "cod_caen": data.cod_caen,
        "denumire_caen": data.denumire_caen,
        "is_vat_payer": data.is_vat_payer,
        "data_infiintare": data.data_infiintare,
        
        # Contact person
        "contact_name": data.contact_name,
        "contact_position": data.contact_position,
        "phone": data.contact_phone,
        "email": data.contact_email,
        
        # Additional info
        "employees_count": data.employees_count,
        "recruitment_industries": data.recruitment_industries,
        
        # Country defaults to Romania
        "country": "RO",
        
        # IGI eligibility (to be completed later)
        "has_no_debts": None,
        "has_no_sanctions": None,
        "has_min_employees": data.employees_count >= 2 if data.employees_count else None,
        "company_age_over_1_year": None,
        
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.employer_profiles.insert_one(profile_doc)
    
    # Create session
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex}",
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return TokenResponse(
        access_token=session_token,
        token_type="bearer",
        user=UserResponse(
            user_id=user_id,
            email=data.email,
            name=data.contact_name,
            role="employer",
            account_type="employer",
            picture=None,
            is_active=True,
            is_verified=False,
            created_at=user_doc["created_at"]
        )
    )

# ==================== REGISTRATION ====================

@auth_router.post("/register", response_model=None)
async def register(data: UserCreate, response: Response):
    """Register new user with email/password"""
    # Map account_type to role
    valid_types = ["candidate", "employer", "student", "immigration_client"]
    if data.account_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid account type. Must be one of: {valid_types}")
        
    role_mapping = {
        "candidate": "candidate", "employer": "employer",
        "student": "student", "immigration_client": "immigration_client"
    }
    role = role_mapping.get(data.account_type, "candidate")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    # Check fallback DB
    hashed_pw = hash_password(data.password)
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # Check fallback DB
    try:
        from database.db_config import execute_pg_write, execute_pg_one, db_manager
        
        # Determine if we should use fallback
        if not db_manager.mongo_available:
            # Fallback to pure PostgreSQL authentication
            
            # Setup pure postgres auth schema if missing
            await execute_pg_write("""
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
            ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
            """)
            
            try:
                await execute_pg_write("ALTER TABLE users ALTER COLUMN mongo_user_id DROP NOT NULL")
            except Exception:
                pass # Ignore if constraint doesn't exist or already dropped
                
            await execute_pg_write("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                session_token VARCHAR(255) UNIQUE NOT NULL,
                expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """)

            existing = await execute_pg_one("SELECT id FROM users WHERE email = $1", data.email)
            if existing:
                raise HTTPException(status_code=400, detail="Email already registered")
                
            pg_user_id = await execute_pg_one("""
                INSERT INTO users (email, name, password_hash, role, account_type, is_active, is_verified)
                VALUES ($1, $2, $3, $4::user_role, $5, $6, $7) RETURNING id
            """, data.email, data.name, hashed_pw, role.upper(), data.account_type, True, False)

            # Creare token verificare email
            verification_token = secrets.token_urlsafe(32)
            await execute_pg_write("""
                INSERT INTO email_verification_tokens (user_id, token, expires_at)
                VALUES ($1, $2, NOW() + INTERVAL '24 hours')
            """, pg_user_id['id'], verification_token)

            # Trimite email de confirmare via Resend
            frontend_url = os.getenv("FRONTEND_URL", "https://gjc.ro")
            resend.api_key = os.getenv("RESEND_API_KEY")
            verify_link = f"{frontend_url}/verify-email?token={verification_token}"
            await asyncio.to_thread(resend.Emails.send, {
                "from": "noreply@gjc.ro",
                "to": data.email,
                "subject": "Confirmă adresa de email — GJC",
                "html": f"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f9f9f9;">
                  <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                    <img src="https://gjc.ro/logo.png" alt="GJC" style="height:48px;margin-bottom:24px;" />
                    <h2 style="color:#1a1a2e;margin:0 0 16px;">Bun venit la GJC!</h2>
                    <p style="color:#444;font-size:16px;line-height:1.6;">
                      Contul tău a fost creat cu succes. Apasă butonul de mai jos pentru a confirma adresa de email.
                    </p>
                    <a href="{verify_link}" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
                      Confirmă Email
                    </a>
                    <p style="color:#888;font-size:13px;">Link-ul expiră în 24 de ore. Dacă nu ai creat acest cont, ignoră acest email.</p>
                  </div>
                </div>
                """
            })

            await execute_pg_write("""
                INSERT INTO user_sessions (user_id, session_token, expires_at)
                VALUES ($1, $2, $3)
            """, pg_user_id['id'], session_token, expires_at)

            return {"message": "Cont creat cu succes. Verifică emailul pentru a activa contul."}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database fallback error: {str(e)}")
            
    # Standard MongoDB Flow (Only runs if mongo_available is True AND the if block was skipped)
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    user_doc = {
        "user_id": user_id, "email": data.email, "name": data.name,
        "password_hash": hashed_pw, "role": role, "account_type": data.account_type,
        "picture": None, "is_active": True, "is_verified": False,
        "auth_provider": "email", "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    await db.users.insert_one(user_doc)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex}", "user_id": user_id,
        "session_token": session_token, "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    await db.user_sessions.insert_one(session_doc)
    
    return TokenResponse(
        access_token=session_token,
        user=UserResponse(
            user_id=user_id, email=data.email, name=data.name, picture=None,
            role=role, account_type=data.account_type, is_active=True, is_verified=False,
            created_at=datetime.now(timezone.utc)
        )
    )

# ==================== EMAIL VERIFICATION ====================

@auth_router.get("/verify-email")
async def verify_email(token: str):
    from fastapi.responses import RedirectResponse
    from database.db_config import execute_pg_one, execute_pg_write

    row = await execute_pg_one("""
        SELECT evt.user_id, evt.expires_at, evt.used_at, u.email, u.name
        FROM email_verification_tokens evt
        JOIN users u ON u.id = evt.user_id
        WHERE evt.token = $1
    """, token)

    frontend_url = os.getenv("FRONTEND_URL", "https://gjc.ro")

    if not row:
        return RedirectResponse(url=f"{frontend_url}/login?error=token_invalid")
    if row['used_at'] is not None:
        return RedirectResponse(url=f"{frontend_url}/login?error=token_used")
    if row['expires_at'] < datetime.now(timezone.utc):
        return RedirectResponse(url=f"{frontend_url}/login?error=token_expired")

    await execute_pg_write("UPDATE users SET is_verified=True WHERE id=$1", row['user_id'])
    await execute_pg_write("UPDATE email_verification_tokens SET used_at=NOW() WHERE token=$1", token)

    # Email de bun venit
    resend.api_key = os.getenv("RESEND_API_KEY")
    await asyncio.to_thread(resend.Emails.send, {
        "from": "noreply@gjc.ro",
        "to": row['email'],
        "subject": "Email confirmat — Bun venit pe GJC!",
        "html": f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:40px 20px;background:#f9f9f9;">
          <div style="background:#fff;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <img src="https://gjc.ro/logo.png" alt="GJC" style="height:48px;margin-bottom:24px;" />
            <h2 style="color:#1a1a2e;">Email confirmat cu succes! ✅</h2>
            <p style="color:#444;font-size:16px;line-height:1.6;">
              Bun venit pe platforma GJC, <strong>{row['name']}</strong>! Contul tău este acum activ.
            </p>
            <a href="{frontend_url}/dashboard" style="display:inline-block;margin:24px 0;padding:14px 32px;background:#16a34a;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">
              Mergi la Dashboard
            </a>
          </div>
        </div>
        """
    })

    return RedirectResponse(url=f"{frontend_url}/login?verified=true")

# ==================== LOGIN ====================

@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, response: Response):
    """Login with email/password"""
    
    # Global fallback safety
    try:
        from database.db_config import execute_pg_one, execute_pg_write, db_manager
        use_fallback = not db_manager.mongo_available
        
        if use_fallback:
            pg_user = await execute_pg_one("""
                SELECT id, email, name, password_hash, role, account_type, is_active, is_verified, created_at
                FROM users WHERE email = $1
            """, data.email)
            if not pg_user:
                raise HTTPException(status_code=401, detail="Invalid email or password")
            if pg_user['password_hash'] != hash_password(data.password):
                raise HTTPException(status_code=401, detail="Invalid email or password")
            if not pg_user['is_active']:
                raise HTTPException(status_code=401, detail="Account deactivated")
                
            session_token = generate_session_token()
            expires_at = datetime.now(timezone.utc) + timedelta(days=7)
            
            await execute_pg_write("""
                INSERT INTO user_sessions (user_id, session_token, expires_at)
                VALUES ($1, $2, $3)
            """, pg_user['id'], session_token, expires_at)
            
            user_response = UserResponse(
                user_id=str(pg_user['id']), email=pg_user['email'], name=pg_user['name'], picture=None,
                role=pg_user['role'].lower(), account_type=pg_user['account_type'] or pg_user['role'].lower(),
                is_active=pg_user['is_active'], is_verified=pg_user['is_verified'],
                created_at=pg_user['created_at']
            )
            return TokenResponse(access_token=session_token, user=user_response)
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PostgreSQL login error: {e}")
        
    # Standard MongoDB Flow (Only runs if mongo_available is True)
    user_doc = await db.users.find_one({"email": data.email}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Check password
    if user_doc.get("password_hash") != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account deactivated")
    
    # Create session
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex}", "user_id": user_doc["user_id"],
        "session_token": session_token, "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    user_response = UserResponse(
        user_id=user_doc["user_id"], email=user_doc["email"], name=user_doc["name"], picture=user_doc.get("picture"),
        role=user_doc["role"], account_type=user_doc.get("account_type", user_doc["role"]),
        is_active=user_doc.get("is_active", True), is_verified=user_doc.get("is_verified", False),
        created_at=user_doc["created_at"] if isinstance(user_doc["created_at"], datetime) else datetime.fromisoformat(user_doc["created_at"])
    )
    
    return TokenResponse(access_token=session_token, user=user_response)

# ==================== GOOGLE OAUTH ====================

class GoogleSessionData(BaseModel):
    session_id: str

@auth_router.post("/google/session", response_model=TokenResponse)
async def google_session(data: GoogleSessionData, response: Response):
    """Exchange Google OAuth session_id for our session token"""
    try:
        # Call Emergent Auth to get user data
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": data.session_id},
                timeout=10.0
            )
        
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid Google session")
        
        google_data = resp.json()
        email = google_data.get("email")
        name = google_data.get("name")
        picture = google_data.get("picture")
        
        if not email:
            raise HTTPException(status_code=401, detail="No email from Google")
        
        # Find or create user
        user_doc = await db.users.find_one({"email": email}, {"_id": 0})
        
        if user_doc:
            # Update existing user's Google info
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": name or user_doc.get("name"),
                    "picture": picture,
                    "updated_at": datetime.now(timezone.utc)
                }}
            )
            user_id = user_doc["user_id"]
            role = user_doc["role"]
            account_type = user_doc.get("account_type", role)
            is_verified = user_doc.get("is_verified", False)
        else:
            # Create new user (default: candidate - they can change via my-account page)
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            role = "candidate"
            account_type = "candidate"
            is_verified = True  # Google users are verified by default
            
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": name or email.split("@")[0],
                "picture": picture,
                "role": role,
                "account_type": account_type,
                "is_active": True,
                "is_verified": is_verified,
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            await db.users.insert_one(user_doc)
        
        # Create session
        session_token = generate_session_token()
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        session_doc = {
            "session_id": f"sess_{uuid.uuid4().hex}",
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        }
        
        await db.user_sessions.insert_one(session_doc)
        
        # Set cookie
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=7 * 24 * 60 * 60
        )
        
        # Return response
        user_response = UserResponse(
            user_id=user_id,
            email=email,
            name=name or email.split("@")[0],
            picture=picture,
            role=role,
            account_type=account_type,
            is_active=True,
            is_verified=is_verified,
            created_at=user_doc.get("created_at", datetime.now(timezone.utc))
        )
        
        return TokenResponse(
            access_token=session_token,
            user=user_response
        )
        
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Auth service error: {str(e)}")

# ==================== SESSION MANAGEMENT ====================

@auth_router.get("/me", response_model=UserResponse)
async def get_me(request: Request):
    """Get current user info"""
    user = await get_current_user(request)
    
    created_at = user.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at)
    
    return UserResponse(
        user_id=user["user_id"],
        email=user["email"],
        name=user["name"],
        picture=user.get("picture"),
        role=user["role"],
        account_type=user.get("account_type", user["role"]),
        is_active=user.get("is_active", True),
        is_verified=user.get("is_verified", False),
        created_at=created_at
    )

@auth_router.post("/logout")
async def logout(request: Request, response: Response):
    """Logout user"""
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_token = auth_header.split(" ")[1]
    
    if session_token:
        from database.db_config import execute_pg_write
        await execute_pg_write("DELETE FROM user_sessions WHERE session_token = $1", session_token)
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

# ==================== PASSWORD RESET ====================

@auth_router.post("/password/reset-request")
async def request_password_reset(data: PasswordResetRequest):
    """Request password reset email"""
    from database.db_config import execute_pg_one, execute_pg_write
    user = await execute_pg_one("SELECT id FROM users WHERE email = $1", data.email)
    
    # Always return success (don't reveal if email exists)
    if not user:
        return {"message": "If email exists, reset instructions will be sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await execute_pg_write("""
        INSERT INTO password_resets (user_id, token, expires_at, used)
        VALUES ($1, $2, $3, $4)
    """, str(user["id"]), reset_token, expires_at, False)
    
    # TODO: Send email with reset link
    # For now, just return success
    
    return {"message": "If email exists, reset instructions will be sent"}

@auth_router.post("/password/reset")
async def reset_password(data: PasswordReset, response: Response):
    """Reset password with token"""
    reset_doc = await db.password_resets.find_one(
        {"token": data.token, "used": False},
        {"_id": 0}
    )
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    expires_at = reset_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    # Update password
    await db.users.update_one(
        {"user_id": reset_doc["user_id"]},
        {"$set": {
            "password_hash": hash_password(data.new_password),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Mark token as used
    await db.password_resets.update_one(
        {"token": data.token},
        {"$set": {"used": True}}
    )
    
    # Delete all existing sessions for this user
    await db.user_sessions.delete_many({"user_id": reset_doc["user_id"]})
    
    return {"message": "Password reset successfully. Please login again."}

# ==================== ADMIN: USER MANAGEMENT ====================

@auth_router.get("/admin/users")
async def admin_list_users(
    request: Request,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Admin: List all users"""
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = {}
    if role:
        query["role"] = role
    
    users = await db.users.find(
        query,
        {"_id": 0, "password_hash": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    total = await db.users.count_documents(query)
    
    return {
        "users": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@auth_router.put("/admin/users/{user_id}/role")
async def admin_update_user_role(
    user_id: str,
    request: Request,
    role: str
):
    """Admin: Update user role"""
    admin = await get_current_user(request)
    if admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if role not in ["candidate", "employer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"role": role, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": f"User role updated to {role}"}

@auth_router.put("/admin/users/{user_id}/status")
async def admin_toggle_user_status(
    user_id: str,
    request: Request,
    is_active: bool
):
    """Admin: Activate/Deactivate user"""
    admin = await get_current_user(request)
    if admin.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    result = await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    # If deactivating, delete all sessions
    if not is_active:
        await db.user_sessions.delete_many({"user_id": user_id})
    
    return {"message": f"User {'activated' if is_active else 'deactivated'}"}



# ==================== CANDIDATE REGISTRATION WITH OCR ====================

from candidate_ocr_service import extract_passport_data, extract_cv_data, merge_extracted_data, calculate_profile_score

class PassportOCRRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"

class CVOCRRequest(BaseModel):
    file_base64: str
    mime_type: Optional[str] = "application/pdf"

class CandidateProfileData(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[str] = None
    citizenship: Optional[str] = None
    nationality: Optional[str] = None
    passport_number: Optional[str] = None
    passport_expiry_date: Optional[str] = None
    gender: Optional[str] = "male"
    phone: Optional[str] = None
    current_profession: Optional[str] = None
    experience_years: Optional[int] = 0
    countries_worked_in: Optional[List[str]] = []
    languages_known: Optional[List[str]] = []
    marital_status: Optional[str] = "single"
    religion: Optional[str] = None
    address: Optional[str] = None
    target_position: Optional[str] = None
    salary_expectation: Optional[str] = None
    availability: Optional[str] = "immediate"
    already_in_romania: Optional[bool] = False
    work_permit_expiry: Optional[str] = None
    available_for_change: Optional[bool] = False
    accept_part_time: Optional[bool] = False

class CandidateRegisterWithProfileRequest(BaseModel):
    email: str
    password: str
    profile_data: CandidateProfileData


@auth_router.post("/candidate/ocr/passport")
async def ocr_passport(data: PassportOCRRequest):
    """
    Extract data from passport image using AI OCR
    Public endpoint for registration flow
    """
    result = await extract_passport_data(data.image_base64, data.mime_type)
    return result


@auth_router.post("/candidate/ocr/cv")
async def ocr_cv(data: CVOCRRequest):
    """
    Extract data from CV document using AI OCR
    Public endpoint for registration flow
    """
    result = await extract_cv_data(data.file_base64, data.mime_type)
    return result


@auth_router.post("/candidate/register-with-profile", response_model=TokenResponse)
async def register_candidate_with_profile(data: CandidateRegisterWithProfileRequest, response: Response):
    """
    Register new candidate with pre-filled profile data from OCR
    Creates both user account and candidate profile in one step
    """
    # Check if email exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email deja înregistrat")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": f"{data.profile_data.first_name or ''} {data.profile_data.last_name or ''}".strip() or data.email.split("@")[0],
        "password_hash": hash_password(data.password),
        "role": "candidate",
        "account_type": "candidate",
        "picture": None,
        "is_active": True,
        "is_verified": False,
        "auth_provider": "email",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_doc)
    
    # Create candidate profile
    profile_id = f"cand_{uuid.uuid4().hex[:12]}"
    profile_doc = {
        "profile_id": profile_id,
        "user_id": user_id,
        "email": data.email,
        "status": "draft",
        
        # Personal data
        "first_name": data.profile_data.first_name,
        "last_name": data.profile_data.last_name,
        "date_of_birth": data.profile_data.date_of_birth,
        "citizenship": data.profile_data.citizenship,
        "nationality": data.profile_data.nationality,
        "country_of_origin": data.profile_data.citizenship,  # Map citizenship to country
        "passport_number": data.profile_data.passport_number,
        "passport_expiry_date": data.profile_data.passport_expiry_date,
        "gender": data.profile_data.gender,
        
        # Contact
        "phone": data.profile_data.phone,
        "whatsapp": data.profile_data.phone,
        
        # Professional
        "current_profession": data.profile_data.current_profession,
        "target_position_cor": data.profile_data.target_position,
        "experience_years": data.profile_data.experience_years or 0,
        "worked_abroad": len(data.profile_data.countries_worked_in or []) > 0,
        "countries_worked_in": data.profile_data.countries_worked_in or [],
        "languages_known": data.profile_data.languages_known or [],
        "english_level": "basic",  # Default
        
        # Personal details
        "marital_status": data.profile_data.marital_status or "single",
        "religion": data.profile_data.religion,
        "address": data.profile_data.address,
        
        # Preferences
        "salary_expectation": data.profile_data.salary_expectation,
        "availability": data.profile_data.availability,
        "already_in_romania": data.profile_data.already_in_romania,
        "existing_residence_permit": data.profile_data.work_permit_expiry if data.profile_data.already_in_romania else None,
        "available_for_change": data.profile_data.available_for_change,
        "accept_part_time": data.profile_data.accept_part_time,
        
        # Documents (will be uploaded separately)
        "cv_doc_id": None,
        "passport_doc_id": None,
        "criminal_record_doc_id": None,
        "passport_photo_doc_id": None,
        "profile_photo_url": None,
        "video_presentation_url": None,
        "diploma_doc_ids": [],
        
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.candidate_profiles.insert_one(profile_doc)
    
    # Create session
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    session_doc = {
        "session_id": f"sess_{uuid.uuid4().hex}",
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.user_sessions.insert_one(session_doc)
    
    # Set cookie
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    return TokenResponse(
        access_token=session_token,
        token_type="bearer",
        user=UserResponse(
            user_id=user_id,
            email=data.email,
            name=user_doc["name"],
            role="candidate",
            account_type="candidate",
            picture=None,
            is_active=True,
            is_verified=False,
            created_at=user_doc["created_at"]
        )
    )
