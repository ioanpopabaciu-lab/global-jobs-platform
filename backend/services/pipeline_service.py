"""
GJC Platform - Pipeline Management Service
Manages the flow of placements through various stages:
Pending → Matched → Offer → Documents → Visa → Relocation → Active

This service handles state transitions, validations, and notifications.
"""

import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone, timedelta
from enum import Enum
import json

from database.db_config import get_pg_connection, execute_pg_query, db_manager

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
        
        Returns:
            Placement UUID if successful, None otherwise
        """
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
        
        Returns:
            Tuple of (success, message)
        """
        # Get current status
        async with get_pg_connection() as conn:
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
                return False, f"Invalid transition from {current_status} to {new_status}. Valid: {valid_next}"
            
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
    
    @staticmethod
    async def get_placement_details(placement_id: str) -> Optional[Dict]:
        """Get full placement details including related data"""
        query = """
            SELECT 
                p.*,
                j.title as job_title,
                j.positions_count,
                j.work_city,
                j.work_country,
                c.name as company_name,
                cand.full_name as candidate_name,
                cand.mongo_profile_id as candidate_mongo_id,
                a.name as agency_name,
                vp.status as visa_status,
                vp.igi_approval_date,
                vp.visa_approval_date,
                rt.status as relocation_status,
                rt.arrival_date
            FROM placements p
            JOIN jobs j ON p.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            JOIN candidates cand ON p.candidate_id = cand.id
            LEFT JOIN agencies a ON p.agency_id = a.id
            LEFT JOIN visa_processes vp ON vp.placement_id = p.id
            LEFT JOIN relocation_tickets rt ON rt.placement_id = p.id
            WHERE p.id = $1::uuid
        """
        
        async with get_pg_connection() as conn:
            row = await conn.fetchrow(query, placement_id)
            
        if not row:
            return None
        
        return dict(row)
    
    @staticmethod
    async def get_pipeline_stats(company_id: str = None) -> Dict:
        """Get pipeline statistics, optionally filtered by company"""
        base_query = """
            SELECT 
                status,
                COUNT(*) as count
            FROM placements p
            JOIN jobs j ON p.job_id = j.id
            {where_clause}
            GROUP BY status
        """
        
        where_clause = f"WHERE j.company_id = '{company_id}'::uuid" if company_id else ""
        query = base_query.format(where_clause=where_clause)
        
        async with get_pg_connection() as conn:
            rows = await conn.fetch(query)
        
        stats = {row['status']: row['count'] for row in rows}
        
        # Calculate totals
        total = sum(stats.values())
        active = stats.get('ACTIVE', 0)
        in_progress = sum(stats.get(s, 0) for s in ['VISA_IN_PROGRESS', 'RELOCATING', 'DOCUMENTS_PENDING', 'DOCUMENTS_VERIFIED'])
        
        return {
            "by_status": stats,
            "total": total,
            "active_workers": active,
            "in_progress": in_progress,
            "pending_review": stats.get('EMPLOYER_REVIEW', 0) + stats.get('PENDING', 0),
            "completion_rate": round(active / total * 100, 2) if total > 0 else 0
        }


# =====================================================
# VISA PROCESS SERVICE
# =====================================================

class VisaProcessService:
    """Service for managing visa application processes"""
    
    @staticmethod
    async def create_visa_process(placement_id: str) -> Optional[str]:
        """Create a new visa process for a placement"""
        query = """
            INSERT INTO visa_processes (placement_id, status)
            VALUES ($1::uuid, 'NOT_STARTED')
            ON CONFLICT DO NOTHING
            RETURNING id::text
        """
        
        async with get_pg_connection() as conn:
            result = await conn.fetchval(query, placement_id)
        
        if result:
            logger.info(f"Created visa process {result} for placement {placement_id}")
        return result
    
    @staticmethod
    async def update_igi_submission(
        visa_process_id: str,
        submission_date: datetime,
        reference_number: str
    ) -> bool:
        """Update IGI submission details"""
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
            return True
        except Exception as e:
            logger.error(f"Failed to update IGI submission: {e}")
            return False
    
    @staticmethod
    async def approve_igi(
        visa_process_id: str,
        approval_date: datetime,
        expiry_date: datetime
    ) -> bool:
        """Mark IGI as approved"""
        query = """
            UPDATE visa_processes
            SET status = 'IGI_APPROVED',
                igi_approval_date = $1,
                igi_expiry_date = $2
            WHERE id = $3::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(query, approval_date, expiry_date, visa_process_id)
            
            # Also update placement status
            placement_query = """
                UPDATE placements p
                SET status = 'VISA_IN_PROGRESS'
                FROM visa_processes vp
                WHERE vp.id = $1::uuid AND vp.placement_id = p.id
            """
            async with get_pg_connection() as conn:
                await conn.execute(placement_query, visa_process_id)
            
            return True
        except Exception as e:
            logger.error(f"Failed to approve IGI: {e}")
            return False
    
    @staticmethod
    async def schedule_embassy_appointment(
        visa_process_id: str,
        embassy_country: str,
        appointment_date: datetime
    ) -> bool:
        """Schedule embassy appointment"""
        query = """
            UPDATE visa_processes
            SET status = 'EMBASSY_SCHEDULED',
                embassy_country = $1,
                embassy_appointment_date = $2
            WHERE id = $3::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(query, embassy_country, appointment_date, visa_process_id)
            return True
        except Exception as e:
            logger.error(f"Failed to schedule embassy appointment: {e}")
            return False
    
    @staticmethod
    async def approve_visa(
        visa_process_id: str,
        visa_number: str,
        approval_date: datetime,
        expiry_date: datetime
    ) -> bool:
        """Mark visa as approved"""
        query = """
            UPDATE visa_processes
            SET status = 'VISA_APPROVED',
                visa_number = $1,
                visa_approval_date = $2,
                visa_expiry_date = $3
            WHERE id = $4::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(query, visa_number, approval_date, expiry_date, visa_process_id)
            
            # Update placement status
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'VISA_APPROVED'
                    FROM visa_processes vp
                    WHERE vp.id = $1::uuid AND vp.placement_id = p.id
                """, visa_process_id)
            
            return True
        except Exception as e:
            logger.error(f"Failed to approve visa: {e}")
            return False
    
    @staticmethod
    async def get_pending_visas(days_threshold: int = 30) -> List[Dict]:
        """Get visa processes that need attention"""
        query = """
            SELECT 
                vp.*,
                p.id as placement_id,
                cand.full_name,
                c.name as company_name,
                j.title as job_title
            FROM visa_processes vp
            JOIN placements p ON vp.placement_id = p.id
            JOIN candidates cand ON p.candidate_id = cand.id
            JOIN jobs j ON p.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE vp.status NOT IN ('VISA_APPROVED', 'VISA_REJECTED', 'WORK_PERMIT_ISSUED')
            ORDER BY vp.created_at ASC
        """
        
        async with get_pg_connection() as conn:
            rows = await conn.fetch(query)
        
        return [dict(row) for row in rows]


# =====================================================
# RELOCATION SERVICE
# =====================================================

class RelocationService:
    """Service for managing candidate relocation"""
    
    @staticmethod
    async def create_relocation_ticket(placement_id: str) -> Optional[str]:
        """Create a relocation ticket for a placement"""
        query = """
            INSERT INTO relocation_tickets (placement_id, status)
            VALUES ($1::uuid, 'NOT_STARTED')
            ON CONFLICT DO NOTHING
            RETURNING id::text
        """
        
        async with get_pg_connection() as conn:
            result = await conn.fetchval(query, placement_id)
        
        return result
    
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
            return True
        except Exception as e:
            logger.error(f"Failed to book flight: {e}")
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
        query = """
            UPDATE relocation_tickets
            SET accommodation_address = $1,
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
            return True
        except Exception as e:
            logger.error(f"Failed to assign accommodation: {e}")
            return False
    
    @staticmethod
    async def mark_arrived(relocation_id: str) -> bool:
        """Mark candidate as arrived"""
        query = """
            UPDATE relocation_tickets
            SET status = 'ARRIVED'
            WHERE id = $1::uuid
        """
        
        try:
            async with get_pg_connection() as conn:
                await conn.execute(query, relocation_id)
            
            # Update placement status to RELOCATING → ACTIVE
            async with get_pg_connection() as conn:
                await conn.execute("""
                    UPDATE placements p
                    SET status = 'ACTIVE'
                    FROM relocation_tickets rt
                    WHERE rt.id = $1::uuid AND rt.placement_id = p.id
                """, relocation_id)
            
            return True
        except Exception as e:
            logger.error(f"Failed to mark arrived: {e}")
            return False
    
    @staticmethod
    async def get_upcoming_arrivals(days: int = 7) -> List[Dict]:
        """Get candidates arriving in the next N days"""
        query = """
            SELECT 
                rt.*,
                cand.full_name,
                cand.nationality,
                c.name as company_name,
                j.title as job_title,
                j.work_city
            FROM relocation_tickets rt
            JOIN placements p ON rt.placement_id = p.id
            JOIN candidates cand ON p.candidate_id = cand.id
            JOIN jobs j ON p.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE rt.status = 'FLIGHT_BOOKED'
                AND rt.arrival_date BETWEEN NOW() AND NOW() + INTERVAL '%s days'
            ORDER BY rt.arrival_date ASC
        """ % days
        
        async with get_pg_connection() as conn:
            rows = await conn.fetch(query)
        
        return [dict(row) for row in rows]


# =====================================================
# CONVENIENCE EXPORTS
# =====================================================

placement_service = PlacementService()
visa_service = VisaProcessService()
relocation_service = RelocationService()
