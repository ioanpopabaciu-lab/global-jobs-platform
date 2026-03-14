"""
GJC Platform - Pipeline Management Service
Manages the flow of placements through various stages:
Pending → Matched → Offer → Documents → Visa → Relocation → Active

This service handles state transitions, validations, and notifications.
"""

import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone
import json
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_config import get_pg_connection, db_manager

logger = logging.getLogger("pipeline_service")
logger.setLevel(logging.INFO)


# =====================================================
# STATUS TRANSITIONS
# =====================================================

# Valid status transitions for placements
PLACEMENT_TRANSITIONS = {
    "PENDING": ["MATCHED", "REJECTED", "CANCELLED"],
    "MATCHED": ["EMPLOYER_REVIEW", "REJECTED", "CANCELLED"],
    "EMPLOYER_REVIEW": ["OFFER_SENT", "REJECTED", "CANCELLED"],
    "OFFER_SENT": ["OFFER_ACCEPTED", "REJECTED", "CANCELLED"],
    "OFFER_ACCEPTED": ["DOCUMENTS_PENDING", "CANCELLED"],
    "DOCUMENTS_PENDING": ["DOCUMENTS_VERIFIED", "REJECTED", "CANCELLED"],
    "DOCUMENTS_VERIFIED": ["VISA_IN_PROGRESS", "CANCELLED"],
    "VISA_IN_PROGRESS": ["VISA_APPROVED", "REJECTED", "CANCELLED"],
    "VISA_APPROVED": ["RELOCATING", "CANCELLED"],
    "RELOCATING": ["ACTIVE", "CANCELLED"],
    "ACTIVE": ["COMPLETED", "CANCELLED"],
    "COMPLETED": [],  # Terminal state
    "REJECTED": [],   # Terminal state
    "CANCELLED": []   # Terminal state
}

VISA_TRANSITIONS = {
    "NOT_STARTED": ["IGI_SUBMISSION"],
    "IGI_SUBMISSION": ["IGI_PENDING"],
    "IGI_PENDING": ["IGI_APPROVED", "IGI_REJECTED"],
    "IGI_APPROVED": ["EMBASSY_SCHEDULED"],
    "IGI_REJECTED": [],  # Terminal, requires restart
    "EMBASSY_SCHEDULED": ["EMBASSY_INTERVIEW"],
    "EMBASSY_INTERVIEW": ["VISA_APPROVED", "VISA_REJECTED"],
    "VISA_APPROVED": ["WORK_PERMIT_ISSUED"],
    "VISA_REJECTED": [],  # Terminal
    "WORK_PERMIT_ISSUED": []  # Terminal success
}

RELOCATION_TRANSITIONS = {
    "NOT_STARTED": ["FLIGHT_BOOKED"],
    "FLIGHT_BOOKED": ["IN_TRANSIT"],
    "IN_TRANSIT": ["ARRIVED"],
    "ARRIVED": ["ACCOMMODATION_ASSIGNED"],
    "ACCOMMODATION_ASSIGNED": ["ONBOARDING"],
    "ONBOARDING": ["COMPLETED"],
    "COMPLETED": []
}


# =====================================================
# PLACEMENT SERVICE
# =====================================================

class PlacementService:
    """Service for managing placement lifecycle"""
    
    @staticmethod
    async def create_placement(
        job_id: str,
        candidate_id: str,
        agency_id: str = None,
        match_score: float = None,
        match_reasons: dict = None
    ) -> Optional[str]:
        """
        Create a new placement (application) for a candidate to a job.
        Returns: Placement UUID if successful, None otherwise
        """
        if not db_manager.pg_available:
            logger.warning("PostgreSQL not available for placement creation")
            return None
        
        query = """
            INSERT INTO placements (job_id, candidate_id, agency_id, match_score, match_reasons, status)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4, $5::jsonb, 'PENDING')
            ON CONFLICT (job_id, candidate_id) DO NOTHING
            RETURNING id::text
        """
        
        try:
            async with get_pg_connection() as conn:
                result = await conn.fetchval(
                    query,
                    job_id,
                    candidate_id,
                    agency_id,
                    match_score,
                    json.dumps(match_reasons) if match_reasons else None
                )
                
                if result:
                    logger.info(f"Created placement {result} for job {job_id}, candidate {candidate_id}")
                return result
                
        except Exception as e:
            logger.error(f"Failed to create placement: {e}")
            return None
    
    @staticmethod
    async def transition_status(
        placement_id: str,
        new_status: str,
        changed_by: str = None,
        reason: str = None,
        metadata: dict = None
    ) -> Tuple[bool, str]:
        """
        Transition a placement to a new status.
        Returns: Tuple of (success, message)
        """
        if not db_manager.pg_available:
            return False, "PostgreSQL not available"
        
        try:
            async with get_pg_connection() as conn:
                # Get current status
                current = await conn.fetchrow(
                    "SELECT status, status_history FROM placements WHERE id = $1::uuid",
                    placement_id
                )
                
                if not current:
                    return False, "Placement not found"
                
                current_status = current['status']
                
                # Validate transition
                valid_next = PLACEMENT_TRANSITIONS.get(current_status, [])
                if new_status not in valid_next:
                    return False, f"Invalid transition from {current_status} to {new_status}. Valid transitions: {valid_next}"
                
                # Build status history entry
                history_entry = {
                    "from": current_status,
                    "to": new_status,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "changed_by": changed_by,
                    "reason": reason
                }
                
                # Update with new history
                current_history = json.loads(current['status_history']) if current['status_history'] else []
                current_history.append(history_entry)
                
                # Perform update
                update_query = """
                    UPDATE placements 
                    SET status = $1::placement_status,
                        status_history = $2::jsonb
                    WHERE id = $3::uuid
                """
                
                await conn.execute(update_query, new_status, json.dumps(current_history), placement_id)
                
                # Log to audit table
                audit_query = """
                    INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, changed_by, change_reason, metadata)
                    VALUES ('placement', $1::uuid, $2, $3, $4::uuid, $5, $6::jsonb)
                """
                await conn.execute(
                    audit_query,
                    placement_id,
                    current_status,
                    new_status,
                    changed_by,
                    reason,
                    json.dumps(metadata) if metadata else None
                )
            
            logger.info(f"Placement {placement_id} transitioned: {current_status} → {new_status}")
            return True, f"Successfully transitioned to {new_status}"
            
        except Exception as e:
            logger.error(f"Failed to transition placement status: {e}")
            return False, str(e)
    
    @staticmethod
    async def get_placement_details(placement_id: str) -> Optional[Dict]:
        """Get full placement details including related data"""
        if not db_manager.pg_available:
            return None
        
        query = """
            SELECT 
                p.id::text as placement_id,
                p.status,
                p.match_score,
                p.match_reasons,
                p.status_history,
                p.offered_salary,
                p.offer_sent_at,
                p.offer_accepted_at,
                p.company_notes,
                p.admin_notes,
                p.created_at,
                p.updated_at,
                j.id::text as job_id,
                j.title as job_title,
                j.positions_count,
                j.work_city,
                j.work_country,
                j.salary_min,
                j.salary_max,
                j.salary_currency,
                co.id::text as company_id,
                co.name as company_name,
                cand.id::text as candidate_pg_id,
                cand.full_name as candidate_name,
                cand.mongo_profile_id as candidate_mongo_id,
                cand.nationality as candidate_nationality,
                a.id::text as agency_id,
                a.name as agency_name,
                vp.id::text as visa_process_id,
                vp.status as visa_status,
                vp.igi_reference_number,
                vp.igi_approval_date,
                vp.embassy_appointment_date,
                vp.visa_approval_date,
                vp.visa_number,
                rt.id::text as relocation_id,
                rt.status as relocation_status,
                rt.departure_date,
                rt.arrival_date,
                rt.arrival_city,
                rt.accommodation_address
            FROM placements p
            JOIN jobs j ON p.job_id = j.id
            JOIN companies co ON j.company_id = co.id
            JOIN candidates cand ON p.candidate_id = cand.id
            LEFT JOIN agencies a ON p.agency_id = a.id
            LEFT JOIN visa_processes vp ON vp.placement_id = p.id
            LEFT JOIN relocation_tickets rt ON rt.placement_id = p.id
            WHERE p.id = $1::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                row = await conn.fetchrow(query, placement_id)
                
            if not row:
                return None
            
            # Convert to dict and handle special types
            result = dict(row)
            
            # Parse JSON fields
            if result.get('match_reasons'):
                try:
                    result['match_reasons'] = json.loads(result['match_reasons'])
                except:
                    pass
            
            if result.get('status_history'):
                try:
                    result['status_history'] = json.loads(result['status_history'])
                except:
                    pass
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to get placement details: {e}")
            return None
    
    @staticmethod
    async def get_pipeline_stats(company_id: str = None) -> Dict:
        """Get pipeline statistics, optionally filtered by company"""
        if not db_manager.pg_available:
            return {"error": "PostgreSQL not available", "by_status": {}}
        
        try:
            async with get_pg_connection() as conn:
                if company_id:
                    query = """
                        SELECT status, COUNT(*) as count
                        FROM placements p
                        JOIN jobs j ON p.job_id = j.id
                        WHERE j.company_id = $1::uuid
                        GROUP BY status
                    """
                    rows = await conn.fetch(query, company_id)
                else:
                    query = """
                        SELECT status, COUNT(*) as count
                        FROM placements
                        GROUP BY status
                    """
                    rows = await conn.fetch(query)
            
            stats = {row['status']: row['count'] for row in rows}
            
            # Calculate totals
            total = sum(stats.values())
            active = stats.get('ACTIVE', 0)
            in_progress = sum(stats.get(s, 0) for s in [
                'VISA_IN_PROGRESS', 'RELOCATING', 'DOCUMENTS_PENDING', 
                'DOCUMENTS_VERIFIED', 'OFFER_ACCEPTED'
            ])
            
            return {
                "by_status": stats,
                "total": total,
                "active_workers": active,
                "in_progress": in_progress,
                "pending_review": stats.get('EMPLOYER_REVIEW', 0) + stats.get('PENDING', 0) + stats.get('MATCHED', 0),
                "completion_rate": round(active / total * 100, 2) if total > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Failed to get pipeline stats: {e}")
            return {"error": str(e), "by_status": {}}
    
    @staticmethod
    async def list_placements(
        company_id: str = None,
        candidate_id: str = None,
        status: str = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict]:
        """List placements with optional filters"""
        if not db_manager.pg_available:
            return []
        
        conditions = []
        params = []
        param_idx = 1
        
        if company_id:
            conditions.append(f"j.company_id = ${param_idx}::uuid")
            params.append(company_id)
            param_idx += 1
        
        if candidate_id:
            conditions.append(f"p.candidate_id = ${param_idx}::uuid")
            params.append(candidate_id)
            param_idx += 1
        
        if status:
            conditions.append(f"p.status = ${param_idx}::placement_status")
            params.append(status)
            param_idx += 1
        
        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
        
        query = f"""
            SELECT 
                p.id::text as placement_id,
                p.status,
                p.match_score,
                p.created_at,
                j.title as job_title,
                co.name as company_name,
                cand.full_name as candidate_name,
                a.name as agency_name
            FROM placements p
            JOIN jobs j ON p.job_id = j.id
            JOIN companies co ON j.company_id = co.id
            JOIN candidates cand ON p.candidate_id = cand.id
            LEFT JOIN agencies a ON p.agency_id = a.id
            {where_clause}
            ORDER BY p.created_at DESC
            LIMIT ${param_idx} OFFSET ${param_idx + 1}
        """
        params.extend([limit, offset])
        
        try:
            async with get_pg_connection() as conn:
                rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to list placements: {e}")
            return []


# =====================================================
# VISA PROCESS SERVICE
# =====================================================

class VisaProcessService:
    """Service for managing visa application processes"""
    
    @staticmethod
    async def create_visa_process(placement_id: str) -> Optional[str]:
        """Create a new visa process for a placement"""
        if not db_manager.pg_available:
            return None
        
        query = """
            INSERT INTO visa_processes (placement_id, status)
            VALUES ($1::uuid, 'NOT_STARTED')
            ON CONFLICT DO NOTHING
            RETURNING id::text
        """
        
        try:
            async with get_pg_connection() as conn:
                result = await conn.fetchval(query, placement_id)
            
            if result:
                logger.info(f"Created visa process {result} for placement {placement_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to create visa process: {e}")
            return None
    
    @staticmethod
    async def update_igi_submission(
        visa_process_id: str,
        submission_date: datetime,
        reference_number: str
    ) -> bool:
        """Update IGI submission details"""
        if not db_manager.pg_available:
            return False
        
        query = """
            UPDATE visa_processes
            SET status = 'IGI_SUBMISSION',
                igi_submission_date = $1,
                igi_reference_number = $2
            WHERE id = $3::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(query, submission_date, reference_number, visa_process_id)
            logger.info(f"Updated IGI submission for visa process {visa_process_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to update IGI submission: {e}")
            return False
    
    @staticmethod
    async def set_igi_pending(visa_process_id: str) -> bool:
        """Mark IGI as pending (submitted and waiting for response)"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    "UPDATE visa_processes SET status = 'IGI_PENDING' WHERE id = $1::uuid",
                    visa_process_id
                )
            return True
        except Exception as e:
            logger.error(f"Failed to set IGI pending: {e}")
            return False
    
    @staticmethod
    async def approve_igi(
        visa_process_id: str,
        approval_date: datetime,
        expiry_date: datetime
    ) -> bool:
        """Mark IGI as approved"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                # Update visa process
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'IGI_APPROVED',
                        igi_approval_date = $1,
                        igi_expiry_date = $2
                    WHERE id = $3::uuid
                """, approval_date, expiry_date, visa_process_id)
                
                # Also update placement status to VISA_IN_PROGRESS
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'VISA_IN_PROGRESS'
                    FROM visa_processes vp
                    WHERE vp.id = $1::uuid AND vp.placement_id = p.id
                """, visa_process_id)
            
            logger.info(f"IGI approved for visa process {visa_process_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to approve IGI: {e}")
            return False
    
    @staticmethod
    async def reject_igi(visa_process_id: str, rejection_reason: str) -> bool:
        """Mark IGI as rejected"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'IGI_REJECTED',
                        rejection_reason = $1
                    WHERE id = $2::uuid
                """, rejection_reason, visa_process_id)
            return True
        except Exception as e:
            logger.error(f"Failed to reject IGI: {e}")
            return False
    
    @staticmethod
    async def schedule_embassy_appointment(
        visa_process_id: str,
        embassy_country: str,
        appointment_date: datetime
    ) -> bool:
        """Schedule embassy appointment"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'EMBASSY_SCHEDULED',
                        embassy_country = $1,
                        embassy_appointment_date = $2
                    WHERE id = $3::uuid
                """, embassy_country, appointment_date, visa_process_id)
            logger.info(f"Embassy appointment scheduled for visa process {visa_process_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to schedule embassy appointment: {e}")
            return False
    
    @staticmethod
    async def complete_embassy_interview(visa_process_id: str, interview_date: datetime) -> bool:
        """Mark embassy interview as completed"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'EMBASSY_INTERVIEW',
                        embassy_interview_date = $1
                    WHERE id = $2::uuid
                """, interview_date, visa_process_id)
            return True
        except Exception as e:
            logger.error(f"Failed to complete embassy interview: {e}")
            return False
    
    @staticmethod
    async def approve_visa(
        visa_process_id: str,
        visa_number: str,
        approval_date: datetime,
        expiry_date: datetime
    ) -> bool:
        """Mark visa as approved"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                # Update visa process
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'VISA_APPROVED',
                        visa_number = $1,
                        visa_approval_date = $2,
                        visa_expiry_date = $3
                    WHERE id = $4::uuid
                """, visa_number, approval_date, expiry_date, visa_process_id)
                
                # Update placement status to VISA_APPROVED
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'VISA_APPROVED'
                    FROM visa_processes vp
                    WHERE vp.id = $1::uuid AND vp.placement_id = p.id
                """, visa_process_id)
            
            logger.info(f"Visa approved for process {visa_process_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to approve visa: {e}")
            return False
    
    @staticmethod
    async def issue_work_permit(
        visa_process_id: str,
        permit_number: str,
        issue_date: datetime,
        expiry_date: datetime
    ) -> bool:
        """Issue work permit"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE visa_processes
                    SET status = 'WORK_PERMIT_ISSUED',
                        work_permit_number = $1,
                        work_permit_issue_date = $2,
                        work_permit_expiry_date = $3
                    WHERE id = $4::uuid
                """, permit_number, issue_date, expiry_date, visa_process_id)
            return True
        except Exception as e:
            logger.error(f"Failed to issue work permit: {e}")
            return False
    
    @staticmethod
    async def get_pending_visas(days_threshold: int = 30) -> List[Dict]:
        """Get visa processes that need attention"""
        if not db_manager.pg_available:
            return []
        
        query = """
            SELECT 
                vp.id::text as visa_process_id,
                vp.status,
                vp.igi_submission_date,
                vp.igi_reference_number,
                vp.igi_approval_date,
                vp.embassy_appointment_date,
                vp.created_at,
                p.id::text as placement_id,
                cand.full_name,
                cand.nationality,
                co.name as company_name,
                j.title as job_title
            FROM visa_processes vp
            JOIN placements p ON vp.placement_id = p.id
            JOIN candidates cand ON p.candidate_id = cand.id
            JOIN jobs j ON p.job_id = j.id
            JOIN companies co ON j.company_id = co.id
            WHERE vp.status NOT IN ('VISA_APPROVED', 'VISA_REJECTED', 'WORK_PERMIT_ISSUED', 'IGI_REJECTED')
            ORDER BY vp.created_at ASC
        """
        
        try:
            async with get_pg_connection() as conn:
                rows = await conn.fetch(query)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to get pending visas: {e}")
            return []
    
    @staticmethod
    async def get_visa_process_by_placement(placement_id: str) -> Optional[Dict]:
        """Get visa process for a placement"""
        if not db_manager.pg_available:
            return None
        
        try:
            async with get_pg_connection() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM visa_processes WHERE placement_id = $1::uuid",
                    placement_id
                )
            return dict(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get visa process: {e}")
            return None


# =====================================================
# RELOCATION SERVICE
# =====================================================

class RelocationService:
    """Service for managing candidate relocation"""
    
    @staticmethod
    async def create_relocation_ticket(placement_id: str) -> Optional[str]:
        """Create a relocation ticket for a placement"""
        if not db_manager.pg_available:
            return None
        
        query = """
            INSERT INTO relocation_tickets (placement_id, status)
            VALUES ($1::uuid, 'NOT_STARTED')
            ON CONFLICT DO NOTHING
            RETURNING id::text
        """
        
        try:
            async with get_pg_connection() as conn:
                result = await conn.fetchval(query, placement_id)
            
            if result:
                logger.info(f"Created relocation ticket {result} for placement {placement_id}")
            return result
        except Exception as e:
            logger.error(f"Failed to create relocation ticket: {e}")
            return None
    
    @staticmethod
    async def book_flight(
        relocation_id: str,
        departure_city: str,
        departure_date: datetime,
        arrival_city: str,
        arrival_date: datetime,
        flight_number: str,
        booking_reference: str,
        flight_cost: float
    ) -> bool:
        """Book flight for relocation"""
        if not db_manager.pg_available:
            return False
        
        query = """
            UPDATE relocation_tickets
            SET status = 'FLIGHT_BOOKED',
                departure_city = $1,
                departure_date = $2,
                arrival_city = $3,
                arrival_date = $4,
                flight_number = $5,
                booking_reference = $6,
                flight_cost = $7
            WHERE id = $8::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    query,
                    departure_city, departure_date, arrival_city, arrival_date,
                    flight_number, booking_reference, flight_cost, relocation_id
                )
                
                # Update placement status to RELOCATING
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'RELOCATING'
                    FROM relocation_tickets rt
                    WHERE rt.id = $1::uuid AND rt.placement_id = p.id
                """, relocation_id)
            
            logger.info(f"Flight booked for relocation {relocation_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to book flight: {e}")
            return False
    
    @staticmethod
    async def mark_in_transit(relocation_id: str) -> bool:
        """Mark candidate as in transit"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    "UPDATE relocation_tickets SET status = 'IN_TRANSIT' WHERE id = $1::uuid",
                    relocation_id
                )
            return True
        except Exception as e:
            logger.error(f"Failed to mark in transit: {e}")
            return False
    
    @staticmethod
    async def mark_arrived(relocation_id: str) -> bool:
        """Mark candidate as arrived"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    "UPDATE relocation_tickets SET status = 'ARRIVED' WHERE id = $1::uuid",
                    relocation_id
                )
            return True
        except Exception as e:
            logger.error(f"Failed to mark arrived: {e}")
            return False
    
    @staticmethod
    async def assign_accommodation(
        relocation_id: str,
        address: str,
        accommodation_type: str,
        check_in_date: datetime,
        monthly_cost: float
    ) -> bool:
        """Assign accommodation for candidate"""
        if not db_manager.pg_available:
            return False
        
        query = """
            UPDATE relocation_tickets
            SET status = 'ACCOMMODATION_ASSIGNED',
                accommodation_address = $1,
                accommodation_type = $2,
                accommodation_check_in = $3,
                accommodation_cost = $4
            WHERE id = $5::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    query,
                    address, accommodation_type, check_in_date, monthly_cost, relocation_id
                )
            logger.info(f"Accommodation assigned for relocation {relocation_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to assign accommodation: {e}")
            return False
    
    @staticmethod
    async def start_onboarding(relocation_id: str) -> bool:
        """Start onboarding process"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(
                    "UPDATE relocation_tickets SET status = 'ONBOARDING' WHERE id = $1::uuid",
                    relocation_id
                )
            return True
        except Exception as e:
            logger.error(f"Failed to start onboarding: {e}")
            return False
    
    @staticmethod
    async def complete_relocation(relocation_id: str) -> bool:
        """Complete relocation and activate worker"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                # Complete relocation
                await conn.execute(
                    "UPDATE relocation_tickets SET status = 'COMPLETED' WHERE id = $1::uuid",
                    relocation_id
                )
                
                # Activate placement
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'ACTIVE'
                    FROM relocation_tickets rt
                    WHERE rt.id = $1::uuid AND rt.placement_id = p.id
                """, relocation_id)
            
            logger.info(f"Relocation completed, worker activated: {relocation_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to complete relocation: {e}")
            return False
    
    @staticmethod
    async def setup_airport_pickup(
        relocation_id: str,
        contact_name: str,
        contact_phone: str
    ) -> bool:
        """Setup airport pickup"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE relocation_tickets
                    SET pickup_arranged = true,
                        pickup_contact_name = $1,
                        pickup_contact_phone = $2
                    WHERE id = $3::uuid
                """, contact_name, contact_phone, relocation_id)
            return True
        except Exception as e:
            logger.error(f"Failed to setup airport pickup: {e}")
            return False
    
    @staticmethod
    async def get_upcoming_arrivals(days: int = 7) -> List[Dict]:
        """Get candidates arriving in the next N days"""
        if not db_manager.pg_available:
            return []
        
        query = """
            SELECT 
                rt.id::text as relocation_id,
                rt.status,
                rt.departure_city,
                rt.departure_date,
                rt.arrival_city,
                rt.arrival_date,
                rt.flight_number,
                rt.pickup_arranged,
                rt.pickup_contact_name,
                rt.pickup_contact_phone,
                rt.accommodation_address,
                cand.full_name,
                cand.nationality,
                co.name as company_name,
                j.title as job_title,
                j.work_city
            FROM relocation_tickets rt
            JOIN placements p ON rt.placement_id = p.id
            JOIN candidates cand ON p.candidate_id = cand.id
            JOIN jobs j ON p.job_id = j.id
            JOIN companies co ON j.company_id = co.id
            WHERE rt.status IN ('FLIGHT_BOOKED', 'IN_TRANSIT')
                AND rt.arrival_date BETWEEN NOW() AND NOW() + INTERVAL '%s days'
            ORDER BY rt.arrival_date ASC
        """ % days
        
        try:
            async with get_pg_connection() as conn:
                rows = await conn.fetch(query)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to get upcoming arrivals: {e}")
            return []
    
    @staticmethod
    async def get_relocation_by_placement(placement_id: str) -> Optional[Dict]:
        """Get relocation ticket for a placement"""
        if not db_manager.pg_available:
            return None
        
        try:
            async with get_pg_connection() as conn:
                row = await conn.fetchrow(
                    "SELECT * FROM relocation_tickets WHERE placement_id = $1::uuid",
                    placement_id
                )
            return dict(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get relocation ticket: {e}")
            return None


# =====================================================
# JOB SERVICE
# =====================================================

class JobService:
    """Service for managing jobs"""
    
    @staticmethod
    async def create_job(
        company_id: str,
        title: str,
        description: str,
        positions_count: int = 1,
        required_skills: List[str] = None,
        required_experience_years: int = 0,
        required_languages: List[str] = None,
        salary_min: float = None,
        salary_max: float = None,
        salary_currency: str = "EUR",
        benefits: str = None,
        work_country: str = "RO",
        work_city: str = None,
        start_date: datetime = None,
        deadline: datetime = None
    ) -> Optional[str]:
        """Create a new job posting"""
        if not db_manager.pg_available:
            return None
        
        query = """
            INSERT INTO jobs (
                company_id, title, description, positions_count,
                required_skills, required_experience_years, required_languages,
                salary_min, salary_max, salary_currency, benefits,
                work_country, work_city, start_date, deadline
            )
            VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING id::text
        """
        
        try:
            async with get_pg_connection() as conn:
                job_id = await conn.fetchval(
                    query,
                    company_id, title, description, positions_count,
                    required_skills or [], required_experience_years, required_languages or [],
                    salary_min, salary_max, salary_currency, benefits,
                    work_country, work_city, start_date, deadline
                )
            
            logger.info(f"Created job {job_id} for company {company_id}")
            return job_id
        except Exception as e:
            logger.error(f"Failed to create job: {e}")
            return None
    
    @staticmethod
    async def get_job(job_id: str) -> Optional[Dict]:
        """Get job by ID"""
        if not db_manager.pg_available:
            return None
        
        try:
            async with get_pg_connection() as conn:
                row = await conn.fetchrow(
                    """
                    SELECT j.*, c.name as company_name
                    FROM jobs j
                    JOIN companies c ON j.company_id = c.id
                    WHERE j.id = $1::uuid
                    """,
                    job_id
                )
            return dict(row) if row else None
        except Exception as e:
            logger.error(f"Failed to get job: {e}")
            return None
    
    @staticmethod
    async def list_active_jobs(
        company_id: str = None,
        work_country: str = None,
        limit: int = 50
    ) -> List[Dict]:
        """List active jobs"""
        if not db_manager.pg_available:
            return []
        
        conditions = ["j.is_active = true", "j.is_filled = false"]
        params = []
        param_idx = 1
        
        if company_id:
            conditions.append(f"j.company_id = ${param_idx}::uuid")
            params.append(company_id)
            param_idx += 1
        
        if work_country:
            conditions.append(f"j.work_country = ${param_idx}")
            params.append(work_country)
            param_idx += 1
        
        query = f"""
            SELECT 
                j.id::text as job_id,
                j.title,
                j.description,
                j.positions_count,
                j.positions_filled,
                j.salary_min,
                j.salary_max,
                j.salary_currency,
                j.work_city,
                j.work_country,
                j.deadline,
                c.name as company_name
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE {' AND '.join(conditions)}
            ORDER BY j.created_at DESC
            LIMIT ${param_idx}
        """
        params.append(limit)
        
        try:
            async with get_pg_connection() as conn:
                rows = await conn.fetch(query, *params)
            return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"Failed to list jobs: {e}")
            return []
    
    @staticmethod
    async def update_job_fill_count(job_id: str, increment: int = 1) -> bool:
        """Update the positions_filled count for a job"""
        if not db_manager.pg_available:
            return False
        
        try:
            async with get_pg_connection() as conn:
                result = await conn.execute("""
                    UPDATE jobs
                    SET positions_filled = positions_filled + $1,
                        is_filled = (positions_filled + $1 >= positions_count)
                    WHERE id = $2::uuid
                """, increment, job_id)
            return True
        except Exception as e:
            logger.error(f"Failed to update job fill count: {e}")
            return False


# =====================================================
# CONVENIENCE EXPORTS
# =====================================================

placement_service = PlacementService()
visa_service = VisaProcessService()
relocation_service = RelocationService()
job_service = JobService()
