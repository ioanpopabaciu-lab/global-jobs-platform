from fastapi import APIRouter, HTTPException, Request, Depends, Query
from typing import Optional, List, Any, Dict
from datetime import datetime, timezone
import math

from auth_routes import get_current_user

v2_router = APIRouter(prefix="/api/v2", tags=["API v2"])

db = None

def set_database(database):
    global db
    db = database

def build_response(success: bool, data: Any = None, message: str = "", error: Any = None) -> Dict[str, Any]:
    """Standardized API response format"""
    return {
        "success": success,
        "data": data,
        "message": message,
        "error": error
    }

def build_paginated_response(data: List[Any], total: int, page: int, per_page: int) -> Dict[str, Any]:
    """Standardized paginated data format"""
    return {
        "data": data,
        "total": total,
        "page": page,
        "per_page": per_page
    }

# ==================== CANDIDATE v2 ROUTES ====================

@v2_router.get("/candidate/jobs")
async def get_candidate_jobs(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """
    Get paginated recommended jobs for the current candidate
    API-FIRST, standard response format.
    """
    try:
        user = await get_current_user(request)
        if user["role"] not in ["candidate", "admin"]:
            return build_response(False, error="Unauthorized", message="Candidate access required")
        
        # Currently, candidate jobs match algorithm is still pending.
        # We return a standard mock list of high-demand Romanian jobs for demonstration
        # in the API-first architecture, until the real matching engine is connected.
        mock_jobs = [
            {
                "id": "job_mock_1",
                "title": "Muncitor în Construcții",
                "company": "Eky Route Construct SRL",
                "location": "București, România",
                "salary": "3500 RON NET",
                "type": "Full-time",
                "match_score": 95,
                "posted_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "job_mock_2",
                "title": "Lucrător Comercial",
                "company": "Mega Image",
                "location": "Cluj-Napoca, România",
                "salary": "2800 RON NET",
                "type": "Full-time",
                "match_score": 88,
                "posted_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": "job_mock_3",
                "title": "Șofer Livrator",
                "company": "Romfracht SRL",
                "location": "Timișoara, România",
                "salary": "4000 RON NET",
                "type": "Full-time",
                "match_score": 82,
                "posted_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        
        # Pagination calculations
        total = len(mock_jobs)
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_jobs = mock_jobs[start_idx:end_idx]
        
        pagination_data = build_paginated_response(paginated_jobs, total, page, per_page)
        return build_response(True, data=pagination_data, message="Recommended jobs retrieved successfully")
        
    except Exception as e:
        return build_response(False, error=str(e), message="Failed to retrieve jobs")


@v2_router.get("/candidate/messages")
async def get_candidate_messages(
    request: Request,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100)
):
    """
    Get paginated messages/notifications for the candidate
    """
    try:
        user = await get_current_user(request)
        if user["role"] not in ["candidate", "admin"]:
            return build_response(False, error="Unauthorized", message="Candidate access required")
            
        # TODO: implement in PostgreSQL
        total = 0
        messages = []
        pagination_data = build_paginated_response(messages, total, page, per_page)
        return build_response(True, data=pagination_data, message="Messages retrieved successfully")
        
    except Exception as e:
        return build_response(False, error=str(e), message="Failed to retrieve messages")
