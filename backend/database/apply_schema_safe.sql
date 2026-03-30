-- ============================================================
-- GJC.ro — Schema PostgreSQL v3.0 — SAFE APPLY
-- Poate fi rulat pe o bază de date existentă fără a distruge date
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMERĂRI (safe — DO block cu exception handling)
-- ============================================================

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin','employer','candidate','agency','migration_client');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE employer_category AS ENUM ('A','B','AB');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE company_legal_form AS ENUM ('SRL','SA','PFA','II','SNC','SCS','RA','Altele');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE candidate_type AS ENUM (
        'type1_abroad',
        'type2_romania_fulltime',
        'type3_romania_parttime'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE qualification_level AS ENUM ('unqualified','qualified','highly_qualified');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE education_level AS ENUM ('none','secondary','higher','master','doctorate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE language_level AS ENUM ('basic','intermediate','advanced','native');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE contract_type AS ENUM ('permanent','seasonal','part_time','detached');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE profile_status AS ENUM (
        'draft','pending_validation','validated','rejected','suspended'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE job_status AS ENUM ('draft','open','in_progress','filled','cancelled','paused');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE placement_stage_a AS ENUM (
        'registered','profile_validated','matched','stage1_visible',
        'interview_scheduled','selected','stage2_visible',
        'igi_submitted','igi_approved','visa_submitted','visa_approved',
        'flight_scheduled','arrived','employed','completed','cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE placement_stage_b AS ENUM (
        'registered','profile_validated','matched','stage1_visible',
        'interview_scheduled','selected','stage2_visible',
        'start_date_set','employed','completed','cancelled'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM (
        'uploaded','pending','verified','rejected','expired','renewed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE document_type AS ENUM (
        'passport','cv','diploma','certificate','criminal_record',
        'medical_certificate','recommendation_letter','work_permit',
        'resignation_letter','layoff_document','driver_license',
        'cui_certificate','admin_id_card','company_criminal_record',
        'anaf_certificate','accommodation_proof',
        'contract_recruitment','payment_proof','offer_letter',
        'agency_license','agency_contract',
        'migration_request_doc','migration_support_doc','other'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE migration_service_type AS ENUM (
        'M1_family_reunion','M2_visa_d_vf','M3_employer_change',
        'M4_permanent_residence','M5_citizenship','M6_civil_documents',
        'M7_diploma_recognition','M8_driving_license','M9_legal_defense','M10_health_card'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE migration_case_status AS ENUM (
        'received','analyzing','validated','documents_requested',
        'documents_received','in_progress','resolving','answer_received','closed'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE migration_case_result AS ENUM ('approved','rejected','new_deadline','pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info','success','warning','error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_category AS ENUM (
        'profile','document','placement','migration','payment','system'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- TABELE (IF NOT EXISTS — safe pentru date existente)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email               VARCHAR(255) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,
    name                VARCHAR(255) NOT NULL,
    role                user_role NOT NULL DEFAULT 'candidate',
    is_active           BOOLEAN DEFAULT TRUE,
    is_email_verified   BOOLEAN DEFAULT FALSE,
    preferred_language  VARCHAR(10) DEFAULT 'ro',
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token  VARCHAR(255) UNIQUE NOT NULL,
    expires_at     TIMESTAMPTZ NOT NULL,
    ip_address     VARCHAR(45),
    user_agent     TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(255) UNIQUE NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employers (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name         VARCHAR(255) NOT NULL,
    cui                  VARCHAR(20) UNIQUE,
    legal_form           company_legal_form,
    registration_number  VARCHAR(50),
    address      TEXT,
    city         VARCHAR(100),
    county       VARCHAR(100),
    country      VARCHAR(100) DEFAULT 'Romania',
    postal_code  VARCHAR(20),
    contact_person_name  VARCHAR(255),
    contact_person_role  VARCHAR(100),
    phone                VARCHAR(50),
    website              VARCHAR(255),
    category              employer_category NOT NULL,
    activity_domain       VARCHAR(255),
    activity_domain_caen  VARCHAR(10),
    total_employees       INTEGER,
    has_non_eu_workers    BOOLEAN DEFAULT FALSE,
    non_eu_workers_count  INTEGER DEFAULT 0,
    igi_no_debts         BOOLEAN,
    igi_no_sanctions     BOOLEAN,
    igi_min_2_employees  BOOLEAN,
    igi_over_1_year      BOOLEAN,
    igi_verified_by      UUID REFERENCES users(id),
    igi_verified_at      TIMESTAMPTZ,
    cat_a_contract_types          TEXT[],
    cat_a_accommodation_provided  BOOLEAN,
    cat_a_meals_provided          BOOLEAN,
    cat_a_accepted_nationalities  TEXT[],
    cat_b_job_types  TEXT[],
    status            profile_status DEFAULT 'draft',
    rejection_reason  TEXT,
    validated_by      UUID REFERENCES users(id),
    validated_at      TIMESTAMPTZ,
    submitted_at      TIMESTAMPTZ,
    anaf_data         JSONB,
    anaf_verified_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agencies (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agency_name  VARCHAR(255) NOT NULL,
    agency_type  VARCHAR(20),
    country      VARCHAR(100) NOT NULL,
    city         VARCHAR(100),
    address      TEXT,
    contact_person_name  VARCHAR(255),
    phone                VARCHAR(50),
    website              VARCHAR(255),
    license_number  VARCHAR(100),
    license_expiry  DATE,
    commission_rate  DECIMAL(5,2),
    specialization   TEXT[],
    status            profile_status DEFAULT 'pending_validation',
    rejection_reason  TEXT,
    validated_by      UUID REFERENCES users(id),
    validated_at      TIMESTAMPTZ,
    total_candidates_uploaded  INTEGER DEFAULT 0,
    total_placements           INTEGER DEFAULT 0,
    success_rate               DECIMAL(5,2),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS candidates (
    id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id   UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id),
    candidate_type  candidate_type NOT NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    date_of_birth     DATE,
    gender            VARCHAR(20),
    marital_status    VARCHAR(50),
    military_service  VARCHAR(50),
    origin_country     VARCHAR(100) NOT NULL,
    nationality        VARCHAR(100),
    residence_country  VARCHAR(100),
    current_address    TEXT,
    phone  VARCHAR(50),
    email  VARCHAR(255),
    target_cor_code       VARCHAR(20),
    target_position_name  VARCHAR(255),
    job_types_sought      TEXT[],
    qualification_level  qualification_level,
    education_level      education_level,
    experience_years_origin   INTEGER DEFAULT 0,
    experience_years_other    INTEGER DEFAULT 0,
    experience_years_romania  INTEGER DEFAULT 0,
    experience_countries      TEXT[],
    last_employer_contact     TEXT,
    languages  JSONB DEFAULT '[]',
    has_driving_license               BOOLEAN DEFAULT FALSE,
    driving_license_national          BOOLEAN DEFAULT FALSE,
    driving_license_international     BOOLEAN DEFAULT FALSE,
    driving_license_categories        TEXT[],
    equipment_used  TEXT[],
    digital_skills  TEXT[],
    digital_tools   TEXT[],
    other_skills    TEXT[],
    available_shifts            BOOLEAN DEFAULT FALSE,
    available_low_temperature   BOOLEAN DEFAULT FALSE,
    available_high_temperature  BOOLEAN DEFAULT FALSE,
    available_at_height         BOOLEAN DEFAULT FALSE,
    preferred_salary_fulltime   DECIMAL(10,2),
    preferred_salary_parttime   DECIMAL(10,2),
    preferred_currency          VARCHAR(10) DEFAULT 'RON',
    current_location_type  VARCHAR(50),
    current_employer_name        VARCHAR(255),
    current_employer_start_date  DATE,
    departure_reason   VARCHAR(20),
    departure_date     DATE,
    work_permit_number VARCHAR(100),
    work_permit_expiry DATE,
    current_employer_parttime  VARCHAR(255),
    current_work_schedule      TEXT,
    available_days             TEXT[],
    available_hours_start      TIME,
    available_hours_end        TIME,
    status            profile_status DEFAULT 'draft',
    rejection_reason  TEXT,
    validated_by      UUID REFERENCES users(id),
    validated_at      TIMESTAMPTZ,
    submitted_at      TIMESTAMPTZ,
    profile_completion_pct  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_requests (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employer_id  UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
    cor_code        VARCHAR(20),
    position_title  VARCHAR(255) NOT NULL,
    positions_count INTEGER NOT NULL DEFAULT 1,
    category        employer_category NOT NULL CHECK (category IN ('A', 'B')),
    min_experience_years_total    INTEGER DEFAULT 0,
    min_experience_years_origin   INTEGER DEFAULT 0,
    min_experience_years_other    INTEGER DEFAULT 0,
    min_experience_years_romania  INTEGER DEFAULT 0,
    work_schedule     TEXT[],
    shift_details     TEXT,
    works_in_shifts   BOOLEAN DEFAULT FALSE,
    works_low_temp    BOOLEAN DEFAULT FALSE,
    works_high_temp   BOOLEAN DEFAULT FALSE,
    works_at_height   BOOLEAN DEFAULT FALSE,
    other_conditions  TEXT,
    min_education_level      education_level,
    required_qualifications  TEXT[],
    required_certifications  TEXT[],
    required_driving_licenses TEXT[],
    required_equipment       TEXT[],
    salary_gross            DECIMAL(10,2),
    salary_currency         VARCHAR(10) DEFAULT 'RON',
    salary_period           VARCHAR(20) DEFAULT 'monthly',
    other_benefits          TEXT,
    accommodation_provided  BOOLEAN DEFAULT FALSE,
    meals_provided          BOOLEAN DEFAULT FALSE,
    transport_provided      BOOLEAN DEFAULT FALSE,
    preferred_nationalities  TEXT[],
    max_age                  INTEGER,
    preferred_gender         VARCHAR(20) DEFAULT 'any',
    preferred_marital_status VARCHAR(50),
    contract_type            contract_type,
    contract_duration_months INTEGER,
    status            job_status DEFAULT 'draft',
    positions_filled  INTEGER DEFAULT 0,
    admin_notes       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    updated_at    TIMESTAMPTZ DEFAULT NOW(),
    published_at  TIMESTAMPTZ,
    closed_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS documents (
    id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_type  VARCHAR(50) NOT NULL,
    owner_id    UUID NOT NULL,
    document_type      document_type NOT NULL,
    original_filename  VARCHAR(500) NOT NULL,
    display_name       VARCHAR(255),
    description        TEXT,
    storage_path  TEXT NOT NULL,
    file_type     VARCHAR(50),
    file_size     INTEGER,
    extracted_data   JSONB,
    document_number  VARCHAR(100),
    issue_date       DATE,
    expiry_date      DATE,
    status             document_status DEFAULT 'uploaded',
    rejection_reason   TEXT,
    verified_by        UUID REFERENCES users(id),
    verified_at        TIMESTAMPTZ,
    verification_notes TEXT,
    expiry_alert_30_sent  BOOLEAN DEFAULT FALSE,
    expiry_alert_60_sent  BOOLEAN DEFAULT FALSE,
    expiry_alert_90_sent  BOOLEAN DEFAULT FALSE,
    is_archived  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS placements (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_request_id  UUID NOT NULL REFERENCES job_requests(id),
    candidate_id    UUID NOT NULL REFERENCES candidates(id),
    employer_id     UUID NOT NULL REFERENCES employers(id),
    placement_type   VARCHAR(1) NOT NULL CHECK (placement_type IN ('A', 'B')),
    current_stage_a  placement_stage_a,
    current_stage_b  placement_stage_b,
    visibility_stage  INTEGER DEFAULT 0 CHECK (visibility_stage IN (0, 1, 2)),
    match_score  INTEGER CHECK (match_score BETWEEN 0 AND 100),
    match_type   VARCHAR(20) DEFAULT 'manual',
    matched_by   UUID REFERENCES users(id),
    matched_at   TIMESTAMPTZ,
    contract_signed       BOOLEAN DEFAULT FALSE,
    contract_signed_at    TIMESTAMPTZ,
    contract_document_id  UUID,
    payment_confirmed     BOOLEAN DEFAULT FALSE,
    payment_confirmed_at  TIMESTAMPTZ,
    payment_amount        DECIMAL(10,2),
    interview_scheduled_at  TIMESTAMPTZ,
    interview_conducted_at  TIMESTAMPTZ,
    selection_confirmed_at  TIMESTAMPTZ,
    igi_submitted_at        DATE,
    igi_approved_at         DATE,
    igi_reference           VARCHAR(100),
    visa_submitted_at       DATE,
    visa_approved_at        DATE,
    visa_number             VARCHAR(100),
    flight_date             DATE,
    flight_number           VARCHAR(50),
    arrived_at              DATE,
    employment_start_date   DATE,
    interview_date      DATE,
    selection_date      DATE,
    new_job_start_date  DATE,
    guarantee_expiry_date     DATE,
    replacement_requested     BOOLEAN DEFAULT FALSE,
    replacement_placement_id  UUID REFERENCES placements(id),
    admin_notes       TEXT,
    rejection_reason  TEXT,
    cancelled_at      TIMESTAMPTZ,
    completed_at      TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (job_request_id, candidate_id)
);

-- Add FK from placements to documents (deferrable) — safe if already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_placement_contract_doc'
    ) THEN
        ALTER TABLE placements
            ADD CONSTRAINT fk_placement_contract_doc
            FOREIGN KEY (contract_document_id) REFERENCES documents(id)
            DEFERRABLE INITIALLY DEFERRED;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS placement_stage_history (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_id  UUID NOT NULL REFERENCES placements(id) ON DELETE CASCADE,
    old_stage     TEXT,
    new_stage     TEXT NOT NULL,
    notes         TEXT,
    stage_date    DATE,
    stage_data    JSONB,
    changed_by    UUID REFERENCES users(id),
    changed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS migration_clients (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  UUID UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    phone             VARCHAR(50),
    email             VARCHAR(255),
    nationality       VARCHAR(100),
    current_location  VARCHAR(255),
    requestor_name          VARCHAR(255),
    requestor_phone         VARCHAR(50),
    requestor_email         VARCHAR(255),
    requestor_relationship  VARCHAR(100),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS migration_cases (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id  UUID NOT NULL REFERENCES migration_clients(id),
    service_type  migration_service_type NOT NULL,
    status        migration_case_status DEFAULT 'received',
    result        migration_case_result DEFAULT 'pending',
    description  TEXT,
    urgency      VARCHAR(20) DEFAULT 'normal',
    estimated_cost         DECIMAL(10,2),
    cost_communicated_at   TIMESTAMPTZ,
    payment_status         VARCHAR(50) DEFAULT 'unpaid',
    documents_requested     TEXT[],
    documents_requested_at  TIMESTAMPTZ,
    final_answer        TEXT,
    answer_received_at  TIMESTAMPTZ,
    next_deadline       DATE,
    assigned_to  UUID REFERENCES users(id),
    admin_notes  TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW(),
    closed_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS migration_case_history (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id    UUID NOT NULL REFERENCES migration_cases(id) ON DELETE CASCADE,
    old_status migration_case_status,
    new_status migration_case_status NOT NULL,
    notes      TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type      notification_type NOT NULL DEFAULT 'info',
    category  notification_category NOT NULL,
    title     VARCHAR(255) NOT NULL,
    message   TEXT NOT NULL,
    entity_type  VARCHAR(50),
    entity_id    UUID,
    is_read   BOOLEAN DEFAULT FALSE,
    read_at   TIMESTAMPTZ,
    email_sent     BOOLEAN DEFAULT FALSE,
    email_sent_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_type  VARCHAR(20) NOT NULL,
    payer_id  UUID NOT NULL,
    placement_id       UUID REFERENCES placements(id),
    migration_case_id  UUID REFERENCES migration_cases(id),
    invoice_number  VARCHAR(50) UNIQUE,
    invoice_date    DATE DEFAULT CURRENT_DATE,
    due_date        DATE,
    subtotal   DECIMAL(10,2) NOT NULL,
    vat_rate   DECIMAL(5,2) DEFAULT 19.00,
    vat_amount DECIMAL(10,2),
    total      DECIMAL(10,2) NOT NULL,
    currency   VARCHAR(10) DEFAULT 'EUR',
    status   VARCHAR(20) DEFAULT 'draft',
    paid_at  TIMESTAMPTZ,
    notes    TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_log (
    id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  UUID REFERENCES users(id),
    action       VARCHAR(100) NOT NULL,
    entity_type  VARCHAR(50) NOT NULL,
    entity_id    UUID NOT NULL,
    old_value  JSONB,
    new_value  JSONB,
    ip_address  VARCHAR(45),
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXURI (IF NOT EXISTS)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_tokens(token);

CREATE INDEX IF NOT EXISTS idx_employers_user ON employers(user_id);
CREATE INDEX IF NOT EXISTS idx_employers_status ON employers(status);
CREATE INDEX IF NOT EXISTS idx_employers_category ON employers(category);
CREATE INDEX IF NOT EXISTS idx_employers_cui ON employers(cui);
CREATE INDEX IF NOT EXISTS idx_employers_county ON employers(county);

CREATE INDEX IF NOT EXISTS idx_agencies_user ON agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_agencies_status ON agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_country ON agencies(country);

CREATE INDEX IF NOT EXISTS idx_candidates_user ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_agency ON candidates(agency_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_type ON candidates(candidate_type);
CREATE INDEX IF NOT EXISTS idx_candidates_nationality ON candidates(nationality);
CREATE INDEX IF NOT EXISTS idx_candidates_cor ON candidates(target_cor_code);
CREATE INDEX IF NOT EXISTS idx_candidates_origin ON candidates(origin_country);

CREATE INDEX IF NOT EXISTS idx_jobs_employer ON job_requests(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON job_requests(category);
CREATE INDEX IF NOT EXISTS idx_jobs_cor ON job_requests(cor_code);

CREATE INDEX IF NOT EXISTS idx_placements_job ON placements(job_request_id);
CREATE INDEX IF NOT EXISTS idx_placements_candidate ON placements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_placements_employer ON placements(employer_id);
CREATE INDEX IF NOT EXISTS idx_placements_type ON placements(placement_type);
CREATE INDEX IF NOT EXISTS idx_placements_stage_a ON placements(current_stage_a);
CREATE INDEX IF NOT EXISTS idx_placements_stage_b ON placements(current_stage_b);
CREATE INDEX IF NOT EXISTS idx_placements_visibility ON placements(visibility_stage);

CREATE INDEX IF NOT EXISTS idx_docs_owner ON documents(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON documents(document_type);
CREATE INDEX IF NOT EXISTS idx_docs_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_docs_expiry ON documents(expiry_date) WHERE expiry_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_migration_cases_client ON migration_cases(client_id);
CREATE INDEX IF NOT EXISTS idx_migration_cases_status ON migration_cases(status);
CREATE INDEX IF NOT EXISTS idx_migration_cases_service ON migration_cases(service_type);
CREATE INDEX IF NOT EXISTS idx_migration_cases_assigned ON migration_cases(assigned_to);

CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at DESC);

-- ============================================================
-- VIEWS (CREATE OR REPLACE — always safe)
-- ============================================================

CREATE OR REPLACE VIEW v_admin_stats AS
SELECT
    (SELECT COUNT(*) FROM candidates WHERE status = 'pending_validation')                    AS pending_candidates,
    (SELECT COUNT(*) FROM employers  WHERE status = 'pending_validation')                    AS pending_employers,
    (SELECT COUNT(*) FROM agencies   WHERE status = 'pending_validation')                    AS pending_agencies,
    (SELECT COUNT(*) FROM migration_cases WHERE status NOT IN ('closed'))                    AS active_migration_cases,
    (SELECT COUNT(*) FROM placements WHERE completed_at IS NULL AND cancelled_at IS NULL)    AS active_placements,
    (SELECT COUNT(*) FROM documents  WHERE status = 'pending')                               AS pending_documents,
    (SELECT COUNT(*) FROM documents  WHERE expiry_date BETWEEN NOW() AND NOW() + INTERVAL '90 days'
                                        AND status NOT IN ('expired','renewed'))             AS expiring_documents_90d,
    (SELECT COUNT(*) FROM job_requests WHERE status = 'open')                                AS open_jobs;

CREATE OR REPLACE VIEW v_placements_pipeline AS
SELECT
    p.id,
    p.placement_type,
    p.visibility_stage,
    p.match_score,
    p.match_type,
    p.current_stage_a,
    p.current_stage_b,
    p.contract_signed,
    p.payment_confirmed,
    c.id                  AS candidate_id,
    c.candidate_type,
    c.origin_country,
    c.residence_country,
    c.target_position_name,
    c.qualification_level,
    CASE WHEN p.visibility_stage >= 2
        THEN c.first_name || ' ' || c.last_name
        ELSE '*** Confidential ***'
    END                   AS candidate_name,
    CASE WHEN p.visibility_stage >= 2 THEN c.phone ELSE NULL END AS candidate_phone,
    CASE WHEN p.visibility_stage >= 2 THEN c.email ELSE NULL END AS candidate_email,
    e.id                  AS employer_id,
    e.category            AS employer_category,
    e.city                AS employer_city,
    e.county              AS employer_county,
    e.activity_domain,
    CASE WHEN p.visibility_stage >= 2
        THEN e.company_name
        ELSE '*** Confidential ***'
    END                   AS employer_name,
    p.igi_submitted_at,
    p.igi_approved_at,
    p.visa_submitted_at,
    p.visa_approved_at,
    p.flight_date,
    p.arrived_at,
    p.employment_start_date,
    p.interview_date,
    p.selection_date,
    p.new_job_start_date,
    p.created_at
FROM placements p
JOIN candidates c ON p.candidate_id = c.id
JOIN employers  e ON p.employer_id  = e.id
WHERE p.completed_at IS NULL
  AND p.cancelled_at IS NULL;

CREATE OR REPLACE VIEW v_expiring_documents AS
SELECT
    d.*,
    CASE
        WHEN d.owner_type = 'candidate' THEN c.first_name || ' ' || c.last_name
        WHEN d.owner_type = 'employer'  THEN e.company_name
        WHEN d.owner_type = 'agency'    THEN ag.agency_name
        ELSE 'N/A'
    END                                     AS owner_name,
    (d.expiry_date - CURRENT_DATE)::INTEGER AS days_until_expiry
FROM documents d
LEFT JOIN candidates c  ON d.owner_type = 'candidate' AND d.owner_id = c.id
LEFT JOIN employers  e  ON d.owner_type = 'employer'  AND d.owner_id = e.id
LEFT JOIN agencies   ag ON d.owner_type = 'agency'    AND d.owner_id = ag.id
WHERE d.expiry_date IS NOT NULL
  AND d.expiry_date > CURRENT_DATE
  AND d.status NOT IN ('expired', 'renewed')
ORDER BY d.expiry_date ASC;

CREATE OR REPLACE VIEW v_employer_change_warnings AS
SELECT
    c.id,
    c.first_name,
    c.last_name,
    c.origin_country,
    c.current_employer_name,
    c.current_employer_start_date,
    c.departure_reason,
    c.departure_date,
    c.work_permit_expiry,
    (CURRENT_DATE - c.current_employer_start_date)::INTEGER AS days_with_employer,
    CASE
        WHEN c.current_employer_start_date IS NOT NULL
             AND (CURRENT_DATE - c.current_employer_start_date) < 365
             AND c.departure_reason = 'resignation'
        THEN TRUE
        ELSE FALSE
    END AS has_under_1year_warning
FROM candidates c
WHERE c.candidate_type = 'type2_romania_fulltime'
  AND c.status != 'draft';

CREATE OR REPLACE VIEW v_agency_performance AS
SELECT
    ag.id,
    ag.agency_name,
    ag.country,
    ag.commission_rate,
    ag.status,
    COUNT(DISTINCT c.id)                                                           AS total_candidates,
    COUNT(DISTINCT p.id)                                                           AS total_placements,
    COUNT(DISTINCT p.id) FILTER (WHERE p.completed_at IS NOT NULL)                AS completed_placements,
    ROUND(
        COUNT(DISTINCT p.id) FILTER (WHERE p.completed_at IS NOT NULL)::NUMERIC
        / NULLIF(COUNT(DISTINCT p.id), 0) * 100, 1
    )                                                                              AS success_rate_pct,
    ROUND(AVG(p.match_score)::NUMERIC, 1)                                         AS avg_match_score
FROM agencies ag
LEFT JOIN candidates c ON c.agency_id = ag.id
LEFT JOIN placements p ON p.candidate_id = c.id
GROUP BY ag.id, ag.agency_name, ag.country, ag.commission_rate, ag.status;

-- ============================================================
-- DATE INIȚIALE (safe — ON CONFLICT DO NOTHING)
-- ============================================================

INSERT INTO users (email, password_hash, name, role, is_active, is_email_verified)
VALUES (
    'admin@gjc.ro',
    'CHANGE_ON_FIRST_LOGIN',
    'Administrator GJC',
    'admin',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;
