-- GJC Platform PostgreSQL Schema
-- Hybrid Architecture: PostgreSQL for transactional data, MongoDB for profiles/documents

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- =====================================================
-- ENUMS (Status Types)
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'COMPANY', 'AGENCY', 'CANDIDATE');

-- Application/Placement status (Pâlnia principală)
CREATE TYPE placement_status AS ENUM (
    'PENDING',              -- Candidat propus
    'MATCHED',              -- AI a confirmat potrivirea
    'EMPLOYER_REVIEW',      -- Angajatorul analizează
    'OFFER_SENT',           -- Ofertă trimisă
    'OFFER_ACCEPTED',       -- Ofertă acceptată
    'DOCUMENTS_PENDING',    -- Așteptăm documente
    'DOCUMENTS_VERIFIED',   -- Documente verificate
    'VISA_IN_PROGRESS',     -- Proces viză activ
    'VISA_APPROVED',        -- Viză aprobată
    'RELOCATING',           -- În relocare
    'ACTIVE',               -- Angajat activ
    'COMPLETED',            -- Contract finalizat
    'REJECTED',             -- Respins
    'CANCELLED'             -- Anulat
);

-- Visa process status
CREATE TYPE visa_status AS ENUM (
    'NOT_STARTED',
    'IGI_SUBMISSION',       -- Depunere IGI
    'IGI_PENDING',          -- Așteptare aprobare IGI
    'IGI_APPROVED',         -- IGI aprobat
    'IGI_REJECTED',         -- IGI respins
    'EMBASSY_SCHEDULED',    -- Programare ambasadă
    'EMBASSY_INTERVIEW',    -- Interviu ambasadă
    'VISA_APPROVED',        -- Viză aprobată
    'VISA_REJECTED',        -- Viză respinsă
    'WORK_PERMIT_ISSUED'    -- Permis de muncă emis
);

-- Relocation status
CREATE TYPE relocation_status AS ENUM (
    'NOT_STARTED',
    'FLIGHT_BOOKED',        -- Zbor rezervat
    'IN_TRANSIT',           -- În tranzit
    'ARRIVED',              -- Sosit
    'ACCOMMODATION_ASSIGNED', -- Cazare alocată
    'ONBOARDING',           -- Onboarding
    'COMPLETED'             -- Finalizat
);

-- Invoice status
CREATE TYPE invoice_status AS ENUM (
    'DRAFT',
    'PENDING',
    'PAID',
    'OVERDUE',
    'CANCELLED'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (links to MongoDB user profiles via mongo_user_id)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mongo_user_id VARCHAR(50) UNIQUE NOT NULL,  -- Reference to MongoDB _id
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies (angajatori)
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mongo_profile_id VARCHAR(50) UNIQUE,  -- Reference to MongoDB employer_profile
    
    -- Basic info (synced from MongoDB)
    name VARCHAR(255) NOT NULL,
    cui VARCHAR(20),
    country VARCHAR(3) DEFAULT 'RO',
    
    -- Billing info
    billing_address TEXT,
    billing_email VARCHAR(255),
    vat_number VARCHAR(50),
    
    -- Stats
    total_positions_requested INT DEFAULT 0,
    total_positions_filled INT DEFAULT 0,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agencies (parteneri B2B)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mongo_profile_id VARCHAR(50) UNIQUE,
    
    -- Basic info
    name VARCHAR(255) NOT NULL,
    country VARCHAR(3) NOT NULL,
    license_number VARCHAR(100),
    
    -- Contact
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Stats
    total_candidates_submitted INT DEFAULT 0,
    total_placements INT DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Commission settings
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    
    -- Status
    is_verified BOOLEAN DEFAULT false,
    verification_date TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates (reference to MongoDB profiles)
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mongo_profile_id VARCHAR(50) UNIQUE NOT NULL,  -- Reference to MongoDB candidate_profile
    agency_id UUID REFERENCES agencies(id),  -- Optional: if submitted by agency
    
    -- Basic synced info
    full_name VARCHAR(255),
    nationality VARCHAR(3),
    
    -- AI Matching embedding (1536 dimensions for OpenAI)
    profile_embedding vector(1536),
    embedding_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_available BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs (cereri de personal)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Job details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    positions_count INT NOT NULL DEFAULT 1,
    positions_filled INT DEFAULT 0,
    
    -- Requirements
    required_skills TEXT[],
    required_experience_years INT DEFAULT 0,
    required_languages TEXT[],
    
    -- Compensation
    salary_min DECIMAL(10,2),
    salary_max DECIMAL(10,2),
    salary_currency VARCHAR(3) DEFAULT 'EUR',
    benefits TEXT,
    
    -- Location
    work_country VARCHAR(3) DEFAULT 'RO',
    work_city VARCHAR(100),
    
    -- Timeline
    start_date DATE,
    deadline DATE,
    
    -- AI Matching embedding
    job_embedding vector(1536),
    embedding_updated_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_filled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FLOW TABLES (Pipeline Principal)
-- =====================================================

-- Applications/Placements (legătura Candidat-Job)
CREATE TABLE placements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id),  -- If submitted via agency
    
    -- AI Matching
    match_score DECIMAL(5,2),  -- 0-100 percentage
    match_reasons JSONB,       -- AI explanation
    
    -- Status tracking
    status placement_status DEFAULT 'PENDING',
    status_history JSONB DEFAULT '[]'::jsonb,
    
    -- Offer details
    offered_salary DECIMAL(10,2),
    offer_sent_at TIMESTAMP WITH TIME ZONE,
    offer_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Notes
    company_notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(job_id, candidate_id)
);

-- Visa Processes
CREATE TABLE visa_processes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_id UUID REFERENCES placements(id) ON DELETE CASCADE,
    
    -- Status
    status visa_status DEFAULT 'NOT_STARTED',
    status_history JSONB DEFAULT '[]'::jsonb,
    
    -- IGI (Inspectoratul General pentru Imigrări)
    igi_submission_date DATE,
    igi_reference_number VARCHAR(100),
    igi_approval_date DATE,
    igi_expiry_date DATE,
    
    -- Embassy
    embassy_country VARCHAR(3),
    embassy_appointment_date TIMESTAMP WITH TIME ZONE,
    embassy_interview_date TIMESTAMP WITH TIME ZONE,
    
    -- Visa
    visa_approval_date DATE,
    visa_number VARCHAR(100),
    visa_expiry_date DATE,
    
    -- Work Permit
    work_permit_number VARCHAR(100),
    work_permit_issue_date DATE,
    work_permit_expiry_date DATE,
    
    -- Documents (references to MongoDB documents)
    mongo_document_ids TEXT[],
    
    -- Notes
    notes TEXT,
    rejection_reason TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Relocation Tracking
CREATE TABLE relocation_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    placement_id UUID REFERENCES placements(id) ON DELETE CASCADE,
    
    -- Status
    status relocation_status DEFAULT 'NOT_STARTED',
    
    -- Flight details
    departure_city VARCHAR(100),
    departure_date TIMESTAMP WITH TIME ZONE,
    arrival_city VARCHAR(100),
    arrival_date TIMESTAMP WITH TIME ZONE,
    flight_number VARCHAR(50),
    booking_reference VARCHAR(100),
    
    -- Layovers
    layovers JSONB DEFAULT '[]'::jsonb,
    
    -- Airport pickup
    pickup_arranged BOOLEAN DEFAULT false,
    pickup_contact_name VARCHAR(255),
    pickup_contact_phone VARCHAR(50),
    
    -- Accommodation
    accommodation_address TEXT,
    accommodation_type VARCHAR(50),  -- 'company_housing', 'shared', 'private'
    accommodation_check_in DATE,
    
    -- Costs
    flight_cost DECIMAL(10,2),
    accommodation_cost DECIMAL(10,2),
    
    -- Notes
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BILLING/INVOICING
-- =====================================================

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Parties
    company_id UUID REFERENCES companies(id),
    agency_id UUID REFERENCES agencies(id),
    
    -- Type
    invoice_type VARCHAR(50) NOT NULL,  -- 'recruitment_fee', 'agency_commission', etc.
    
    -- Amounts
    subtotal DECIMAL(12,2) NOT NULL,
    vat_rate DECIMAL(5,2) DEFAULT 19.00,
    vat_amount DECIMAL(12,2),
    total_amount DECIMAL(12,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    
    -- Status
    status invoice_status DEFAULT 'DRAFT',
    
    -- Dates
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    
    -- Payment
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Details
    line_items JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items detail
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    placement_id UUID REFERENCES placements(id),
    
    description TEXT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AI MATCHING LOGS
-- =====================================================

-- AI Matching history
CREATE TABLE ai_matching_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES jobs(id),
    candidate_id UUID REFERENCES candidates(id),
    
    -- Matching details
    match_score DECIMAL(5,2),
    match_vector_distance DECIMAL(10,6),
    match_explanation JSONB,
    
    -- Performance
    processing_time_ms INT,
    model_used VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADMIN/AUDIT
-- =====================================================

-- Status change audit log
CREATE TABLE status_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL,  -- 'placement', 'visa_process', 'relocation'
    entity_id UUID NOT NULL,
    
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_mongo_id ON users(mongo_user_id);
CREATE INDEX idx_users_role ON users(role);

-- Companies
CREATE INDEX idx_companies_user ON companies(user_id);
CREATE INDEX idx_companies_cui ON companies(cui);

-- Agencies
CREATE INDEX idx_agencies_user ON agencies(user_id);
CREATE INDEX idx_agencies_country ON agencies(country);

-- Candidates
CREATE INDEX idx_candidates_user ON candidates(user_id);
CREATE INDEX idx_candidates_agency ON candidates(agency_id);
CREATE INDEX idx_candidates_available ON candidates(is_available);

-- Jobs
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_country ON jobs(work_country);

-- Placements
CREATE INDEX idx_placements_job ON placements(job_id);
CREATE INDEX idx_placements_candidate ON placements(candidate_id);
CREATE INDEX idx_placements_status ON placements(status);
CREATE INDEX idx_placements_agency ON placements(agency_id);

-- Visa processes
CREATE INDEX idx_visa_placement ON visa_processes(placement_id);
CREATE INDEX idx_visa_status ON visa_processes(status);

-- Relocation
CREATE INDEX idx_relocation_placement ON relocation_tickets(placement_id);
CREATE INDEX idx_relocation_status ON relocation_tickets(status);

-- Invoices
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_agency ON invoices(agency_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Vector similarity search indexes (HNSW for fast approximate search)
CREATE INDEX idx_candidates_embedding ON candidates USING hnsw (profile_embedding vector_cosine_ops);
CREATE INDEX idx_jobs_embedding ON jobs USING hnsw (job_embedding vector_cosine_ops);

-- Audit log
CREATE INDEX idx_audit_entity ON status_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_created ON status_audit_log(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_placements_updated_at BEFORE UPDATE ON placements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_visa_processes_updated_at BEFORE UPDATE ON visa_processes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_relocation_updated_at BEFORE UPDATE ON relocation_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function for AI similarity search
CREATE OR REPLACE FUNCTION find_matching_candidates(
    job_embedding_input vector(1536),
    limit_count INT DEFAULT 20,
    min_score DECIMAL DEFAULT 0.7
)
RETURNS TABLE (
    candidate_id UUID,
    mongo_profile_id VARCHAR,
    full_name VARCHAR,
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.mongo_profile_id,
        c.full_name,
        (1 - (c.profile_embedding <=> job_embedding_input))::DECIMAL AS similarity_score
    FROM candidates c
    WHERE c.is_available = true
        AND c.profile_embedding IS NOT NULL
        AND (1 - (c.profile_embedding <=> job_embedding_input)) >= min_score
    ORDER BY c.profile_embedding <=> job_embedding_input
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO status_audit_log (entity_type, entity_id, old_status, new_status, metadata)
        VALUES (TG_TABLE_NAME, NEW.id, OLD.status::VARCHAR, NEW.status::VARCHAR, 
                jsonb_build_object('updated_at', NOW()));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply status logging triggers
CREATE TRIGGER log_placement_status AFTER UPDATE ON placements FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER log_visa_status AFTER UPDATE ON visa_processes FOR EACH ROW EXECUTE FUNCTION log_status_change();
CREATE TRIGGER log_relocation_status AFTER UPDATE ON relocation_tickets FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- =====================================================
-- VIEWS
-- =====================================================

-- Dashboard view: Active placements pipeline
CREATE VIEW v_placement_pipeline AS
SELECT 
    p.id,
    p.status,
    p.match_score,
    p.created_at,
    j.title AS job_title,
    j.positions_count,
    j.positions_filled,
    c.name AS company_name,
    cand.full_name AS candidate_name,
    cand.nationality,
    a.name AS agency_name,
    vp.status AS visa_status,
    rt.status AS relocation_status
FROM placements p
JOIN jobs j ON p.job_id = j.id
JOIN companies c ON j.company_id = c.id
JOIN candidates cand ON p.candidate_id = cand.id
LEFT JOIN agencies a ON p.agency_id = a.id
LEFT JOIN visa_processes vp ON vp.placement_id = p.id
LEFT JOIN relocation_tickets rt ON rt.placement_id = p.id
WHERE p.status NOT IN ('COMPLETED', 'REJECTED', 'CANCELLED');

-- Dashboard view: Company stats
CREATE VIEW v_company_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(DISTINCT j.id) AS total_jobs,
    SUM(j.positions_count) AS total_positions,
    SUM(j.positions_filled) AS filled_positions,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE') AS active_workers,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'VISA_IN_PROGRESS') AS pending_visas
FROM companies c
LEFT JOIN jobs j ON j.company_id = c.id
LEFT JOIN placements p ON p.job_id = j.id
GROUP BY c.id, c.name;

-- Dashboard view: Agency performance
CREATE VIEW v_agency_performance AS
SELECT 
    a.id,
    a.name,
    a.country,
    COUNT(DISTINCT cand.id) AS total_candidates,
    COUNT(DISTINCT p.id) AS total_placements,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE') AS successful_placements,
    AVG(p.match_score) AS avg_match_score,
    ROUND(
        COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'ACTIVE')::DECIMAL / 
        NULLIF(COUNT(DISTINCT p.id), 0) * 100, 2
    ) AS success_rate
FROM agencies a
LEFT JOIN candidates cand ON cand.agency_id = a.id
LEFT JOIN placements p ON p.agency_id = a.id
GROUP BY a.id, a.name, a.country;

COMMENT ON SCHEMA public IS 'GJC Platform - Hybrid Architecture (PostgreSQL + MongoDB)';
