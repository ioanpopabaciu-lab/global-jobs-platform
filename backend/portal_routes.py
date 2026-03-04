"""
Portal routes for Candidates and Employers
Extended with cloud storage document upload
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse
from datetime import datetime, timezone
from typing import Optional, List
import uuid
import logging
import os
import io

from models import (
    CandidateProfile, CandidateProfileCreate,
    EmployerProfile, EmployerProfileCreate,
    JobRequest, JobRequestCreate,
    Project, Document, Notification
)
from auth_routes import get_current_user, require_role
from storage import put_object, get_object, generate_storage_path, get_content_type, init_storage
from notification_service import notify_admin_new_profile_pending

logger = logging.getLogger(__name__)

# Platform URL for emails
PLATFORM_URL = os.environ.get("PLATFORM_URL", "https://visa-platform-2.preview.emergentagent.com")

# Database will be injected
db = None

def set_database(database):
    global db
    db = database

portal_router = APIRouter(prefix="/portal", tags=["Portal"])

# ==================== DOCUMENT UPLOAD ====================

ALLOWED_DOCUMENT_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/gif",
    "application/pdf",
    "video/mp4", "video/quicktime", "video/x-msvideo",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

# Storage folder mapping
DOCUMENT_FOLDERS = {
    "candidate": "candidate_documents",
    "employer": "employer_documents",
    "project": "immigration_files",
    "profile_photo": "profile_photos",
    "video_presentation": "video_presentations"
}

@portal_router.post("/candidate/documents/upload")
async def upload_candidate_document(
    request: Request,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    document_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None)
):
    """Upload a document for candidate profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")
    
    # Get or create candidate profile
    profile = await db.candidate_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        # Create a basic profile first
        profile = CandidateProfile(user_id=user["user_id"]).model_dump()
        profile["created_at"] = profile["created_at"].isoformat()
        profile["updated_at"] = profile["updated_at"].isoformat()
        await db.candidate_profiles.insert_one(profile)
    
    owner_id = profile["profile_id"]
    
    # Validate file
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # Determine storage folder
    if document_type == "profile_photo":
        folder = "profile_photos"
    elif document_type == "video_presentation":
        folder = "video_presentations"
    else:
        folder = "candidate_documents"
    
    # Generate storage path
    storage_path = generate_storage_path(folder, user["user_id"], file.filename)
    
    try:
        # Upload to cloud storage
        result = put_object(storage_path, content, file.content_type or "application/octet-stream")
        actual_path = result.get("path", storage_path)
        
        # Create document record
        doc = Document(
            owner_id=owner_id,
            owner_type="candidate",
            filename=actual_path.split("/")[-1],
            original_filename=file.filename,
            file_type=file.content_type or "application/octet-stream",
            file_size=len(content),
            storage_path=actual_path,
            document_type=document_type,
            document_number=document_number,
            issue_date=issue_date,
            expiry_date=expiry_date,
            uploaded_by=user["user_id"]
        )
        
        doc_dict = doc.model_dump()
        doc_dict["created_at"] = doc_dict["created_at"].isoformat()
        
        await db.documents.insert_one(doc_dict)
        
        # Update profile with document reference
        update_field = None
        if document_type == "passport":
            update_field = "passport_doc_id"
        elif document_type == "cv":
            update_field = "cv_doc_id"
        elif document_type == "criminal_record":
            update_field = "criminal_record_doc_id"
        elif document_type == "passport_photo":
            update_field = "passport_photo_doc_id"
        elif document_type == "profile_photo":
            update_field = "profile_photo_url"
        elif document_type == "video_presentation":
            update_field = "video_presentation_url"
        elif document_type == "medical_certificate":
            update_field = "medical_certificate_doc_id"
        
        if update_field:
            value = doc.doc_id
            # For photo/video, store the API URL to access it
            if document_type in ["profile_photo", "video_presentation"]:
                value = f"/api/portal/documents/{doc.doc_id}/download"
            
            await db.candidate_profiles.update_one(
                {"profile_id": owner_id},
                {"$set": {update_field: value, "updated_at": datetime.now(timezone.utc)}}
            )
        
        # For diplomas, add to array
        if document_type == "diploma":
            await db.candidate_profiles.update_one(
                {"profile_id": owner_id},
                {
                    "$push": {"diploma_doc_ids": doc.doc_id},
                    "$set": {"updated_at": datetime.now(timezone.utc)}
                }
            )
        
        return {
            "doc_id": doc.doc_id,
            "filename": file.filename,
            "storage_path": actual_path,
            "size": len(content),
            "message": "Document uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@portal_router.post("/employer/documents/upload")
async def upload_employer_document(
    request: Request,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    document_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None)
):
    """Upload a document for employer profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    # Get or create employer profile
    profile = await db.employer_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        profile = EmployerProfile(user_id=user["user_id"]).model_dump()
        profile["created_at"] = profile["created_at"].isoformat()
        profile["updated_at"] = profile["updated_at"].isoformat()
        await db.employer_profiles.insert_one(profile)
    
    owner_id = profile["profile_id"]
    
    # Validate file
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"File type {file.content_type} not allowed")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")
    
    # Generate storage path
    storage_path = generate_storage_path("employer_documents", user["user_id"], file.filename)
    
    try:
        # Upload to cloud storage
        result = put_object(storage_path, content, file.content_type or "application/octet-stream")
        actual_path = result.get("path", storage_path)
        
        # Create document record
        doc = Document(
            owner_id=owner_id,
            owner_type="employer",
            filename=actual_path.split("/")[-1],
            original_filename=file.filename,
            file_type=file.content_type or "application/octet-stream",
            file_size=len(content),
            storage_path=actual_path,
            document_type=document_type,
            document_number=document_number,
            issue_date=issue_date,
            expiry_date=expiry_date,
            uploaded_by=user["user_id"]
        )
        
        doc_dict = doc.model_dump()
        doc_dict["created_at"] = doc_dict["created_at"].isoformat()
        
        await db.documents.insert_one(doc_dict)
        
        # Update profile with document reference
        update_field = None
        if document_type == "cui_certificate":
            update_field = "cui_certificate_doc_id"
        elif document_type == "administrator_id":
            update_field = "administrator_id_doc_id"
        elif document_type == "company_criminal_record":
            update_field = "company_criminal_record_doc_id"
        elif document_type == "company_registration":
            update_field = "company_registration_doc_id"
        elif document_type == "fiscal_certificate":
            update_field = "fiscal_certificate_doc_id"
        
        if update_field:
            await db.employer_profiles.update_one(
                {"profile_id": owner_id},
                {"$set": {update_field: doc.doc_id, "updated_at": datetime.now(timezone.utc)}}
            )
        
        return {
            "doc_id": doc.doc_id,
            "filename": file.filename,
            "storage_path": actual_path,
            "size": len(content),
            "message": "Document uploaded successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to upload document: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload document: {str(e)}")

@portal_router.get("/candidate/documents")
async def get_candidate_documents(request: Request):
    """Get all documents for candidate"""
    user = await get_current_user(request)
    
    profile = await db.candidate_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        return {"documents": []}
    
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "candidate", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {"documents": documents}

@portal_router.get("/employer/documents")
async def get_employer_documents(request: Request):
    """Get all documents for employer"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        return {"documents": []}
    
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "employer", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {"documents": documents}

@portal_router.get("/documents/{doc_id}/download")
async def download_document(doc_id: str, request: Request):
    """Download a document by ID"""
    user = await get_current_user(request)
    
    # Find document
    doc = await db.documents.find_one(
        {"doc_id": doc_id, "is_deleted": {"$ne": True}},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Check access - owner or admin
    has_access = user["role"] == "admin"
    
    if not has_access:
        if doc["owner_type"] == "candidate":
            profile = await db.candidate_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
            has_access = profile and profile["profile_id"] == doc["owner_id"]
        elif doc["owner_type"] == "employer":
            profile = await db.employer_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
            has_access = profile and profile["profile_id"] == doc["owner_id"]
    
    if not has_access:
        raise HTTPException(status_code=403, detail="Access denied")
    
    try:
        # Get from cloud storage
        content, content_type = get_object(doc["storage_path"])
        
        return Response(
            content=content,
            media_type=doc.get("file_type", content_type),
            headers={
                "Content-Disposition": f"inline; filename=\"{doc['original_filename']}\""
            }
        )
    except Exception as e:
        logger.error(f"Failed to download document: {e}")
        raise HTTPException(status_code=500, detail="Failed to download document")

@portal_router.delete("/candidate/documents/{doc_id}")
async def delete_candidate_document(doc_id: str, request: Request):
    """Soft delete a candidate document"""
    user = await get_current_user(request)
    
    profile = await db.candidate_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find and verify ownership
    doc = await db.documents.find_one(
        {"doc_id": doc_id, "owner_id": profile["profile_id"], "owner_type": "candidate"},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Soft delete
    await db.documents.update_one(
        {"doc_id": doc_id},
        {"$set": {"is_deleted": True}}
    )
    
    # Remove reference from profile
    doc_type = doc["document_type"]
    if doc_type == "passport":
        await db.candidate_profiles.update_one(
            {"profile_id": profile["profile_id"]},
            {"$set": {"passport_doc_id": None}}
        )
    elif doc_type == "cv":
        await db.candidate_profiles.update_one(
            {"profile_id": profile["profile_id"]},
            {"$set": {"cv_doc_id": None}}
        )
    elif doc_type == "diploma":
        await db.candidate_profiles.update_one(
            {"profile_id": profile["profile_id"]},
            {"$pull": {"diploma_doc_ids": doc_id}}
        )
    elif doc_type == "criminal_record":
        await db.candidate_profiles.update_one(
            {"profile_id": profile["profile_id"]},
            {"$set": {"criminal_record_doc_id": None}}
        )
    
    return {"message": "Document deleted"}

@portal_router.delete("/employer/documents/{doc_id}")
async def delete_employer_document(doc_id: str, request: Request):
    """Soft delete an employer document"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one({"user_id": user["user_id"]}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Find and verify ownership
    doc = await db.documents.find_one(
        {"doc_id": doc_id, "owner_id": profile["profile_id"], "owner_type": "employer"},
        {"_id": 0}
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Soft delete
    await db.documents.update_one(
        {"doc_id": doc_id},
        {"$set": {"is_deleted": True}}
    )
    
    return {"message": "Document deleted"}

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
    
    # Get documents list
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "candidate", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {"profile": profile, "documents": documents}

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
    
    # Filter out None values from update data
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if existing:
        # Update existing profile
        # Don't reset status if just updating basic info
        if existing["status"] not in ["pending_validation", "validated"]:
            update_data["status"] = "draft"
        
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
            email=user.get("email"),
            **update_data
        )
        profile_doc = profile.model_dump()
        profile_doc["created_at"] = profile_doc["created_at"].isoformat()
        profile_doc["updated_at"] = profile_doc["updated_at"].isoformat()
        
        await db.candidate_profiles.insert_one(profile_doc)
        
        # Remove MongoDB _id before returning
        profile_doc.pop("_id", None)
        
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
    
    if profile["status"] not in ["draft", "rejected"]:
        raise HTTPException(status_code=400, detail="Profile already submitted or validated")
    
    # Check required fields
    required_fields = ["first_name", "last_name", "country_of_origin", "citizenship", "phone"]
    missing = [f for f in required_fields if not profile.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")
    
    # Check required documents
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "candidate", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    doc_types = [d["document_type"] for d in documents]
    required_docs = ["cv", "passport", "criminal_record", "passport_photo"]
    missing_docs = [d for d in required_docs if d not in doc_types]
    
    if missing_docs:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing required documents: {', '.join(missing_docs)}"
        )
    
    await db.candidate_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "status": "pending_validation",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Create notification for admins (in-app)
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": "admin",
        "title": "Profil candidat nou pentru validare",
        "message": f"Candidatul {profile.get('first_name', '')} {profile.get('last_name', '')} a trimis profilul pentru validare.",
        "type": "info",
        "category": "profile",
        "related_entity_type": "candidate_profile",
        "related_entity_id": profile["profile_id"],
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Send email notification to admin (candidati@gjc.ro)
    profile["email"] = user.get("email")
    await notify_admin_new_profile_pending(
        profile_type="Candidat",
        profile_data=profile,
        account_type="candidate",
        platform_url=PLATFORM_URL
    )
    
    return {"message": "Profile submitted for validation", "status": "pending_validation"}

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
    
    # Get documents list
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "employer", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {"profile": profile, "documents": documents}

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
    
    # Filter out None values from update data
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if existing:
        # Update existing profile
        if existing["status"] not in ["pending_validation", "validated"]:
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
            **update_data
        )
        profile_doc = profile.model_dump()
        profile_doc["created_at"] = profile_doc["created_at"].isoformat()
        profile_doc["updated_at"] = profile_doc["updated_at"].isoformat()
        
        await db.employer_profiles.insert_one(profile_doc)
        
        # Remove MongoDB _id before returning
        profile_doc.pop("_id", None)
        
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
    
    if profile["status"] not in ["draft", "rejected"]:
        raise HTTPException(status_code=400, detail="Profile already submitted or validated")
    
    # Check required fields
    required_fields = ["company_name", "company_cui", "address", "administrator_name", "phone", "email"]
    missing = [f for f in required_fields if not profile.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")
    
    # Check IGI eligibility for Romania
    if profile.get("country") == "RO":
        igi_checks = ["has_no_debts", "has_no_sanctions", "has_min_employees", "company_age_over_1_year"]
        failed_checks = [c for c in igi_checks if not profile.get(c)]
        if failed_checks:
            raise HTTPException(
                status_code=400, 
                detail="Please confirm all IGI eligibility requirements"
            )
    
    # Check required documents
    documents = await db.documents.find(
        {"owner_id": profile["profile_id"], "owner_type": "employer", "is_deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    doc_types = [d["document_type"] for d in documents]
    required_docs = ["cui_certificate", "administrator_id", "company_criminal_record"]
    missing_docs = [d for d in required_docs if d not in doc_types]
    
    if missing_docs:
        raise HTTPException(
            status_code=400, 
            detail=f"Missing required documents: {', '.join(missing_docs)}"
        )
    
    await db.employer_profiles.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "status": "pending_validation",
            "updated_at": datetime.now(timezone.utc)
        }}
    )
    
    # Create notification for admins (in-app)
    await db.notifications.insert_one({
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": "admin",
        "title": "Profil angajator nou pentru validare",
        "message": f"Compania {profile.get('company_name', '')} a trimis profilul pentru validare.",
        "type": "info",
        "category": "profile",
        "related_entity_type": "employer_profile",
        "related_entity_id": profile["profile_id"],
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    # Send email notification to admin (office@gjc.ro)
    await notify_admin_new_profile_pending(
        profile_type="Angajator",
        profile_data=profile,
        platform_url=PLATFORM_URL
    )
    
    return {"message": "Profile submitted for validation", "status": "pending_validation"}

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

@portal_router.put("/employer/jobs/{job_id}")
async def update_job_request(job_id: str, data: JobRequestCreate, request: Request):
    """Update existing job request"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    # Verify ownership
    job = await db.job_requests.find_one(
        {"job_id": job_id, "employer_id": profile["profile_id"]},
        {"_id": 0}
    )
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.job_requests.update_one(
        {"job_id": job_id},
        {"$set": update_data}
    )
    
    updated_job = await db.job_requests.find_one({"job_id": job_id}, {"_id": 0})
    return {"job": updated_job, "message": "Job updated"}

@portal_router.delete("/employer/jobs/{job_id}")
async def delete_job_request(job_id: str, request: Request):
    """Delete/cancel a job request"""
    user = await get_current_user(request)
    
    profile = await db.employer_profiles.find_one(
        {"user_id": user["user_id"]},
        {"_id": 0}
    )
    
    if not profile:
        raise HTTPException(status_code=400, detail="Profile not found")
    
    result = await db.job_requests.update_one(
        {"job_id": job_id, "employer_id": profile["profile_id"]},
        {"$set": {"status": "cancelled", "updated_at": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {"message": "Job cancelled"}

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
            {"_id": 0, "first_name": 1, "last_name": 1, "citizenship": 1, "current_profession": 1, "experience_years": 1}
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
            {"_id": 0, "first_name": 1, "last_name": 1, "citizenship": 1, "current_profession": 1}
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
        {"owner_id": project_id, "owner_type": "project", "is_deleted": {"$ne": True}},
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
            "unread_notifications": 0,
            "documents_count": 0
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
    
    # Count uploaded documents
    documents_count = await db.documents.count_documents({
        "owner_id": profile["profile_id"],
        "owner_type": "candidate",
        "is_deleted": {"$ne": True}
    })
    
    # Build full name from parts if available
    full_name = profile.get("full_name")
    if not full_name and (profile.get("first_name") or profile.get("last_name")):
        full_name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
    
    return {
        "has_profile": True,
        "profile_status": profile["status"],
        "active_projects": active_projects,
        "unread_notifications": unread_notifications,
        "documents_count": documents_count,
        "profile_summary": {
            "full_name": full_name or user.get("name", ""),
            "nationality": profile.get("citizenship") or profile.get("nationality", ""),
            "profession": profile.get("current_profession") or profile.get("profession", ""),
            "profile_photo": profile.get("profile_photo_url")
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
            "unread_notifications": 0,
            "documents_count": 0
        }
    
    # Count open jobs
    open_jobs = await db.job_requests.count_documents({
        "employer_id": profile["profile_id"],
        "status": "open"
    })
    
    # Count all jobs
    total_jobs = await db.job_requests.count_documents({
        "employer_id": profile["profile_id"]
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
    
    # Count uploaded documents
    documents_count = await db.documents.count_documents({
        "owner_id": profile["profile_id"],
        "owner_type": "employer",
        "is_deleted": {"$ne": True}
    })
    
    return {
        "has_profile": True,
        "profile_status": profile["status"],
        "company_name": profile.get("company_name", ""),
        "open_jobs": open_jobs,
        "total_jobs": total_jobs,
        "active_projects": active_projects,
        "unread_notifications": unread_notifications,
        "documents_count": documents_count
    }
