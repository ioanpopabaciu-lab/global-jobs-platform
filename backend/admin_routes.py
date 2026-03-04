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
PLATFORM_URL = os.environ.get("PLATFORM_URL", "https://global-jobs-recruit.preview.emergentagent.com")

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
    
    # User stats
    total_users = await db.users.count_documents({})
    candidates_count = await db.users.count_documents({"role": "candidate"})
    employers_count = await db.users.count_documents({"role": "employer"})
    
    # Profile stats
    pending_candidate_profiles = await db.candidate_profiles.count_documents({"status": "pending_validation"})
    pending_employer_profiles = await db.employer_profiles.count_documents({"status": "pending_validation"})
    validated_candidates = await db.candidate_profiles.count_documents({"status": "validated"})
    validated_employers = await db.employer_profiles.count_documents({"status": "validated"})
    
    # Project stats
    total_projects = await db.projects.count_documents({})
    active_projects = await db.projects.count_documents({"current_stage": {"$ne": "completed"}})
    completed_projects = await db.projects.count_documents({"current_stage": "completed"})
    
    # Job stats
    open_jobs = await db.job_requests.count_documents({"status": "open"})
    
    # Projects by stage
    pipeline = [
        {"$group": {"_id": "$current_stage", "count": {"$sum": 1}}}
    ]
    stages_aggregation = await db.projects.aggregate(pipeline).to_list(30)
    projects_by_stage = {item["_id"]: item["count"] for item in stages_aggregation}
    
    return {
        "users": {
            "total": total_users,
            "candidates": candidates_count,
            "employers": employers_count
        },
        "profiles": {
            "pending_candidates": pending_candidate_profiles,
            "pending_employers": pending_employer_profiles,
            "validated_candidates": validated_candidates,
            "validated_employers": validated_employers
        },
        "projects": {
            "total": total_projects,
            "active": active_projects,
            "completed": completed_projects,
            "by_stage": projects_by_stage
        },
        "jobs": {
            "open": open_jobs
        }
    }

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
    
    query = {}
    if status:
        query["status"] = status
    if nationality:
        query["nationality"] = nationality
    
    candidates = await db.candidate_profiles.find(
        query,
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    total = await db.candidate_profiles.count_documents(query)
    
    # Enrich with user email
    for candidate in candidates:
        user = await db.users.find_one(
            {"user_id": candidate["user_id"]},
            {"_id": 0, "email": 1}
        )
        candidate["email"] = user.get("email") if user else None
    
    return {
        "candidates": candidates,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@admin_router.get("/candidates/{profile_id}")
async def get_candidate_detail(profile_id: str, request: Request):
    """Get detailed candidate info"""
    await require_admin(request)
    
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": profile_id},
        {"_id": 0}
    )
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Get user info
    user = await db.users.find_one(
        {"user_id": candidate["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    # Get documents
    documents = await db.documents.find(
        {"owner_id": profile_id, "owner_type": "candidate"},
        {"_id": 0}
    ).to_list(50)
    
    # Get projects
    projects = await db.projects.find(
        {"candidate_id": profile_id},
        {"_id": 0}
    ).to_list(50)
    
    return {
        "candidate": candidate,
        "user": user,
        "documents": documents,
        "projects": projects
    }

@admin_router.put("/candidates/{profile_id}/validate")
async def validate_candidate(
    profile_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None
):
    """Validate or reject candidate profile"""
    admin = await require_admin(request)
    
    if status not in ["validated", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'validated' or 'rejected'")
    
    # Get candidate before update
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": profile_id},
        {"_id": 0}
    )
    
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Update status
    result = await db.candidate_profiles.update_one(
        {"profile_id": profile_id},
        {"$set": {
            "status": status,
            "validation_notes": notes,
            "validated_by": admin["user_id"],
            "validated_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Get user info for notifications
    user = await db.users.find_one(
        {"user_id": candidate["user_id"]},
        {"_id": 0, "email": 1, "name": 1}
    )
    
    candidate_name = f"{candidate.get('first_name', '')} {candidate.get('last_name', '')}".strip()
    if not candidate_name:
        candidate_name = user.get("name", "Candidat")
    
    # Send notification with email
    await notify_profile_validation(
        user_id=candidate["user_id"],
        user_name=candidate_name,
        user_type="candidate",
        is_validated=(status == "validated"),
        rejection_reason=notes if status == "rejected" else None,
        platform_url=PLATFORM_URL
    )
    
    # If validated, trigger matching with open jobs and notify employers
    if status == "validated":
        # Refresh candidate data with full profile
        updated_candidate = await db.candidate_profiles.find_one(
            {"profile_id": profile_id},
            {"_id": 0}
        )
        await notify_employers_of_new_candidate(updated_candidate, PLATFORM_URL)
    
    return {"message": f"Candidate profile {status}"}

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
    
    query = {}
    if status:
        query["status"] = status
    if country:
        query["country"] = country
    
    employers = await db.employer_profiles.find(
        query,
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    total = await db.employer_profiles.count_documents(query)
    
    return {
        "employers": employers,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@admin_router.get("/employers/{profile_id}")
async def get_employer_detail(profile_id: str, request: Request):
    """Get detailed employer info"""
    await require_admin(request)
    
    employer = await db.employer_profiles.find_one(
        {"profile_id": profile_id},
        {"_id": 0}
    )
    
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    # Get user info
    user = await db.users.find_one(
        {"user_id": employer["user_id"]},
        {"_id": 0, "password_hash": 0}
    )
    
    # Get job requests
    jobs = await db.job_requests.find(
        {"employer_id": profile_id},
        {"_id": 0}
    ).to_list(50)
    
    # Get projects
    projects = await db.projects.find(
        {"employer_id": profile_id},
        {"_id": 0}
    ).to_list(50)
    
    return {
        "employer": employer,
        "user": user,
        "jobs": jobs,
        "projects": projects
    }

@admin_router.put("/employers/{profile_id}/validate")
async def validate_employer(
    profile_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None
):
    """Validate or reject employer profile"""
    admin = await require_admin(request)
    
    if status not in ["validated", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'validated' or 'rejected'")
    
    # Get employer before update
    employer = await db.employer_profiles.find_one(
        {"profile_id": profile_id},
        {"_id": 0}
    )
    
    if not employer:
        raise HTTPException(status_code=404, detail="Employer not found")
    
    # Update status
    result = await db.employer_profiles.update_one(
        {"profile_id": profile_id},
        {"$set": {
            "status": status,
            "validation_notes": notes,
            "validated_by": admin["user_id"],
            "validated_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Get user info for notifications
    user = await db.users.find_one(
        {"user_id": employer["user_id"]},
        {"_id": 0, "email": 1, "name": 1}
    )
    
    company_name = employer.get("company_name") or user.get("name", "Companie")
    
    # Send notification with email
    await notify_profile_validation(
        user_id=employer["user_id"],
        user_name=company_name,
        user_type="employer",
        is_validated=(status == "validated"),
        rejection_reason=notes if status == "rejected" else None,
        platform_url=PLATFORM_URL
    )
    
    return {"message": f"Employer profile {status}"}

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
    
    query = {}
    if status:
        query["status"] = status
    
    jobs = await db.job_requests.find(
        query,
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with employer info
    for job in jobs:
        employer = await db.employer_profiles.find_one(
            {"profile_id": job["employer_id"]},
            {"_id": 0, "company_name": 1, "country": 1}
        )
        job["employer"] = employer
    
    total = await db.job_requests.count_documents(query)
    
    return {
        "jobs": jobs,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@admin_router.put("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    request: Request,
    status: str
):
    """Update job request status"""
    await require_admin(request)
    
    if status not in ["draft", "open", "in_progress", "filled", "cancelled"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    result = await db.job_requests.update_one(
        {"job_id": job_id},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": f"Job status updated to {status}"}

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
    
    query = {}
    if stage:
        query["current_stage"] = stage
    
    projects = await db.projects.find(
        query,
        {"_id": 0}
    ).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with candidate and employer info
    for project in projects:
        candidate = await db.candidate_profiles.find_one(
            {"profile_id": project["candidate_id"]},
            {"_id": 0, "full_name": 1, "nationality": 1}
        )
        employer = await db.employer_profiles.find_one(
            {"profile_id": project["employer_id"]},
            {"_id": 0, "company_name": 1}
        )
        job = await db.job_requests.find_one(
            {"job_id": project["job_id"]},
            {"_id": 0, "title": 1}
        )
        project["candidate"] = candidate
        project["employer"] = employer
        project["job"] = job
    
    total = await db.projects.count_documents(query)
    
    return {
        "projects": projects,
        "total": total,
        "skip": skip,
        "limit": limit
    }

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
    
    # Verify candidate exists and is validated
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": candidate_id, "status": "validated"},
        {"_id": 0}
    )
    if not candidate:
        raise HTTPException(status_code=400, detail="Candidate not found or not validated")
    
    # Verify employer exists and is validated
    employer = await db.employer_profiles.find_one(
        {"profile_id": employer_id, "status": "validated"},
        {"_id": 0}
    )
    if not employer:
        raise HTTPException(status_code=400, detail="Employer not found or not validated")
    
    # Verify job exists
    job = await db.job_requests.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    if not job:
        raise HTTPException(status_code=400, detail="Job not found")
    
    # Create project
    project_id = f"proj_{uuid.uuid4().hex[:12]}"
    project_doc = {
        "project_id": project_id,
        "candidate_id": candidate_id,
        "employer_id": employer_id,
        "job_id": job_id,
        "current_stage": "candidate_matched",
        "stage_history": [{
            "stage": "candidate_matched",
            "changed_at": datetime.now(timezone.utc).isoformat(),
            "changed_by": admin["user_id"],
            "notes": "Project created"
        }],
        "matching_score": matching_score,
        "payment_status": "pending",
        "notes": [],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.projects.insert_one(project_doc)
    
    # Update job status
    await db.job_requests.update_one(
        {"job_id": job_id},
        {"$set": {"status": "in_progress"}}
    )
    
    # Notify candidate
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": candidate["user_id"],
        "title": "Ai fost selectat pentru un job!",
        "message": f"Ai fost potrivit pentru poziția {job['title']} la {employer['company_name']}.",
        "type": "success",
        "category": "project",
        "related_entity_type": "project",
        "related_entity_id": project_id,
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Notify employer
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": employer["user_id"],
        "title": "Candidat potrivit găsit!",
        "message": f"Am găsit un candidat potrivit pentru poziția {job['title']}: {candidate['full_name']}.",
        "type": "success",
        "category": "project",
        "related_entity_type": "project",
        "related_entity_id": project_id,
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"project": project_doc, "message": "Project created"}

@admin_router.get("/projects/{project_id}")
async def get_project_detail_admin(project_id: str, request: Request):
    """Get full project details"""
    await require_admin(request)
    
    project = await db.projects.find_one(
        {"project_id": project_id},
        {"_id": 0}
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get all related data
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": project["candidate_id"]},
        {"_id": 0}
    )
    employer = await db.employer_profiles.find_one(
        {"profile_id": project["employer_id"]},
        {"_id": 0}
    )
    job = await db.job_requests.find_one(
        {"job_id": project["job_id"]},
        {"_id": 0}
    )
    documents = await db.documents.find(
        {"owner_id": project_id, "owner_type": "project"},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "project": project,
        "candidate": candidate,
        "employer": employer,
        "job": job,
        "documents": documents
    }

@admin_router.put("/projects/{project_id}/stage")
async def update_project_stage(
    project_id: str,
    request: Request,
    new_stage: str,
    notes: Optional[str] = None
):
    """Update project immigration stage"""
    admin = await require_admin(request)
    
    # Validate stage
    valid_stages = [
        "candidate_registration", "candidate_validation", "employer_registration",
        "employer_validation", "job_request_created", "candidate_matched",
        "contract_generated", "contract_signed", "invoice_generated",
        "payment_received", "documents_uploaded", "igi_work_permit_submitted",
        "igi_work_permit_approved", "evisa_submitted", "embassy_interview",
        "visa_issued", "candidate_travel", "arrival_romania",
        "residence_permit_applied", "residence_permit_issued", "completed"
    ]
    
    if new_stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")
    
    project = await db.projects.find_one(
        {"project_id": project_id},
        {"_id": 0}
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Add to stage history
    stage_entry = {
        "stage": new_stage,
        "changed_at": datetime.now(timezone.utc).isoformat(),
        "changed_by": admin["user_id"],
        "notes": notes
    }
    
    await db.projects.update_one(
        {"project_id": project_id},
        {
            "$set": {
                "current_stage": new_stage,
                "updated_at": datetime.now(timezone.utc)
            },
            "$push": {"stage_history": stage_entry}
        }
    )
    
    # Get candidate and employer for notifications
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": project["candidate_id"]},
        {"_id": 0, "user_id": 1}
    )
    employer = await db.employer_profiles.find_one(
        {"profile_id": project["employer_id"]},
        {"_id": 0, "user_id": 1}
    )
    
    # Stage names for notifications
    stage_names = {
        "contract_generated": "Contract generat",
        "contract_signed": "Contract semnat",
        "invoice_generated": "Factură emisă",
        "payment_received": "Plată primită",
        "documents_uploaded": "Documente încărcate",
        "igi_work_permit_submitted": "Dosar IGI depus",
        "igi_work_permit_approved": "Aviz muncă aprobat",
        "evisa_submitted": "e-Visa depusă",
        "embassy_interview": "Interviu ambasadă programat",
        "visa_issued": "Viză emisă",
        "candidate_travel": "Călătorie programată",
        "arrival_romania": "Sosire în România",
        "residence_permit_applied": "Permis ședere depus",
        "residence_permit_issued": "Permis ședere emis",
        "completed": "Proiect finalizat"
    }
    
    stage_name = stage_names.get(new_stage, new_stage)
    
    # Notify both parties
    for user_id in [candidate["user_id"], employer["user_id"]]:
        await db.notifications.insert_one({
            "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
            "user_id": user_id,
            "title": f"Actualizare proiect: {stage_name}",
            "message": notes or f"Proiectul a trecut în etapa: {stage_name}",
            "type": "info",
            "category": "project",
            "related_entity_type": "project",
            "related_entity_id": project_id,
            "is_read": False,
            "created_at": datetime.now(timezone.utc)
        })
    
    return {"message": f"Project stage updated to {new_stage}"}

@admin_router.post("/projects/{project_id}/notes")
async def add_project_note(
    project_id: str,
    request: Request,
    text: str
):
    """Add note to project"""
    admin = await require_admin(request)
    
    note = {
        "user_id": admin["user_id"],
        "text": text,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.projects.update_one(
        {"project_id": project_id},
        {"$push": {"notes": note}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return {"message": "Note added", "note": note}

# ==================== MATCHING ENGINE ====================

@admin_router.get("/matching/candidates/{job_id}")
async def find_matching_candidates(job_id: str, request: Request):
    """Find candidates matching a job request"""
    await require_admin(request)
    
    job = await db.job_requests.find_one(
        {"job_id": job_id},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get validated candidates
    candidates = await db.candidate_profiles.find(
        {"status": "validated"},
        {"_id": 0}
    ).to_list(500)
    
    # Calculate matching scores
    matched = []
    for candidate in candidates:
        score = calculate_matching_score(candidate, job)
        if score > 0:
            matched.append({
                "candidate": candidate,
                "score": score
            })
    
    # Sort by score descending
    matched.sort(key=lambda x: x["score"], reverse=True)
    
    return {
        "job": job,
        "matches": matched[:50]  # Top 50 matches
    }

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
