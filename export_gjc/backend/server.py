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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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

# Initialize sample blog posts
@api_router.post("/blog/init-sample")
async def init_sample_blog_posts():
    sample_posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Cum să angajezi forță de muncă din Asia în România",
            "slug": "angajare-forta-munca-asia-romania",
            "excerpt": "Ghid complet pentru angajatorii români care doresc să recruteze lucrători din țările asiatice.",
            "content": "Procesul de angajare a forței de muncă din Asia implică mai mulți pași esențiali: identificarea nevoilor, selectarea candidaților, obținerea permiselor de muncă și integrarea culturală. La Global Jobs Consulting, oferim suport complet în toate aceste etape.",
            "image_url": "https://images.unsplash.com/photo-1760009436767-d154e930e55c?w=800",
            "category": "Recrutare",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Avantajele forței de muncă din Africa pentru sectorul HoReCa",
            "slug": "avantaje-forta-munca-africa-horeca",
            "excerpt": "Descoperă de ce tot mai mulți angajatori din Europa aleg să recruteze personal din Africa pentru industria ospitalității.",
            "content": "Lucrătorii din Africa aduc o combinație unică de etică a muncii, adaptabilitate și dorință de a învăța. În sectorul HoReCa, aceste calități sunt esențiale pentru succesul afacerii.",
            "image_url": "https://images.unsplash.com/photo-1765735049473-7cb6466e5b3f?w=800",
            "category": "Industrie",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Ghid: Vize și permise de muncă în Austria",
            "slug": "ghid-vize-permise-munca-austria",
            "excerpt": "Tot ce trebuie să știți despre procesul de obținere a vizelor și permiselor de muncă pentru Austria.",
            "content": "Austria are un sistem specific pentru angajarea cetățenilor din țări terțe. Procesul include verificarea pieței muncii, obținerea aprobării AMS și aplicarea pentru permisul de ședere.",
            "image_url": "https://images.unsplash.com/photo-1627660080110-20045fd3875d?w=800",
            "category": "Legislație",
            "author": "Global Jobs Consulting",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "published": True
        }
    ]
    
    for post in sample_posts:
        existing = await db.blog_posts.find_one({"slug": post["slug"]})
        if not existing:
            await db.blog_posts.insert_one(post)
    
    return {"message": "Sample blog posts initialized", "count": len(sample_posts)}

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

# Include the router
app.include_router(api_router)

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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
