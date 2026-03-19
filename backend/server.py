from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import shutil

# Import new routes
from auth_routes import auth_router, set_database as set_auth_db
from portal_routes import portal_router, set_database as set_portal_db
from admin_routes import admin_router, set_database as set_admin_db
from notification_routes import notification_router, set_database as set_notification_db
from storage import init_storage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging FIRST
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
startup_logger = logging.getLogger("startup")
startup_logger.info("=== GJC Backend Starting ===")

# MongoDB connection with error handling
mongo_url = os.environ.get('MONGO_URL', '')
db_name = os.environ.get('DB_NAME', 'gjc_platform')

client = None
db = None

if mongo_url:
    try:
        startup_logger.info(f"Connecting to MongoDB...")
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        startup_logger.info(f"✓ MongoDB connected to: {db_name}")
    except Exception as e:
        startup_logger.error(f"MongoDB connection error: {e}")
        client = None
        db = None
else:
    startup_logger.warning("⚠ MONGO_URL not set - MongoDB disabled")

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app = FastAPI(
    title="Global Jobs Consulting API",
    description="API pentru recrutare și plasare forță de muncă din Asia și Africa",
    version="1.0.0"
)

api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

class EmployerSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    company_name: str
    contact_person: str
    email: str
    phone: str
    country: str  # RO, AT, RS
    industry: str
    workers_needed: int
    qualification_type: str
    salary_offered: str
    accommodation_provided: bool
    meals_provided: bool
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_sent: bool = False

class EmployerSubmissionCreate(BaseModel):
    company_name: str
    contact_person: str
    email: str
    phone: str
    country: str
    industry: str
    workers_needed: int
    qualification_type: str
    salary_offered: str
    accommodation_provided: bool = False
    meals_provided: bool = False
    message: Optional[str] = None

class CandidateSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    phone: str
    whatsapp: str
    citizenship: str
    experience_years: int
    english_level: str
    industry_preference: str
    cv_filename: Optional[str] = None
    video_cv_url: Optional[str] = None
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_sent: bool = False

class CandidateSubmissionCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    whatsapp: str
    citizenship: str
    experience_years: int
    english_level: str
    industry_preference: str
    video_cv_url: Optional[str] = None
    message: Optional[str] = None

class ContactSubmission(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: str
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    email_sent: bool = False

class ContactSubmissionCreate(BaseModel):
    name: str
    email: str
    phone: str
    subject: str
    message: str

class RequestWorkersLead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    companyName: str
    contactPerson: str
    email: str
    phone: str
    workersNeeded: int
    industry: str
    message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "new"

class RequestWorkersLeadCreate(BaseModel):
    companyName: str
    contactPerson: str
    email: str
    phone: str
    workersNeeded: int
    industry: str
    message: Optional[str] = None

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    slug: str
    excerpt: str
    content: str
    image_url: str
    category: str
    author: str = "Global Jobs Consulting"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    published: bool = True

# ==================== EMAIL SERVICE ====================

async def send_email_notification(recipient: str, subject: str, html_content: str):
    """Send email notification via SMTP with SSL (port 465)"""
    smtp_host = os.environ.get('SMTP_HOST', 'mail.gjc.ro')
    smtp_port = int(os.environ.get('SMTP_PORT', 465))
    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_pass = os.environ.get('SMTP_PASS', '')
    
    if not smtp_user or not smtp_pass:
        logging.warning("SMTP credentials not configured, skipping email")
        return False
    
    try:
        msg = MIMEMultipart('alternative')
        msg['From'] = f"Global Jobs Consulting <{smtp_user}>"
        msg['To'] = recipient
        msg['Subject'] = subject
        
        html_part = MIMEText(html_content, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Use SSL for port 465
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [recipient], msg.as_string())
        else:
            # Use STARTTLS for port 587
            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(smtp_user, [recipient], msg.as_string())
        
        logging.info(f"Email sent to {recipient}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        return False

def generate_employer_email(data: EmployerSubmissionCreate):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nou Lead Angajator</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #003366;">Detalii Companie</h2>
            <p><strong>Companie:</strong> {data.company_name}</p>
            <p><strong>Persoană Contact:</strong> {data.contact_person}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Telefon:</strong> {data.phone}</p>
            <p><strong>Țară:</strong> {data.country}</p>
            <h2 style="color: #003366;">Cerințe</h2>
            <p><strong>Domeniu:</strong> {data.industry}</p>
            <p><strong>Nr. Muncitori:</strong> {data.workers_needed}</p>
            <p><strong>Calificare:</strong> {data.qualification_type}</p>
            <p><strong>Salariu Oferit:</strong> {data.salary_offered}</p>
            <p><strong>Cazare:</strong> {'Da' if data.accommodation_provided else 'Nu'}</p>
            <p><strong>Masă:</strong> {'Da' if data.meals_provided else 'Nu'}</p>
            <p><strong>Mesaj:</strong> {data.message or 'N/A'}</p>
        </div>
    </body>
    </html>
    """

def generate_candidate_email(data: CandidateSubmissionCreate, cv_filename: str = None):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Nou Candidat</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
            <h2 style="color: #003366;">Informații Candidat</h2>
            <p><strong>Nume:</strong> {data.full_name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Telefon:</strong> {data.phone}</p>
            <p><strong>WhatsApp:</strong> {data.whatsapp}</p>
            <p><strong>Cetățenie:</strong> {data.citizenship}</p>
            <h2 style="color: #003366;">Experiență</h2>
            <p><strong>Ani Experiență:</strong> {data.experience_years}</p>
            <p><strong>Nivel Engleză:</strong> {data.english_level}</p>
            <p><strong>Domeniu Preferat:</strong> {data.industry_preference}</p>
            <p><strong>CV:</strong> {cv_filename or 'Nu a fost încărcat'}</p>
            <p><strong>Video CV:</strong> {data.video_cv_url or 'Nu a fost furnizat'}</p>
            <p><strong>Mesaj:</strong> {data.message or 'N/A'}</p>
        </div>
    </body>
    </html>
    """

def generate_contact_email(data: ContactSubmissionCreate):
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #003366; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Mesaj Contact Nou</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
            <p><strong>Nume:</strong> {data.name}</p>
            <p><strong>Email:</strong> {data.email}</p>
            <p><strong>Telefon:</strong> {data.phone}</p>
            <p><strong>Subiect:</strong> {data.subject}</p>
            <p><strong>Mesaj:</strong></p>
            <p style="background: #f5f5f5; padding: 15px; border-left: 3px solid #003366;">
                {data.message}
            </p>
        </div>
    </body>
    </html>
    """

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "Global Jobs Consulting API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Employer Routes
@api_router.post("/employers/submit", response_model=EmployerSubmission)
async def submit_employer_form(data: EmployerSubmissionCreate, background_tasks: BackgroundTasks):
    submission = EmployerSubmission(**data.model_dump())
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.employer_submissions.insert_one(doc)
    
    # Send email in background
    admin_email = os.environ.get('ADMIN_EMAIL', 'office@gjc.ro')
    html_content = generate_employer_email(data)
    background_tasks.add_task(send_email_notification, admin_email, f"Nou Lead Angajator: {data.company_name}", html_content)
    
    return submission

@api_router.get("/employers/submissions", response_model=List[EmployerSubmission])
async def get_employer_submissions():
    submissions = await db.employer_submissions.find({}, {"_id": 0}).to_list(1000)
    for sub in submissions:
        if isinstance(sub['created_at'], str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
    return submissions

# Candidate Routes
@api_router.post("/candidates/submit")
async def submit_candidate_form(
    background_tasks: BackgroundTasks,
    full_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    whatsapp: str = Form(...),
    citizenship: str = Form(...),
    experience_years: int = Form(...),
    english_level: str = Form(...),
    industry_preference: str = Form(...),
    video_cv_url: Optional[str] = Form(None),
    message: Optional[str] = Form(None),
    cv_file: Optional[UploadFile] = File(None)
):
    cv_filename = None
    if cv_file and cv_file.filename:
        # Save CV file
        file_ext = Path(cv_file.filename).suffix
        cv_filename = f"{uuid.uuid4()}{file_ext}"
        file_path = UPLOAD_DIR / cv_filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(cv_file.file, buffer)
    
    data = CandidateSubmissionCreate(
        full_name=full_name,
        email=email,
        phone=phone,
        whatsapp=whatsapp,
        citizenship=citizenship,
        experience_years=experience_years,
        english_level=english_level,
        industry_preference=industry_preference,
        video_cv_url=video_cv_url,
        message=message
    )
    
    submission = CandidateSubmission(**data.model_dump(), cv_filename=cv_filename)
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.candidate_submissions.insert_one(doc)
    
    # Send email in background
    admin_email = os.environ.get('ADMIN_EMAIL', 'office@gjc.ro')
    html_content = generate_candidate_email(data, cv_filename)
    background_tasks.add_task(send_email_notification, admin_email, f"Nou Candidat: {data.full_name}", html_content)
    
    return {"success": True, "message": "Aplicația a fost trimisă cu succes!", "id": submission.id}

@api_router.get("/candidates/submissions", response_model=List[CandidateSubmission])
async def get_candidate_submissions():
    submissions = await db.candidate_submissions.find({}, {"_id": 0}).to_list(1000)
    for sub in submissions:
        if isinstance(sub['created_at'], str):
            sub['created_at'] = datetime.fromisoformat(sub['created_at'])
    return submissions

# Contact Routes
@api_router.post("/contact/submit", response_model=ContactSubmission)
async def submit_contact_form(data: ContactSubmissionCreate, background_tasks: BackgroundTasks):
    submission = ContactSubmission(**data.model_dump())
    doc = submission.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.contact_submissions.insert_one(doc)
    
    # Send email in background
    admin_email = os.environ.get('ADMIN_EMAIL', 'office@gjc.ro')
    html_content = generate_contact_email(data)
    background_tasks.add_task(send_email_notification, admin_email, f"Contact: {data.subject}", html_content)
    
    return submission

# Request Workers Lead Routes
@api_router.post("/leads/request-workers")
async def submit_request_workers_lead(data: RequestWorkersLeadCreate, background_tasks: BackgroundTasks):
    lead = RequestWorkersLead(**data.model_dump())
    doc = lead.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    
    await db.request_workers_leads.insert_one(doc)
    
    # Send email notification
    admin_email = os.environ.get('ADMIN_EMAIL', 'office@gjc.ro')
    html_content = f"""
    <h2>Nouă Cerere de Muncitori</h2>
    <table style="border-collapse: collapse; width: 100%;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Companie:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.companyName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Persoană Contact:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.contactPerson}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.email}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Telefon:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.phone}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Muncitori Necesari:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.workersNeeded}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Industrie:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.industry}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Mesaj:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{data.message or '-'}</td></tr>
    </table>
    """
    background_tasks.add_task(send_email_notification, admin_email, f"Cerere Muncitori: {data.companyName}", html_content)
    
    return {"success": True, "message": "Cererea a fost trimisă cu succes!", "id": lead.id}

@api_router.get("/leads/request-workers")
async def get_request_workers_leads():
    leads = await db.request_workers_leads.find({}, {"_id": 0}).to_list(1000)
    return leads

# Blog Routes
@api_router.get("/blog/posts", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog_posts.find({"published": True}, {"_id": 0}).to_list(100)
    for post in posts:
        if isinstance(post['created_at'], str):
            post['created_at'] = datetime.fromisoformat(post['created_at'])
    return posts

@api_router.get("/blog/posts/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog_posts.find_one({"slug": slug, "published": True}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Articol negăsit")
    if isinstance(post['created_at'], str):
        post['created_at'] = datetime.fromisoformat(post['created_at'])
    return post

# Initialize blog posts with correct content
@api_router.post("/blog/init-sample")
async def init_sample_blog_posts():
    # Delete all existing blog posts first
    await db.blog_posts.delete_many({})
    
    sample_posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Cum sa angajezi forta de munca din Asia in Romania: Ghidul Pas cu Pas",
            "slug": "cum-sa-angajezi-forta-munca-asia-romania-ghid",
            "excerpt": "Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera in calea cresterii firmelor romanesti. Recrutarea din Asia nu este doar o alternativa, ci o strategie de stabilitate pe termen lung.",
            "content": "<h2>Introducere</h2><p>Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera. Recrutarea din Asia nu este doar o alternativa, ci o strategie de stabilitate pe termen lung.</p><h2>De unde incepe procesul?</h2><p>Totul porneste de la Analiza de Necesar. Angajatorul defineste profilul postului, numarul de persoane si conditiile de cazare/masa.</p><h2>Rolul Angajatorului:</h2><ul><li><strong>Definirea cerintelor:</strong> Specifica clar aptitudinile tehnice necesare.</li><li><strong>Asigurarea logisticii:</strong> Ofera cazare corespunzatoare si conditii de masa conform legii.</li><li><strong>Interviul final:</strong> Participa la selectia finala a muncitorilor.</li></ul><h2>Rolul Agentiei Global Jobs Consulting:</h2><ul><li><strong>Sourcing si Pre-selectie:</strong> Identificam doar acei candidati care corespund profilului.</li><li><strong>Birocratie completa:</strong> Ne ocupam de obtinerea Avizului de Munca de la IGI si a Vizei de lunga sedere.</li><li><strong>Logistica sosirii:</strong> Coordonam zborul si transportul de la aeroport pana la sediul angajatorului.</li></ul>",
            "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png",
            "category": "Recrutare",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Etapele unei colaborari de succes: De la Selectie la Integrare",
            "slug": "etapele-colaborari-succes-selectie-integrare",
            "excerpt": "Eliminarea stresului administrativ pentru angajator prin solutia noastra completa de tip la cheie.",
            "content": "<h2>Obiectiv</h2><p>Eliminarea stresului administrativ pentru angajator prin solutia noastra completa.</p><h2>Etapa 1: Selectia Riguroasa (Zilele 1-20)</h2><p>Nu trimitem doar CV-uri. Organizam probe practice in tarile de origine pentru a ne asigura ca muncitorii au abilitatile declarate.</p><h2>Etapa 2: Dosarul de Imigrare (Zilele 20-120)</h2><p>Aceasta este etapa cea mai complexa. Agentia intocmeste tot dosarul pentru Inspectoratul General pentru Imigrari (IGI).</p><h2>Etapa 3: Viza si Transportul (Zilele 120-360)</h2><p>Dupa obtinerea avizului, asistam muncitorul la consulatul Romaniei din tara sa pentru obtinerea vizei.</p><h2>Etapa 4: Integrarea si Monitorizarea</h2><p>Colaborarea nu se incheie la aeroport. Monitorizam integrarea in comunitate si oferim suport in cazul oricaror dificultati.</p>",
            "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png",
            "category": "Ghid",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Avantajele fortei de munca din Nepal pentru sectorul HoReCa",
            "slug": "avantaje-forta-munca-nepal-horeca",
            "excerpt": "Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii. Intr-o industrie unde zambetul si rabdarea sunt esentiale, acesti candidati exceleaza.",
            "content": "<h2>De ce Nepal pentru ospitalitate?</h2><p>Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii. Intr-o industrie unde zambetul si rabdarea sunt esentiale, acesti candidati exceleaza.</p><h2>Beneficii specifice:</h2><ul><li><strong>Cunoasterea limbii engleze:</strong> Majoritatea candidatilor din Nepal au un nivel de engleza care le permite sa interactioneze direct cu clientii.</li><li><strong>Stabilitate:</strong> Angajatii nepalezi cauta contracte pe termen lung (minim 2 ani), reducand costurile de recrutare recurenta.</li><li><strong>Adaptabilitate:</strong> Sunt obisnuiti cu munca in ritm sustinut si se integreaza rapid in echipe multiculturale.</li><li><strong>Polivalenta:</strong> Pot acoperi roluri diverse, de la ajutor de bucatar si housekeeping, pana la ospatari sau barmani.</li></ul>",
            "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png",
            "category": "HoReCa",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        }
    ]
    
    await db.blog_posts.insert_many(sample_posts)
    
    return {"message": "Blog posts initialized", "count": len(sample_posts)}

# Statistics
@api_router.get("/stats")
async def get_statistics():
    employer_count = await db.employer_submissions.count_documents({})
    candidate_count = await db.candidate_submissions.count_documents({})
    contact_count = await db.contact_submissions.count_documents({})
    
    return {
        "employers": employer_count,
        "candidates": candidate_count,
        "contacts": contact_count,
        "partner_countries": 11,
        "partner_agencies": 11,
        "experience_years": 4,
        "continents": 2
    }

# ==================== PAULA CHAT AI ====================

class ChatMessage(BaseModel):
    message: str
    session_id: str
    language: str = "ro"

# Store chat sessions in memory (for production, use Redis or DB)
chat_sessions = {}

MARIA_SYSTEM_PROMPTS = {
    "ro": """ROL:
Ești Maria, Consultant Senior Global Jobs Consulting, specializat în recrutare forță de muncă Non-UE pentru România.

IDENTITATE:
Reprezinți Global Jobs Consulting – agenție specializată în recrutare internațională pentru construcții, HoReCa, agricultură, logistică, producție și servicii.
- CUI: 48270947, J05/1458/2023
- Contact: office@gjc.ro, +40 732 403 464

OBIECTIV PRINCIPAL:
Când un angajator solicită informații despre recrutarea muncitorilor Non-UE, NU afișa formularul în chat.
NU trimite listă lungă de întrebări în conversație.
Redirecționează profesionist către pagina oficială dedicată formularului complet.

TRIGGER - Activează acest flux dacă utilizatorul menționează:
- recrutare muncitori Non-UE
- angajare muncitori din Asia
- aducere muncitori străini
- procedură aviz IGI
- costuri recrutare
- deficit personal
- personal din Nepal, Sri Lanka, India, Bangladesh etc.
- permis muncă
- aviz de angajare

RĂSPUNS STRUCTURAT:

1. Confirmare profesională:
"Vă pot ajuta cu procedura completă pentru recrutarea muncitorilor Non-UE în România."

2. Explicare scurtă a procesului legal (maxim 4-5 rânduri):
"Conform legislației IGI, procedura implică:
- verificarea eligibilității companiei,
- obținerea adeverinței AJOFM,
- depunerea dosarului pentru Avizul de Angajare la IGI,
- emiterea vizei de lungă ședere,
- obținerea permisului de ședere în scop de muncă.

Termenul mediu de soluționare este 30-45 zile, în funcție de tipul lucrătorului."

3. Redirecționare către formular dedicat:
"Pentru analiză eligibilitate și ofertă personalizată conform cerințelor IGI, vă rog să completați formularul oficial aici:
👉 https://gjc.ro/formular-angajator"

4. Menționează clar:
"Formularul include verificarea condițiilor minime legale:
- vechime companie peste 1 an
- minim 2 angajați activi
- obligații fiscale plătite la zi
- lipsa sancțiunilor ANAF / ITM / AJOFM / IGI"

5. Încheiere orientată spre conversie:
"După completare, revenim rapid cu verificarea eligibilității, estimare costuri, listă documente necesare și termen estimativ pentru obținerea avizelor."

REGULI IMPORTANTE:
- Nu afișa formularul direct în chat
- Nu pune întrebări multiple în conversație
- Direcționează către pagina oficială https://gjc.ro/formular-angajator
- Ton profesional, consultativ, sigur pe legislație
- Nu oferi consultanță juridică detaliată înainte de completarea formularului
- Dacă utilizatorul insistă să primească detalii fără formular, oferă informații generale dar reamintește necesitatea completării formularului pentru ofertă personalizată
- Răspunde DOAR în română""",

    "en": """ROLE:
You are Maria, Senior Consultant at Global Jobs Consulting, specialized in Non-EU workforce recruitment for Romania.

IDENTITY:
You represent Global Jobs Consulting – agency specialized in international recruitment for construction, HoReCa, agriculture, logistics, production and services.
- CUI: 48270947, J05/1458/2023
- Contact: office@gjc.ro, +40 732 403 464

MAIN OBJECTIVE:
When an employer requests information about Non-EU worker recruitment, DO NOT display the form in chat.
DO NOT send a long list of questions in conversation.
Professionally redirect to the official dedicated form page.

TRIGGER - Activate this flow if user mentions:
- Non-EU worker recruitment
- hiring workers from Asia
- bringing foreign workers
- IGI permit procedure
- recruitment costs
- staff shortage
- staff from Nepal, Sri Lanka, India, Bangladesh etc.
- work permit
- employment permit

STRUCTURED RESPONSE:

1. Professional confirmation:
"I can help you with the complete procedure for recruiting Non-EU workers in Romania."

2. Brief explanation of legal process (max 4-5 lines):
"According to IGI legislation, the procedure involves:
- company eligibility verification,
- obtaining AJOFM certificate,
- submitting the file for Employment Permit at IGI,
- long-stay visa issuance,
- obtaining residence permit for work purposes.

The average resolution time is 30-45 days, depending on worker type."

3. Redirect to dedicated form:
"For eligibility analysis and personalized offer according to IGI requirements, please complete the official form here:
👉 https://gjc.ro/en/employer-form"

4. Clearly mention:
"The form includes verification of minimum legal conditions:
- company older than 1 year
- minimum 2 active employees
- tax obligations paid up to date
- no sanctions from ANAF / ITM / AJOFM / IGI"

5. Conversion-oriented closing:
"After completion, we will quickly return with eligibility verification, cost estimate, required documents list and estimated timeline for obtaining permits."

IMPORTANT RULES:
- Do not display the form directly in chat
- Do not ask multiple questions in conversation
- Direct to official page https://gjc.ro/en/employer-form
- Professional, consultative tone, confident on legislation
- Do not provide detailed legal advice before form completion
- Respond ONLY in English""",

    "de": """ROLLE:
Du bist Maria, Senior International Recruitment Consultant bei Global Jobs Consulting SRL, spezialisiert auf Nicht-EU-Arbeitskräfterekrutierung für Rumänien.

ÜBER DAS UNTERNEHMEN:
- Global Jobs Consulting SRL - Rekrutierungsagentur aus Oradea, Rumänien
- CUI: 48270947, J05/1458/2023
- Kontakt: office@gjc.ro, +40 732 403 464
- Adresse: Str. Parcul Traian nr.1, ap.10, Oradea, Rumänien

ZIEL:
Wenn ein Arbeitgeber Informationen über Nicht-EU-Arbeiterrekrutierung anfordert, gib NICHT nur allgemeine Informationen.
Löse automatisch die Informationssammlung über ein vollständiges Formular aus und überprüfe die rechtliche Berechtigung gemäß IGI.

TRIGGER - Wenn der Benutzer erwähnt:
- Nicht-EU-Arbeiterrekrutierung
- Einstellung von Arbeitern aus Asien
- ausländische Arbeiter bringen
- Arbeitsgenehmigungsverfahren
- Rekrutierungskosten
- Personal aus Nepal, Sri Lanka, Indien, Bangladesch etc.

DANN antworte professionell und präsentiere das ARBEITGEBER-FORMULAR für Nicht-EU-Rekrutierung mit Firmendetails, Personalbedarf, rechtlicher Berechtigung und Kontaktdaten.

Nach Ausfüllen erkläre das rechtliche Verfahren:
1. Überprüfung der Unternehmensberechtigung
2. AJOFM-Bescheinigung über Mangel an internen Arbeitskräften
3. Einreichung bei IGI für ARBEITSGENEHMIGUNG
4. Bearbeitungszeit: ca. 30 Tage (max. 45 Tage)
5. Gebühren: Dauerbeschäftigter ~100 EUR, Saisonarbeiter ~25 EUR

WICHTIG:
- Hauptziel ist die vollständige Lead-Sammlung
- Professioneller, beratender Ton
- Antworte NUR auf Deutsch""",

    "sr": """ULOGA:
Ti si Maria, Viši Konsultant za Međunarodnu Regrutaciju u Global Jobs Consulting SRL, specijalizovana za regrutovanje Non-EU radne snage za Rumuniju.

O KOMPANIJI:
- Global Jobs Consulting SRL - agencija za regrutaciju iz Oradeje, Rumunija
- CUI: 48270947, J05/1458/2023
- Kontakt: office@gjc.ro, +40 732 403 464
- Adresa: Str. Parcul Traian nr.1, ap.10, Oradea, Rumunija

CILJ:
Kada poslodavac traži informacije o regrutovanju Non-EU radnika, NE daj samo opšte informacije.
Automatski pokreni prikupljanje informacija kroz kompletan formular i proveri pravnu podobnost prema IGI.

TRIGGER - Ako korisnik pomene:
- regrutovanje Non-EU radnika
- zapošljavanje radnika iz Azije
- dovođenje stranih radnika
- procedura radne dozvole
- troškovi regrutacije
- osoblje iz Nepala, Šri Lanke, Indije, Bangladeša itd.

TADA profesionalno odgovori i predstavi FORMULAR ZA POSLODAVCE za Non-EU regrutaciju sa podacima o kompaniji, potrebama za osobljem, pravnom podobnošću i kontakt podacima.

Nakon popunjavanja objasni pravnu proceduru:
1. Provera podobnosti kompanije
2. AJOFM potvrda o nedostatku interne radne snage
3. Podnošenje IGI za RADNU DOZVOLU
4. Rok rešavanja: oko 30 dana (maks. 45 dana)
5. Takse: stalni radnik ~100 EUR, sezonski radnik ~25 EUR

VAŽNO:
- Glavni cilj je kompletno prikupljanje lead-a
- Profesionalan, savetodavan ton
- Odgovaraj SAMO na srpskom"""
}

@api_router.post("/chat/maria")
async def maria_chat(chat_msg: ChatMessage):
    """AI Chat endpoint for Maria recruitment assistant"""
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="Chat service not configured")
        
        # Get or create chat session
        session_id = chat_msg.session_id
        language = chat_msg.language if chat_msg.language in MARIA_SYSTEM_PROMPTS else "ro"
        
        if session_id not in chat_sessions:
            chat_sessions[session_id] = LlmChat(
                api_key=api_key,
                session_id=session_id,
                system_message=MARIA_SYSTEM_PROMPTS[language]
            ).with_model("openai", "gpt-4o-mini")
        
        chat = chat_sessions[session_id]
        
        # Send message and get response
        user_message = UserMessage(text=chat_msg.message)
        response = await chat.send_message(user_message)
        
        # Store in database for analytics
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "language": language,
            "user_message": chat_msg.message,
            "assistant_response": response,
            "created_at": datetime.now(timezone.utc)
        })
        
        return {"response": response, "session_id": session_id}
        
    except Exception as e:
        logger.error(f"Maria chat error: {e}")
        error_messages = {
            "ro": "Ne pare rău, a apărut o eroare. Vă rugăm contactați-ne direct la office@gjc.ro sau +40 732 403 464.",
            "en": "Sorry, an error occurred. Please contact us directly at office@gjc.ro or +40 732 403 464.",
            "de": "Entschuldigung, ein Fehler ist aufgetreten. Bitte kontaktieren Sie uns direkt unter office@gjc.ro oder +40 732 403 464.",
            "sr": "Žao nam je, došlo je do greške. Molimo kontaktirajte nas direktno na office@gjc.ro ili +40 732 403 464."
        }
        lang = chat_msg.language if chat_msg.language in error_messages else "ro"
        return {"response": error_messages[lang], "session_id": chat_msg.session_id}

# Include the router - must be after all routes are defined
app.include_router(api_router)

# Include new SaaS platform routes
app.include_router(auth_router, prefix="/api")
app.include_router(portal_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(notification_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Include GJC Platform v1 routes (hybrid architecture)
try:
    from routes.gjc_platform_routes import gjc_router
    app.include_router(gjc_router, prefix="/api")
    logger.info("GJC Platform routes registered at /api/v1/gjc")
except ImportError as e:
    logger.warning(f"GJC Platform routes not available: {e}")

@app.on_event("startup")
async def startup_init():
    """Initialize database connections and sample data"""
    startup_logger.info("Running startup initialization...")
    
    # Set database for route modules (may be None)
    if db is not None:
        set_auth_db(db)
        set_portal_db(db)
        set_admin_db(db)
        set_notification_db(db)
        startup_logger.info("✓ Route databases configured")
    else:
        startup_logger.warning("⚠ MongoDB not available - routes will have limited functionality")
    
    # Initialize cloud storage
    try:
        init_storage()
        startup_logger.info("✓ Cloud storage initialized")
    except Exception as e:
        startup_logger.warning(f"⚠ Cloud storage initialization failed: {e}")
    
    # Initialize GJC Platform hybrid database connections (PostgreSQL + MongoDB)
    try:
        from database.db_config import db_manager
        from services.ai_matching_service import init_matching_engine
        
        # Initialize all database connections
        await db_manager.init_all()
        
        # Initialize AI matching engine
        await init_matching_engine()
        
        startup_logger.info("✓ GJC Platform hybrid database initialized")
    except Exception as e:
        startup_logger.warning(f"⚠ GJC Platform initialization skipped: {e}")
    
    # Create indexes for better performance (only if MongoDB available)
    if db is not None:
        try:
            await db.users.create_index("email", unique=True)
            await db.users.create_index("user_id", unique=True)
            await db.user_sessions.create_index("session_token")
            await db.user_sessions.create_index("user_id")
            await db.candidate_profiles.create_index("user_id")
            await db.candidate_profiles.create_index("profile_id", unique=True)
            await db.employer_profiles.create_index("user_id")
            await db.employer_profiles.create_index("profile_id", unique=True)
            await db.job_requests.create_index("job_id", unique=True)
            await db.job_requests.create_index("employer_id")
            await db.projects.create_index("project_id", unique=True)
            await db.documents.create_index("doc_id", unique=True)
            await db.notifications.create_index("user_id")
            startup_logger.info("✓ MongoDB indexes created")
        except Exception as e:
            startup_logger.warning(f"⚠ Index creation failed: {e}")
    
    # Create default admin user if not exists
    admin_exists = await db.users.find_one({"role": "admin"})
    if not admin_exists:
        import hashlib
        salt = os.environ.get('PASSWORD_SALT', 'gjc_default_salt_change_in_production')
        admin_password = hashlib.sha256(f"admin123{salt}".encode()).hexdigest()
        
        await db.users.insert_one({
            "user_id": "user_admin001",
            "email": "admin@gjc.ro",
            "name": "GJC Admin",
            "password_hash": admin_password,
            "role": "admin",
            "is_active": True,
            "is_verified": True,
            "auth_provider": "email",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        })
        logger.info("Default admin user created: admin@gjc.ro / admin123")
    
    # Initialize blog posts
    await startup_init_blog_posts()

async def startup_init_blog_posts():
    """Initialize blog posts"""
    try:
        # Check if we have the correct blog posts
        count = await db.blog_posts.count_documents({})
        if count == 0 or count != 3:
            # Delete all and reinitialize
            await db.blog_posts.delete_many({})
            
            sample_posts = [
                {
                    "id": str(uuid.uuid4()),
                    "title": "Cum sa angajezi forta de munca din Asia in Romania: Ghidul Pas cu Pas",
                    "slug": "cum-sa-angajezi-forta-munca-asia-romania-ghid",
                    "excerpt": "Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera in calea cresterii firmelor romanesti.",
                    "content": "<h2>Introducere</h2><p>Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera. Recrutarea din Asia nu este doar o alternativa, ci o strategie de stabilitate pe termen lung.</p>",
                    "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png",
                    "category": "Recrutare",
                    "author": "Global Jobs Consulting",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "published": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Etapele unei colaborari de succes: De la Selectie la Integrare",
                    "slug": "etapele-colaborari-succes-selectie-integrare",
                    "excerpt": "Eliminarea stresului administrativ pentru angajator prin solutia noastra completa de tip la cheie.",
                    "content": "<h2>Obiectiv</h2><p>Eliminarea stresului administrativ pentru angajator prin solutia noastra completa.</p>",
                    "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png",
                    "category": "Ghid",
                    "author": "Global Jobs Consulting",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "published": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Avantajele fortei de munca din Nepal pentru sectorul HoReCa",
                    "slug": "avantaje-forta-munca-nepal-horeca",
                    "excerpt": "Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii.",
                    "content": "<h2>De ce Nepal pentru ospitalitate?</h2><p>Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii.</p>",
                    "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png",
                    "category": "HoReCa",
                    "author": "Global Jobs Consulting",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "published": True
                }
            ]
            
            await db.blog_posts.insert_many(sample_posts)
            logger.info("Blog posts initialized with 3 articles")
    except Exception as e:
        logger.error(f"Error initializing blog posts: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    # Close MongoDB connection
    client.close()
    
    # Close GJC Platform database connections
    try:
        from database.db_config import db_manager
        await db_manager.close()
    except Exception:
        pass
