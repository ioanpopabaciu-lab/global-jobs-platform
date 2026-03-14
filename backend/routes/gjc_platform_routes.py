"""
GJC Platform API Routes v1
API endpoints for the 4 portal types: Company, Agency, Candidate, Admin
Prefix: /api/v1/gjc
"""

from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime, date
import logging
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_config import db_manager, get_pg_connection, check_database_health
from services.pipeline_service import (
    PlacementService, VisaProcessService, RelocationService, JobService,
    placement_service, visa_service, relocation_service, job_service
)
from services.ai_matching_service import (
    matching_engine, get_candidate_matches, get_job_matches, get_match_score
)

logger = logging.getLogger("gjc_api")

# Create router with v1 prefix
gjc_router = APIRouter(prefix="/v1/gjc", tags=["GJC Platform v1"])


# =====================================================
# PYDANTIC MODELS
# =====================================================

class JobCreate(BaseModel):
    title: str
    description: str
    positions_count: int = 1
    required_skills: List[str] = []
    required_experience_years: int = 0
    required_languages: List[str] = []
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "EUR"
    benefits: Optional[str] = None
    work_country: str = "RO"
    work_city: Optional[str] = None
    start_date: Optional[date] = None
    deadline: Optional[date] = None


class PlacementCreate(BaseModel):
    job_id: str
    candidate_id: str
    agency_id: Optional[str] = None


class StatusUpdate(BaseModel):
    new_status: str
    reason: Optional[str] = None


class IGISubmission(BaseModel):
    submission_date: date
    reference_number: str


class IGIApproval(BaseModel):
    approval_date: date
    expiry_date: date


class EmbassySchedule(BaseModel):
    embassy_country: str
    appointment_date: datetime


class VisaApproval(BaseModel):
    visa_number: str
    approval_date: date
    expiry_date: date


class FlightBooking(BaseModel):
    departure_city: str
    departure_date: datetime
    arrival_city: str
    arrival_date: datetime
    flight_number: str
    booking_reference: str
    flight_cost: float


class AccommodationAssign(BaseModel):
    address: str
    accommodation_type: str  # 'company_housing', 'shared', 'private'
    check_in_date: date
    monthly_cost: float


class EmbeddingRequest(BaseModel):
    text: str


# =====================================================
# HEALTH & STATUS ENDPOINTS
# =====================================================

@gjc_router.get("/health")
async def gjc_health_check():
    """
    Health check for GJC Platform services.
    Returns status of all databases and services.
    """
    health = await check_database_health()
    
    # Check AI matching service
    health["ai_matching"] = {
        "status": "available" if matching_engine.is_available else "unavailable"
    }
    
    overall_status = "healthy"
    if health["postgres"]["status"] != "healthy":
        overall_status = "degraded"
    if health["mongodb"]["status"] != "healthy":
        overall_status = "degraded"
    
    return {
        "status": overall_status,
        "services": health,
        "timestamp": datetime.utcnow().isoformat()
    }


# =====================================================
# COMPANY PORTAL ENDPOINTS
# =====================================================

@gjc_router.post("/company/jobs")
async def create_job(job: JobCreate, company_pg_id: str = Query(..., description="PostgreSQL UUID of the company")):
    """
    Create a new job posting for a company.
    Automatically generates AI embedding for semantic matching.
    """
    if not db_manager.pg_available:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        # Create job in database
        job_id = await job_service.create_job(
            company_id=company_pg_id,
            title=job.title,
            description=job.description,
            positions_count=job.positions_count,
            required_skills=job.required_skills,
            required_experience_years=job.required_experience_years,
            required_languages=job.required_languages,
            salary_min=job.salary_min,
            salary_max=job.salary_max,
            salary_currency=job.salary_currency,
            benefits=job.benefits,
            work_country=job.work_country,
            work_city=job.work_city,
            start_date=datetime.combine(job.start_date, datetime.min.time()) if job.start_date else None,
            deadline=datetime.combine(job.deadline, datetime.min.time()) if job.deadline else None
        )
        
        if not job_id:
            raise HTTPException(status_code=500, detail="Failed to create job")
        
        # Generate AI embedding for matching (async, non-blocking)
        embedding_success = await matching_engine.update_job_embedding(job_id, job.dict())
        
        return {
            "success": True,
            "job_id": job_id,
            "embedding_generated": embedding_success,
            "message": "Job created successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/company/jobs")
async def list_company_jobs(company_id: str = Query(...), limit: int = Query(50, le=100)):
    """
    List all jobs for a company.
    """
    jobs = await job_service.list_active_jobs(company_id=company_id, limit=limit)
    return {"jobs": jobs, "count": len(jobs)}


@gjc_router.get("/company/jobs/{job_id}")
async def get_job_details(job_id: str):
    """
    Get details of a specific job.
    """
    job = await job_service.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@gjc_router.get("/company/jobs/{job_id}/candidates")
async def get_matching_candidates(
    job_id: str, 
    limit: int = Query(20, le=50), 
    min_score: float = Query(70, ge=0, le=100)
):
    """
    Get AI-matched candidates for a job.
    Uses semantic similarity via pgvector.
    """
    try:
        # Convert percentage to decimal for matching
        min_score_decimal = min_score / 100.0
        candidates = await matching_engine.find_matching_candidates(
            job_id, 
            limit=limit,
            min_score=min_score_decimal
        )
        
        return {
            "job_id": job_id,
            "total_matches": len(candidates),
            "min_score_applied": min_score,
            "candidates": candidates
        }
        
    except Exception as e:
        logger.error(f"Failed to get matching candidates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/company/pipeline")
async def get_company_pipeline(company_id: str = Query(...)):
    """
    Get the Kanban pipeline view for a company.
    Shows all placements grouped by status.
    """
    if not db_manager.pg_available:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        # Get all placements for company
        placements = await placement_service.list_placements(company_id=company_id, limit=200)
        
        # Group by status
        pipeline = {}
        for p in placements:
            status = p.get('status', 'UNKNOWN')
            if status not in pipeline:
                pipeline[status] = []
            pipeline[status].append(p)
        
        # Get stats
        stats = await PlacementService.get_pipeline_stats(company_id)
        
        return {
            "company_id": company_id,
            "pipeline": pipeline,
            "stats": stats
        }
        
    except Exception as e:
        logger.error(f"Failed to get company pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/company/tracking/{placement_id}")
async def get_placement_tracking(placement_id: str):
    """
    Get real-time status tracking for a specific placement.
    Shows visa and relocation progress.
    """
    details = await PlacementService.get_placement_details(placement_id)
    
    if not details:
        raise HTTPException(status_code=404, detail="Placement not found")
    
    return details


# =====================================================
# AGENCY PORTAL ENDPOINTS
# =====================================================

@gjc_router.post("/agency/candidates/batch")
async def batch_upload_candidates(
    agency_pg_id: str = Query(...),
    candidates: List[Dict] = Body(...)
):
    """
    Batch upload candidates for an agency.
    Creates candidates in PostgreSQL and generates embeddings.
    """
    if not db_manager.pg_available:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    results = {
        "total": len(candidates),
        "success": 0,
        "failed": 0,
        "created_ids": [],
        "errors": []
    }
    
    for idx, candidate_data in enumerate(candidates):
        try:
            # Create candidate in PostgreSQL
            query = """
                INSERT INTO candidates (agency_id, full_name, nationality, is_available, mongo_profile_id)
                VALUES ($1::uuid, $2, $3, true, $4)
                RETURNING id::text
            """
            
            # Generate a temporary mongo_profile_id for candidates without MongoDB profile
            import uuid
            temp_mongo_id = f"agency_batch_{uuid.uuid4().hex[:12]}"
            
            async with get_pg_connection() as conn:
                cand_id = await conn.fetchval(
                    query,
                    agency_pg_id,
                    candidate_data.get("full_name"),
                    (candidate_data.get("nationality", "") or "")[:3],
                    temp_mongo_id
                )
            
            if cand_id:
                # Generate embedding if profile data available
                if candidate_data.get("skills") or candidate_data.get("experience"):
                    await matching_engine.update_candidate_embedding(cand_id, candidate_data)
                
                results["success"] += 1
                results["created_ids"].append(cand_id)
            else:
                results["failed"] += 1
                results["errors"].append({"index": idx, "error": "Insert returned no ID"})
                
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"index": idx, "error": str(e)})
    
    return results


@gjc_router.get("/agency/jobs/available")
async def get_available_jobs(
    country: str = Query(None, description="Filter by work country"),
    limit: int = Query(50, le=100)
):
    """
    Get all active jobs available for agency candidates.
    """
    jobs = await job_service.list_active_jobs(work_country=country, limit=limit)
    
    # Add positions_available calculation
    for job in jobs:
        job["positions_available"] = (job.get("positions_count") or 0) - (job.get("positions_filled") or 0)
    
    return {"jobs": jobs, "count": len(jobs)}


@gjc_router.post("/agency/apply")
async def apply_candidate_to_job(
    agency_id: str = Query(...),
    job_id: str = Query(...),
    candidate_id: str = Query(...)
):
    """
    Apply a single candidate to a job.
    Calculates match score and creates placement.
    """
    try:
        # Calculate match score
        score, explanation = await get_match_score(job_id, candidate_id)
        
        # Create placement
        placement_id = await PlacementService.create_placement(
            job_id=job_id,
            candidate_id=candidate_id,
            agency_id=agency_id,
            match_score=score,
            match_reasons={"source": "agency_submission", "explanation": explanation}
        )
        
        if not placement_id:
            raise HTTPException(status_code=400, detail="Placement already exists or creation failed")
        
        return {
            "success": True,
            "placement_id": placement_id,
            "match_score": score,
            "match_level": explanation.get("level", "UNKNOWN")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to apply candidate: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.post("/agency/apply/bulk")
async def bulk_apply_candidates(
    agency_id: str = Query(...),
    job_id: str = Query(...),
    candidate_ids: List[str] = Body(...)
):
    """
    Bulk apply multiple candidates to a job.
    """
    results = {
        "total": len(candidate_ids),
        "success": 0,
        "failed": 0,
        "placements": []
    }
    
    for cand_id in candidate_ids:
        try:
            # Calculate match score
            score, explanation = await get_match_score(job_id, cand_id)
            
            # Create placement
            placement_id = await PlacementService.create_placement(
                job_id=job_id,
                candidate_id=cand_id,
                agency_id=agency_id,
                match_score=score,
                match_reasons={"source": "agency_bulk_submission"}
            )
            
            if placement_id:
                results["success"] += 1
                results["placements"].append({
                    "candidate_id": cand_id,
                    "placement_id": placement_id,
                    "match_score": score
                })
            else:
                results["failed"] += 1
                
        except Exception as e:
            results["failed"] += 1
            logger.error(f"Failed to apply candidate {cand_id}: {e}")
    
    return results


@gjc_router.get("/agency/performance")
async def get_agency_performance(agency_id: str = Query(...)):
    """
    Get agency performance metrics.
    """
    if not db_manager.pg_available:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        async with get_pg_connection() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM v_agency_performance WHERE id = $1::uuid",
                agency_id
            )
        
        if not row:
            raise HTTPException(status_code=404, detail="Agency not found or no data")
        
        return dict(row)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get agency performance: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# CANDIDATE PORTAL ENDPOINTS
# =====================================================

@gjc_router.get("/candidate/matching-jobs")
async def get_matching_jobs_for_candidate(
    candidate_pg_id: str = Query(...),
    limit: int = Query(20, le=50),
    min_score: float = Query(70, ge=0, le=100)
):
    """
    Get AI-matched jobs for a candidate.
    """
    try:
        min_score_decimal = min_score / 100.0
        jobs = await matching_engine.find_matching_jobs(
            candidate_pg_id,
            limit=limit,
            min_score=min_score_decimal
        )
        
        return {
            "candidate_id": candidate_pg_id,
            "total_matches": len(jobs),
            "min_score_applied": min_score,
            "jobs": jobs
        }
        
    except Exception as e:
        logger.error(f"Failed to get matching jobs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/candidate/status/{candidate_pg_id}")
async def get_candidate_status(candidate_pg_id: str):
    """
    Get current status of all applications for a candidate.
    Provides transparency on visa and relocation progress.
    """
    if not db_manager.pg_available:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    placements = await placement_service.list_placements(candidate_id=candidate_pg_id, limit=50)
    
    # Enrich with status messages
    for p in placements:
        p["status_message"] = _get_status_message(p.get('status'))
    
    return {
        "candidate_id": candidate_pg_id,
        "applications": placements,
        "total": len(placements)
    }


def _get_status_message(status: str) -> str:
    """Generate human-readable status message (Romanian)"""
    messages = {
        "PENDING": "Candidatura ta este în analiză.",
        "MATCHED": "Ai fost selectat ca potrivire pentru acest job!",
        "EMPLOYER_REVIEW": "Angajatorul îți analizează profilul.",
        "OFFER_SENT": "Ai primit o ofertă de angajare! Verifică detaliile.",
        "OFFER_ACCEPTED": "Felicitări! Oferta a fost acceptată. Pregătește documentele.",
        "DOCUMENTS_PENDING": "Așteptăm documentele tale.",
        "DOCUMENTS_VERIFIED": "Documentele au fost verificate. Procesul de viză începe.",
        "VISA_IN_PROGRESS": "Procesul de viză este în desfășurare.",
        "VISA_APPROVED": "Viza a fost aprobată! Pregătește-te pentru relocare.",
        "RELOCATING": "Ești în proces de relocare.",
        "ACTIVE": "Ești angajat activ. Succes!",
        "COMPLETED": "Contractul s-a încheiat cu succes.",
        "REJECTED": "Ne pare rău, candidatura nu a fost acceptată.",
        "CANCELLED": "Procesul a fost anulat."
    }
    return messages.get(status, "Status necunoscut")


# =====================================================
# ADMIN PORTAL ENDPOINTS (GOD VIEW)
# =====================================================

@gjc_router.get("/admin/dashboard")
async def get_admin_dashboard():
    """
    Get complete admin dashboard with all platform metrics.
    The "God View" of the platform.
    """
    if not db_manager.pg_available:
        return {
            "error": "PostgreSQL not available",
            "overview": {},
            "pipeline": {},
            "pending_visas": [],
            "upcoming_arrivals": []
        }
    
    try:
        # Overall stats
        stats_query = """
            SELECT 
                (SELECT COUNT(*) FROM companies) as total_companies,
                (SELECT COUNT(*) FROM agencies) as total_agencies,
                (SELECT COUNT(*) FROM candidates) as total_candidates,
                (SELECT COUNT(*) FROM jobs WHERE is_active = true) as active_jobs,
                (SELECT COUNT(*) FROM placements) as total_placements,
                (SELECT COUNT(*) FROM placements WHERE status = 'ACTIVE') as active_workers,
                (SELECT COUNT(*) FROM visa_processes WHERE status NOT IN ('VISA_APPROVED', 'VISA_REJECTED', 'WORK_PERMIT_ISSUED', 'IGI_REJECTED')) as pending_visas,
                (SELECT COUNT(*) FROM relocation_tickets WHERE status IN ('FLIGHT_BOOKED', 'IN_TRANSIT')) as in_transit
        """
        
        async with get_pg_connection() as conn:
            stats = await conn.fetchrow(stats_query)
        
        # Pipeline distribution
        pipeline_stats = await PlacementService.get_pipeline_stats()
        
        # Pending visas
        pending_visas = await VisaProcessService.get_pending_visas()
        
        # Upcoming arrivals
        arrivals = await RelocationService.get_upcoming_arrivals(7)
        
        return {
            "overview": dict(stats) if stats else {},
            "pipeline": pipeline_stats,
            "pending_visas": pending_visas[:10],
            "upcoming_arrivals": arrivals,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get admin dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.post("/admin/placement/{placement_id}/status")
async def admin_update_placement_status(
    placement_id: str,
    update: StatusUpdate,
    admin_user_id: str = Query(...)
):
    """
    Admin override for placement status.
    Allows manual intervention in the pipeline.
    """
    success, message = await PlacementService.transition_status(
        placement_id=placement_id,
        new_status=update.new_status,
        changed_by=admin_user_id,
        reason=update.reason,
        metadata={"admin_override": True}
    )
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    return {"success": True, "message": message}


@gjc_router.post("/admin/visa/{visa_id}/igi-submission")
async def admin_submit_igi(visa_id: str, data: IGISubmission):
    """Submit IGI application"""
    success = await VisaProcessService.update_igi_submission(
        visa_id,
        datetime.combine(data.submission_date, datetime.min.time()),
        data.reference_number
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to update IGI submission")
    
    return {"success": True, "message": "IGI submission recorded"}


@gjc_router.post("/admin/visa/{visa_id}/igi-pending")
async def admin_set_igi_pending(visa_id: str):
    """Mark IGI as pending"""
    success = await VisaProcessService.set_igi_pending(visa_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to set IGI pending")
    
    return {"success": True}


@gjc_router.post("/admin/visa/{visa_id}/igi-approval")
async def admin_approve_igi(visa_id: str, data: IGIApproval):
    """Approve IGI"""
    success = await VisaProcessService.approve_igi(
        visa_id,
        datetime.combine(data.approval_date, datetime.min.time()),
        datetime.combine(data.expiry_date, datetime.min.time())
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to approve IGI")
    
    return {"success": True, "message": "IGI approved"}


@gjc_router.post("/admin/visa/{visa_id}/embassy-schedule")
async def admin_schedule_embassy(visa_id: str, data: EmbassySchedule):
    """Schedule embassy appointment"""
    success = await VisaProcessService.schedule_embassy_appointment(
        visa_id,
        data.embassy_country,
        data.appointment_date
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to schedule embassy")
    
    return {"success": True, "message": "Embassy appointment scheduled"}


@gjc_router.post("/admin/visa/{visa_id}/visa-approval")
async def admin_approve_visa(visa_id: str, data: VisaApproval):
    """Approve visa"""
    success = await VisaProcessService.approve_visa(
        visa_id,
        data.visa_number,
        datetime.combine(data.approval_date, datetime.min.time()),
        datetime.combine(data.expiry_date, datetime.min.time())
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to approve visa")
    
    return {"success": True, "message": "Visa approved"}


@gjc_router.post("/admin/relocation/{relocation_id}/book-flight")
async def admin_book_flight(relocation_id: str, data: FlightBooking):
    """Book flight for candidate"""
    success = await RelocationService.book_flight(
        relocation_id,
        data.departure_city,
        data.departure_date,
        data.arrival_city,
        data.arrival_date,
        data.flight_number,
        data.booking_reference,
        data.flight_cost
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to book flight")
    
    return {"success": True, "message": "Flight booked"}


@gjc_router.post("/admin/relocation/{relocation_id}/accommodation")
async def admin_assign_accommodation(relocation_id: str, data: AccommodationAssign):
    """Assign accommodation"""
    success = await RelocationService.assign_accommodation(
        relocation_id,
        data.address,
        data.accommodation_type,
        datetime.combine(data.check_in_date, datetime.min.time()),
        data.monthly_cost
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to assign accommodation")
    
    return {"success": True, "message": "Accommodation assigned"}


@gjc_router.post("/admin/relocation/{relocation_id}/mark-arrived")
async def admin_mark_arrived(relocation_id: str):
    """Mark candidate as arrived"""
    success = await RelocationService.mark_arrived(relocation_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to mark arrived")
    
    return {"success": True, "message": "Candidate marked as arrived"}


@gjc_router.post("/admin/relocation/{relocation_id}/complete")
async def admin_complete_relocation(relocation_id: str):
    """Complete relocation and activate worker"""
    success = await RelocationService.complete_relocation(relocation_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to complete relocation")
    
    return {"success": True, "message": "Relocation completed, worker activated"}


@gjc_router.get("/admin/audit-log")
async def get_audit_log(
    entity_type: str = Query(None, description="Filter by entity type"),
    limit: int = Query(100, le=500)
):
    """Get status change audit log"""
    if not db_manager.pg_available:
        return {"audit_log": [], "error": "PostgreSQL not available"}
    
    try:
        base_query = """
            SELECT 
                sal.id::text,
                sal.entity_type,
                sal.entity_id::text,
                sal.old_status,
                sal.new_status,
                sal.changed_by::text,
                sal.change_reason,
                sal.metadata,
                sal.created_at,
                u.email as changed_by_email
            FROM status_audit_log sal
            LEFT JOIN users u ON sal.changed_by = u.id
        """
        
        if entity_type:
            base_query += f" WHERE sal.entity_type = $1"
            base_query += f" ORDER BY sal.created_at DESC LIMIT $2"
            
            async with get_pg_connection() as conn:
                rows = await conn.fetch(base_query, entity_type, limit)
        else:
            base_query += f" ORDER BY sal.created_at DESC LIMIT $1"
            
            async with get_pg_connection() as conn:
                rows = await conn.fetch(base_query, limit)
        
        return {"audit_log": [dict(row) for row in rows]}
        
    except Exception as e:
        logger.error(f"Failed to get audit log: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# AI MATCHING UTILITY ENDPOINTS
# =====================================================

@gjc_router.post("/matching/generate-embedding")
async def generate_embedding(request: EmbeddingRequest):
    """
    Generate embedding for arbitrary text.
    Useful for testing and ad-hoc searches.
    """
    if not matching_engine.is_available:
        raise HTTPException(status_code=503, detail="AI Matching service not available")
    
    embedding = await matching_engine.generate_embedding_for_text(request.text)
    
    if embedding is None:
        raise HTTPException(status_code=500, detail="Failed to generate embedding")
    
    return {
        "success": True,
        "dimensions": len(embedding),
        "embedding": embedding[:10],  # Return only first 10 for preview
        "message": f"Generated {len(embedding)}-dimensional embedding"
    }


@gjc_router.get("/matching/score")
async def calculate_match_score(
    job_id: str = Query(...),
    candidate_id: str = Query(...)
):
    """
    Calculate match score between a job and candidate.
    """
    score, explanation = await get_match_score(job_id, candidate_id)
    
    return {
        "job_id": job_id,
        "candidate_id": candidate_id,
        "score": score,
        "explanation": explanation
    }
