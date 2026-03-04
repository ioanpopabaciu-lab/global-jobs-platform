"""
Notification Service for GJC Platform
Handles in-app notifications and email alerts
"""
import os
import asyncio
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone
from typing import Optional, List
import uuid

logger = logging.getLogger(__name__)

# SMTP Configuration
SMTP_HOST = os.environ.get("SMTP_HOST", "mail.gjc.ro")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "465"))
SMTP_USER = os.environ.get("SMTP_USER", "office@gjc.ro")
SMTP_PASS = os.environ.get("SMTP_PASS", "")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "office@gjc.ro")

# Database reference
db = None

def set_database(database):
    global db
    db = database

# ==================== EMAIL TEMPLATES ====================

def get_email_template(template_type: str, data: dict) -> tuple[str, str]:
    """Returns (subject, html_body) for email templates"""
    
    templates = {
        "candidate_match": {
            "subject": f"🎯 Candidat nou potrivit pentru poziția: {data.get('job_title', 'N/A')}",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Global Jobs Consulting</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Notificare Candidat Nou</p>
                    </div>
                    
                    <div style="background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #1e3a5f; margin-top: 0;">
                            🎯 Candidat potrivit găsit!
                        </h2>
                        
                        <p>Stimate/Stimată <strong>{data.get('employer_name', 'Client')}</strong>,</p>
                        
                        <p>Vă informăm că un nou candidat validat corespunde cerințelor poziției dvs.:</p>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #38a169;">
                            <h3 style="margin: 0 0 15px 0; color: #2d3748;">📋 Detalii Poziție</h3>
                            <p style="margin: 5px 0;"><strong>Titlu:</strong> {data.get('job_title', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Cod COR:</strong> {data.get('cor_code', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Locație:</strong> {data.get('work_location', 'N/A')}</p>
                        </div>
                        
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3182ce;">
                            <h3 style="margin: 0 0 15px 0; color: #2d3748;">👤 Profil Candidat</h3>
                            <p style="margin: 5px 0;"><strong>Nume:</strong> {data.get('candidate_name', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Cetățenie:</strong> {data.get('candidate_nationality', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Profesie:</strong> {data.get('candidate_profession', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Experiență:</strong> {data.get('candidate_experience', 0)} ani</p>
                            <p style="margin: 5px 0;"><strong>Nivel Engleză:</strong> {data.get('candidate_english', 'N/A')}</p>
                            <p style="margin: 5px 0;"><strong>Scor Potrivire:</strong> <span style="color: #38a169; font-weight: bold;">{data.get('match_score', 0)}%</span></p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{data.get('platform_url', '#')}/portal/employer" 
                               style="background: #1e3a5f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Vezi Candidatul în Portal
                            </a>
                        </div>
                        
                        <p style="color: #718096; font-size: 14px;">
                            Echipa GJC va lua legătura cu dvs. pentru a discuta următorii pași.
                        </p>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">
                        <p>© 2026 Global Jobs Consulting. Toate drepturile rezervate.</p>
                        <p>Str. Exemplu nr. 1, București, România</p>
                    </div>
                </div>
            </body>
            </html>
            """
        },
        
        "profile_validated": {
            "subject": f"✅ Profilul dvs. a fost validat - Global Jobs Consulting",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #38a169 0%, #48bb78 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Global Jobs Consulting</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Profil Validat</p>
                    </div>
                    
                    <div style="background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #38a169; margin-top: 0;">
                            ✅ Felicitări! Profilul dvs. a fost validat.
                        </h2>
                        
                        <p>Stimate/Stimată <strong>{data.get('user_name', 'Utilizator')}</strong>,</p>
                        
                        <p>Vă informăm că profilul dvs. a fost verificat și validat de echipa noastră.</p>
                        
                        <p><strong>Ce urmează:</strong></p>
                        <ul>
                            <li>{'Veți fi inclus(ă) în procesul de potrivire cu angajatorii' if data.get('user_type') == 'candidate' else 'Puteți crea cereri de personal pentru a recruta muncitori'}</li>
                            <li>Veți primi notificări când apar oportunități potrivite</li>
                            <li>Echipa GJC vă va contacta pentru următorii pași</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{data.get('platform_url', '#')}" 
                               style="background: #38a169; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Accesează Portalul
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">
                        <p>© 2026 Global Jobs Consulting. Toate drepturile rezervate.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        },
        
        "profile_rejected": {
            "subject": f"⚠️ Acțiune necesară pentru profilul dvs. - Global Jobs Consulting",
            "body": f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #e53e3e 0%, #f56565 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0;">Global Jobs Consulting</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Acțiune Necesară</p>
                    </div>
                    
                    <div style="background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px;">
                        <h2 style="color: #e53e3e; margin-top: 0;">
                            ⚠️ Profilul dvs. necesită modificări
                        </h2>
                        
                        <p>Stimate/Stimată <strong>{data.get('user_name', 'Utilizator')}</strong>,</p>
                        
                        <p>După verificarea profilului dvs., am identificat câteva aspecte care necesită atenție:</p>
                        
                        <div style="background: #fff5f5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e53e3e;">
                            <p style="margin: 0;"><strong>Motiv:</strong></p>
                            <p style="margin: 5px 0 0 0;">{data.get('rejection_reason', 'Vă rugăm să completați toate câmpurile obligatorii.')}</p>
                        </div>
                        
                        <p>Vă rugăm să accesați portalul și să actualizați profilul conform indicațiilor.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{data.get('platform_url', '#')}" 
                               style="background: #e53e3e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                Actualizează Profilul
                            </a>
                        </div>
                    </div>
                    
                    <div style="text-align: center; padding: 20px; color: #718096; font-size: 12px;">
                        <p>© 2026 Global Jobs Consulting. Toate drepturile rezervate.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        }
    }
    
    template = templates.get(template_type, {"subject": "Notificare GJC", "body": "<p>Aveți o notificare nouă.</p>"})
    return template["subject"], template["body"]

# ==================== EMAIL SENDING ====================

async def send_email_async(to_email: str, subject: str, html_body: str) -> bool:
    """Send email asynchronously using SMTP"""
    
    if not SMTP_PASS:
        logger.warning("SMTP password not configured, skipping email send")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"Global Jobs Consulting <{SMTP_USER}>"
        msg['To'] = to_email
        
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Run SMTP in thread to avoid blocking
        def send_sync():
            with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASS)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
        
        await asyncio.to_thread(send_sync)
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

# ==================== IN-APP NOTIFICATIONS ====================

async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str = "info",
    category: str = "general",
    related_entity_type: Optional[str] = None,
    related_entity_id: Optional[str] = None,
    action_url: Optional[str] = None,
    send_email: bool = False,
    email_template: Optional[str] = None,
    email_data: Optional[dict] = None
) -> dict:
    """Create an in-app notification and optionally send email"""
    
    notification = {
        "notification_id": f"notif_{uuid.uuid4().hex[:12]}",
        "user_id": user_id,
        "title": title,
        "message": message,
        "type": notification_type,  # info, success, warning, error
        "category": category,  # general, profile, job, match, document
        "related_entity_type": related_entity_type,
        "related_entity_id": related_entity_id,
        "action_url": action_url,
        "is_read": False,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.notifications.insert_one(notification)
    notification.pop("_id", None)
    
    # Send email if requested
    if send_email and email_template and email_data:
        # Get user email
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "email": 1})
        if user and user.get("email"):
            subject, html_body = get_email_template(email_template, email_data)
            await send_email_async(user["email"], subject, html_body)
    
    return notification

async def get_user_notifications(user_id: str, unread_only: bool = False, limit: int = 50) -> List[dict]:
    """Get notifications for a user"""
    query = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return notifications

async def mark_notification_read(notification_id: str, user_id: str) -> bool:
    """Mark a notification as read"""
    result = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": user_id},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}}
    )
    return result.modified_count > 0

async def mark_all_notifications_read(user_id: str) -> int:
    """Mark all notifications as read for a user"""
    result = await db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.now(timezone.utc)}}
    )
    return result.modified_count

async def get_unread_count(user_id: str) -> int:
    """Get count of unread notifications"""
    return await db.notifications.count_documents({"user_id": user_id, "is_read": False})

# ==================== CANDIDATE-JOB MATCHING ====================

def calculate_match_score(candidate: dict, job: dict) -> int:
    """
    Calculate match score between candidate and job (0-100)
    Advanced matching based on: profession, experience, languages, country, age
    """
    score = 0
    max_score = 100
    
    # 1. Profession matching (30 points)
    candidate_profession = (candidate.get("current_profession") or "").lower()
    job_title = (job.get("title") or "").lower()
    job_cor = job.get("cor_code") or ""
    candidate_cor = candidate.get("target_position_cor") or ""
    
    if candidate_cor and job_cor and candidate_cor == job_cor:
        score += 30  # Exact COR match
    elif candidate_profession and job_title:
        # Fuzzy profession match
        if candidate_profession in job_title or job_title in candidate_profession:
            score += 25
        elif any(word in job_title for word in candidate_profession.split()):
            score += 15
    
    # 2. Experience matching (20 points)
    candidate_exp = candidate.get("experience_years") or 0
    required_exp = job.get("required_experience_years") or 0
    
    if candidate_exp >= required_exp:
        score += 20
    elif candidate_exp >= required_exp * 0.7:
        score += 15
    elif candidate_exp >= required_exp * 0.5:
        score += 10
    
    # 3. Language matching (20 points)
    english_levels = {"none": 0, "basic": 1, "intermediate": 2, "advanced": 3, "fluent": 4}
    candidate_english = english_levels.get(candidate.get("english_level", "none"), 0)
    required_english = english_levels.get(job.get("required_english_level", "none"), 0)
    
    if candidate_english >= required_english:
        score += 15
    elif candidate_english >= required_english - 1:
        score += 10
    
    # Check other required languages
    required_languages = set(job.get("required_languages") or [])
    candidate_languages = set(candidate.get("languages_known") or [])
    if required_languages and required_languages.issubset(candidate_languages):
        score += 5
    
    # 4. Nationality/Country preference (15 points)
    preferred_nationalities = job.get("preferred_nationalities") or []
    candidate_nationality = candidate.get("citizenship") or candidate.get("country_of_origin") or ""
    
    if not preferred_nationalities:
        score += 15  # No preference = all accepted
    elif candidate_nationality in preferred_nationalities:
        score += 15
    
    # 5. Age range matching (10 points)
    age_min = job.get("age_range_min")
    age_max = job.get("age_range_max")
    
    candidate_dob = candidate.get("date_of_birth")
    if candidate_dob and (age_min or age_max):
        try:
            from datetime import date
            if isinstance(candidate_dob, str):
                birth_year = int(candidate_dob.split("-")[0])
            else:
                birth_year = candidate_dob.year
            candidate_age = datetime.now().year - birth_year
            
            in_range = True
            if age_min and candidate_age < age_min:
                in_range = False
            if age_max and candidate_age > age_max:
                in_range = False
            
            if in_range:
                score += 10
        except:
            score += 5  # Partial points if can't calculate
    else:
        score += 10  # No age requirement = full points
    
    # 6. Gender preference (5 points)
    preferred_gender = job.get("preferred_gender")
    candidate_gender = candidate.get("gender")
    
    if not preferred_gender or preferred_gender == "any":
        score += 5
    elif candidate_gender == preferred_gender:
        score += 5
    
    return min(score, max_score)

async def find_matching_jobs_for_candidate(candidate_profile: dict, min_score: int = 50) -> List[dict]:
    """Find all open jobs that match a candidate"""
    
    # Get all open jobs
    jobs = await db.job_requests.find(
        {"status": "open"},
        {"_id": 0}
    ).to_list(100)
    
    matches = []
    for job in jobs:
        score = calculate_match_score(candidate_profile, job)
        if score >= min_score:
            # Get employer info
            employer = await db.employer_profiles.find_one(
                {"profile_id": job["employer_id"]},
                {"_id": 0, "company_name": 1, "user_id": 1}
            )
            
            matches.append({
                "job": job,
                "employer": employer,
                "match_score": score
            })
    
    # Sort by score descending
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches

async def notify_employers_of_new_candidate(candidate_profile: dict, platform_url: str = ""):
    """
    When a candidate is validated, notify all employers with matching open jobs
    """
    matches = await find_matching_jobs_for_candidate(candidate_profile, min_score=60)
    
    candidate_name = f"{candidate_profile.get('first_name', '')} {candidate_profile.get('last_name', '')}".strip()
    
    for match in matches:
        job = match["job"]
        employer = match["employer"]
        score = match["match_score"]
        
        if not employer:
            continue
        
        # Get employer user for email
        employer_user = await db.users.find_one(
            {"user_id": employer.get("user_id")},
            {"_id": 0, "email": 1, "name": 1}
        )
        
        if not employer_user:
            continue
        
        # Create in-app notification
        await create_notification(
            user_id=employer["user_id"],
            title=f"🎯 Candidat nou potrivit: {candidate_name}",
            message=f"Un candidat cu scor de potrivire {score}% pentru poziția '{job.get('title')}' este acum disponibil.",
            notification_type="success",
            category="match",
            related_entity_type="candidate_profile",
            related_entity_id=candidate_profile.get("profile_id"),
            action_url=f"/portal/employer/jobs/{job.get('job_id')}",
            send_email=True,
            email_template="candidate_match",
            email_data={
                "employer_name": employer_user.get("name") or employer.get("company_name"),
                "job_title": job.get("title"),
                "cor_code": job.get("cor_code"),
                "work_location": job.get("work_location"),
                "candidate_name": candidate_name,
                "candidate_nationality": candidate_profile.get("citizenship") or candidate_profile.get("country_of_origin"),
                "candidate_profession": candidate_profile.get("current_profession"),
                "candidate_experience": candidate_profile.get("experience_years", 0),
                "candidate_english": candidate_profile.get("english_level", "N/A").title(),
                "match_score": score,
                "platform_url": platform_url
            }
        )
        
        logger.info(f"Notified employer {employer.get('company_name')} about candidate {candidate_name} (score: {score}%)")

async def notify_profile_validation(
    user_id: str, 
    user_name: str, 
    user_type: str,
    is_validated: bool,
    rejection_reason: Optional[str] = None,
    platform_url: str = ""
):
    """Notify user about profile validation status"""
    
    if is_validated:
        await create_notification(
            user_id=user_id,
            title="✅ Profilul dvs. a fost validat!",
            message="Felicitări! Profilul dvs. a fost verificat și aprobat de echipa GJC.",
            notification_type="success",
            category="profile",
            action_url=f"/portal/{user_type}/profile",
            send_email=True,
            email_template="profile_validated",
            email_data={
                "user_name": user_name,
                "user_type": user_type,
                "platform_url": platform_url
            }
        )
    else:
        await create_notification(
            user_id=user_id,
            title="⚠️ Profilul necesită modificări",
            message=rejection_reason or "Vă rugăm să actualizați profilul conform indicațiilor.",
            notification_type="warning",
            category="profile",
            action_url=f"/portal/{user_type}/profile",
            send_email=True,
            email_template="profile_rejected",
            email_data={
                "user_name": user_name,
                "rejection_reason": rejection_reason,
                "platform_url": platform_url
            }
        )
