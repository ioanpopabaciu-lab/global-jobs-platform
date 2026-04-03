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
import logging
import os
import uuid
from typing import Optional, List

logger = logging.getLogger(__name__)

from models import (
    UserBase, UserCreate, UserLogin, UserResponse, UserSession,
    TokenResponse, PasswordResetRequest, PasswordReset
)
from anaf_service import lookup_company_anaf, RECRUITMENT_INDUSTRIES

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
    
    await execute_pg_write("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE
    """)

async def send_email_safe(payload):
    try:
        result = await asyncio.to_thread(resend.Emails.send, payload)
        logger.info(f"Email trimis cu succes: {result}")
    except Exception as e:
        logger.error(f"Eroare trimitere email Resend: {str(e)}")

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
    # TODO: implement employer/candidate registration with PostgreSQL
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== REGISTRATION ====================

@auth_router.post("/register", response_model=None)
async def register(data: UserCreate, response: Response):
    """Register new user with email/password"""
    # Map account_type to role
    valid_types = ["candidate", "employer", "student", "immigration_client", "agency", "migration_client"]
    if data.account_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid account type. Must be one of: {valid_types}")

    role_mapping = {
        "candidate": "candidate", "employer": "employer",
        "student": "student", "immigration_client": "immigration_client",
        "agency": "agency", "migration_client": "migration_client",
    }
    role = role_mapping.get(data.account_type, "candidate")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    # Check fallback DB
    hashed_pw = hash_password(data.password)
    session_token = generate_session_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    
    # PostgreSQL authentication
    try:
        from database.db_config import execute_pg_write, execute_pg_one

        # Setup pure postgres auth schema if missing
        await execute_pg_write("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'email',
        ADD COLUMN IF NOT EXISTS account_type VARCHAR(50);
        """)

        # Convertim coloana role la VARCHAR pentru a evita restricțiile enum din producție
        try:
            await execute_pg_write(
                "ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50) USING role::TEXT"
            )
        except Exception:
            pass  # Deja VARCHAR sau migrare inutilă

        try:
            await execute_pg_write("ALTER TABLE users ALTER COLUMN mongo_user_id DROP NOT NULL")
        except Exception:
            pass  # Ignore if constraint doesn't exist or already dropped

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
            VALUES ($1, $2, $3, $4::text, $5, $6, $7) RETURNING id
        """, data.email, data.name, hashed_pw, role, data.account_type, True, False)

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
        await send_email_safe({
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
    await send_email_safe({
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
    
    # PostgreSQL authentication
    try:
        from database.db_config import execute_pg_one, execute_pg_write
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
        if not pg_user['is_verified']:
            raise HTTPException(status_code=403, detail="Confirmă emailul înainte de a te autentifica")

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

# ==================== GOOGLE OAUTH ====================

class GoogleSessionData(BaseModel):
    session_id: str

@auth_router.post("/google/session", response_model=TokenResponse)
async def google_session(data: GoogleSessionData, response: Response):
    """Exchange Google OAuth session_id for our session token"""
    # TODO: implement Google OAuth with PostgreSQL
    raise HTTPException(status_code=501, detail="Google OAuth not yet implemented in PostgreSQL mode")

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
    user = await execute_pg_one("SELECT id, name FROM users WHERE email = $1", data.email)
    
    # Always return success (don't reveal if email exists)
    if not user:
        return {"message": "If email exists, reset instructions will be sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    # create table if not exists just to be safe
    await execute_pg_write("""
        CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            user_id UUID REFERENCES users(id),
            token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            used BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
    """)
    
    await execute_pg_write("""
        INSERT INTO password_resets (user_id, token, expires_at, used)
        VALUES ($1, $2, $3, $4)
    """, str(user["id"]), reset_token, expires_at, False)
    
    # Send email
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    await send_email_safe({
        "from": "GJC <no-reply@gjc.ro>",
        "to": [data.email],
        "subject": "Recuperare parolă - Global Jobs Consulting",
        "html": f"""
        <div style="font-family: sans-serif; max-w-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Salut {user['name'] or 'Candidat'},</h2>
            <p>Am primit o cerere de resetare a parolei pentru contul tău GJC.</p>
            <p>Dacă nu ai cerut tu acest lucru, poți ignora acest mesaj automat.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Setează o nouă parolă
                </a>
            </div>
            <p style="color: #64748b; font-size: 14px;">Acest link este valabil doar 1 oră.</p>
        </div>
        """
    })
    
    return {"message": "If email exists, reset instructions will be sent"}

@auth_router.post("/password/reset")
async def reset_password(data: PasswordReset, response: Response):
    """Reset password with token"""
    from database.db_config import execute_pg_one, execute_pg_write
    
    reset_doc = await execute_pg_one("""
        SELECT id, user_id, expires_at 
        FROM password_resets 
        WHERE token = $1 AND used = FALSE
    """, data.token)
    
    if not reset_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    
    expires_at = reset_doc["expires_at"]
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token expired")
    
    # Update password in postgres
    hashed = hash_password(data.new_password)
    user_id_str = str(reset_doc["user_id"])
    
    await execute_pg_write("""
        UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2
    """, hashed, user_id_str)
    
    # Mark token as used
    await execute_pg_write("""
        UPDATE password_resets SET used = TRUE WHERE id = $1
    """, reset_doc["id"])

    # Delete all existing sessions for this user
    await execute_pg_write("DELETE FROM user_sessions WHERE user_id = $1", user_id_str)

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
    # TODO: implement in PostgreSQL
    return {"users": [], "total": 0, "skip": skip, "limit": limit}

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
    # TODO: implement in PostgreSQL
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

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
    # TODO: implement in PostgreSQL
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")



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
    # TODO: implement employer/candidate registration with PostgreSQL
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@auth_router.get("/verify-email")
async def verify_email(token: str):
    """Validează adresa de email după înregistrare"""
    from database.db_config import execute_pg_one, execute_pg_write
    
    # Caută token-ul
    token_row = await execute_pg_one(
        "SELECT user_id, expires_at, used_at FROM email_verification_tokens WHERE token = $1", 
        token
    )

    if not token_row:
        raise HTTPException(status_code=400, detail="Token-ul este invalid sau nu există.")
        
    if token_row.get("used_at"):
        raise HTTPException(status_code=400, detail="Acest link a fost deja utilizat. Emailul tău este deja confirmat.")
        
    expires_at = token_row["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
        
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Acest link de verificare a expirat (24 de ore).")
        
    # Marchează token-ul ca utilizat
    await execute_pg_write("UPDATE email_verification_tokens SET used_at = NOW() WHERE token = $1", token)
    
    # Activează contul utilizatorului (ambele coloane pt siguranță)
    await execute_pg_write("UPDATE users SET is_verified = TRUE, email_verified = TRUE WHERE id = $1", token_row["user_id"])
    
    return {"success": True, "message": "Adresa de email a fost confirmată cu succes!"}
