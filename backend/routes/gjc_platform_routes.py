"""
GJC Platform API Routes
API endpoints for the 4 portal types: Company, Agency, Candidate, Admin
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Body
from typing import List, Optional, Dict
from pydantic import BaseModel, Field
from datetime import datetime, date
import logging

from database.db_config import db_manager, get_pg_connection, execute_pg_query
from services.pipeline_service import (
    placement_service, visa_service, relocation_service,
    PlacementService, VisaProcessService, RelocationService
)
from services.ai_matching_service import matching_engine, get_candidate_matches, get_job_matches

logger = logging.getLogger("gjc_api")

# Create router
gjc_router = APIRouter(prefix="/gjc", tags=["GJC Platform"])


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


# =====================================================
# COMPANY PORTAL ENDPOINTS
# =====================================================

@gjc_router.post("/company/jobs", response_model=Dict)
async def create_job(job: JobCreate, company_pg_id: str = Query(...)):
    """
    Create a new job posting for a company.
    Automatically generates AI embedding for matching.
    """
    query = """
        INSERT INTO jobs (
            company_id, title, description, positions_count,
            required_skills, required_experience_years, required_languages,
            salary_min, salary_max, salary_currency, benefits,
            work_country, work_city, start_date, deadline
        )
        VALUES (
            $1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
        )
        RETURNING id::text
    """
    
    try:
        async with get_pg_connection() as conn:
            job_id = await conn.fetchval(
                query,
                company_pg_id,
                job.title,
                job.description,
                job.positions_count,
                job.required_skills,
                job.required_experience_years,
                job.required_languages,
                job.salary_min,
                job.salary_max,
                job.salary_currency,
                job.benefits,
                job.work_country,
                job.work_city,
                job.start_date,
                job.deadline
            )
        
        # Generate AI embedding for matching
        await matching_engine.update_job_embedding(job_id, job.dict())
        
        return {
            "success": True,
            "job_id": job_id,
            "message": "Job created successfully"
        }
        
    except Exception as e:
        logger.error(f"Failed to create job: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/company/jobs/{job_id}/candidates")
async def get_matching_candidates(job_id: str, limit: int = 20, min_score: float = 70):
    """
    Get AI-matched candidates for a job.
    Uses semantic similarity via pgvector.
    """
    try:
        candidates = await get_candidate_matches(job_id, limit)
        
        # Filter by minimum score
        filtered = [c for c in candidates if c['match_score'] >= min_score]
        
        return {
            "job_id": job_id,
            "total_matches": len(filtered),
            "candidates": filtered
        }
        
    except Exception as e:
        logger.error(f"Failed to get matching candidates: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@gjc_router.get("/company/pipeline")
async def get_company_pipeline(company_id: str):
    """
    Get the Kanban pipeline view for a company.
    Shows all placements grouped by status.
    """
    query = """
        SELECT 
            p.id::text,
            p.status,
            p.match_score,
            p.created_at,
            j.title as job_title,
            cand.full_name,
            cand.nationality,
            a.name as agency_name,
            vp.status as visa_status,
            rt.status as relocation_status
        FROM placements p
        JOIN jobs j ON p.job_id = j.id
        JOIN candidates cand ON p.candidate_id = cand.id
        LEFT JOIN agencies a ON p.agency_id = a.id
        LEFT JOIN visa_processes vp ON vp.placement_id = p.id
        LEFT JOIN relocation_tickets rt ON rt.placement_id = p.id
        WHERE j.company_id = $1::uuid
        ORDER BY p.created_at DESC
    """
    
    async with get_pg_connection() as conn:
        rows = await conn.fetch(query, company_id)
    
    # Group by status
    pipeline = {}
    for row in rows:
        status = row['status']
        if status not in pipeline:
            pipeline[status] = []
        pipeline[status].append(dict(row))
    
    # Get stats
    stats = await PlacementService.get_pipeline_stats(company_id)
    
    return {
        "pipeline": pipeline,
        "stats": stats
    }


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
    agency_pg_id: str,
    candidates: List[Dict] = Body(...)
):
    """
    Batch upload candidates for an agency.
    Accepts a list of candidate profile data.
    """
    results = {
        "total": len(candidates),
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    for idx, candidate_data in enumerate(candidates):
        try:
            # This would sync to MongoDB first, then PostgreSQL
            # For now, just create in PostgreSQL
            query = """
                INSERT INTO candidates (agency_id, full_name, nationality, is_available)
                VALUES ($1::uuid, $2, $3, true)
                RETURNING id::text
            """
            
            async with get_pg_connection() as conn:
                cand_id = await conn.fetchval(
                    query,
                    agency_pg_id,
                    candidate_data.get("full_name"),
                    candidate_data.get("nationality", "")[:3]
                )
            
            # Generate embedding if profile data available
            if cand_id and candidate_data.get("skills"):
                await matching_engine.update_candidate_embedding(cand_id, candidate_data)
            
            results["success"] += 1
            
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"index": idx, "error": str(e)})
    
    return results


@gjc_router.get("/agency/jobs/available")
async def get_available_jobs(agency_id: str, country: str = None):
    """
    Get all active jobs available for agency candidates.
    """
    query = """
        SELECT 
            j.id::text,
            j.title,
            j.description,
            j.positions_count - j.positions_filled as positions_available,
            j.salary_min,
            j.salary_max,
            j.salary_currency,
            j.work_city,
            j.work_country,
            j.deadline,
            c.name as company_name
        FROM jobs j
        JOIN companies c ON j.company_id = c.id
        WHERE j.is_active = true
            AND j.is_filled = false
            AND j.positions_count > j.positions_filled
    """
    
    if country:
        query += f" AND j.work_country = '{country}'"
    
    query += " ORDER BY j.created_at DESC"
    
    async with get_pg_connection() as conn:
        rows = await conn.fetch(query)
    
    return {"jobs": [dict(row) for row in rows]}


@gjc_router.post("/agency/apply/bulk")
async def bulk_apply_candidates(
    agency_id: str,
    job_id: str,
    candidate_ids: List[str] = Body(...)
):
    """
    Bulk apply multiple candidates to a job.
    Bypasses pure AI matching for agency submissions.
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
            score, _ = await matching_engine.calculate_match_score(job_id, cand_id)
            
            # Create placement
            placement_id = await PlacementService.create_placement(
                job_id=job_id,
                candidate_id=cand_id,
                agency_id=agency_id,
                match_score=score,
                match_reasons={"source": "agency_submission"}
            )
            
            if placement_id:
                results["success"] += 1
                results["placements"].append(placement_id)
            else:
                results["failed"] += 1
                
        except Exception as e:
            results["failed"] += 1
            logger.error(f"Failed to apply candidate {cand_id}: {e}")
    
    return results


@gjc_router.get("/agency/performance")
async def get_agency_performance(agency_id: str):
    """
    Get agency performance metrics.
    """
    query = """
        SELECT * FROM v_agency_performance WHERE id = $1::uuid
    """
    
    async with get_pg_connection() as conn:
        row = await conn.fetchrow(query, agency_id)
    
    if not row:
        raise HTTPException(status_code=404, detail="Agency not found")
    
    return dict(row)


# =====================================================
# CANDIDATE PORTAL ENDPOINTS
# =====================================================

@gjc_router.get("/candidate/matching-jobs")
async def get_matching_jobs_for_candidate(candidate_pg_id: str, limit: int = 20):
    """
    Get AI-matched jobs for a candidate.
    """
    jobs = await get_job_matches(candidate_pg_id, limit)
    
    return {
        "candidate_id": candidate_pg_id,
        "total_matches": len(jobs),
        "jobs": jobs
    }


@gjc_router.get("/candidate/status/{candidate_pg_id}")
async def get_candidate_status(candidate_pg_id: str):
    """
    Get current status of all applications for a candidate.
    Provides transparency on visa and relocation progress.
    """
    query = """
        SELECT 
            p.id::text as placement_id,
            p.status,
            p.match_score,
            p.offer_sent_at,
            p.offer_accepted_at,
            j.title as job_title,
            c.name as company_name,
            j.work_city,
            j.work_country,
            vp.status as visa_status,
            vp.igi_reference_number,
            vp.embassy_appointment_date,
            vp.visa_number,
            rt.status as relocation_status,
            rt.departure_date,
            rt.arrival_date,
            rt.accommodation_address
        FROM placements p
        JOIN jobs j ON p.job_id = j.id
        JOIN companies c ON j.company_id = c.id
        LEFT JOIN visa_processes vp ON vp.placement_id = p.id
        LEFT JOIN relocation_tickets rt ON rt.placement_id = p.id
        WHERE p.candidate_id = $1::uuid
        ORDER BY p.created_at DESC
    """
    
    async with get_pg_connection() as conn:
        rows = await conn.fetch(query, candidate_pg_id)
    
    applications = []
    for row in rows:
        app = dict(row)
        # Add human-readable status message
        app["status_message"] = get_status_message(row['status'], row.get('visa_status'), row.get('relocation_status'))
        applications.append(app)
    
    return {"applications": applications}


def get_status_message(placement_status: str, visa_status: str = None, relocation_status: str = None) -> str:
    """Generate human-readable status message"""
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
    
    base_message = messages.get(placement_status, "Status necunoscut")
    
    # Add visa details
    if placement_status == "VISA_IN_PROGRESS" and visa_status:
        visa_messages = {
            "IGI_SUBMISSION": "Dosarul IGI a fost depus.",
            "IGI_PENDING": "Așteptăm răspunsul de la IGI.",
            "IGI_APPROVED": "IGI aprobat! Programăm ambasada.",
            "EMBASSY_SCHEDULED": "Ai programare la ambasadă.",
            "EMBASSY_INTERVIEW": "Interviul la ambasadă a avut loc."
        }
        if visa_status in visa_messages:
            base_message += f" {visa_messages[visa_status]}"
    
    # Add relocation details
    if placement_status == "RELOCATING" and relocation_status:
        reloc_messages = {
            "FLIGHT_BOOKED": "Biletul de avion a fost rezervat.",
            "IN_TRANSIT": "Ești în drum spre destinație.",
            "ARRIVED": "Ai ajuns! Bine ai venit!",
            "ACCOMMODATION_ASSIGNED": "Cazarea a fost alocată."
        }
        if relocation_status in reloc_messages:
            base_message += f" {reloc_messages[relocation_status]}"
    
    return base_message


# =====================================================
# ADMIN PORTAL ENDPOINTS (GOD VIEW)
# =====================================================

@gjc_router.get("/admin/dashboard")
async def get_admin_dashboard():
    """
    Get complete admin dashboard with all platform metrics.
    The "God View" of the platform.
    """
    # Overall stats
    stats_query = """
        SELECT 
            (SELECT COUNT(*) FROM users WHERE role = 'COMPANY') as total_companies,
            (SELECT COUNT(*) FROM users WHERE role = 'AGENCY') as total_agencies,
            (SELECT COUNT(*) FROM candidates) as total_candidates,
            (SELECT COUNT(*) FROM jobs WHERE is_active = true) as active_jobs,
            (SELECT COUNT(*) FROM placements) as total_placements,
            (SELECT COUNT(*) FROM placements WHERE status = 'ACTIVE') as active_workers,
            (SELECT COUNT(*) FROM visa_processes WHERE status NOT IN ('VISA_APPROVED', 'VISA_REJECTED', 'WORK_PERMIT_ISSUED')) as pending_visas,
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
        "overview": dict(stats),
        "pipeline": pipeline_stats,
        "pending_visas": pending_visas[:10],  # Top 10
        "upcoming_arrivals": arrivals,
        "generated_at": datetime.utcnow().isoformat()
    }


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
    
    return {"success": True}


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
    
    return {"success": True}


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
    
    return {"success": True}


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
    
    return {"success": True}


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
    
    return {"success": True}


@gjc_router.post("/admin/relocation/{relocation_id}/mark-arrived")
async def admin_mark_arrived(relocation_id: str):
    """Mark candidate as arrived"""
    success = await RelocationService.mark_arrived(relocation_id)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to mark arrived")
    
    return {"success": True, "message": "Candidate marked as arrived and activated"}


@gjc_router.get("/admin/audit-log")
async def get_audit_log(
    entity_type: str = None,
    limit: int = 100
):
    """Get status change audit log"""
    query = """
        SELECT 
            sal.*,
            u.email as changed_by_email
        FROM status_audit_log sal
        LEFT JOIN users u ON sal.changed_by = u.id
    """
    
    if entity_type:
        query += f" WHERE sal.entity_type = '{entity_type}'"
    
    query += f" ORDER BY sal.created_at DESC LIMIT {limit}"
    
    async with get_pg_connection() as conn:
        rows = await conn.fetch(query)
    
    return {"audit_log": [dict(row) for row in rows]}
