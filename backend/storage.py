"""
Cloud Storage Service using Emergent Object Storage
"""
import os
import requests
import logging
import uuid
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "gjc-platform"

# Module-level storage key - initialized once at startup
storage_key: Optional[str] = None

MIME_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg", 
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    "pdf": "application/pdf",
    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

def init_storage() -> Optional[str]:
    """Initialize storage and get session key. Call ONCE at startup."""
    global storage_key
    
    if storage_key:
        return storage_key
    
    emergent_key = os.environ.get("EMERGENT_LLM_KEY")
    if not emergent_key:
        logger.warning(
            "EMERGENT_LLM_KEY not configured — server-side storage (e.g. employer uploads) disabled. "
            "Candidate documents use Supabase direct upload."
        )
        return None
    
    try:
        resp = requests.post(
            f"{STORAGE_URL}/init",
            json={"emergent_key": emergent_key},
            timeout=30
        )
        resp.raise_for_status()
        storage_key = resp.json()["storage_key"]
        logger.info("Emergent Object Storage initialized successfully")
        return storage_key
    except Exception as e:
        logger.error(f"Failed to initialize storage: {e}")
        raise

def get_storage_key() -> Optional[str]:
    """Get storage key, initializing if needed."""
    global storage_key
    if not storage_key:
        return init_storage()
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    """
    Upload file to Emergent object storage (server-side; employer/legacy flows).
    Returns {"path": "...", "size": 123, "etag": "..."}
    """
    key = get_storage_key()
    if not key:
        raise RuntimeError(
            "Server-side object storage is not configured (set EMERGENT_LLM_KEY). "
            "Candidate uploads use Supabase direct upload instead."
        )
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data,
        timeout=120,
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> Tuple[bytes, str]:
    """
    Download file from cloud storage.
    Returns (content_bytes, content_type)
    """
    key = get_storage_key()
    if not key:
        raise FileNotFoundError(
            f"Cannot read object {path}: EMERGENT_LLM_KEY not set (no local disk fallback)."
        )
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

def generate_storage_path(folder: str, user_id: str, filename: str) -> str:
    """
    Generate a storage path for a file.
    Format: {APP_NAME}/{folder}/{user_id}/{uuid}.{ext}
    
    Folders:
    - candidate_documents
    - employer_documents
    - contracts
    - invoices
    - immigration_files
    - profile_photos
    - video_presentations
    """
    ext = filename.split(".")[-1].lower() if "." in filename else "bin"
    unique_id = uuid.uuid4().hex[:12]
    return f"{APP_NAME}/{folder}/{user_id}/{unique_id}.{ext}"

def get_content_type(filename: str) -> str:
    """Get MIME type from filename extension."""
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    return MIME_TYPES.get(ext, "application/octet-stream")
