"""
# Railway rebuild: force fresh deploy
Portal routes for Candidates and Employers
Extended with cloud storage document upload
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import uuid
import logging
import os
import io
import base64

from models import (
    CandidateProfile, CandidateProfileCreate,
    EmployerProfile, EmployerProfileCreate,
    JobRequest, JobRequestCreate,
    Project, Document, Notification
)
from auth_routes import get_current_user, require_role
from storage import put_object, generate_storage_path, get_content_type, init_storage
from notification_service import notify_admin_new_profile_pending
from direct_upload_storage import (
    build_candidate_object_path,
    create_candidate_signed_upload,
    fetch_document_bytes,
    candidate_path_owned_by_user,
)
from document_ocr_service import (
    extract_id_card_data, 
    extract_document_expiry,
    calculate_expiry_status,
    get_documents_expiring_soon,
    DOCUMENT_VALIDITY
)

logger = logging.getLogger(__name__)

# Platform URL for emails
PLATFORM_URL = os.environ.get("PLATFORM_URL", "https://visa-relocation-hub.preview.emergentagent.com")

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


class CandidateUploadSessionBody(BaseModel):
    document_type: str
    filename: str = Field(..., max_length=512)
    content_type: str
    replace_existing: bool = False


class CandidateDocumentRegisterBody(BaseModel):
    document_type: str
    storage_path: str = Field(..., max_length=1024)
    original_filename: str = Field(..., max_length=512)
    file_size: int = Field(..., ge=0, le=MAX_FILE_SIZE)
    file_type: str
    replace_existing: bool = False
    document_number: Optional[str] = None
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None


# Storage folder mapping
DOCUMENT_FOLDERS = {
    "candidate": "candidate_documents",
    "employer": "employer_documents",
    "project": "immigration_files",
    "profile_photo": "profile_photos",
    "video_presentation": "video_presentations"
}

@portal_router.get("/candidate/documents/check-existing")
async def check_existing_candidate_document(
    request: Request,
    document_type: str
):
    """Check if candidate already has an active document of this type"""
    user = await get_current_user(request)

    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")

    try:
        from database.db_config import get_pg_connection
        async with get_pg_connection() as conn:
            row = await conn.fetchrow(
                "SELECT id, document_type, original_filename, status, created_at FROM documents WHERE user_id = $1 AND document_type = $2 AND is_archived = FALSE ORDER BY created_at DESC LIMIT 1",
                uuid.UUID(user["user_id"]), document_type
            )
        if row:
            return {"exists": True, "document": {
                "id": str(row["id"]),
                "document_type": row["document_type"],
                "original_filename": row["original_filename"],
                "status": row["status"],
                "created_at": row["created_at"].isoformat() if row["created_at"] else None,
            }}
        return {"exists": False, "document": None}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error checking existing document: %s", e)
        return {"exists": False, "document": None}


@portal_router.post("/candidate/documents/upload-session")
async def candidate_document_upload_session(request: Request, body: CandidateUploadSessionBody):
    """
    Return a signed URL for direct upload to Supabase Storage (browser PUT).
    Fișierul nu trece prin FastAPI.
    """
    user = await get_current_user(request)

    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")

    if body.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed: {body.content_type}",
        )

    # Use a minimal profile stub (TODO: fetch from PostgreSQL)
    profile = {"profile_id": f"cand_{user['user_id']}"}
    owner_id = profile["profile_id"]

    object_path = build_candidate_object_path(
        user["user_id"], body.document_type, body.filename
    )
    try:
        signed = create_candidate_signed_upload(object_path)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e)) from e

    return {
        "exists": False,
        "upload_url": signed["upload_url"],
        "storage_path": signed["storage_path"],
        "token": signed.get("token"),
        "bucket": signed.get("bucket"),
        "upload_method": "PUT",
        "content_type": body.content_type,
        "max_bytes": MAX_FILE_SIZE,
    }


@portal_router.post("/candidate/documents/register")
async def candidate_document_register(request: Request, body: CandidateDocumentRegisterBody):
    """După upload la Supabase Storage: salvează informațiile documentului în baza de date."""
    user = await get_current_user(request)

    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")

    if body.file_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"File type not allowed: {body.file_type}")
    if body.file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 50MB)")

    if not candidate_path_owned_by_user(body.storage_path, user["user_id"]):
        raise HTTPException(status_code=403, detail="Invalid storage path for this user")

    try:
        from database.db_config import get_pg_connection
        doc_id = uuid.uuid4()
        user_uuid = uuid.UUID(user["user_id"])

        issue_date_val = None
        expiry_date_val = None
        if body.issue_date:
            from datetime import date as date_type
            issue_date_val = date_type.fromisoformat(body.issue_date)
        if body.expiry_date:
            from datetime import date as date_type
            expiry_date_val = date_type.fromisoformat(body.expiry_date)

        # If replace_existing, archive old documents of same type
        async with get_pg_connection() as conn:
            if body.replace_existing:
                await conn.execute(
                    "UPDATE documents SET is_archived = TRUE, updated_at = NOW() WHERE user_id = $1 AND document_type = $2 AND is_archived = FALSE",
                    user_uuid, body.document_type
                )

            await conn.execute(
                """INSERT INTO documents (id, user_id, document_type, original_filename, file_type, file_size, storage_path, document_number, issue_date, expiry_date, status, owner_role)
                   VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'candidate')""",
                doc_id, user_uuid, body.document_type, body.original_filename,
                body.file_type, body.file_size, body.storage_path,
                body.document_number, issue_date_val, expiry_date_val
            )

        return {"success": True, "doc_id": str(doc_id), "status": "pending"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error registering candidate document: %s", e)
        raise HTTPException(status_code=500, detail="Could not save document information")

@portal_router.get("/employer/documents/check-existing")
async def check_existing_employer_document(
    request: Request,
    document_type: str
):
    """Check if employer already has an active document of this type"""
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    # TODO: implement in PostgreSQL
    return {"exists": False, "document": None}


@portal_router.post("/employer/documents/upload")
async def upload_employer_document(
    request: Request,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    document_number: Optional[str] = Form(None),
    issue_date: Optional[str] = Form(None),
    expiry_date: Optional[str] = Form(None),
    replace_existing: Optional[str] = Form("false")
):
    """Upload a document for employer profile"""
    user = await get_current_user(request)
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/candidate/documents")
async def get_candidate_documents(request: Request, include_archived: bool = False):
    """Get all documents for candidate"""
    user = await get_current_user(request)
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")

    try:
        from database.db_config import get_pg_connection
        async with get_pg_connection() as conn:
            if include_archived:
                rows = await conn.fetch(
                    "SELECT * FROM documents WHERE user_id = $1 AND owner_role = 'candidate' ORDER BY created_at DESC",
                    uuid.UUID(user["user_id"])
                )
            else:
                rows = await conn.fetch(
                    "SELECT * FROM documents WHERE user_id = $1 AND owner_role = 'candidate' AND is_archived = FALSE ORDER BY created_at DESC",
                    uuid.UUID(user["user_id"])
                )
        documents = []
        for r in rows:
            documents.append({
                "id": str(r["id"]),
                "document_type": r["document_type"],
                "original_filename": r["original_filename"],
                "file_type": r["file_type"],
                "file_size": r["file_size"],
                "storage_path": r["storage_path"],
                "document_number": r["document_number"],
                "issue_date": str(r["issue_date"]) if r["issue_date"] else None,
                "expiry_date": str(r["expiry_date"]) if r["expiry_date"] else None,
                "status": r["status"],
                "is_archived": r["is_archived"],
                "created_at": r["created_at"].isoformat() if r["created_at"] else None,
                "updated_at": r["updated_at"].isoformat() if r["updated_at"] else None,
            })

        required_types = ["passport", "cv"]
        uploaded_types = {d["document_type"] for d in documents}
        required_missing = [t for t in required_types if t not in uploaded_types]

        return {"documents": documents, "required_missing": required_missing}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error fetching candidate documents: %s", e)
        return {"documents": [], "required_missing": ["passport", "cv"]}

@portal_router.get("/employer/documents")
async def get_employer_documents(request: Request, include_archived: bool = False):
    """Get all documents for employer"""
    user = await get_current_user(request)
    return {"documents": []}  # TODO: implement in PostgreSQL

@portal_router.get("/documents/{doc_id}/download")
async def download_document(doc_id: str, request: Request):
    """Download a document by ID"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.delete("/candidate/documents/{doc_id}")
async def delete_candidate_document(doc_id: str, request: Request):
    """Soft delete a candidate document"""
    user = await get_current_user(request)
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")

    try:
        from database.db_config import get_pg_connection
        doc_uuid = uuid.UUID(doc_id)
        user_uuid = uuid.UUID(user["user_id"])

        async with get_pg_connection() as conn:
            row = await conn.fetchrow(
                "SELECT id, user_id FROM documents WHERE id = $1 AND is_archived = FALSE",
                doc_uuid
            )
            if not row:
                raise HTTPException(status_code=404, detail="Document not found")
            if str(row["user_id"]) != user["user_id"] and user["role"] != "admin":
                raise HTTPException(status_code=403, detail="Not your document")

            await conn.execute(
                "UPDATE documents SET is_archived = TRUE, updated_at = NOW() WHERE id = $1",
                doc_uuid
            )

        return {"success": True, "message": "Document deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Error deleting candidate document: %s", e)
        raise HTTPException(status_code=500, detail="Could not delete document")

@portal_router.delete("/employer/documents/{doc_id}")
async def delete_employer_document(doc_id: str, request: Request):
    """Soft delete an employer document"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")


# ==================== OCR AND DOCUMENT EXPIRY ====================

from pydantic import BaseModel

class OCRRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"

class DocumentExpiryRequest(BaseModel):
    image_base64: str
    document_type: str
    mime_type: Optional[str] = "image/jpeg"


@portal_router.post("/employer/ocr/id-card")
async def ocr_id_card(data: OCRRequest, request: Request):
    """
    Extract data from Romanian ID card using OCR
    Returns structured data that can be mapped to profile fields
    """
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    result = await extract_id_card_data(data.image_base64, data.mime_type)
    return result


@portal_router.post("/employer/ocr/document-expiry")
async def ocr_document_expiry(data: DocumentExpiryRequest, request: Request):
    """
    Extract expiry date and other data from documents
    Automatically calculates expiry for documents with fixed validity periods
    """
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    result = await extract_document_expiry(data.image_base64, data.document_type, data.mime_type)
    return result


@portal_router.get("/employer/documents/expiring")
async def get_employer_expiring_documents(request: Request, days: int = 30):
    """
    Get employer documents that are expiring within specified days
    Returns documents with status and days remaining
    """
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")


@portal_router.post("/employer/documents/upload-with-ocr")
async def upload_employer_document_with_ocr(
    request: Request,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    apply_ocr: str = Form("false"),
    replace_existing: Optional[str] = Form("false")
):
    """
    Upload a document for employer with optional OCR extraction
    For administrator_id (CI), automatically extracts and returns data
    """
    user = await get_current_user(request)
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")


# ==================== CANDIDATE PORTAL ====================

@portal_router.get("/candidate/profile")
async def get_candidate_profile(request: Request):
    """Get candidate's own profile"""
    user = await get_current_user(request)
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.post("/candidate/profile")
async def create_candidate_profile(data: CandidateProfileCreate, request: Request):
    """Create or update candidate profile"""
    user = await get_current_user(request)
    if user["role"] not in ["candidate", "admin"]:
        raise HTTPException(status_code=403, detail="Candidate access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.post("/candidate/profile/submit")
async def submit_candidate_profile(request: Request):
    """Submit profile for validation"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/candidate/applications")
async def get_candidate_applications(request: Request):
    """Get candidate's job applications/projects"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/candidate/notifications")
async def get_candidate_notifications(request: Request, unread_only: bool = False):
    """Get candidate notifications"""
    user = await get_current_user(request)
    return {"notifications": []}  # TODO: implement in PostgreSQL

@portal_router.put("/candidate/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request):
    """Mark notification as read"""
    user = await get_current_user(request)
    return {"message": "OK"}  # TODO: implement in PostgreSQL

# ==================== EMPLOYER PORTAL ====================

@portal_router.get("/employer/profile")
async def get_employer_profile(request: Request):
    """Get employer's own profile"""
    user = await get_current_user(request)
    
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.post("/employer/profile")
async def create_employer_profile(data: EmployerProfileCreate, request: Request):
    """Create or update employer profile"""
    user = await get_current_user(request)
    if user["role"] not in ["employer", "admin"]:
        raise HTTPException(status_code=403, detail="Employer access required")
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.post("/employer/profile/submit")
async def submit_employer_profile(request: Request):
    """Submit employer profile for validation"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

# ==================== JOB REQUESTS ====================

@portal_router.get("/employer/jobs")
async def get_employer_jobs(request: Request):
    """Get employer's job requests"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.post("/employer/jobs")
async def create_job_request(data: JobRequestCreate, request: Request):
    """Create new job request"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.put("/employer/jobs/{job_id}")
async def update_job_request(job_id: str, data: JobRequestCreate, request: Request):
    """Update existing job request"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.delete("/employer/jobs/{job_id}")
async def delete_job_request(job_id: str, request: Request):
    """Delete/cancel a job request"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/employer/jobs/{job_id}")
async def get_job_detail(job_id: str, request: Request):
    """Get job request details with matched candidates"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/employer/projects")
async def get_employer_projects(request: Request):
    """Get all employer's recruitment projects"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/employer/projects/{project_id}")
async def get_project_detail(project_id: str, request: Request):
    """Get detailed project tracking"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/employer/notifications")
async def get_employer_notifications(request: Request, unread_only: bool = False):
    """Get employer notifications"""
    user = await get_current_user(request)
    return {"notifications": []}  # TODO: implement in PostgreSQL

# ==================== DASHBOARD STATS ====================

@portal_router.get("/candidate/dashboard")
async def get_candidate_dashboard(request: Request):
    """Get candidate dashboard data"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")

@portal_router.get("/employer/dashboard")
async def get_employer_dashboard(request: Request):
    """Get employer dashboard data"""
    user = await get_current_user(request)
    raise HTTPException(status_code=501, detail="Not yet implemented in PostgreSQL mode")
