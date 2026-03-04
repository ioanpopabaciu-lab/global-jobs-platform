"""
Authentication models and schemas for GJC SaaS Platform
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, Literal
from datetime import datetime, timezone
import uuid

# User Roles (for permissions)
UserRole = Literal["candidate", "employer", "student", "immigration_client", "admin"]

# Account Types (for service differentiation)
AccountType = Literal["candidate", "employer", "student", "immigration_client"]

# ==================== AUTH MODELS ====================

class UserBase(BaseModel):
    """Base user model"""
    model_config = ConfigDict(extra="ignore")
    user_id: str = Field(default_factory=lambda: f"user_{uuid.uuid4().hex[:12]}")
    email: EmailStr
    name: str
    picture: Optional[str] = None
    role: UserRole = "candidate"
    account_type: AccountType = "candidate"
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    """User registration model"""
    email: EmailStr
    password: str
    name: str
    account_type: AccountType = "candidate"

class UserLogin(BaseModel):
    """User login model"""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response model (no sensitive data)"""
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: UserRole
    account_type: AccountType
    is_active: bool
    is_verified: bool
    created_at: datetime

class UserSession(BaseModel):
    """User session model"""
    model_config = ConfigDict(extra="ignore")
    session_id: str = Field(default_factory=lambda: f"sess_{uuid.uuid4().hex}")
    user_id: str
    session_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class PasswordResetRequest(BaseModel):
    """Password reset request"""
    email: EmailStr

class PasswordReset(BaseModel):
    """Password reset with token"""
    token: str
    new_password: str

# ==================== CANDIDATE MODELS ====================

class CandidateProfile(BaseModel):
    """Candidate profile model"""
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: f"cand_{uuid.uuid4().hex[:12]}")
    user_id: str
    
    # Personal info
    full_name: str
    date_of_birth: Optional[datetime] = None
    nationality: str
    current_country: str
    phone: str
    whatsapp: Optional[str] = None
    
    # Professional info
    profession: str
    experience_years: int = 0
    english_level: Literal["none", "basic", "intermediate", "advanced", "fluent"] = "basic"
    other_languages: list[str] = []
    skills: list[str] = []
    
    # Preferences
    preferred_countries: list[str] = []  # RO, AT, RS
    preferred_industries: list[str] = []
    salary_expectation: Optional[str] = None
    available_from: Optional[datetime] = None
    
    # Documents (references to document IDs)
    passport_doc_id: Optional[str] = None
    cv_doc_id: Optional[str] = None
    diploma_doc_ids: list[str] = []
    criminal_record_doc_id: Optional[str] = None
    medical_certificate_doc_id: Optional[str] = None
    video_presentation_url: Optional[str] = None
    
    # Status
    status: Literal["draft", "pending_validation", "validated", "rejected"] = "draft"
    validation_notes: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CandidateProfileCreate(BaseModel):
    """Create candidate profile"""
    full_name: str
    nationality: str
    current_country: str
    phone: str
    whatsapp: Optional[str] = None
    profession: str
    experience_years: int = 0
    english_level: str = "basic"
    preferred_countries: list[str] = []
    preferred_industries: list[str] = []

# ==================== EMPLOYER MODELS ====================

class EmployerProfile(BaseModel):
    """Employer profile model"""
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: f"emp_{uuid.uuid4().hex[:12]}")
    user_id: str
    
    # Company info
    company_name: str
    company_cui: str  # Romanian CUI
    company_j_number: Optional[str] = None  # J number
    country: Literal["RO", "AT", "RS"]
    city: str
    address: str
    
    # Contact
    contact_person: str
    contact_email: str
    contact_phone: str
    
    # Company details
    industry: str
    employees_count: int = 0
    year_founded: Optional[int] = None
    website: Optional[str] = None
    
    # IGI Eligibility (for RO employers)
    has_no_debts: bool = False
    has_no_sanctions: bool = False
    has_min_employees: bool = False  # min 2 employees
    company_age_over_1_year: bool = False
    
    # Documents
    company_registration_doc_id: Optional[str] = None
    fiscal_certificate_doc_id: Optional[str] = None
    
    # Status
    status: Literal["draft", "pending_validation", "validated", "rejected"] = "draft"
    validation_notes: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmployerProfileCreate(BaseModel):
    """Create employer profile"""
    company_name: str
    company_cui: str
    country: str = "RO"
    city: str
    address: str
    contact_person: str
    contact_email: str
    contact_phone: str
    industry: str
    employees_count: int = 0

# ==================== JOB REQUEST MODELS ====================

class JobRequest(BaseModel):
    """Job request from employer"""
    model_config = ConfigDict(extra="ignore")
    job_id: str = Field(default_factory=lambda: f"job_{uuid.uuid4().hex[:12]}")
    employer_id: str  # employer profile_id
    
    # Job details
    title: str
    description: str
    industry: str
    positions_count: int = 1
    
    # Requirements
    required_experience_years: int = 0
    required_english_level: str = "basic"
    required_skills: list[str] = []
    preferred_nationalities: list[str] = []
    
    # Conditions
    salary_gross: str  # e.g., "2000-2500 EUR"
    contract_type: Literal["permanent", "seasonal", "detached"] = "permanent"
    contract_duration_months: Optional[int] = None
    accommodation_provided: bool = False
    meals_provided: bool = False
    transport_provided: bool = False
    work_location: str
    
    # Status
    status: Literal["draft", "open", "in_progress", "filled", "cancelled"] = "draft"
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deadline: Optional[datetime] = None

class JobRequestCreate(BaseModel):
    """Create job request"""
    title: str
    description: str
    industry: str
    positions_count: int = 1
    required_experience_years: int = 0
    required_english_level: str = "basic"
    required_skills: list[str] = []
    salary_gross: str
    contract_type: str = "permanent"
    accommodation_provided: bool = False
    meals_provided: bool = False
    work_location: str

# ==================== PROJECT MODELS ====================

# Immigration workflow stages
ImmigrationStage = Literal[
    "candidate_registration",      # 1. Înregistrare candidat
    "candidate_validation",        # 2. Validare profil candidat
    "employer_registration",       # 3. Înregistrare angajator
    "employer_validation",         # 4. Validare angajator
    "job_request_created",         # 5. Cerere job creată
    "candidate_matched",           # 6. Candidat potrivit
    "contract_generated",          # 7. Contract servicii generat
    "contract_signed",             # 8. Contract semnat
    "invoice_generated",           # 9. Factură generată
    "payment_received",            # 10. Plată primită
    "documents_uploaded",          # 11. Documente încărcate
    "igi_work_permit_submitted",   # 12. Dosar IGI depus
    "igi_work_permit_approved",    # 13. Aviz muncă aprobat
    "evisa_submitted",             # 14. e-Visa depusă
    "embassy_interview",           # 15. Interviu ambasadă
    "visa_issued",                 # 16. Viză emisă
    "candidate_travel",            # 17. Călătorie candidat
    "arrival_romania",             # 18. Sosire România
    "residence_permit_applied",    # 19. Permis ședere depus
    "residence_permit_issued",     # 20. Permis ședere emis
    "completed"                    # 21. Finalizat
]

class ProjectStageHistory(BaseModel):
    """Stage change history entry"""
    stage: str
    changed_at: datetime
    changed_by: str  # user_id
    notes: Optional[str] = None

class Project(BaseModel):
    """Recruitment project model"""
    model_config = ConfigDict(extra="ignore")
    project_id: str = Field(default_factory=lambda: f"proj_{uuid.uuid4().hex[:12]}")
    
    # References
    candidate_id: str  # candidate profile_id
    employer_id: str   # employer profile_id
    job_id: str        # job request id
    
    # Current status
    current_stage: ImmigrationStage = "candidate_matched"
    stage_history: list[ProjectStageHistory] = []
    
    # Contract & Invoice
    contract_id: Optional[str] = None
    contract_signed_date: Optional[datetime] = None
    invoice_id: Optional[str] = None
    payment_status: Literal["pending", "partial", "paid"] = "pending"
    payment_date: Optional[datetime] = None
    
    # Immigration tracking
    igi_submission_date: Optional[datetime] = None
    igi_approval_date: Optional[datetime] = None
    igi_reference_number: Optional[str] = None
    
    visa_submission_date: Optional[datetime] = None
    embassy_interview_date: Optional[datetime] = None
    visa_issue_date: Optional[datetime] = None
    visa_number: Optional[str] = None
    
    travel_date: Optional[datetime] = None
    arrival_date: Optional[datetime] = None
    
    residence_permit_submission_date: Optional[datetime] = None
    residence_permit_issue_date: Optional[datetime] = None
    residence_permit_number: Optional[str] = None
    residence_permit_expiry: Optional[datetime] = None
    
    # Matching score (0-100)
    matching_score: int = 0
    
    # Notes
    notes: list[dict] = []  # {user_id, text, created_at}
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== DOCUMENT MODELS ====================

DocumentType = Literal[
    "passport", "cv", "diploma", "criminal_record", 
    "medical_certificate", "company_registration", 
    "fiscal_certificate", "contract", "invoice", "other"
]

class Document(BaseModel):
    """Document model"""
    model_config = ConfigDict(extra="ignore")
    doc_id: str = Field(default_factory=lambda: f"doc_{uuid.uuid4().hex[:12]}")
    
    # Owner
    owner_id: str  # user_id or profile_id
    owner_type: Literal["candidate", "employer", "project"]
    
    # File info
    filename: str
    original_filename: str
    file_type: str  # mime type
    file_size: int  # bytes
    storage_path: str  # S3 key or local path
    
    # Document metadata
    document_type: DocumentType
    document_number: Optional[str] = None  # e.g., passport number
    issue_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    issuing_authority: Optional[str] = None
    
    # Status
    status: Literal["uploaded", "verified", "rejected", "expired"] = "uploaded"
    verification_notes: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    # Metadata
    uploaded_by: str  # user_id
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== NOTIFICATION MODELS ====================

class Notification(BaseModel):
    """Notification model"""
    model_config = ConfigDict(extra="ignore")
    notification_id: str = Field(default_factory=lambda: f"notif_{uuid.uuid4().hex[:12]}")
    
    user_id: str
    title: str
    message: str
    type: Literal["info", "success", "warning", "error"] = "info"
    category: Literal["profile", "document", "project", "payment", "system"] = "system"
    
    # Link to relevant entity
    related_entity_type: Optional[str] = None  # project, document, etc.
    related_entity_id: Optional[str] = None
    
    # Status
    is_read: bool = False
    read_at: Optional[datetime] = None
    
    # Email
    email_sent: bool = False
    email_sent_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
