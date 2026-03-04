"""
Portal routes for Candidates and Employers
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from datetime import datetime, timezone
from typing import Optional, List
import uuid

from models import (
    CandidateProfile, CandidateProfileCreate,
    EmployerProfile, EmployerProfileCreate,
    JobRequest, JobRequestCreate,
    Project, Document, Notification
)
from auth_routes import get_current_user, require_role

# Database will be injected
db = None

def set_database(database):
    global db
    db = database

portal_router = APIRouter(prefix="/portal", tags=["Portal"])

# ==================== CANDIDATE PORTAL ====================

@portal_router.get("/candidate/profile")
async def get_candidate_profile(request: Request):
    """Get candidate's own profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")
    
    profile = await db.candidate_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {"profile": None, "message": "Profile not created yet"}
    
    return {"profile": profile}

@portal_router.post("/candidate/profile")
async def create_candidate_profile(data: CandidateProfileCreate, request: Request):
    """Create or update candidate profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")
    
    existing = await db.candidate_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if existing:
        # Update existing profile
        update_data = data.model_dump()
        update_data["updated_at"] = datetime.now(timezone.utc)
        update_data["status"] = "draft"  # Reset to draft on update
        
        await db.candidate_profiles.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
        
        profile = await db.candidate_profiles.find_one(
            {"user_id": user["user_id"]},
            {"_id": 0}
        )
        return {"profile": profile, "message": "Profile updated"}
    else:
        # Create new profile
        profile = CandidateProfile(
            user_id=user["user_id"],
            **data.model_dump()
        )
        profile_doc = profile.model_dump()
        profile_doc["created_at"] = profile_doc["created_at"].isoformat()
        profile_doc["updated_at"] = profile_doc["updated_at"].isoformat()
        
        await db.candidate_profiles.insert_one(profile_doc)
        
        return {"profile": profile_doc, "message": "Profile created"}

@portal_router.post("/candidate/profile/submit")
async def submit_candidate_profile(request: Request):
    """Submit profile for validation"""
    user = await get_current_user(request)
    
    profile = await db.candidate_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile["status"] != "draft":
        raise HTTPException(status_code=400, detail="Profile already submitted")
    
    await db.candidate_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "status": "pending_validation",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Create notification for admins
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": "admin",  # Will be filtered for admin users
        "title": "Profil candidat nou pentru validare",
        "message": f"Candidatul {profile['full_name']} a trimis profilul pentru validare.",
        "type": "info",
        "category": "profile",
        "related_entity_type": "candidate_profile",
        "related_entity_id": profile["profile_id"],
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return {"message": "Profile submitted for validation"}

@portal_router.get("/candidate/applications")
async def get_candidate_applications(request: Request):
    """Get candidate's job applications/projects"""
    user = await get_current_user(request)
    
    profile = await db.candidate_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {"projects": [], "message": "Create profile first"}
    
    projects = await db.projects.find(
        {"candidate_id": profile["profile_id"]},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with job and employer info
    for project in projects:
        job = await db.job_requests.find_one(
            {"job_id": project["job_id"]},
            {"_id": 0, "title": 1, "industry": 1, "work_location": 1}
        )
        employer = await db.employer_profiles.find_one(
            {"profile_id": project["employer_id"]},
            {"_id": 0, "company_name": 1}
        )
        project["job"] = job
        project["employer"] = employer
    
    return {"projects": projects}

@portal_router.get("/candidate/notifications")
async def get_candidate_notifications(request: Request, unread_only: bool = False):
    """Get candidate notifications"""
    user = await get_current_user(request)
    
    query = {"user_id": user["user_id"]}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"notifications": notifications}

@portal_router.put("/candidate/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request):
    """Mark notification as read"""
    user = await get_current_user(request)
    
    result = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user["user_id"]},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    return {"message": "Marked as read"}

# ==================== EMPLOYER PORTAL ====================

@portal_router.get("/employer/profile")
async def get_employer_profile(request: Request):
    """Get employer's own profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {"profile": None, "message": "Profile not created yet"}
    
    return {"profile": profile}

@portal_router.post("/employer/profile")
async def create_employer_profile(data: EmployerProfileCreate, request: Request):
    """Create or update employer profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    existing = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if existing:
        # Update existing profile
        update_data = data.model_dump()
        update_data["updated_at"] = datetime.now(timezone.utc)
        update_data["status"] = "draft"
        
        await db.employer_profiles.update_one(
            {"user_id": user["user_id"]},
            {"$set": update_data}
        )
        
        profile = await db.employer_profiles.find_one(
            {"user_id": user["user_id"]},
            {"_id": 0}
        )
        return {"profile": profile, "message": "Profile updated"}
    else:
        # Create new profile
        profile = EmployerProfile(
            user_id=user["user_id"],
            **data.model_dump()
        )
        profile_doc = profile.model_dump()
        profile_doc["created_at"] = profile_doc["created_at"].isoformat()
        profile_doc["updated_at"] = profile_doc["updated_at"].isoformat()
        
        await db.employer_profiles.insert_one(profile_doc)
        
        return {"profile": profile_doc, "message": "Profile created"}

@portal_router.post("/employer/profile/submit")
async def submit_employer_profile(request: Request):
    """Submit employer profile for validation"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if profile["status"] != "draft":
        raise HTTPException(status_code=400, detail="Profile already submitted")
    
    await db.employer_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "status": "pending_validation",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    return {"message": "Profile submitted for validation"}

# ==================== JOB REQUESTS ====================

@portal_router.get("/employer/jobs")
async def get_employer_jobs(request: Request):
    """Get employer's job requests"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {"jobs": [], "message": "Create company profile first"}
    
    jobs = await db.job_requests.find(
        {"employer_id": profile["profile_id"]},
        {"_id": 0}
    ).to_list(100)
    
    return {"jobs": jobs}

@portal_router.post("/employer/jobs")
async def create_job_request(data: JobRequestCreate, request: Request):
    """Create new job request"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=400, detail="Create company profile first")
    
    if profile["status"] != "validated":
        raise HTTPException(status_code=400, detail="Company profile must be validated first")
    
    job = JobRequest(
        employer_id=profile["profile_id"],
        **data.model_dump()
    )
    job_doc = job.model_dump()
    job_doc["created_at"] = job_doc["created_at"].isoformat()
    job_doc["updated_at"] = job_doc["updated_at"].isoformat()
    
    await db.job_requests.insert_one(job_doc)
    
    return {"job": job_doc, "message": "Job request created"}

@portal_router.get("/employer/jobs/{job_id}")
async def get_job_detail(job_id: str, request: Request):
    """Get job request details with matched candidates"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    job = await db.job_requests.find_one(
        {"job_id": job_id, "employer_id": profile["profile_id"]},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Get projects (matched candidates) for this job
    projects = await db.projects.find(
        {"job_id": job_id},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with candidate info
    for project in projects:
        candidate = await db.candidate_profiles.find_one(
            {"profile_id": project["candidate_id"]},
            {"_id": 0, "full_name": 1, "nationality": 1, "profession": 1, "experience_years": 1}
        )
        project["candidate"] = candidate
    
    return {"job": job, "projects": projects}

@portal_router.get("/employer/projects")
async def get_employer_projects(request: Request):
    """Get all employer's recruitment projects"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {"projects": [], "message": "Create company profile first"}
    
    projects = await db.projects.find(
        {"employer_id": profile["profile_id"]},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with candidate and job info
    for project in projects:
        candidate = await db.candidate_profiles.find_one(
            {"profile_id": project["candidate_id"]},
            {"_id": 0, "full_name": 1, "nationality": 1, "profession": 1}
        )
        job = await db.job_requests.find_one(
            {"job_id": project["job_id"]},
            {"_id": 0, "title": 1}
        )
        project["candidate"] = candidate
        project["job"] = job
    
    return {"projects": projects}

@portal_router.get("/employer/projects/{project_id}")
async def get_project_detail(project_id: str, request: Request):
    """Get detailed project tracking"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    project = await db.projects.find_one(
        {"project_id": project_id, "employer_id": profile["profile_id"]},
        {"_id": 0}
    )
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get full candidate info
    candidate = await db.candidate_profiles.find_one(
        {"profile_id": project["candidate_id"]},
        {"_id": 0}
    )
    
    # Get job info
    job = await db.job_requests.find_one(
        {"job_id": project["job_id"]},
        {"_id": 0}
    )
    
    # Get related documents
    documents = await db.documents.find(
        {"owner_id": project_id, "owner_type": "project"},
        {"_id": 0}
    ).to_list(50)
    
    return {
        "project": project,
        "candidate": candidate,
        "job": job,
        "documents": documents
    }

@portal_router.get("/employer/notifications")
async def get_employer_notifications(request: Request, unread_only: bool = False):
    """Get employer notifications"""
    user = await get_current_user(request)
    
    query = {"user_id": user["user_id"]}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"notifications": notifications}

# ==================== DASHBOARD STATS ====================

@portal_router.get("/candidate/dashboard")
async def get_candidate_dashboard(request: Request):
    """Get candidate dashboard data"""
    user = await get_current_user(request)
    
    profile = await db.candidate_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {
            "has_profile": False,
            "profile_status": None,
            "active_projects": 0,
            "unread_notifications": 0
        }
    
    # Count active projects
    active_projects = await db.projects.count_documents({
        "candidate_id": profile["profile_id"],
        "current_stage": {"$ne": "completed"}
    })
    
    # Count unread notifications
    unread_notifications = await db.notifications.count_documents({
        "user_id": user["user_id"],
        "is_read": False
    })
    
    return {
        "has_profile": True,
        "profile_status": profile["status"],
        "active_projects": active_projects,
        "unread_notifications": unread_notifications,
        "profile_summary": {
            "full_name": profile["full_name"],
            "nationality": profile["nationality"],
            "profession": profile["profession"]
        }
    }

@portal_router.get("/employer/dashboard")
async def get_employer_dashboard(request: Request):
    """Get employer dashboard data"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        return {
            "has_profile": False,
            "profile_status": None,
            "open_jobs": 0,
            "active_projects": 0,
            "unread_notifications": 0
        }
    
    # Count open jobs
    open_jobs = await db.job_requests.count_documents({
        "employer_id": profile["profile_id"],
        "status": "open"
    })
    
    # Count active projects
    active_projects = await db.projects.count_documents({
        "employer_id": profile["profile_id"],
        "current_stage": {"$ne": "completed"}
    })
    
    # Count unread notifications
    unread_notifications = await db.notifications.count_documents({
        "user_id": user["user_id"],
        "is_read": False
    })
    
    return {
        "has_profile": True,
        "profile_status": profile["status"],
        "company_name": profile["company_name"],
        "open_jobs": open_jobs,
        "active_projects": active_projects,
        "unread_notifications": unread_notifications
    }
