"""
Portal routes — GJC Platform v3.0
Portaluri pentru: Candidat, Angajator, Agenție, Client Migrație
Include upload documente (Supabase Storage) și OCR.
"""
from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form
from datetime import datetime, timezone, date
from typing import Optional
import uuid
import logging
import os

from auth_routes import get_current_user
from database.db_config import execute_pg_one, execute_pg_write, get_pg_connection
from notification_service import notify_admin_new_profile_pending

logger = logging.getLogger(__name__)

PLATFORM_URL = os.environ.get("PLATFORM_URL", "https://gjc.ro")

portal_router = APIRouter(prefix="/portal", tags=["Portal"])


# ── helpers ───────────────────────────────────────────────────────────────────

def _row(r) -> dict | None:
    return dict(r) if r else None

def _rows(rs) -> list[dict]:
    return [dict(r) for r in rs]

async def _require_role(request: Request, *roles: str) -> dict:
    user = await get_current_user(request)
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Acces neautorizat.")
    return user


# ══════════════════════════════════════════════════════════════════════════════
# UPLOAD DOCUMENTE (comun tuturor rolurilor)
# ══════════════════════════════════════════════════════════════════════════════

ALLOWED_MIME_TYPES = {
    "image/jpeg", "image/png", "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

@portal_router.post("/documents/upload-session")
async def create_upload_session(request: Request):
    """
    Generează URL semnat pentru upload direct în Supabase Storage.
    Candidatul/angajatorul/agenția încarcă direct fără a trece prin backend.
    """
    user = await get_current_user(request)
    body = await request.json()
    document_type = body.get("document_type", "other")
    filename = body.get("filename", "document")
    content_type = body.get("content_type", "application/pdf")

    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Tip de fișier neacceptat.")

    try:
        from direct_upload_storage import create_candidate_signed_upload, build_candidate_object_path
        object_path = build_candidate_object_path(user["id"], document_type, filename)
        signed_url = await create_candidate_signed_upload(object_path)
        return {"upload_url": signed_url, "storage_path": object_path}
    except Exception as e:
        logger.error("Upload session error: %s", e)
        raise HTTPException(status_code=500, detail="Nu s-a putut crea sesiunea de upload.")


@portal_router.post("/documents/register")
async def register_document(request: Request):
    """
    Înregistrează metadatele unui document după ce fișierul a fost încărcat în Supabase.
    """
    user = await get_current_user(request)
    body = await request.json()

    required = ["owner_type", "owner_id", "document_type", "storage_path", "original_filename"]
    for field in required:
        if not body.get(field):
            raise HTTPException(status_code=400, detail=f"Câmp lipsă: {field}")

    # Verifică că owner_id aparține utilizatorului curent
    owner_type = body["owner_type"]
    owner_id = body["owner_id"]
    role = user.get("role")

    async with get_pg_connection() as conn:
        if owner_type == "candidate" and role == "candidate":
            ok = await conn.fetchval(
                "SELECT id FROM candidates WHERE id=$1 AND user_id=$2",
                uuid.UUID(owner_id), uuid.UUID(user["id"])
            )
            if not ok:
                raise HTTPException(status_code=403, detail="Nu poți înregistra documente pentru alt candidat.")
        elif owner_type == "employer" and role == "employer":
            ok = await conn.fetchval(
                "SELECT id FROM employers WHERE id=$1 AND user_id=$2",
                uuid.UUID(owner_id), uuid.UUID(user["id"])
            )
            if not ok:
                raise HTTPException(status_code=403, detail="Nu poți înregistra documente pentru altă firmă.")
        elif owner_type == "agency" and role == "agency":
            ok = await conn.fetchval(
                "SELECT id FROM agencies WHERE id=$1 AND user_id=$2",
                uuid.UUID(owner_id), uuid.UUID(user["id"])
            )
            if not ok:
                raise HTTPException(status_code=403, detail="Nu poți înregistra documente pentru altă agenție.")

        doc_id = await conn.fetchval("""
            INSERT INTO documents
                (owner_type, owner_id, document_type, original_filename,
                 display_name, storage_path, file_type, file_size, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
            RETURNING id
        """,
            owner_type, uuid.UUID(owner_id),
            body["document_type"], body["original_filename"],
            body.get("display_name"), body["storage_path"],
            body.get("content_type"), body.get("file_size")
        )

    return {"success": True, "document_id": str(doc_id)}


# ══════════════════════════════════════════════════════════════════════════════
# PORTAL CANDIDAT
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.get("/candidate/dashboard")
async def candidate_dashboard(request: Request):
    """Dashboard candidat: statusul profilului, plasamente active, notificări."""
    user = await _require_role(request, "candidate")
    async with get_pg_connection() as conn:
        candidate = await conn.fetchrow(
            "SELECT id, status, profile_completion_pct, candidate_type, "
            "target_position_name, submitted_at FROM candidates WHERE user_id=$1",
            uuid.UUID(user["id"])
        )
        if not candidate:
            return {"profile_exists": False, "profile": None, "placements": [], "notifications": []}

        placements = await conn.fetch("""
            SELECT p.id, p.placement_type, p.visibility_stage,
                   p.current_stage_a, p.current_stage_b,
                   -- Firma: vizibilă de la etapa 2 (doar numele)
                   CASE WHEN p.visibility_stage >= 2 THEN e.company_name
                        ELSE '*** Confidențial ***' END AS employer_name,
                   e.city AS employer_city, e.county AS employer_county,
                   e.activity_domain,
                   jr.position_title, jr.salary_gross, jr.salary_currency,
                   jr.contract_type,
                   p.interview_date, p.selection_date, p.new_job_start_date,
                   p.igi_submitted_at, p.igi_approved_at,
                   p.visa_submitted_at, p.visa_approved_at,
                   p.flight_date, p.employment_start_date,
                   p.created_at
            FROM placements p
            JOIN job_requests jr ON p.job_request_id = jr.id
            JOIN employers e ON p.employer_id = e.id
            WHERE p.candidate_id = $1
              AND p.cancelled_at IS NULL
            ORDER BY p.created_at DESC
        """, candidate["id"])

        notifications = await conn.fetch("""
            SELECT id, type, category, title, message, is_read, created_at
            FROM notifications WHERE user_id=$1
            ORDER BY created_at DESC LIMIT 20
        """, uuid.UUID(user["id"]))

    return {
        "profile_exists": True,
        "profile": _row(candidate),
        "placements": _rows(placements),
        "notifications": _rows(notifications),
        "unread_count": sum(1 for n in notifications if not n["is_read"]),
    }


@portal_router.get("/candidate/profile")
async def get_candidate_profile(request: Request):
    """Returnează profilul complet al candidatului autentificat."""
    user = await _require_role(request, "candidate")
    async with get_pg_connection() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM candidates WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not profile:
            return {"profile": None}
        docs = await conn.fetch(
            "SELECT id, document_type, display_name, original_filename, status, "
            "expiry_date, created_at FROM documents "
            "WHERE owner_type='candidate' AND owner_id=$1 AND is_archived=FALSE "
            "ORDER BY created_at DESC",
            profile["id"]
        )
    return {"profile": _row(profile), "documents": _rows(docs)}


@portal_router.post("/candidate/profile")
async def create_candidate_profile(request: Request):
    """Creează sau actualizează profilul candidatului."""
    user = await _require_role(request, "candidate")
    body = await request.json()

    async with get_pg_connection() as conn:
        existing = await conn.fetchrow(
            "SELECT id, status FROM candidates WHERE user_id=$1", uuid.UUID(user["id"])
        )

        if existing:
            if existing["status"] == "pending_validation":
                raise HTTPException(
                    status_code=400,
                    detail="Profilul este în curs de validare. Nu poți face modificări."
                )

            # UPDATE — construim dinamic doar câmpurile trimise
            updatable = [
                "candidate_type", "first_name", "last_name", "date_of_birth",
                "gender", "marital_status", "military_service",
                "origin_country", "nationality", "residence_country", "current_address",
                "phone", "email",
                "target_cor_code", "target_position_name", "job_types_sought",
                "qualification_level", "education_level",
                "experience_years_origin", "experience_years_other", "experience_years_romania",
                "experience_countries", "last_employer_contact", "languages",
                "has_driving_license", "driving_license_national", "driving_license_international",
                "driving_license_categories", "equipment_used", "digital_skills",
                "digital_tools", "other_skills",
                "available_shifts", "available_low_temperature", "available_high_temperature",
                "available_at_height", "preferred_salary_fulltime", "preferred_salary_parttime",
                "preferred_currency",
                # Type 1
                "current_location_type",
                # Type 2
                "current_employer_name", "current_employer_start_date",
                "departure_reason", "departure_date", "work_permit_number", "work_permit_expiry",
                # Type 3
                "current_employer_parttime", "current_work_schedule",
                "available_days", "available_hours_start", "available_hours_end",
            ]
            sets = []
            params: list = []
            i = 1
            for field in updatable:
                if field in body:
                    sets.append(f"{field}=${i}")
                    params.append(body[field]); i += 1

            if sets:
                sets.append(f"updated_at=NOW()")
                params.append(existing["id"])
                await conn.execute(
                    f"UPDATE candidates SET {', '.join(sets)} WHERE id=${i}",
                    *params
                )
            return {"success": True, "candidate_id": str(existing["id"]), "action": "updated"}

        else:
            # CREATE
            candidate_type = body.get("candidate_type")
            if not candidate_type:
                raise HTTPException(status_code=400, detail="candidate_type este obligatoriu.")
            first_name = body.get("first_name", "")
            last_name = body.get("last_name", "")
            origin_country = body.get("origin_country", "")
            if not first_name or not last_name or not origin_country:
                raise HTTPException(
                    status_code=400,
                    detail="first_name, last_name, origin_country sunt obligatorii."
                )

            cid = await conn.fetchval("""
                INSERT INTO candidates
                    (user_id, candidate_type, first_name, last_name, origin_country,
                     nationality, residence_country, date_of_birth, gender, marital_status,
                     email, phone, target_cor_code, target_position_name, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'draft')
                RETURNING id
            """,
                uuid.UUID(user["id"]), candidate_type, first_name, last_name, origin_country,
                body.get("nationality"), body.get("residence_country"),
                body.get("date_of_birth"), body.get("gender"), body.get("marital_status"),
                body.get("email", user.get("email")), body.get("phone"),
                body.get("target_cor_code"), body.get("target_position_name")
            )
            return {"success": True, "candidate_id": str(cid), "action": "created"}


@portal_router.post("/candidate/profile/submit")
async def submit_candidate_profile(request: Request):
    """Trimite profilul candidatului spre validare admin."""
    user = await _require_role(request, "candidate")
    async with get_pg_connection() as conn:
        profile = await conn.fetchrow(
            "SELECT id, status, first_name, last_name FROM candidates WHERE user_id=$1",
            uuid.UUID(user["id"])
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Profilul nu există. Creează-l mai întâi.")
        if profile["status"] == "pending_validation":
            raise HTTPException(status_code=400, detail="Profilul este deja trimis spre validare.")
        if profile["status"] == "validated":
            raise HTTPException(status_code=400, detail="Profilul este deja validat.")

        await conn.execute("""
            UPDATE candidates
            SET status='pending_validation', submitted_at=NOW(), updated_at=NOW()
            WHERE id=$1
        """, profile["id"])

    # Notifică adminul
    try:
        await notify_admin_new_profile_pending(
            profile_type="candidate",
            user_name=f"{profile['first_name']} {profile['last_name']}",
            platform_url=PLATFORM_URL
        )
    except Exception as e:
        logger.warning("notify_admin_new_profile_pending failed: %s", e)

    return {"success": True, "message": "Profilul a fost trimis spre validare."}


@portal_router.get("/candidate/notifications")
async def get_candidate_notifications(request: Request):
    """Notificările candidatului autentificat."""
    user = await _require_role(request, "candidate")
    async with get_pg_connection() as conn:
        rows = await conn.fetch("""
            SELECT id, type, category, title, message, is_read, entity_type, entity_id, created_at
            FROM notifications WHERE user_id=$1
            ORDER BY created_at DESC LIMIT 50
        """, uuid.UUID(user["id"]))
    return {"notifications": _rows(rows)}


@portal_router.put("/candidate/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, request: Request):
    """Marchează o notificare ca citită."""
    user = await _require_role(request, "candidate", "employer", "agency", "migration_client")
    async with get_pg_connection() as conn:
        await conn.execute("""
            UPDATE notifications SET is_read=TRUE, read_at=NOW()
            WHERE id=$1 AND user_id=$2
        """, uuid.UUID(notification_id), uuid.UUID(user["id"]))
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# PORTAL ANGAJATOR
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.get("/employer/dashboard")
async def employer_dashboard(request: Request):
    """Dashboard angajator: statusul profilului, joburi active, plasamente."""
    user = await _require_role(request, "employer")
    async with get_pg_connection() as conn:
        employer = await conn.fetchrow(
            "SELECT id, status, company_name, category, city, county FROM employers WHERE user_id=$1",
            uuid.UUID(user["id"])
        )
        if not employer:
            return {"profile_exists": False}

        jobs = await conn.fetch("""
            SELECT id, position_title, cor_code, category, positions_count,
                   positions_filled, status, created_at
            FROM job_requests WHERE employer_id=$1
            ORDER BY created_at DESC LIMIT 20
        """, employer["id"])

        placements = await conn.fetch("""
            SELECT p.id, p.placement_type, p.visibility_stage,
                   p.current_stage_a, p.current_stage_b,
                   p.match_score, p.contract_signed, p.payment_confirmed,
                   -- Candidat: vizibil complet de la etapa 2
                   CASE WHEN p.visibility_stage >= 2
                       THEN c.first_name || ' ' || c.last_name
                       ELSE '*** Confidențial ***' END AS candidate_name,
                   c.origin_country, c.candidate_type,
                   c.target_position_name, c.qualification_level,
                   -- Informații job-specific vizibile de la etapa 1
                   CASE WHEN p.visibility_stage >= 1
                       THEN c.experience_years_origin ELSE NULL END AS experience_years,
                   CASE WHEN p.visibility_stage >= 1
                       THEN c.qualification_level::TEXT ELSE NULL END AS qualification,
                   jr.position_title,
                   p.interview_date, p.selection_date,
                   p.igi_submitted_at, p.igi_approved_at,
                   p.flight_date, p.arrived_at,
                   p.created_at
            FROM placements p
            JOIN candidates c ON p.candidate_id = c.id
            JOIN job_requests jr ON p.job_request_id = jr.id
            WHERE p.employer_id = $1 AND p.cancelled_at IS NULL
            ORDER BY p.created_at DESC
        """, employer["id"])

        notifications = await conn.fetch("""
            SELECT id, type, category, title, message, is_read, created_at
            FROM notifications WHERE user_id=$1
            ORDER BY created_at DESC LIMIT 20
        """, uuid.UUID(user["id"]))

    return {
        "profile_exists": True,
        "employer": _row(employer),
        "jobs": _rows(jobs),
        "placements": _rows(placements),
        "notifications": _rows(notifications),
        "unread_count": sum(1 for n in notifications if not n["is_read"]),
    }


@portal_router.get("/employer/profile")
async def get_employer_profile(request: Request):
    """Profilul complet al angajatorului autentificat."""
    user = await _require_role(request, "employer")
    async with get_pg_connection() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM employers WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not profile:
            return {"profile": None}
        docs = await conn.fetch(
            "SELECT id, document_type, display_name, original_filename, status, created_at "
            "FROM documents WHERE owner_type='employer' AND owner_id=$1 AND is_archived=FALSE",
            profile["id"]
        )
    return {"profile": _row(profile), "documents": _rows(docs)}


@portal_router.post("/employer/profile")
async def create_or_update_employer_profile(request: Request):
    """Creează sau actualizează profilul angajatorului."""
    user = await _require_role(request, "employer")
    body = await request.json()

    async with get_pg_connection() as conn:
        existing = await conn.fetchrow(
            "SELECT id, status FROM employers WHERE user_id=$1", uuid.UUID(user["id"])
        )

        updatable = [
            "company_name", "cui", "legal_form", "registration_number",
            "address", "city", "county", "country", "postal_code",
            "contact_person_name", "contact_person_role", "phone", "website",
            "category", "activity_domain", "activity_domain_caen",
            "total_employees", "has_non_eu_workers", "non_eu_workers_count",
            "cat_a_contract_types", "cat_a_accommodation_provided", "cat_a_meals_provided",
            "cat_a_accepted_nationalities", "cat_b_job_types",
        ]

        if existing:
            if existing["status"] == "pending_validation":
                raise HTTPException(
                    status_code=400,
                    detail="Profilul este în curs de validare."
                )
            sets = []
            params: list = []
            i = 1
            for field in updatable:
                if field in body:
                    sets.append(f"{field}=${i}")
                    params.append(body[field]); i += 1
            if sets:
                sets.append("updated_at=NOW()")
                params.append(existing["id"])
                await conn.execute(
                    f"UPDATE employers SET {', '.join(sets)} WHERE id=${i}", *params
                )
            return {"success": True, "employer_id": str(existing["id"]), "action": "updated"}

        else:
            category = body.get("category")
            company_name = body.get("company_name", "")
            if not category or not company_name:
                raise HTTPException(status_code=400, detail="company_name și category sunt obligatorii.")

            eid = await conn.fetchval("""
                INSERT INTO employers
                    (user_id, company_name, cui, legal_form, category,
                     address, city, county, country,
                     contact_person_name, phone, website,
                     activity_domain, total_employees, status)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'draft')
                RETURNING id
            """,
                uuid.UUID(user["id"]), company_name,
                body.get("cui"), body.get("legal_form"), category,
                body.get("address"), body.get("city"), body.get("county"),
                body.get("country", "Romania"),
                body.get("contact_person_name"), body.get("phone"), body.get("website"),
                body.get("activity_domain"), body.get("total_employees")
            )
            return {"success": True, "employer_id": str(eid), "action": "created"}


@portal_router.post("/employer/profile/submit")
async def submit_employer_profile(request: Request):
    """Trimite profilul angajatorului spre validare admin."""
    user = await _require_role(request, "employer")
    async with get_pg_connection() as conn:
        profile = await conn.fetchrow(
            "SELECT id, status, company_name FROM employers WHERE user_id=$1",
            uuid.UUID(user["id"])
        )
        if not profile:
            raise HTTPException(status_code=404, detail="Profilul nu există.")
        if profile["status"] in ("pending_validation", "validated"):
            raise HTTPException(status_code=400, detail=f"Profilul este deja: {profile['status']}.")

        await conn.execute("""
            UPDATE employers
            SET status='pending_validation', submitted_at=NOW(), updated_at=NOW()
            WHERE id=$1
        """, profile["id"])

    try:
        await notify_admin_new_profile_pending(
            profile_type="employer",
            user_name=profile["company_name"],
            platform_url=PLATFORM_URL
        )
    except Exception as e:
        logger.warning("notify_admin failed: %s", e)

    return {"success": True, "message": "Profilul a fost trimis spre validare."}


# ── Job Requests (Angajator) ──────────────────────────────────────────────────

@portal_router.get("/employer/jobs")
async def list_employer_jobs(request: Request):
    """Cererile de recrutare ale angajatorului autentificat."""
    user = await _require_role(request, "employer")
    async with get_pg_connection() as conn:
        employer = await conn.fetchrow(
            "SELECT id, status FROM employers WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not employer:
            raise HTTPException(status_code=404, detail="Profil angajator negăsit.")

        jobs = await conn.fetch("""
            SELECT jr.*,
                (SELECT COUNT(*) FROM placements p WHERE p.job_request_id=jr.id) AS placements_count
            FROM job_requests jr
            WHERE jr.employer_id=$1
            ORDER BY jr.created_at DESC
        """, employer["id"])
    return {"jobs": _rows(jobs)}


@portal_router.post("/employer/jobs")
async def create_job_request(request: Request):
    """Creează o nouă cerere de recrutare."""
    user = await _require_role(request, "employer")
    body = await request.json()

    async with get_pg_connection() as conn:
        employer = await conn.fetchrow(
            "SELECT id, status, category FROM employers WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not employer:
            raise HTTPException(status_code=404, detail="Profil angajator negăsit.")
        if employer["status"] != "validated":
            raise HTTPException(
                status_code=400,
                detail="Profilul companiei trebuie validat înainte de a posta cereri."
            )

        position_title = body.get("position_title")
        category = body.get("category", employer["category"])
        if not position_title:
            raise HTTPException(status_code=400, detail="position_title este obligatoriu.")
        if category == "AB":
            raise HTTPException(
                status_code=400,
                detail="Selectează categoria A sau B pentru această cerere (nu AB)."
            )

        job_id = await conn.fetchval("""
            INSERT INTO job_requests
                (employer_id, cor_code, position_title, positions_count, category,
                 min_experience_years_total, min_experience_years_origin,
                 min_experience_years_other, min_experience_years_romania,
                 min_education_level, required_qualifications, required_certifications,
                 required_driving_licenses, required_equipment,
                 salary_gross, salary_currency, other_benefits,
                 accommodation_provided, meals_provided, transport_provided,
                 preferred_nationalities, max_age, preferred_gender,
                 preferred_marital_status, contract_type, contract_duration_months,
                 works_in_shifts, works_low_temp, works_high_temp, works_at_height,
                 status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,'draft')
            RETURNING id
        """,
            employer["id"],
            body.get("cor_code"), position_title,
            body.get("positions_count", 1), category,
            body.get("min_experience_years_total", 0),
            body.get("min_experience_years_origin", 0),
            body.get("min_experience_years_other", 0),
            body.get("min_experience_years_romania", 0),
            body.get("min_education_level"),
            body.get("required_qualifications"), body.get("required_certifications"),
            body.get("required_driving_licenses"), body.get("required_equipment"),
            body.get("salary_gross"), body.get("salary_currency", "RON"),
            body.get("other_benefits"),
            body.get("accommodation_provided", False),
            body.get("meals_provided", False),
            body.get("transport_provided", False),
            body.get("preferred_nationalities"),
            body.get("max_age"), body.get("preferred_gender", "any"),
            body.get("preferred_marital_status"),
            body.get("contract_type"), body.get("contract_duration_months"),
            body.get("works_in_shifts", False), body.get("works_low_temp", False),
            body.get("works_high_temp", False), body.get("works_at_height", False),
        )
    return {"success": True, "job_id": str(job_id)}


@portal_router.put("/employer/jobs/{job_id}")
async def update_job_request(job_id: str, request: Request):
    """Actualizează o cerere de recrutare (doar dacă e în draft sau deschisă)."""
    user = await _require_role(request, "employer")
    body = await request.json()

    async with get_pg_connection() as conn:
        job = await conn.fetchrow("""
            SELECT jr.id, jr.status FROM job_requests jr
            JOIN employers e ON jr.employer_id = e.id
            WHERE jr.id=$1 AND e.user_id=$2
        """, uuid.UUID(job_id), uuid.UUID(user["id"]))

        if not job:
            raise HTTPException(status_code=404, detail="Cerere negăsită sau nu îți aparține.")
        if job["status"] in ("filled", "cancelled"):
            raise HTTPException(status_code=400, detail="Nu poți modifica o cerere finalizată.")

        updatable = [
            "position_title", "positions_count", "cor_code",
            "min_experience_years_total", "salary_gross", "other_benefits",
            "accommodation_provided", "meals_provided", "transport_provided",
            "preferred_nationalities", "max_age", "contract_type",
        ]
        sets = []
        params: list = []
        i = 1
        for field in updatable:
            if field in body:
                sets.append(f"{field}=${i}")
                params.append(body[field]); i += 1

        if sets:
            sets.append("updated_at=NOW()")
            params.append(uuid.UUID(job_id))
            await conn.execute(
                f"UPDATE job_requests SET {', '.join(sets)} WHERE id=${i}", *params
            )
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# PORTAL AGENȚIE
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.get("/agency/dashboard")
async def agency_dashboard(request: Request):
    """Dashboard agenție: candidații proprii, joburi disponibile, statistici."""
    user = await _require_role(request, "agency")
    async with get_pg_connection() as conn:
        agency = await conn.fetchrow(
            "SELECT id, status, agency_name, country FROM agencies WHERE user_id=$1",
            uuid.UUID(user["id"])
        )
        if not agency:
            return {"profile_exists": False}

        candidates = await conn.fetch("""
            SELECT id, first_name, last_name, candidate_type, origin_country,
                   target_position_name, status, created_at
            FROM candidates WHERE agency_id=$1
            ORDER BY created_at DESC LIMIT 50
        """, agency["id"])

        # Joburi disponibile (agenția vede: oraș, județ, domeniu, info job)
        open_jobs = await conn.fetch("""
            SELECT jr.id, jr.position_title, jr.cor_code, jr.category,
                   jr.positions_count - jr.positions_filled AS positions_available,
                   jr.salary_gross, jr.salary_currency, jr.contract_type,
                   jr.min_experience_years_total,
                   jr.accommodation_provided, jr.meals_provided,
                   jr.preferred_nationalities, jr.max_age,
                   -- Angajator: agenția vede DOAR oraș, județ, domeniu
                   e.city AS employer_city,
                   e.county AS employer_county,
                   e.activity_domain,
                   jr.created_at
            FROM job_requests jr
            JOIN employers e ON jr.employer_id = e.id
            WHERE jr.status = 'open'
              AND (jr.positions_count - jr.positions_filled) > 0
            ORDER BY jr.created_at DESC LIMIT 50
        """)

        stats = await conn.fetchrow("""
            SELECT
                COUNT(*) FILTER (WHERE status='validated') AS validated_count,
                COUNT(*) FILTER (WHERE status='pending_validation') AS pending_count,
                COUNT(*) FILTER (WHERE status='draft') AS draft_count
            FROM candidates WHERE agency_id=$1
        """, agency["id"])

    return {
        "profile_exists": True,
        "agency": _row(agency),
        "candidates": _rows(candidates),
        "open_jobs": _rows(open_jobs),
        "stats": _row(stats),
    }


@portal_router.get("/agency/profile")
async def get_agency_profile(request: Request):
    """Profilul complet al agenției autentificate."""
    user = await _require_role(request, "agency")
    async with get_pg_connection() as conn:
        profile = await conn.fetchrow(
            "SELECT * FROM agencies WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not profile:
            return {"profile": None}
        docs = await conn.fetch(
            "SELECT id, document_type, display_name, status, created_at "
            "FROM documents WHERE owner_type='agency' AND owner_id=$1",
            profile["id"]
        )
    return {"profile": _row(profile), "documents": _rows(docs)}


@portal_router.post("/agency/profile")
async def create_or_update_agency_profile(request: Request):
    """Creează sau actualizează profilul agenției."""
    user = await _require_role(request, "agency")
    body = await request.json()

    async with get_pg_connection() as conn:
        existing = await conn.fetchrow(
            "SELECT id, status FROM agencies WHERE user_id=$1", uuid.UUID(user["id"])
        )

        updatable = [
            "agency_name", "agency_type", "country", "city", "address",
            "contact_person_name", "phone", "website",
            "license_number", "license_expiry", "commission_rate", "specialization",
        ]

        if existing:
            sets = []
            params: list = []
            i = 1
            for field in updatable:
                if field in body:
                    sets.append(f"{field}=${i}")
                    params.append(body[field]); i += 1
            if sets:
                sets.append("updated_at=NOW()")
                params.append(existing["id"])
                await conn.execute(
                    f"UPDATE agencies SET {', '.join(sets)} WHERE id=${i}", *params
                )
            return {"success": True, "agency_id": str(existing["id"]), "action": "updated"}

        else:
            agency_name = body.get("agency_name", "")
            country = body.get("country", "")
            if not agency_name or not country:
                raise HTTPException(status_code=400, detail="agency_name și country sunt obligatorii.")

            aid = await conn.fetchval("""
                INSERT INTO agencies
                    (user_id, agency_name, agency_type, country, city, address,
                     contact_person_name, phone, license_number, commission_rate, status)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending_validation')
                RETURNING id
            """,
                uuid.UUID(user["id"]), agency_name, body.get("agency_type"), country,
                body.get("city"), body.get("address"), body.get("contact_person_name"),
                body.get("phone"), body.get("license_number"), body.get("commission_rate")
            )
            return {"success": True, "agency_id": str(aid), "action": "created"}


@portal_router.post("/agency/candidates")
async def upload_agency_candidate(request: Request):
    """
    Agenția încarcă un candidat nou (fără cont propriu).
    Adminul va valida separat fiecare candidat.
    """
    user = await _require_role(request, "agency")
    body = await request.json()

    async with get_pg_connection() as conn:
        agency = await conn.fetchrow(
            "SELECT id, status FROM agencies WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not agency:
            raise HTTPException(status_code=404, detail="Profil agenție negăsit.")
        if agency["status"] != "validated":
            raise HTTPException(
                status_code=400,
                detail="Agenția trebuie validată înainte de a încărca candidați."
            )

        candidate_type = body.get("candidate_type", "type1_abroad")
        first_name = body.get("first_name", "")
        last_name = body.get("last_name", "")
        origin_country = body.get("origin_country", "")

        if not first_name or not last_name or not origin_country:
            raise HTTPException(status_code=400, detail="first_name, last_name, origin_country obligatorii.")

        cid = await conn.fetchval("""
            INSERT INTO candidates
                (agency_id, candidate_type, first_name, last_name,
                 origin_country, nationality, residence_country,
                 date_of_birth, gender, phone, email,
                 target_cor_code, target_position_name,
                 qualification_level, education_level,
                 experience_years_origin, experience_years_other, experience_years_romania,
                 experience_countries, languages,
                 has_driving_license, driving_license_categories,
                 equipment_used, available_shifts, available_at_height,
                 preferred_salary_fulltime, status)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,'draft')
            RETURNING id
        """,
            agency["id"], candidate_type, first_name, last_name, origin_country,
            body.get("nationality"), body.get("residence_country"),
            body.get("date_of_birth"), body.get("gender"),
            body.get("phone"), body.get("email"),
            body.get("target_cor_code"), body.get("target_position_name"),
            body.get("qualification_level"), body.get("education_level"),
            body.get("experience_years_origin", 0),
            body.get("experience_years_other", 0),
            body.get("experience_years_romania", 0),
            body.get("experience_countries"),
            body.get("languages", []),
            body.get("has_driving_license", False),
            body.get("driving_license_categories"),
            body.get("equipment_used"),
            body.get("available_shifts", False),
            body.get("available_at_height", False),
            body.get("preferred_salary_fulltime"),
        )

        # Actualizează contor agenție
        await conn.execute("""
            UPDATE agencies SET total_candidates_uploaded=total_candidates_uploaded+1 WHERE id=$1
        """, agency["id"])

    return {"success": True, "candidate_id": str(cid)}


@portal_router.get("/agency/candidates")
async def list_agency_candidates(request: Request):
    """Lista candidaților încărcați de agenția autentificată."""
    user = await _require_role(request, "agency")
    async with get_pg_connection() as conn:
        agency = await conn.fetchrow(
            "SELECT id FROM agencies WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not agency:
            raise HTTPException(status_code=404, detail="Profil agenție negăsit.")
        candidates = await conn.fetch("""
            SELECT id, first_name, last_name, candidate_type, origin_country,
                   nationality, target_position_name, qualification_level,
                   status, created_at, profile_completion_pct
            FROM candidates WHERE agency_id=$1
            ORDER BY created_at DESC
        """, agency["id"])
    return {"candidates": _rows(candidates)}


# ══════════════════════════════════════════════════════════════════════════════
# PORTAL CLIENT MIGRAȚIE
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.post("/migration/request")
async def create_migration_request(request: Request):
    """
    Orice persoană (cu sau fără cont) poate solicita un serviciu de migrație.
    Pentru utilizatorii autentificați, contul e legat automat.
    """
    body = await request.json()

    # Încearcă autentificare opțională
    user = None
    try:
        user = await get_current_user(request)
    except Exception:
        pass

    service_type = body.get("service_type")
    valid_services = [
        "M1_family_reunion", "M2_visa_d_vf", "M3_employer_change",
        "M4_permanent_residence", "M5_citizenship", "M6_civil_documents",
        "M7_diploma_recognition", "M8_driving_license",
        "M9_legal_defense", "M10_health_card"
    ]
    if service_type not in valid_services:
        raise HTTPException(
            status_code=400,
            detail=f"Tip serviciu invalid. Valori: {valid_services}"
        )

    first_name = body.get("first_name", "")
    last_name = body.get("last_name", "")
    if not first_name or not last_name:
        raise HTTPException(status_code=400, detail="first_name și last_name sunt obligatorii.")

    async with get_pg_connection() as conn:
        # Creează sau găsește clientul
        user_id = uuid.UUID(user["id"]) if user else None

        if user_id:
            client = await conn.fetchrow(
                "SELECT id FROM migration_clients WHERE user_id=$1", user_id
            )
        else:
            client = None

        if not client:
            client_id = await conn.fetchval("""
                INSERT INTO migration_clients
                    (user_id, first_name, last_name, phone, email,
                     nationality, current_location,
                     requestor_name, requestor_phone, requestor_email, requestor_relationship)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING id
            """,
                user_id, first_name, last_name,
                body.get("phone"), body.get("email"),
                body.get("nationality"), body.get("current_location"),
                body.get("requestor_name"), body.get("requestor_phone"),
                body.get("requestor_email"),
                body.get("requestor_relationship", "self")
            )
        else:
            client_id = client["id"]

        case_id = await conn.fetchval("""
            INSERT INTO migration_cases
                (client_id, service_type, status, description, urgency)
            VALUES ($1, $2, 'received', $3, $4)
            RETURNING id
        """,
            client_id, service_type,
            body.get("description"), body.get("urgency", "normal")
        )

        # Istoricul inițial
        await conn.execute("""
            INSERT INTO migration_case_history (case_id, old_status, new_status, notes)
            VALUES ($1, NULL, 'received', 'Cerere nouă primită')
        """, case_id)

    return {
        "success": True,
        "case_id": str(case_id),
        "message": "Cererea ta a fost primită. GJC te va contacta în cel mai scurt timp."
    }


@portal_router.get("/migration/cases")
async def list_my_migration_cases(request: Request):
    """Dosarele de migrație ale utilizatorului autentificat."""
    user = await _require_role(request, "migration_client", "candidate")
    async with get_pg_connection() as conn:
        client = await conn.fetchrow(
            "SELECT id FROM migration_clients WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not client:
            return {"cases": []}
        cases = await conn.fetch("""
            SELECT id, service_type, status, result, urgency,
                   estimated_cost, payment_status,
                   created_at, updated_at, closed_at
            FROM migration_cases WHERE client_id=$1
            ORDER BY created_at DESC
        """, client["id"])
    return {"cases": _rows(cases)}


@portal_router.get("/migration/cases/{case_id}")
async def get_migration_case(case_id: str, request: Request):
    """Detaliile unui dosar de migrație (istoricul etapelor inclus)."""
    user = await _require_role(request, "migration_client", "candidate")
    async with get_pg_connection() as conn:
        client = await conn.fetchrow(
            "SELECT id FROM migration_clients WHERE user_id=$1", uuid.UUID(user["id"])
        )
        if not client:
            raise HTTPException(status_code=404, detail="Nu ai dosare de migrație.")

        case = await conn.fetchrow("""
            SELECT id, service_type, status, result, urgency,
                   documents_requested, estimated_cost, payment_status,
                   final_answer, answer_received_at, next_deadline,
                   created_at, updated_at
            FROM migration_cases WHERE id=$1 AND client_id=$2
        """, uuid.UUID(case_id), client["id"])

        if not case:
            raise HTTPException(status_code=404, detail="Dosar negăsit.")

        history = await conn.fetch("""
            SELECT new_status, notes, changed_at
            FROM migration_case_history WHERE case_id=$1
            ORDER BY changed_at ASC
        """, uuid.UUID(case_id))

    return {"case": _row(case), "history": _rows(history)}


# ══════════════════════════════════════════════════════════════════════════════
# OCR — extragere date din documente (existent, păstrat)
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.post("/ocr/id-card")
async def ocr_id_card(request: Request, file: UploadFile = File(...)):
    """Extrage datele dintr-un act de identitate prin OCR."""
    await get_current_user(request)
    try:
        from document_ocr_service import extract_id_card_data
        content = await file.read()
        result = await extract_id_card_data(content, file.content_type)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error("OCR id-card error: %s", e)
        raise HTTPException(status_code=500, detail="OCR eșuat.")


@portal_router.post("/ocr/passport")
async def ocr_passport(request: Request, file: UploadFile = File(...)):
    """Extrage datele dintr-un pașaport prin OCR (MRZ)."""
    await get_current_user(request)
    try:
        from document_ocr_service import extract_id_card_data
        content = await file.read()
        result = await extract_id_card_data(content, file.content_type)
        return {"success": True, "data": result}
    except Exception as e:
        logger.error("OCR passport error: %s", e)
        raise HTTPException(status_code=500, detail="OCR eșuat.")


# ══════════════════════════════════════════════════════════════════════════════
# CANDIDATE DOCUMENTS — rute specifice (compatibilitate frontend existent)
# ══════════════════════════════════════════════════════════════════════════════

@portal_router.get("/candidate/documents/check-existing")
async def check_existing_candidate_document(request: Request, document_type: str):
    user = await _require_role(request, "candidate", "admin")
    try:
        async with get_pg_connection() as conn:
            row = await conn.fetchrow(
                "SELECT id, document_type, original_filename, status, created_at FROM documents WHERE user_id=$1 AND document_type=$2 AND is_archived=FALSE ORDER BY created_at DESC LIMIT 1",
                uuid.UUID(user["id"]), document_type
            )
        if row:
            return {"exists": True, "document": {"id": str(row["id"]), "document_type": row["document_type"], "original_filename": row["original_filename"], "status": row["status"], "created_at": row["created_at"].isoformat() if row["created_at"] else None}}
        return {"exists": False, "document": None}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("check-existing error: %s", e)
        return {"exists": False, "document": None}


@portal_router.post("/candidate/documents/upload-session")
async def candidate_upload_session(request: Request):
    user = await _require_role(request, "candidate", "admin")
    body = await request.json()
    document_type = body.get("document_type", "other")
    filename = body.get("filename", "document")
    content_type = body.get("content_type", "application/pdf")

    if content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Tip de fișier neacceptat.")

    try:
        from direct_upload_storage import create_candidate_signed_upload, build_candidate_object_path
        object_path = build_candidate_object_path(user["id"], document_type, filename)
        signed = create_candidate_signed_upload(object_path)
        return {
            "exists": False,
            "upload_url": signed["upload_url"],
            "storage_path": signed["storage_path"],
            "token": signed.get("token"),
            "bucket": signed.get("bucket"),
            "upload_method": "PUT",
            "content_type": content_type,
            "max_bytes": MAX_FILE_SIZE,
        }
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        logger.error("candidate upload-session error: %s", e)
        raise HTTPException(status_code=500, detail="Nu s-a putut crea sesiunea de upload.")


@portal_router.post("/candidate/documents/register")
async def candidate_register_document(request: Request):
    user = await _require_role(request, "candidate", "admin")
    body = await request.json()

    document_type = body.get("document_type", "other")
    storage_path = body.get("storage_path", "")
    original_filename = body.get("original_filename", "document")
    file_size = body.get("file_size", 0)
    file_type = body.get("file_type", "application/pdf")
    replace_existing = body.get("replace_existing", False)
    document_number = body.get("document_number")
    issue_date = body.get("issue_date")
    expiry_date = body.get("expiry_date")

    if not storage_path:
        raise HTTPException(status_code=400, detail="storage_path lipsește")

    try:
        doc_id = uuid.uuid4()
        user_uuid = uuid.UUID(user["id"])

        issue_date_val = date.fromisoformat(issue_date) if issue_date else None
        expiry_date_val = date.fromisoformat(expiry_date) if expiry_date else None

        async with get_pg_connection() as conn:
            if replace_existing:
                await conn.execute(
                    "UPDATE documents SET is_archived=TRUE, updated_at=NOW() WHERE user_id=$1 AND document_type=$2 AND is_archived=FALSE",
                    user_uuid, document_type
                )
            await conn.execute(
                """INSERT INTO documents (id, user_id, document_type, original_filename, file_type, file_size, storage_path, document_number, issue_date, expiry_date, status, owner_role)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending','candidate')""",
                doc_id, user_uuid, document_type, original_filename, file_type, file_size,
                storage_path, document_number, issue_date_val, expiry_date_val
            )
        return {"success": True, "doc_id": str(doc_id), "status": "pending"}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("candidate register error: %s", e)
        raise HTTPException(status_code=500, detail="Nu s-a putut salva documentul.")


@portal_router.get("/candidate/documents")
async def get_candidate_documents(request: Request):
    user = await _require_role(request, "candidate", "admin")
    try:
        async with get_pg_connection() as conn:
            rows = await conn.fetch(
                "SELECT * FROM documents WHERE user_id=$1 AND owner_role='candidate' AND is_archived=FALSE ORDER BY created_at DESC",
                uuid.UUID(user["id"])
            )
        documents = []
        for r in rows:
            documents.append({
                "id": str(r["id"]),
                "document_type": r["document_type"],
                "original_filename": r["original_filename"],
                "file_type": r.get("file_type"),
                "file_size": r.get("file_size", 0),
                "storage_path": r.get("storage_path"),
                "document_number": r.get("document_number"),
                "issue_date": str(r["issue_date"]) if r.get("issue_date") else None,
                "expiry_date": str(r["expiry_date"]) if r.get("expiry_date") else None,
                "status": r["status"],
                "is_archived": r.get("is_archived", False),
                "created_at": r["created_at"].isoformat() if r.get("created_at") else None,
                "updated_at": r["updated_at"].isoformat() if r.get("updated_at") else None,
            })
        required_types = ["passport", "cv"]
        uploaded_types = {d["document_type"] for d in documents}
        required_missing = [t for t in required_types if t not in uploaded_types]
        return {"documents": documents, "required_missing": required_missing}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("get candidate documents error: %s", e)
        return {"documents": [], "required_missing": ["passport", "cv"]}


@portal_router.delete("/candidate/documents/{doc_id}")
async def delete_candidate_document(doc_id: str, request: Request):
    user = await _require_role(request, "candidate", "admin")
    try:
        doc_uuid = uuid.UUID(doc_id)
        user_uuid = uuid.UUID(user["id"])
        async with get_pg_connection() as conn:
            row = await conn.fetchrow(
                "SELECT id, user_id FROM documents WHERE id=$1 AND is_archived=FALSE", doc_uuid
            )
            if not row:
                raise HTTPException(status_code=404, detail="Document negăsit.")
            if str(row["user_id"]) != user["id"] and user.get("role") != "admin":
                raise HTTPException(status_code=403, detail="Nu este documentul tău.")
            await conn.execute(
                "UPDATE documents SET is_archived=TRUE, updated_at=NOW() WHERE id=$1", doc_uuid
            )
        return {"success": True, "message": "Document șters."}
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("delete candidate document error: %s", e)
        raise HTTPException(status_code=500, detail="Nu s-a putut șterge documentul.")
