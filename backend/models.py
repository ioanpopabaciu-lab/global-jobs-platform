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
# Comprehensive profile for Non-EU worker recruitment in Romania

class CandidateProfile(BaseModel):
    """Candidate profile model - Full profile for international recruitment"""
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: f"cand_{uuid.uuid4().hex[:12]}")
    user_id: str
    
    # SECTION 1 - Personal Information (Informații personale)
    profile_photo_url: Optional[str] = None  # Poză profil (obligatoriu)
    first_name: str = ""  # Prenume
    last_name: str = ""  # Nume
    country_of_origin: str = ""  # Țară de origine
    date_of_birth: Optional[str] = None  # Data nașterii (stored as string YYYY-MM-DD)
    gender: Literal["male", "female", "other"] = "male"  # Sex
    marital_status: Literal["single", "married", "divorced", "widowed"] = "single"  # Stare civilă
    religion: Optional[str] = None  # Religie
    citizenship: str = ""  # Cetățenie
    
    # SECTION 2 - Family (Familie)
    father_name: Optional[str] = None  # Nume tată
    mother_name: Optional[str] = None  # Nume mamă
    spouse_name: Optional[str] = None  # Nume soț / soție
    children_count: int = 0  # Număr copii
    children_ages: list[int] = []  # Vârsta copiilor
    
    # SECTION 3 - Professional Experience (Experiență profesională)
    current_profession: str = ""  # Profesie actuală
    target_position_cor: Optional[str] = None  # Postul vizat (cod COR România)
    experience_years: int = 0  # Număr ani experiență
    worked_abroad: bool = False  # A lucrat în străinătate (Da / Nu)
    countries_worked_in: list[str] = []  # În ce țări a lucrat
    languages_known: list[str] = []  # Limbi străine cunoscute
    english_level: Literal["none", "basic", "intermediate", "advanced", "fluent"] = "none"  # Nivel limbă engleză
    
    # SECTION 4 - Documents (Documente obligatorii) - stored as doc_ids
    cv_doc_id: Optional[str] = None  # CV fără date de contact
    diploma_doc_ids: list[str] = []  # Diplome / certificate
    video_presentation_url: Optional[str] = None  # Video prezentare candidat
    passport_doc_id: Optional[str] = None  # Copie pașaport
    criminal_record_doc_id: Optional[str] = None  # Certificat cazier judiciar
    passport_photo_doc_id: Optional[str] = None  # Fotografie tip pașaport
    
    # SECTION 5 - Additional Information (Informații suplimentare)
    salary_expectation: Optional[str] = None  # Salariul solicitat (opțional)
    existing_residence_permit: Optional[str] = None  # Permis de ședere într-o altă țară
    existing_residence_permit_country: Optional[str] = None  # Țara permisului de ședere
    
    # Contact (for internal use only)
    phone: str = ""
    whatsapp: Optional[str] = None
    email: Optional[str] = None
    
    # Legacy fields for backward compatibility
    full_name: Optional[str] = None
    nationality: Optional[str] = None
    current_country: Optional[str] = None
    profession: Optional[str] = None
    other_languages: list[str] = []
    skills: list[str] = []
    preferred_countries: list[str] = []
    preferred_industries: list[str] = []
    available_from: Optional[datetime] = None
    medical_certificate_doc_id: Optional[str] = None
    
    # Status
    status: Literal["draft", "pending_validation", "validated", "rejected"] = "draft"
    validation_notes: Optional[str] = None
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CandidateProfileCreate(BaseModel):
    """Create/Update candidate profile - all fields optional for partial updates"""
    # Section 1 - Personal
    profile_photo_url: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    country_of_origin: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    marital_status: Optional[str] = None
    religion: Optional[str] = None
    citizenship: Optional[str] = None
    
    # Section 2 - Family
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    spouse_name: Optional[str] = None
    children_count: Optional[int] = None
    children_ages: Optional[list[int]] = None
    
    # Section 3 - Professional
    current_profession: Optional[str] = None
    target_position_cor: Optional[str] = None
    experience_years: Optional[int] = None
    worked_abroad: Optional[bool] = None
    countries_worked_in: Optional[list[str]] = None
    languages_known: Optional[list[str]] = None
    english_level: Optional[str] = None
    
    # Section 5 - Additional
    salary_expectation: Optional[str] = None
    existing_residence_permit: Optional[str] = None
    existing_residence_permit_country: Optional[str] = None
    
    # Contact
    phone: Optional[str] = None
    whatsapp: Optional[str] = None

# ==================== EMPLOYER MODELS ====================

class EmployerProfile(BaseModel):
    """Employer profile model - Full company profile with job positions"""
    model_config = ConfigDict(extra="ignore")
    profile_id: str = Field(default_factory=lambda: f"emp_{uuid.uuid4().hex[:12]}")
    user_id: str
    
    # Company Information (Date companie)
    company_name: str = ""  # Denumire companie
    company_cui: str = ""  # CUI
    company_j_number: Optional[str] = None  # Nr. Registrul Comerțului
    address: str = ""  # Adresă sediu
    phone: str = ""  # Telefon
    email: str = ""  # Email
    administrator_name: str = ""  # Nume administrator
    
    # Additional company details
    country: Literal["RO", "AT", "RS"] = "RO"
    city: str = ""
    industry: str = ""
    employees_count: int = 0
    year_founded: Optional[int] = None
    website: Optional[str] = None
    
    # Contact person (for communication)
    contact_person: str = ""
    contact_email: str = ""
    contact_phone: str = ""
    
    # Documents (Documente obligatorii)
    cui_certificate_doc_id: Optional[str] = None  # Certificat CUI
    administrator_id_doc_id: Optional[str] = None  # Carte identitate administrator
    company_criminal_record_doc_id: Optional[str] = None  # Cazier judiciar persoană juridică
    company_registration_doc_id: Optional[str] = None  # Legacy
    fiscal_certificate_doc_id: Optional[str] = None  # Legacy
    
    # IGI Eligibility (for RO employers)
    has_no_debts: bool = False  # Obligații fiscale plătite la zi
    has_no_sanctions: bool = False  # Fără sancțiuni ANAF / ITM / AJOFM / IGI
    has_min_employees: bool = False  # min 2 angajați activi
    company_age_over_1_year: bool = False  # Vechime companie peste 1 an
    
    # Status
    status: Literal["draft", "pending_validation", "validated", "rejected"] = "draft"
    validation_notes: Optional[str] = None
    validated_by: Optional[str] = None
    validated_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EmployerProfileCreate(BaseModel):
    """Create/Update employer profile"""
    # Company info
    company_name: Optional[str] = None
    company_cui: Optional[str] = None
    company_j_number: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    administrator_name: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    industry: Optional[str] = None
    employees_count: Optional[int] = None
    year_founded: Optional[int] = None
    website: Optional[str] = None
    
    # Contact
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    
    # IGI Eligibility
    has_no_debts: Optional[bool] = None
    has_no_sanctions: Optional[bool] = None
    has_min_employees: Optional[bool] = None
    company_age_over_1_year: Optional[bool] = None

# ==================== JOB REQUEST MODELS ====================
# Job Position (Cerere poziție) - Employer can create multiple

class JobRequest(BaseModel):
    """Job request/position from employer"""
    model_config = ConfigDict(extra="ignore")
    job_id: str = Field(default_factory=lambda: f"job_{uuid.uuid4().hex[:12]}")
    employer_id: str  # employer profile_id
    
    # Position details (Secțiune poziții deschise)
    title: str = ""  # Position name
    cor_code: Optional[str] = None  # Cod COR
    description: str = ""
    positions_count: int = 1  # Număr poziții deschise
    
    # Requirements
    required_experience_years: int = 0  # Nivel experiență dorit
    preferred_gender: Optional[Literal["male", "female", "any"]] = "any"  # Sex preferat
    age_range_min: Optional[int] = None  # Interval vârstă - min
    age_range_max: Optional[int] = None  # Interval vârstă - max
    preferred_nationalities: list[str] = []  # Țară de proveniență dorită
    required_languages: list[str] = []  # Limbi străine
    required_language_level: Optional[str] = None  # Nivel limbă
    required_english_level: str = "basic"
    required_skills: list[str] = []
    
    # Conditions
    salary_gross: Optional[str] = None  # Salariu oferit (opțional)
    contract_type: Literal["permanent", "seasonal", "detached"] = "permanent"
    contract_duration_months: Optional[int] = None
    accommodation_provided: bool = False
    meals_provided: bool = False
    transport_provided: bool = False
    work_location: str = ""
    
    # Industry
    industry: str = ""
    
    # Status
    status: Literal["draft", "open", "in_progress", "filled", "cancelled"] = "draft"
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deadline: Optional[datetime] = None

class JobRequestCreate(BaseModel):
    """Create job request"""
    title: str
    cor_code: Optional[str] = None
    description: Optional[str] = None
    positions_count: int = 1
    required_experience_years: int = 0
    preferred_gender: Optional[str] = "any"
    age_range_min: Optional[int] = None
    age_range_max: Optional[int] = None
    preferred_nationalities: Optional[list[str]] = []
    required_languages: Optional[list[str]] = []
    required_language_level: Optional[str] = None
    required_english_level: str = "basic"
    required_skills: Optional[list[str]] = []
    salary_gross: Optional[str] = None
    contract_type: str = "permanent"
    contract_duration_months: Optional[int] = None
    accommodation_provided: bool = False
    meals_provided: bool = False
    transport_provided: bool = False
    work_location: str = ""
    industry: str = ""

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
