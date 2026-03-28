"""
Admin routes for Agency Dashboard
Full control over candidates, employers, projects, and immigration workflow
"""
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import os

from models import Project, ProjectStageHistory, ImmigrationStage
from auth_routes import get_current_user
from notification_service import (
    notify_employers_of_new_candidate,
    notify_profile_validation,
    calculate_match_score
)

# Database will be injected
db = None

# Platform URL for emails
PLATFORM_URL = os.environ.get("PLATFORM_URL", "https://visa-relocation-hub.preview.emergentagent.com")

def set_database(database):
    global db
    db = database

admin_router = APIRouter(prefix="/admin", tags=["Admin"])

# Helper to check admin role
async def require_admin(request: Request):
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

# ==================== DASHBOARD ====================

@admin_router.get("/dashboard")
async def get_admin_dashboard(request: Request):
    """Get admin dashboard overview"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== CANDIDATE MANAGEMENT ====================

@admin_router.get("/candidates")
async def list_candidates(
    request: Request,
    status: Optional[str] = None,
    nationality: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all candidate profiles"""
    await require_admin(request)
    
    return {"candidates": [], "total": 0, "skip": skip, "limit": limit}  # TODO: implement in PostgreSQL

@admin_router.get("/candidates/{profile_id}")
async def get_candidate_detail(profile_id: str, request: Request):
    """Get detailed candidate info"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@admin_router.put("/candidates/{profile_id}/validate")
async def validate_candidate(
    profile_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None
):
    """Validate or reject candidate profile"""
    admin = await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== EMPLOYER MANAGEMENT ====================

@admin_router.get("/employers")
async def list_employers(
    request: Request,
    status: Optional[str] = None,
    country: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all employer profiles"""
    await require_admin(request)
    
    return {"employers": [], "total": 0, "skip": skip, "limit": limit}  # TODO: implement in PostgreSQL

@admin_router.get("/employers/{profile_id}")
async def get_employer_detail(profile_id: str, request: Request):
    """Get detailed employer info"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@admin_router.put("/employers/{profile_id}/validate")
async def validate_employer(
    profile_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None
):
    """Validate or reject employer profile"""
    admin = await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== JOB MANAGEMENT ====================

@admin_router.get("/jobs")
async def list_all_jobs(
    request: Request,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all job requests"""
    await require_admin(request)
    
    return {"jobs": [], "total": 0, "skip": skip, "limit": limit}  # TODO: implement in PostgreSQL

@admin_router.put("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    request: Request,
    status: str
):
    """Update job request status"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== PROJECT MANAGEMENT ====================

@admin_router.get("/projects")
async def list_all_projects(
    request: Request,
    stage: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all recruitment projects"""
    await require_admin(request)
    
    return {"projects": [], "total": 0, "skip": skip, "limit": limit}  # TODO: implement in PostgreSQL

@admin_router.post("/projects")
async def create_project(
    request: Request,
    candidate_id: str,
    employer_id: str,
    job_id: str,
    matching_score: int = 0
):
    """Create new recruitment project (match candidate to job)"""
    admin = await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@admin_router.get("/projects/{project_id}")
async def get_project_detail_admin(project_id: str, request: Request):
    """Get full project details"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@admin_router.put("/projects/{project_id}/stage")
async def update_project_stage(
    project_id: str,
    request: Request,
    new_stage: str,
    notes: Optional[str] = None
):
    """Update project immigration stage"""
    admin = await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@admin_router.post("/projects/{project_id}/notes")
async def add_project_note(
    project_id: str,
    request: Request,
    text: str
):
    """Add note to project"""
    admin = await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== MATCHING ENGINE ====================

@admin_router.get("/matching/candidates/{job_id}")
async def find_matching_candidates(job_id: str, request: Request):
    """Find candidates matching a job request"""
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

def calculate_matching_score(candidate: dict, job: dict) -> int:
    """Calculate compatibility score between candidate and job (0-100)"""
    score = 0
    
    # Industry match (30 points)
    if job.get("industry") in candidate.get("preferred_industries", []):
        score += 30
    
    # Experience (25 points)
    required_exp = job.get("required_experience_years", 0)
    candidate_exp = candidate.get("experience_years", 0)
    if candidate_exp >= required_exp:
        score += 25
    elif candidate_exp >= required_exp - 1:
        score += 15
    
    # English level (20 points)
    english_levels = {"none": 0, "basic": 1, "intermediate": 2, "advanced": 3, "fluent": 4}
    required_level = english_levels.get(job.get("required_english_level", "basic"), 1)
    candidate_level = english_levels.get(candidate.get("english_level", "basic"), 1)
    if candidate_level >= required_level:
        score += 20
    elif candidate_level == required_level - 1:
        score += 10
    
    # Nationality preference (15 points)
    preferred_nationalities = job.get("preferred_nationalities", [])
    if not preferred_nationalities or candidate.get("nationality") in preferred_nationalities:
        score += 15
    
    # Skills match (10 points)
    required_skills = set(job.get("required_skills", []))
    candidate_skills = set(candidate.get("skills", []))
    if required_skills:
        skill_match = len(required_skills & candidate_skills) / len(required_skills)
        score += int(skill_match * 10)
    else:
        score += 10
    
    return score


# ==================== DOCUMENT EXPIRY ADMIN ====================

from document_ocr_service import calculate_expiry_status, get_documents_expiring_soon

@admin_router.get("/documents/expiring")
async def get_all_expiring_documents(
    request: Request,
    days: int = 30,
    filter_status: str = "all"
):
    """
    Get all documents expiring within specified days across all employers
    Used for admin monitoring of document expiry
    """
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")


@admin_router.put("/documents/{doc_id}/renew")
async def mark_document_renewed(doc_id: str, request: Request):
    """
    Mark a document as renewed (for admin use when new document is uploaded)
    """
    await require_admin(request)
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

