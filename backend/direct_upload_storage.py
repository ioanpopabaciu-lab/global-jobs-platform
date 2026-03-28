"""
Direct client uploads to Supabase Storage (signed URL from backend; file never transits FastAPI).
"""
from __future__ import annotations

import logging
import os
import re
import uuid
from typing import Any

logger = logging.getLogger(__name__)

_client: Any = None


def _supabase_configured() -> bool:
    return bool(
        (os.environ.get("SUPABASE_URL") or "").strip()
        and (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    )


def _get_client():
    global _client
    if _client is not None:
        return _client
    from supabase import create_client

    url = (os.environ.get("SUPABASE_URL") or "").rstrip("/")
    key = (os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or "").strip()
    if not url or not key:
        raise RuntimeError(
            "Direct upload requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment."
        )
    _client = create_client(url, key)
    return _client


def storage_bucket() -> str:
    return (os.environ.get("SUPABASE_STORAGE_BUCKET") or "candidate-documents").strip()


def build_candidate_object_path(user_id: str, document_type: str, original_filename: str) -> str:
    base = os.path.basename(original_filename) or "file"
    safe = re.sub(r"[^a-zA-Z0-9._-]", "_", base)
    safe = safe[-180:] if len(safe) > 180 else safe
    if not safe or safe == "_":
        safe = "file"
    uid = uuid.uuid4().hex[:16]
    return f"candidates/{user_id}/{document_type}/{uid}_{safe}"


def create_candidate_signed_upload(object_path: str) -> dict:
    """Return signed URL + token for browser PUT upload."""
    client = _get_client()
    bucket = storage_bucket()
    try:
        res = client.storage.from_(bucket).create_signed_upload_url(object_path)
    except Exception as e:
        logger.exception("Supabase create_signed_upload_url failed for %s", object_path)
        raise RuntimeError(f"Could not create upload session: {e}") from e

    upload_url = res.get("signed_url") or res.get("signedUrl")
    if not upload_url:
        raise RuntimeError("Storage provider returned no signed URL")
    return {
        "upload_url": upload_url,
        "token": res.get("token"),
        "storage_path": res.get("path", object_path),
        "bucket": bucket,
    }


def download_object(storage_path: str) -> bytes:
    client = _get_client()
    bucket = storage_bucket()
    return client.storage.from_(bucket).download(storage_path)


def candidate_path_owned_by_user(storage_path: str, user_id: str) -> bool:
    prefix = f"candidates/{user_id}/"
    return storage_path.startswith(prefix)


def fetch_document_bytes(storage_path: str) -> tuple[bytes, str]:
    """Supabase pentru paths `candidates/*`, altfel Emergent via storage.get_object."""
    if storage_path.startswith("candidates/"):
        data = download_object(storage_path)
        return data, "application/octet-stream"
    from storage import get_object

    return get_object(storage_path)

