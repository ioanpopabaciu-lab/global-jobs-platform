"""
Admin routes — GJC Platform v3.0
Gestionare completă: angajatori, candidați, agenții, joburi, plasamente,
dosare migrație, documente, notificări, statistici dashboard.
"""
from fastapi import APIRouter, HTTPException, Request, Query
from datetime import datetime, timezone
from typing import Optional
import uuid

from auth_routes import get_current_user
from database.db_config import execute_pg_one, execute_pg_write, get_pg_connection

admin_router = APIRouter(prefix="/admin", tags=["Admin"])


# ── helper: verifică rol admin ────────────────────────────────────────────────

async def require_admin(request: Request) -> dict:
    user = await get_current_user(request)
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Acces restricționat — doar admin.")
    return user


def _row(r) -> dict | None:
    return dict(r) if r else None


def _rows(rs) -> list[dict]:
    return [dict(r) for r in rs]


# ══════════════════════════════════════════════════════════════════════════════
# DASHBOARD
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/dashboard")
async def get_admin_dashboard(request: Request):
    """Statistici rapide pentru dashboard-ul adminului."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        stats = await conn.fetchrow("SELECT * FROM v_admin_stats")
        # Ultimele 10 acțiuni din audit_log
        activity = await conn.fetch("""
            SELECT al.action, al.entity_type, al.entity_id,
                   al.created_at, u.name AS actor_name
            FROM audit_log al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 10
        """)
        # Documente care expiră în 30 zile
        expiring_soon = await conn.fetch("""
            SELECT owner_name, owner_type, document_type,
                   expiry_date, days_until_expiry
            FROM v_expiring_documents
            WHERE days_until_expiry <= 30
            LIMIT 20
        """)
    return {
        "stats": _row(stats),
        "recent_activity": _rows(activity),
        "expiring_soon": _rows(expiring_soon),
    }


# ══════════════════════════════════════════════════════════════════════════════
# CANDIDAȚI
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/candidates")
async def list_candidates(
    request: Request,
    status: Optional[str] = None,
    candidate_type: Optional[str] = None,
    nationality: Optional[str] = None,
    agency_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor candidaților cu filtre."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"c.status = ${i}")
        params.append(status); i += 1
    if candidate_type:
        conditions.append(f"c.candidate_type = ${i}")
        params.append(candidate_type); i += 1
    if nationality:
        conditions.append(f"c.nationality ILIKE ${i}")
        params.append(f"%{nationality}%"); i += 1
    if agency_id:
        conditions.append(f"c.agency_id = ${i}")
        params.append(uuid.UUID(agency_id)); i += 1
    if search:
        conditions.append(
            f"(c.first_name ILIKE ${i} OR c.last_name ILIKE ${i} "
            f"OR c.email ILIKE ${i} OR c.target_position_name ILIKE ${i})"
        )
        params.append(f"%{search}%"); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM candidates c WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT c.id, c.candidate_type, c.first_name, c.last_name,
                   c.origin_country, c.nationality, c.residence_country,
                   c.target_cor_code, c.target_position_name,
                   c.qualification_level, c.education_level,
                   c.status, c.submitted_at, c.validated_at,
                   c.profile_completion_pct, c.created_at,
                   c.work_permit_expiry,
                   -- Avertisment < 1 an la angajator
                   CASE
                       WHEN c.candidate_type = 'type2_romania_fulltime'
                            AND c.current_employer_start_date IS NOT NULL
                            AND (CURRENT_DATE - c.current_employer_start_date) < 365
                            AND c.departure_reason = 'resignation'
                       THEN TRUE ELSE FALSE
                   END AS has_under_1year_warning,
                   ag.agency_name,
                   (SELECT COUNT(*) FROM documents d
                    WHERE d.owner_type = 'candidate' AND d.owner_id = c.id) AS docs_count,
                   (SELECT COUNT(*) FROM documents d
                    WHERE d.owner_type = 'candidate' AND d.owner_id = c.id
                      AND d.status = 'verified') AS docs_verified
            FROM candidates c
            LEFT JOIN agencies ag ON c.agency_id = ag.id
            WHERE {where}
            ORDER BY c.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"candidates": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.get("/candidates/{candidate_id}")
async def get_candidate_detail(candidate_id: str, request: Request):
    """Detalii complete candidat — admin vede tot."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        candidate = await conn.fetchrow(
            "SELECT * FROM candidates WHERE id = $1", uuid.UUID(candidate_id)
        )
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidat negăsit.")
        docs = await conn.fetch(
            "SELECT * FROM documents WHERE owner_type='candidate' AND owner_id=$1 ORDER BY created_at DESC",
            uuid.UUID(candidate_id)
        )
        placements = await conn.fetch("""
            SELECT p.id, p.placement_type, p.current_stage_a, p.current_stage_b,
                   p.visibility_stage, p.match_score, p.created_at,
                   e.company_name, jr.position_title
            FROM placements p
            JOIN employers e ON p.employer_id = e.id
            JOIN job_requests jr ON p.job_request_id = jr.id
            WHERE p.candidate_id = $1
            ORDER BY p.created_at DESC
        """, uuid.UUID(candidate_id))
        agency = None
        if candidate["agency_id"]:
            agency = await conn.fetchrow(
                "SELECT id, agency_name, country, contact_person_name FROM agencies WHERE id=$1",
                candidate["agency_id"]
            )

    c = dict(candidate)
    # Calculează avertisment < 1 an
    if (c.get("candidate_type") == "type2_romania_fulltime"
            and c.get("current_employer_start_date")
            and c.get("departure_reason") == "resignation"):
        from datetime import date
        days = (date.today() - c["current_employer_start_date"]).days
        c["under_1year_warning"] = days < 365
        c["days_with_current_employer"] = days

    return {
        "candidate": c,
        "documents": _rows(docs),
        "placements": _rows(placements),
        "agency": _row(agency),
    }


@admin_router.put("/candidates/{candidate_id}/validate")
async def validate_candidate(
    candidate_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
):
    """Aprobă sau respinge profilul unui candidat."""
    admin = await require_admin(request)
    if status not in ("validated", "rejected", "suspended"):
        raise HTTPException(status_code=400, detail="Status invalid. Folosește: validated/rejected/suspended")

    async with get_pg_connection() as conn:
        candidate = await conn.fetchrow(
            "SELECT id, user_id, first_name, last_name, status FROM candidates WHERE id=$1",
            uuid.UUID(candidate_id)
        )
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidat negăsit.")

        await conn.execute("""
            UPDATE candidates
            SET status=$1, rejection_reason=$2,
                validated_by=$3, validated_at=NOW(), updated_at=NOW()
            WHERE id=$4
        """, status, notes, uuid.UUID(admin["id"]), uuid.UUID(candidate_id))

        # Audit log
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, $2, 'candidate', $3, $4, $5)
        """, uuid.UUID(admin["id"]),
            f"candidate_{status}",
            uuid.UUID(candidate_id),
            {"status": candidate["status"]},
            {"status": status, "notes": notes}
        )

        # Notificare utilizator (dacă are cont)
        if candidate["user_id"]:
            title = "Profil aprobat ✓" if status == "validated" else "Profil respins"
            message = (
                "Profilul tău a fost aprobat. Poți fi acum asociat cu oferte de muncă."
                if status == "validated"
                else f"Profilul tău a fost respins. Motiv: {notes or 'Vezi detalii în cont.'}"
            )
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, $2, 'profile', $3, $4, 'candidate', $5)
            """, candidate["user_id"],
                "success" if status == "validated" else "error",
                title, message, uuid.UUID(candidate_id)
            )

    return {"success": True, "candidate_id": candidate_id, "new_status": status}


# ══════════════════════════════════════════════════════════════════════════════
# ANGAJATORI
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/employers")
async def list_employers(
    request: Request,
    status: Optional[str] = None,
    category: Optional[str] = None,
    county: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor angajatorilor cu filtre."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"e.status = ${i}")
        params.append(status); i += 1
    if category:
        conditions.append(f"e.category = ${i}")
        params.append(category); i += 1
    if county:
        conditions.append(f"e.county ILIKE ${i}")
        params.append(f"%{county}%"); i += 1
    if search:
        conditions.append(
            f"(e.company_name ILIKE ${i} OR e.cui ILIKE ${i} OR e.city ILIKE ${i})"
        )
        params.append(f"%{search}%"); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM employers e WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT e.id, e.company_name, e.cui, e.legal_form, e.category,
                   e.city, e.county, e.country, e.activity_domain,
                   e.total_employees, e.has_non_eu_workers,
                   e.status, e.submitted_at, e.validated_at, e.created_at,
                   e.igi_no_debts, e.igi_no_sanctions,
                   e.igi_min_2_employees, e.igi_over_1_year,
                   (SELECT COUNT(*) FROM job_requests jr WHERE jr.employer_id=e.id) AS jobs_count,
                   (SELECT COUNT(*) FROM placements p WHERE p.employer_id=e.id
                    AND p.completed_at IS NULL AND p.cancelled_at IS NULL) AS active_placements
            FROM employers e
            WHERE {where}
            ORDER BY e.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"employers": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.get("/employers/{employer_id}")
async def get_employer_detail(employer_id: str, request: Request):
    """Detalii complete angajator."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        employer = await conn.fetchrow(
            "SELECT * FROM employers WHERE id=$1", uuid.UUID(employer_id)
        )
        if not employer:
            raise HTTPException(status_code=404, detail="Angajator negăsit.")
        docs = await conn.fetch(
            "SELECT * FROM documents WHERE owner_type='employer' AND owner_id=$1 ORDER BY created_at DESC",
            uuid.UUID(employer_id)
        )
        jobs = await conn.fetch("""
            SELECT id, position_title, cor_code, category, positions_count,
                   positions_filled, status, created_at
            FROM job_requests WHERE employer_id=$1 ORDER BY created_at DESC
        """, uuid.UUID(employer_id))

    return {
        "employer": _row(employer),
        "documents": _rows(docs),
        "jobs": _rows(jobs),
    }


@admin_router.put("/employers/{employer_id}/validate")
async def validate_employer(
    employer_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
):
    """Aprobă sau respinge profilul unui angajator."""
    admin = await require_admin(request)
    if status not in ("validated", "rejected", "suspended"):
        raise HTTPException(status_code=400, detail="Status invalid.")

    async with get_pg_connection() as conn:
        employer = await conn.fetchrow(
            "SELECT id, user_id, company_name, status FROM employers WHERE id=$1",
            uuid.UUID(employer_id)
        )
        if not employer:
            raise HTTPException(status_code=404, detail="Angajator negăsit.")

        await conn.execute("""
            UPDATE employers
            SET status=$1, rejection_reason=$2,
                validated_by=$3, validated_at=NOW(), updated_at=NOW()
            WHERE id=$4
        """, status, notes, uuid.UUID(admin["id"]), uuid.UUID(employer_id))

        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, $2, 'employer', $3, $4, $5)
        """, uuid.UUID(admin["id"]),
            f"employer_{status}",
            uuid.UUID(employer_id),
            {"status": employer["status"]},
            {"status": status, "notes": notes}
        )

        if employer["user_id"]:
            title = "Companie aprobată ✓" if status == "validated" else "Profil companie respins"
            message = (
                "Contul companiei a fost aprobat. Puteți posta cereri de recrutare."
                if status == "validated"
                else f"Profilul companiei a fost respins. Motiv: {notes or 'Contactați GJC.'}"
            )
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, $2, 'profile', $3, $4, 'employer', $5)
            """, employer["user_id"],
                "success" if status == "validated" else "error",
                title, message, uuid.UUID(employer_id)
            )

    return {"success": True, "employer_id": employer_id, "new_status": status}


@admin_router.put("/employers/{employer_id}/igi")
async def update_igi_eligibility(
    employer_id: str,
    request: Request,
    no_debts: Optional[bool] = None,
    no_sanctions: Optional[bool] = None,
    min_2_employees: Optional[bool] = None,
    over_1_year: Optional[bool] = None,
):
    """Actualizează eligibilitatea IGI pentru un angajator Cat. A."""
    admin = await require_admin(request)
    updates = []
    params: list = []
    i = 1

    if no_debts is not None:
        updates.append(f"igi_no_debts=${i}"); params.append(no_debts); i += 1
    if no_sanctions is not None:
        updates.append(f"igi_no_sanctions=${i}"); params.append(no_sanctions); i += 1
    if min_2_employees is not None:
        updates.append(f"igi_min_2_employees=${i}"); params.append(min_2_employees); i += 1
    if over_1_year is not None:
        updates.append(f"igi_over_1_year=${i}"); params.append(over_1_year); i += 1

    if not updates:
        raise HTTPException(status_code=400, detail="Niciun câmp de actualizat.")

    updates.append(f"igi_verified_by=${i}"); params.append(uuid.UUID(admin["id"])); i += 1
    updates.append(f"igi_verified_at=NOW()")
    updates.append(f"updated_at=NOW()")
    params.append(uuid.UUID(employer_id))

    async with get_pg_connection() as conn:
        await conn.execute(
            f"UPDATE employers SET {', '.join(updates)} WHERE id=${i}",
            *params
        )
    return {"success": True, "employer_id": employer_id}


# ══════════════════════════════════════════════════════════════════════════════
# AGENȚII PARTENERE
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/agencies")
async def list_agencies(
    request: Request,
    status: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor agențiilor partenere."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"a.status = ${i}")
        params.append(status); i += 1
    if country:
        conditions.append(f"a.country ILIKE ${i}")
        params.append(f"%{country}%"); i += 1
    if search:
        conditions.append(
            f"(a.agency_name ILIKE ${i} OR a.contact_person_name ILIKE ${i})"
        )
        params.append(f"%{search}%"); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM agencies a WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT a.id, a.agency_name, a.agency_type, a.country, a.city,
                   a.contact_person_name, a.commission_rate,
                   a.license_number, a.license_expiry,
                   a.status, a.validated_at, a.created_at,
                   a.total_candidates_uploaded, a.total_placements, a.success_rate
            FROM agencies a
            WHERE {where}
            ORDER BY a.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"agencies": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.get("/agencies/{agency_id}")
async def get_agency_detail(agency_id: str, request: Request):
    """Detalii complete agenție + candidații ei."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        agency = await conn.fetchrow(
            "SELECT * FROM agencies WHERE id=$1", uuid.UUID(agency_id)
        )
        if not agency:
            raise HTTPException(status_code=404, detail="Agenție negăsită.")
        candidates = await conn.fetch("""
            SELECT id, first_name, last_name, candidate_type, origin_country,
                   target_position_name, status, created_at
            FROM candidates WHERE agency_id=$1 ORDER BY created_at DESC LIMIT 100
        """, uuid.UUID(agency_id))
        docs = await conn.fetch(
            "SELECT * FROM documents WHERE owner_type='agency' AND owner_id=$1",
            uuid.UUID(agency_id)
        )

    return {
        "agency": _row(agency),
        "candidates": _rows(candidates),
        "documents": _rows(docs),
    }


@admin_router.put("/agencies/{agency_id}/validate")
async def validate_agency(
    agency_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
):
    """Aprobă sau respinge o agenție parteneră."""
    admin = await require_admin(request)
    if status not in ("validated", "rejected", "suspended"):
        raise HTTPException(status_code=400, detail="Status invalid.")

    async with get_pg_connection() as conn:
        agency = await conn.fetchrow(
            "SELECT id, user_id, agency_name, status FROM agencies WHERE id=$1",
            uuid.UUID(agency_id)
        )
        if not agency:
            raise HTTPException(status_code=404, detail="Agenție negăsită.")

        await conn.execute("""
            UPDATE agencies
            SET status=$1, rejection_reason=$2,
                validated_by=$3, validated_at=NOW(), updated_at=NOW()
            WHERE id=$4
        """, status, notes, uuid.UUID(admin["id"]), uuid.UUID(agency_id))

        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, $2, 'agency', $3, $4, $5)
        """, uuid.UUID(admin["id"]),
            f"agency_{status}",
            uuid.UUID(agency_id),
            {"status": agency["status"]},
            {"status": status, "notes": notes}
        )

        if agency["user_id"]:
            title = "Agenție aprobată ✓" if status == "validated" else "Agenție respinsă"
            message = (
                "Contul agenției a fost aprobat. Puteți încărca candidați."
                if status == "validated"
                else f"Contul agenției a fost respins. Motiv: {notes or 'Contactați GJC.'}"
            )
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, $2, 'profile', $3, $4, 'agency', $5)
            """, agency["user_id"],
                "success" if status == "validated" else "error",
                title, message, uuid.UUID(agency_id)
            )

    return {"success": True, "agency_id": agency_id, "new_status": status}


# ══════════════════════════════════════════════════════════════════════════════
# JOBURI (CERERI DE RECRUTARE)
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/jobs")
async def list_jobs(
    request: Request,
    status: Optional[str] = None,
    category: Optional[str] = None,
    employer_id: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor cererilor de recrutare."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"jr.status = ${i}")
        params.append(status); i += 1
    if category:
        conditions.append(f"jr.category = ${i}")
        params.append(category); i += 1
    if employer_id:
        conditions.append(f"jr.employer_id = ${i}")
        params.append(uuid.UUID(employer_id)); i += 1
    if search:
        conditions.append(
            f"(jr.position_title ILIKE ${i} OR jr.cor_code ILIKE ${i} OR e.company_name ILIKE ${i})"
        )
        params.append(f"%{search}%"); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM job_requests jr JOIN employers e ON jr.employer_id=e.id WHERE {where}",
            *params
        )
        rows = await conn.fetch(f"""
            SELECT jr.id, jr.position_title, jr.cor_code, jr.category,
                   jr.positions_count, jr.positions_filled, jr.status,
                   jr.salary_gross, jr.salary_currency,
                   jr.contract_type, jr.created_at, jr.published_at,
                   e.id AS employer_id, e.company_name, e.city, e.county,
                   (SELECT COUNT(*) FROM placements p WHERE p.job_request_id=jr.id) AS placements_count
            FROM job_requests jr
            JOIN employers e ON jr.employer_id = e.id
            WHERE {where}
            ORDER BY jr.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"jobs": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.get("/jobs/{job_id}")
async def get_job_detail(job_id: str, request: Request):
    """Detalii complete cerere de recrutare."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        job = await conn.fetchrow("""
            SELECT jr.*, e.company_name, e.city, e.county, e.category AS employer_category
            FROM job_requests jr
            JOIN employers e ON jr.employer_id = e.id
            WHERE jr.id = $1
        """, uuid.UUID(job_id))
        if not job:
            raise HTTPException(status_code=404, detail="Cerere de recrutare negăsită.")
        placements = await conn.fetch("""
            SELECT p.id, p.placement_type, p.current_stage_a, p.current_stage_b,
                   p.visibility_stage, p.match_score, p.match_type, p.created_at,
                   c.first_name, c.last_name, c.origin_country, c.candidate_type
            FROM placements p
            JOIN candidates c ON p.candidate_id = c.id
            WHERE p.job_request_id = $1
            ORDER BY p.match_score DESC NULLS LAST
        """, uuid.UUID(job_id))

    return {"job": _row(job), "placements": _rows(placements)}


@admin_router.put("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
):
    """Actualizează statusul unei cereri de recrutare."""
    admin = await require_admin(request)
    valid = ("draft", "open", "in_progress", "filled", "cancelled", "paused")
    if status not in valid:
        raise HTTPException(status_code=400, detail=f"Status invalid. Valori: {valid}")

    async with get_pg_connection() as conn:
        job = await conn.fetchrow(
            "SELECT id, status FROM job_requests WHERE id=$1", uuid.UUID(job_id)
        )
        if not job:
            raise HTTPException(status_code=404, detail="Job negăsit.")

        extra = ""
        if status == "open":
            extra = ", published_at=NOW()"
        elif status == "filled":
            extra = ", closed_at=NOW()"

        await conn.execute(
            f"UPDATE job_requests SET status=$1, admin_notes=$2, updated_at=NOW(){extra} WHERE id=$3",
            status, notes, uuid.UUID(job_id)
        )
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, 'job_status_changed', 'job_request', $2, $3, $4)
        """, uuid.UUID(admin["id"]), uuid.UUID(job_id),
            {"status": job["status"]}, {"status": status, "notes": notes}
        )

    return {"success": True, "job_id": job_id, "new_status": status}


# ══════════════════════════════════════════════════════════════════════════════
# PLASAMENTE (POTRIVIRI MANUALE ȘI GESTIONARE FLUX)
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/placements")
async def list_placements(
    request: Request,
    placement_type: Optional[str] = None,
    stage: Optional[str] = None,
    employer_id: Optional[str] = None,
    candidate_id: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor plasamentelor active."""
    await require_admin(request)

    conditions = ["p.cancelled_at IS NULL"]
    params: list = []
    i = 1

    if placement_type:
        conditions.append(f"p.placement_type = ${i}")
        params.append(placement_type); i += 1
    if employer_id:
        conditions.append(f"p.employer_id = ${i}")
        params.append(uuid.UUID(employer_id)); i += 1
    if candidate_id:
        conditions.append(f"p.candidate_id = ${i}")
        params.append(uuid.UUID(candidate_id)); i += 1
    if stage:
        conditions.append(
            f"(p.current_stage_a::TEXT = ${i} OR p.current_stage_b::TEXT = ${i})"
        )
        params.append(stage); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM placements p WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT p.id, p.placement_type, p.visibility_stage,
                   p.current_stage_a, p.current_stage_b,
                   p.match_score, p.match_type,
                   p.contract_signed, p.payment_confirmed,
                   p.created_at, p.completed_at,
                   -- Candidat (vizibilitate completă pentru admin)
                   c.id AS candidate_id,
                   c.first_name || ' ' || c.last_name AS candidate_name,
                   c.candidate_type, c.origin_country,
                   -- Angajator
                   e.id AS employer_id, e.company_name, e.city,
                   -- Job
                   jr.position_title, jr.cor_code
            FROM placements p
            JOIN candidates c ON p.candidate_id = c.id
            JOIN employers e ON p.employer_id = e.id
            JOIN job_requests jr ON p.job_request_id = jr.id
            WHERE {where}
            ORDER BY p.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"placements": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.post("/placements")
async def create_manual_placement(
    request: Request,
    candidate_id: str,
    job_request_id: str,
    match_score: int = 0,
    notes: Optional[str] = None,
):
    """Crează o potrivire manuală candidat — job (de către admin)."""
    admin = await require_admin(request)

    async with get_pg_connection() as conn:
        # Verifică candidat
        candidate = await conn.fetchrow(
            "SELECT id, candidate_type, status FROM candidates WHERE id=$1",
            uuid.UUID(candidate_id)
        )
        if not candidate:
            raise HTTPException(status_code=404, detail="Candidat negăsit.")
        if candidate["status"] != "validated":
            raise HTTPException(status_code=400, detail="Candidatul nu este validat.")

        # Verifică job
        job = await conn.fetchrow(
            "SELECT id, employer_id, category, status FROM job_requests WHERE id=$1",
            uuid.UUID(job_request_id)
        )
        if not job:
            raise HTTPException(status_code=404, detail="Job negăsit.")
        if job["status"] not in ("open", "in_progress"):
            raise HTTPException(status_code=400, detail="Job-ul nu este deschis.")

        # Verifică dacă există deja
        existing = await conn.fetchrow(
            "SELECT id FROM placements WHERE job_request_id=$1 AND candidate_id=$2",
            uuid.UUID(job_request_id), uuid.UUID(candidate_id)
        )
        if existing:
            raise HTTPException(status_code=409, detail="Potrivire deja existentă.")

        # Determină tipul fluxului
        ctype = candidate["candidate_type"]
        placement_type = "B" if ctype in ("type2_romania_fulltime", "type3_romania_parttime") else "A"
        stage_field = "current_stage_a" if placement_type == "A" else "current_stage_b"

        placement_id = await conn.fetchval(f"""
            INSERT INTO placements
                (job_request_id, candidate_id, employer_id, placement_type,
                 {stage_field}, visibility_stage, match_score, match_type,
                 matched_by, matched_at, admin_notes)
            VALUES ($1, $2, $3, $4, 'matched', 1, $5, 'manual', $6, NOW(), $7)
            RETURNING id
        """, uuid.UUID(job_request_id), uuid.UUID(candidate_id),
            job["employer_id"], placement_type,
            max(0, min(100, match_score)),
            uuid.UUID(admin["id"]), notes
        )

        # Istoricul etapei
        await conn.execute("""
            INSERT INTO placement_stage_history (placement_id, old_stage, new_stage, notes, changed_by)
            VALUES ($1, NULL, 'matched', $2, $3)
        """, placement_id, notes or "Potrivire manuală de admin", uuid.UUID(admin["id"]))

        # Actualizează job status
        await conn.execute("""
            UPDATE job_requests SET status='in_progress', updated_at=NOW() WHERE id=$1
        """, uuid.UUID(job_request_id))

        # Audit
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value)
            VALUES ($1, 'manual_match_created', 'placement', $2, $3)
        """, uuid.UUID(admin["id"]), placement_id,
            {"candidate_id": candidate_id, "job_id": job_request_id, "score": match_score}
        )

        # Notifică candidatul
        if candidate.get("user_id"):
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, 'info', 'placement',
                        'Ai fost selectat pentru o ofertă de muncă',
                        'Profilul tău a fost asociat cu o cerere de recrutare. Urmează interviul.',
                        'placement', $2)
            """, candidate["user_id"], placement_id)

    return {"success": True, "placement_id": str(placement_id)}


@admin_router.get("/placements/{placement_id}")
async def get_placement_detail(placement_id: str, request: Request):
    """Detalii complete plasament cu istoricul etapelor."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        placement = await conn.fetchrow(
            "SELECT * FROM placements WHERE id=$1", uuid.UUID(placement_id)
        )
        if not placement:
            raise HTTPException(status_code=404, detail="Plasament negăsit.")
        history = await conn.fetch("""
            SELECT psh.*, u.name AS changed_by_name
            FROM placement_stage_history psh
            LEFT JOIN users u ON psh.changed_by = u.id
            WHERE psh.placement_id = $1
            ORDER BY psh.changed_at ASC
        """, uuid.UUID(placement_id))
        candidate = await conn.fetchrow(
            "SELECT * FROM candidates WHERE id=$1", placement["candidate_id"]
        )
        job = await conn.fetchrow(
            "SELECT jr.*, e.company_name, e.city, e.county FROM job_requests jr "
            "JOIN employers e ON jr.employer_id=e.id WHERE jr.id=$1",
            placement["job_request_id"]
        )

    return {
        "placement": _row(placement),
        "candidate": _row(candidate),
        "job": _row(job),
        "stage_history": _rows(history),
    }


@admin_router.put("/placements/{placement_id}/stage")
async def update_placement_stage(
    placement_id: str,
    request: Request,
    new_stage: str,
    stage_date: Optional[str] = None,
    notes: Optional[str] = None,
):
    """Avansează etapa unui plasament (flux A sau B) și înregistrează data evenimentului."""
    admin = await require_admin(request)

    # Etape valide per flux
    stages_a = [
        "registered", "profile_validated", "matched", "stage1_visible",
        "interview_scheduled", "selected", "stage2_visible",
        "igi_submitted", "igi_approved", "visa_submitted", "visa_approved",
        "flight_scheduled", "arrived", "employed", "completed", "cancelled"
    ]
    stages_b = [
        "registered", "profile_validated", "matched", "stage1_visible",
        "interview_scheduled", "selected", "stage2_visible",
        "start_date_set", "employed", "completed", "cancelled"
    ]

    async with get_pg_connection() as conn:
        placement = await conn.fetchrow(
            "SELECT id, placement_type, current_stage_a, current_stage_b, "
            "candidate_id, employer_id FROM placements WHERE id=$1",
            uuid.UUID(placement_id)
        )
        if not placement:
            raise HTTPException(status_code=404, detail="Plasament negăsit.")

        ptype = placement["placement_type"]
        valid_stages = stages_a if ptype == "A" else stages_b
        if new_stage not in valid_stages:
            raise HTTPException(
                status_code=400,
                detail=f"Etapă invalidă pentru flux {ptype}. Valori: {valid_stages}"
            )

        old_stage = placement["current_stage_a"] if ptype == "A" else placement["current_stage_b"]
        stage_field = "current_stage_a" if ptype == "A" else "current_stage_b"

        # Câmpuri specifice per etapă (flux A)
        extra_update = ""
        parsed_date = None
        if stage_date:
            try:
                from datetime import date
                parsed_date = date.fromisoformat(stage_date)
            except ValueError:
                raise HTTPException(status_code=400, detail="Format dată invalid (YYYY-MM-DD).")

        stage_date_fields = {
            "interview_scheduled": "interview_scheduled_at",
            "igi_submitted":       "igi_submitted_at",
            "igi_approved":        "igi_approved_at",
            "visa_submitted":      "visa_submitted_at",
            "visa_approved":       "visa_approved_at",
            "flight_scheduled":    "flight_date",
            "arrived":             "arrived_at",
            "employed":            "employment_start_date" if ptype == "A" else None,
            "start_date_set":      "new_job_start_date",
            "interview_scheduled_b": "interview_date",
            "selected":            "selection_date" if ptype == "B" else "selection_confirmed_at",
        }

        date_field = stage_date_fields.get(new_stage)
        if parsed_date and date_field:
            extra_update = f", {date_field}=$5"

        # Vizibilitate automată
        visibility_update = ""
        if new_stage == "stage1_visible":
            visibility_update = ", visibility_stage=1"
        elif new_stage == "stage2_visible":
            visibility_update = ", visibility_stage=2"

        # Finalizare automată
        complete_update = ""
        if new_stage == "completed":
            complete_update = ", completed_at=NOW()"
        elif new_stage == "cancelled":
            complete_update = ", cancelled_at=NOW()"

        if extra_update and parsed_date:
            await conn.execute(
                f"UPDATE placements SET {stage_field}=$1, updated_at=NOW()"
                f"{visibility_update}{complete_update}{extra_update} WHERE id=$2",
                new_stage, uuid.UUID(placement_id), parsed_date
            )
            # Reconstruim fără extra_update pentru simplitate
        else:
            await conn.execute(
                f"UPDATE placements SET {stage_field}=$1, updated_at=NOW()"
                f"{visibility_update}{complete_update} WHERE id=$2",
                new_stage, uuid.UUID(placement_id)
            )

        # Istoricul etapei
        await conn.execute("""
            INSERT INTO placement_stage_history
                (placement_id, old_stage, new_stage, notes, stage_date, changed_by)
            VALUES ($1, $2, $3, $4, $5, $6)
        """, uuid.UUID(placement_id), str(old_stage) if old_stage else None,
            new_stage, notes, parsed_date, uuid.UUID(admin["id"])
        )

        # Audit
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, 'placement_stage_changed', 'placement', $2, $3, $4)
        """, uuid.UUID(admin["id"]), uuid.UUID(placement_id),
            {"stage": str(old_stage)}, {"stage": new_stage, "date": stage_date, "notes": notes}
        )

        # Notifică candidatul la etape importante
        notify_stages = {
            "stage1_visible": "Ai fost selectat pentru un interviu",
            "stage2_visible": "Felicitări! Ai fost selectat",
            "igi_submitted":  "Dosarul tău de aviz de muncă a fost depus",
            "igi_approved":   "Avizul de muncă a fost aprobat! ✓",
            "visa_approved":  "Viza ta a fost aprobată! ✓",
            "flight_scheduled": "Zborul tău a fost programat",
            "employed":       "Felicitări! Ești acum angajat",
            "start_date_set": "Data de începere a noului job a fost confirmată",
        }
        if new_stage in notify_stages:
            cand = await conn.fetchrow(
                "SELECT user_id FROM candidates WHERE id=$1", placement["candidate_id"]
            )
            if cand and cand["user_id"]:
                await conn.execute("""
                    INSERT INTO notifications
                        (user_id, type, category, title, message, entity_type, entity_id)
                    VALUES ($1, 'info', 'placement', $2, $3, 'placement', $4)
                """, cand["user_id"],
                    notify_stages[new_stage],
                    f"Etapă actualizată: {new_stage.replace('_', ' ').title()}",
                    uuid.UUID(placement_id)
                )

    return {"success": True, "placement_id": placement_id, "new_stage": new_stage}


# ══════════════════════════════════════════════════════════════════════════════
# DOCUMENTE
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/documents")
async def list_documents(
    request: Request,
    status: Optional[str] = None,
    owner_type: Optional[str] = None,
    document_type: Optional[str] = None,
    expiring_days: Optional[int] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista documentelor cu filtre."""
    await require_admin(request)

    if expiring_days:
        # Folosim view-ul dedicat
        async with get_pg_connection() as conn:
            rows = await conn.fetch(
                "SELECT * FROM v_expiring_documents WHERE days_until_expiry <= $1 LIMIT $2 OFFSET $3",
                expiring_days, limit, skip
            )
        return {"documents": _rows(rows)}

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"d.status = ${i}")
        params.append(status); i += 1
    if owner_type:
        conditions.append(f"d.owner_type = ${i}")
        params.append(owner_type); i += 1
    if document_type:
        conditions.append(f"d.document_type = ${i}")
        params.append(document_type); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM documents d WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT d.*,
                CASE
                    WHEN d.owner_type='candidate' THEN
                        (SELECT c.first_name||' '||c.last_name FROM candidates c WHERE c.id=d.owner_id)
                    WHEN d.owner_type='employer' THEN
                        (SELECT e.company_name FROM employers e WHERE e.id=d.owner_id)
                    WHEN d.owner_type='agency' THEN
                        (SELECT a.agency_name FROM agencies a WHERE a.id=d.owner_id)
                    ELSE NULL
                END AS owner_name
            FROM documents d
            WHERE {where}
            ORDER BY d.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"documents": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.put("/documents/{document_id}/verify")
async def verify_document(
    document_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
):
    """Marchează un document ca verificat sau respins."""
    admin = await require_admin(request)
    if status not in ("verified", "rejected", "expired", "renewed"):
        raise HTTPException(status_code=400, detail="Status invalid.")

    async with get_pg_connection() as conn:
        doc = await conn.fetchrow(
            "SELECT id, owner_type, owner_id, document_type, status FROM documents WHERE id=$1",
            uuid.UUID(document_id)
        )
        if not doc:
            raise HTTPException(status_code=404, detail="Document negăsit.")

        await conn.execute("""
            UPDATE documents
            SET status=$1, rejection_reason=$2,
                verified_by=$3, verified_at=NOW(),
                verification_notes=$4, updated_at=NOW()
            WHERE id=$5
        """, status, notes if status == "rejected" else None,
            uuid.UUID(admin["id"]), notes, uuid.UUID(document_id)
        )

        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, 'document_verified', 'document', $2, $3, $4)
        """, uuid.UUID(admin["id"]), uuid.UUID(document_id),
            {"status": doc["status"]}, {"status": status, "notes": notes}
        )

        # Notifică proprietarul
        owner_user_id = None
        if doc["owner_type"] == "candidate":
            row = await conn.fetchrow("SELECT user_id FROM candidates WHERE id=$1", doc["owner_id"])
            if row:
                owner_user_id = row["user_id"]
        elif doc["owner_type"] == "employer":
            row = await conn.fetchrow("SELECT user_id FROM employers WHERE id=$1", doc["owner_id"])
            if row:
                owner_user_id = row["user_id"]
        elif doc["owner_type"] == "agency":
            row = await conn.fetchrow("SELECT user_id FROM agencies WHERE id=$1", doc["owner_id"])
            if row:
                owner_user_id = row["user_id"]

        if owner_user_id:
            title = "Document verificat ✓" if status == "verified" else "Document respins"
            message = (
                "Documentul tău a fost verificat și aprobat."
                if status == "verified"
                else f"Documentul {doc['document_type']} a fost respins. Motiv: {notes or 'Reîncarcă documentul.'}"
            )
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, $2, 'document', $3, $4, 'document', $5)
            """, owner_user_id,
                "success" if status == "verified" else "warning",
                title, message, uuid.UUID(document_id)
            )

    return {"success": True, "document_id": document_id, "new_status": status}


# ══════════════════════════════════════════════════════════════════════════════
# DOSARE MIGRAȚIE
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/migration")
async def list_migration_cases(
    request: Request,
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    assigned_to: Optional[str] = None,
    urgency: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista dosarelor de migrație."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if status:
        conditions.append(f"mc.status = ${i}")
        params.append(status); i += 1
    if service_type:
        conditions.append(f"mc.service_type = ${i}")
        params.append(service_type); i += 1
    if assigned_to:
        conditions.append(f"mc.assigned_to = ${i}")
        params.append(uuid.UUID(assigned_to)); i += 1
    if urgency:
        conditions.append(f"mc.urgency = ${i}")
        params.append(urgency); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(
            f"SELECT COUNT(*) FROM migration_cases mc WHERE {where}", *params
        )
        rows = await conn.fetch(f"""
            SELECT mc.id, mc.service_type, mc.status, mc.result,
                   mc.urgency, mc.estimated_cost, mc.payment_status,
                   mc.created_at, mc.updated_at,
                   mcl.first_name, mcl.last_name, mcl.nationality,
                   mcl.requestor_name, mcl.requestor_relationship,
                   u.name AS assigned_to_name
            FROM migration_cases mc
            JOIN migration_clients mcl ON mc.client_id = mcl.id
            LEFT JOIN users u ON mc.assigned_to = u.id
            WHERE {where}
            ORDER BY
                CASE mc.urgency WHEN 'urgent' THEN 0 ELSE 1 END,
                mc.created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"cases": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.get("/migration/{case_id}")
async def get_migration_case_detail(case_id: str, request: Request):
    """Detalii complete dosar migrație cu istoric etape."""
    await require_admin(request)
    async with get_pg_connection() as conn:
        case = await conn.fetchrow(
            "SELECT mc.*, mcl.first_name, mcl.last_name, mcl.phone, mcl.email, "
            "mcl.nationality, mcl.current_location, mcl.requestor_name, "
            "mcl.requestor_phone, mcl.requestor_email, mcl.requestor_relationship "
            "FROM migration_cases mc JOIN migration_clients mcl ON mc.client_id=mcl.id "
            "WHERE mc.id=$1",
            uuid.UUID(case_id)
        )
        if not case:
            raise HTTPException(status_code=404, detail="Dosar negăsit.")
        history = await conn.fetch("""
            SELECT mch.*, u.name AS changed_by_name
            FROM migration_case_history mch
            LEFT JOIN users u ON mch.changed_by = u.id
            WHERE mch.case_id = $1
            ORDER BY mch.changed_at ASC
        """, uuid.UUID(case_id))
        docs = await conn.fetch(
            "SELECT * FROM documents WHERE owner_type='migration_case' AND owner_id=$1",
            uuid.UUID(case_id)
        )

    return {
        "case": _row(case),
        "history": _rows(history),
        "documents": _rows(docs),
    }


@admin_router.put("/migration/{case_id}/status")
async def update_migration_case_status(
    case_id: str,
    request: Request,
    status: str,
    notes: Optional[str] = None,
    result: Optional[str] = None,
    next_deadline: Optional[str] = None,
    documents_requested: Optional[str] = None,
    estimated_cost: Optional[float] = None,
):
    """Actualizează statusul unui dosar de migrație."""
    admin = await require_admin(request)
    valid_statuses = (
        "received", "analyzing", "validated", "documents_requested",
        "documents_received", "in_progress", "resolving", "answer_received", "closed"
    )
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Status invalid. Valori: {valid_statuses}")

    async with get_pg_connection() as conn:
        case = await conn.fetchrow(
            "SELECT mc.id, mc.status, mc.client_id, mcl.user_id "
            "FROM migration_cases mc JOIN migration_clients mcl ON mc.client_id=mcl.id "
            "WHERE mc.id=$1",
            uuid.UUID(case_id)
        )
        if not case:
            raise HTTPException(status_code=404, detail="Dosar negăsit.")

        # Construim UPDATE dinamic
        sets = ["status=$1", "updated_at=NOW()"]
        params: list = [status]
        i = 2

        if notes:
            sets.append(f"admin_notes=${i}"); params.append(notes); i += 1
        if result:
            sets.append(f"result=${i}"); params.append(result); i += 1
        if next_deadline:
            from datetime import date
            sets.append(f"next_deadline=${i}")
            params.append(date.fromisoformat(next_deadline)); i += 1
        if estimated_cost is not None:
            sets.append(f"estimated_cost=${i}"); params.append(estimated_cost); i += 1
            sets.append(f"cost_communicated_at=NOW()")
        if documents_requested:
            doc_list = [d.strip() for d in documents_requested.split(",") if d.strip()]
            sets.append(f"documents_requested=${i}"); params.append(doc_list); i += 1
            sets.append(f"documents_requested_at=NOW()")
        if status == "answer_received":
            sets.append(f"final_answer=${i}"); params.append(notes or ""); i += 1
            sets.append("answer_received_at=NOW()")
        if status == "closed":
            sets.append("closed_at=NOW()")

        params.append(uuid.UUID(case_id))
        await conn.execute(
            f"UPDATE migration_cases SET {', '.join(sets)} WHERE id=${i}",
            *params
        )

        # Istoricul
        await conn.execute("""
            INSERT INTO migration_case_history (case_id, old_status, new_status, notes, changed_by)
            VALUES ($1, $2, $3, $4, $5)
        """, uuid.UUID(case_id), case["status"], status, notes, uuid.UUID(admin["id"]))

        # Audit
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, 'migration_status_changed', 'migration_case', $2, $3, $4)
        """, uuid.UUID(admin["id"]), uuid.UUID(case_id),
            {"status": case["status"]}, {"status": status}
        )

        # Notifică clientul
        notify_map = {
            "validated":            ("Dosarul tău a fost validat", "GJC va contacta în curând cu detalii."),
            "documents_requested":  ("Documente necesare", "GJC solicită documente suplimentare pentru dosarul tău."),
            "in_progress":          ("Dosarul tău este în lucru", "Documentele au fost depuse la autorități."),
            "answer_received":      ("Răspuns primit pentru dosarul tău", notes or "Contactați GJC pentru detalii."),
        }
        if case["user_id"] and status in notify_map:
            title, msg = notify_map[status]
            await conn.execute("""
                INSERT INTO notifications (user_id, type, category, title, message, entity_type, entity_id)
                VALUES ($1, 'info', 'migration', $2, $3, 'migration_case', $4)
            """, case["user_id"], title, msg, uuid.UUID(case_id))

    return {"success": True, "case_id": case_id, "new_status": status}


@admin_router.put("/migration/{case_id}/assign")
async def assign_migration_case(
    case_id: str,
    request: Request,
    operator_id: str,
):
    """Atribuie un dosar de migrație unui operator GJC."""
    admin = await require_admin(request)
    async with get_pg_connection() as conn:
        await conn.execute(
            "UPDATE migration_cases SET assigned_to=$1, updated_at=NOW() WHERE id=$2",
            uuid.UUID(operator_id), uuid.UUID(case_id)
        )
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# NOTIFICĂRI — TRIMITERE MANUALĂ
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.post("/notify")
async def send_notification(
    request: Request,
    user_id: str,
    title: str,
    message: str,
    category: str = "system",
    notification_type: str = "info",
    entity_type: Optional[str] = None,
    entity_id: Optional[str] = None,
):
    """Trimite o notificare manuală unui utilizator."""
    admin = await require_admin(request)
    async with get_pg_connection() as conn:
        user = await conn.fetchrow("SELECT id FROM users WHERE id=$1", uuid.UUID(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="Utilizator negăsit.")

        await conn.execute("""
            INSERT INTO notifications
                (user_id, type, category, title, message, entity_type, entity_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """, uuid.UUID(user_id), notification_type, category, title, message,
            entity_type, uuid.UUID(entity_id) if entity_id else None
        )
    return {"success": True}


# ══════════════════════════════════════════════════════════════════════════════
# UTILIZATORI — MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/users")
async def list_users(
    request: Request,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, le=200),
):
    """Lista tuturor utilizatorilor."""
    await require_admin(request)

    conditions = ["1=1"]
    params: list = []
    i = 1

    if role:
        conditions.append(f"role = ${i}"); params.append(role); i += 1
    if is_active is not None:
        conditions.append(f"is_active = ${i}"); params.append(is_active); i += 1
    if search:
        conditions.append(f"(name ILIKE ${i} OR email ILIKE ${i})")
        params.append(f"%{search}%"); i += 1

    where = " AND ".join(conditions)

    async with get_pg_connection() as conn:
        total = await conn.fetchval(f"SELECT COUNT(*) FROM users WHERE {where}", *params)
        rows = await conn.fetch(f"""
            SELECT id, email, name, role, is_active, is_email_verified,
                   last_login_at, created_at
            FROM users WHERE {where}
            ORDER BY created_at DESC
            LIMIT ${i} OFFSET ${i+1}
        """, *params, limit, skip)

    return {"users": _rows(rows), "total": total, "skip": skip, "limit": limit}


@admin_router.put("/users/{user_id}/status")
async def toggle_user_status(user_id: str, request: Request, is_active: bool):
    """Activează sau dezactivează un cont de utilizator."""
    admin = await require_admin(request)
    if user_id == admin["id"]:
        raise HTTPException(status_code=400, detail="Nu poți dezactiva propriul cont.")

    async with get_pg_connection() as conn:
        await conn.execute(
            "UPDATE users SET is_active=$1, updated_at=NOW() WHERE id=$2",
            is_active, uuid.UUID(user_id)
        )
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, new_value)
            VALUES ($1, $2, 'user', $3, $4)
        """, uuid.UUID(admin["id"]),
            "user_activated" if is_active else "user_deactivated",
            uuid.UUID(user_id), {"is_active": is_active}
        )
    return {"success": True, "user_id": user_id, "is_active": is_active}


@admin_router.put("/users/{user_id}/role")
async def change_user_role(user_id: str, request: Request, role: str):
    """Schimbă rolul unui utilizator."""
    admin = await require_admin(request)
    valid_roles = ("admin", "employer", "candidate", "agency", "migration_client")
    if role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Rol invalid. Valori: {valid_roles}")

    async with get_pg_connection() as conn:
        old = await conn.fetchrow("SELECT role FROM users WHERE id=$1", uuid.UUID(user_id))
        if not old:
            raise HTTPException(status_code=404, detail="Utilizator negăsit.")
        await conn.execute(
            "UPDATE users SET role=$1, updated_at=NOW() WHERE id=$2",
            role, uuid.UUID(user_id)
        )
        await conn.execute("""
            INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_value, new_value)
            VALUES ($1, 'user_role_changed', 'user', $2, $3, $4)
        """, uuid.UUID(admin["id"]), uuid.UUID(user_id),
            {"role": old["role"]}, {"role": role}
        )
    return {"success": True, "user_id": user_id, "new_role": role}


# ══════════════════════════════════════════════════════════════════════════════
# MATCHING — CANDIDAȚI POTRIVIȚI PER JOB
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/matching/{job_id}")
async def find_matching_candidates(job_id: str, request: Request):
    """
    Găsește candidații potriviți pentru un job pe baza criteriilor din cerere.
    Returnează candidații sortați după scor de compatibilitate calculat în Python.
    """
    await require_admin(request)

    async with get_pg_connection() as conn:
        job = await conn.fetchrow(
            "SELECT * FROM job_requests WHERE id=$1", uuid.UUID(job_id)
        )
        if not job:
            raise HTTPException(status_code=404, detail="Job negăsit.")

        # Filtrăm candidații validați, compatibili cu tipul jobului
        candidate_type_filter = (
            "type1_abroad" if job["category"] == "A"
            else "type2_romania_fulltime"
        )
        candidates = await conn.fetch("""
            SELECT c.id, c.first_name, c.last_name, c.candidate_type,
                   c.origin_country, c.nationality, c.target_position_name,
                   c.target_cor_code, c.qualification_level, c.education_level,
                   c.experience_years_origin, c.experience_years_other,
                   c.experience_years_romania, c.languages,
                   c.available_shifts, c.available_at_height,
                   c.available_low_temperature, c.available_high_temperature,
                   c.driving_license_categories, c.equipment_used,
                   c.preferred_salary_fulltime, c.agency_id
            FROM candidates c
            WHERE c.status = 'validated'
              AND c.candidate_type IN ($1, 'type3_romania_parttime')
              AND NOT EXISTS (
                  SELECT 1 FROM placements p
                  WHERE p.candidate_id = c.id
                    AND p.job_request_id = $2
              )
        """, candidate_type_filter, uuid.UUID(job_id))

    j = dict(job)
    results = []
    for c in candidates:
        score = _calculate_match_score(dict(c), j)
        if score > 0:
            results.append({**dict(c), "match_score": score})

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"job_id": job_id, "candidates": results[:50]}


def _calculate_match_score(candidate: dict, job: dict) -> int:
    """Calculează scorul de compatibilitate candidat-job (0-100)."""
    score = 0

    # Experiență (30 puncte)
    min_exp = job.get("min_experience_years_total") or 0
    cand_exp = max(
        candidate.get("experience_years_origin") or 0,
        candidate.get("experience_years_other") or 0,
        candidate.get("experience_years_romania") or 0,
    )
    if cand_exp >= min_exp:
        score += 30
    elif min_exp > 0 and cand_exp >= min_exp - 1:
        score += 15

    # Cod COR (25 puncte)
    if job.get("cor_code") and candidate.get("target_cor_code"):
        if job["cor_code"] == candidate["target_cor_code"]:
            score += 25
        elif job["cor_code"][:3] == candidate["target_cor_code"][:3]:
            score += 12

    # Condiții de muncă (20 puncte)
    cond_score = 0
    checks = [
        ("works_in_shifts", "available_shifts"),
        ("works_at_height", "available_at_height"),
        ("works_low_temp", "available_low_temperature"),
        ("works_high_temp", "available_high_temperature"),
    ]
    required_conds = sum(1 for jk, _ in checks if job.get(jk))
    if required_conds == 0:
        cond_score = 20
    else:
        met = sum(1 for jk, ck in checks if job.get(jk) and candidate.get(ck))
        cond_score = int(met / required_conds * 20)
    score += cond_score

    # Naționalitate preferată (15 puncte)
    preferred = job.get("preferred_nationalities") or []
    if not preferred or candidate.get("nationality") in preferred:
        score += 15

    # Permise conducere (10 puncte)
    required_licenses = set(job.get("required_driving_licenses") or [])
    if not required_licenses:
        score += 10
    else:
        cand_licenses = set(candidate.get("driving_license_categories") or [])
        if required_licenses.issubset(cand_licenses):
            score += 10
        elif required_licenses & cand_licenses:
            score += 5

    return min(score, 100)


# ══════════════════════════════════════════════════════════════════════════════
# CONTACT MESSAGES — MESAJE DIN FORMULARUL DE CONTACT
# ══════════════════════════════════════════════════════════════════════════════

@admin_router.get("/contact/messages")
async def get_contact_messages_admin(request: Request):
    """Returnează toate mesajele din formularul de contact, ordonate descrescător."""
    await require_admin(request)
    try:
        async with get_pg_connection() as conn:
            rows = await conn.fetch("""
                SELECT id, name, email, phone, subject, message, is_read, created_at
                FROM contact_messages ORDER BY created_at DESC
            """)
        return {"messages": [dict(r) for r in rows]}
    except Exception as e:
        logger.error(f"Error fetching contact messages: {e}")
        return {"messages": []}


@admin_router.put("/contact/messages/{message_id}/read")
async def mark_contact_message_read(message_id: str, request: Request):
    """Marchează un mesaj ca citit."""
    await require_admin(request)
    try:
        async with get_pg_connection() as conn:
            await conn.execute(
                "UPDATE contact_messages SET is_read = TRUE WHERE id = $1",
                message_id
            )
        return {"success": True}
    except Exception as e:
        logger.error(f"Error marking message as read: {e}")
        raise HTTPException(status_code=500, detail="Eroare la actualizare.")
