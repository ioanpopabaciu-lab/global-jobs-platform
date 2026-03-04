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
import os
import uuid
from typing import Optional

from models import (
    UserBase, UserCreate, UserLogin, UserResponse, UserSession,
    TokenResponse, PasswordResetRequest, PasswordReset
)

# Database will be injected
db = None

def set_database(database):
    global db
    db = database

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
    
    # Find session
    session_doc = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    # Check expiry
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        # Delete expired session
        await db.user_sessions.delete_one({"session_token": session_token})
        raise HTTPException(status_code=401, detail="Session expired")
    
    # Get user
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    
    if not user_doc.get("is_active", True):
        raise HTTPException(status_code=401, detail="Account deactivated")
    
    return user_doc

def require_role(allowed_roles: list):
    """Dependency to check user role"""
    async def check_role(request: Request):
        user = await get_current_user(request)
        if user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return check_role

# ==================== REGISTRATION ====================

@auth_router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate, response: Response):
    """Register new user with email/password"""
    # Check if email exists
    existing = await db.users.find_one({"email": data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate role
    if data.role not in ["candidate", "employer"]:
        raise HTTPException(status_code=400, detail="Invalid role. Must be 'candidate' or 'employer'")
    
    # Create user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    user_doc = {
        "user_id": user_id,
        "email": data.email,
        "name": data.name,
        "password_hash": hash_password(data.password),
        "role": data.role,
        "picture": None,
        "is_active": True,
        "is_verified": False,
        "auth_provider": "email",
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
        max_age=7 * 24 * 60 * 60  # 7 days
    )
    
    # Return response
    user_response = UserResponse(
        user_id=user_id,
        email=data.email,
        name=data.name,
        picture=None,
        role=data.role,
        is_active=True,
        is_verified=False,
        created_at=user_doc["created_at"]
    )
    
    return TokenResponse(
        access_token=session_token,
        user=user_response
    )

# ==================== LOGIN ====================

@auth_router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, response: Response):
    """Login with email/password"""
    # Find user
    user_doc = await db.users.find_one(
        {"email": data.email},
        {"_id": 0}
    )
    
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
        "session_id": f"sess_{uuid.uuid4().hex}",
        "user_id": user_doc["user_id"],
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
        user_id=user_doc["user_id"],
        email=user_doc["email"],
        name=user_doc["name"],
        picture=user_doc.get("picture"),
        role=user_doc["role"],
        is_active=user_doc.get("is_active", True),
        is_verified=user_doc.get("is_verified", False),
        created_at=user_doc["created_at"] if isinstance(user_doc["created_at"], datetime) 
                   else datetime.fromisoformat(user_doc["created_at"])
    )
    
    return TokenResponse(
        access_token=session_token,
        user=user_response
    )

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
            is_verified = user_doc.get("is_verified", False)
        else:
            # Create new user (default role: candidate)
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            role = "candidate"
            is_verified = True  # Google users are verified by default
            
            user_doc = {
                "user_id": user_id,
                "email": email,
                "name": name or email.split("@")[0],
                "picture": picture,
                "role": role,
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
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    
    return {"message": "Logged out successfully"}

# ==================== PASSWORD RESET ====================

@auth_router.post("/password/reset-request")
async def request_password_reset(data: PasswordResetRequest):
    """Request password reset email"""
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    
    # Always return success (don't reveal if email exists)
    if not user:
        return {"message": "If email exists, reset instructions will be sent"}
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    await db.password_resets.insert_one({
        "token": reset_token,
        "user_id": user["user_id"],
        "expires_at": expires_at,
        "used": False,
        "created_at": datetime.now(timezone.utc)
    })
    
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
