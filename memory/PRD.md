# GJC (Global Job Connect) Platform - Product Requirements Document

## Original Problem Statement
Build a complex B2B and B2C recruitment and immigration ecosystem that connects companies, candidates, and partner agencies. The platform automates workflows like visa approvals and document processing using AI.

## Architecture Overview

### Hybrid Database Model
- **PostgreSQL 15** (+ pgvector extension): Transactional data - jobs, placements, visa processes, relocation tickets, invoices
- **MongoDB**: Profile data - users, candidates, employers, documents, chat history

### Backend: FastAPI (Python)
- RESTful API with versioned endpoints (`/api/v1/gjc/*`)
- Async database operations with `asyncpg` (PostgreSQL) and `motor` (MongoDB)

### AI Matching Engine
- **Model**: OpenAI `text-embedding-3-small`
- **Vector Dimensions**: 1536
- **Storage**: PostgreSQL with `pgvector` extension
- **Similarity Metric**: Cosine distance

## User Personas & Portals

### 1. Company Portal
- Create and manage job postings
- View AI-matched candidates with match scores
- Track placement pipeline (Kanban view)
- Monitor visa and relocation progress

### 2. Agency Portal  
- Batch upload candidates
- Browse available jobs
- Apply candidates to jobs (single or bulk)
- View performance metrics

### 3. Candidate Portal
- View matching jobs
- Track application status in real-time
- Receive status updates in Romanian

### 4. Admin Portal (God View)
- Global dashboard with platform metrics
- Manual status transitions with audit logging
- Visa and relocation management
- Complete audit trail

## Implemented Features (Phase P0) ✅

### Date: March 14, 2026

#### Database Layer (`db_config.py`)
- [x] Dual database connection management (PostgreSQL + MongoDB)
- [x] Connection pooling for PostgreSQL (asyncpg)
- [x] Health check endpoints
- [x] User/Company/Candidate sync utilities

#### AI Matching Service (`ai_matching_service.py`)
- [x] OpenAI embedding generation (text-embedding-3-small, 1536 dims)
- [x] Candidate profile text builder
- [x] Job description text builder
- [x] pgvector storage and retrieval
- [x] Semantic similarity search
- [x] Match score calculation with levels (EXCELLENT/HIGH/GOOD/MODERATE/LOW)

#### Pipeline Service (`pipeline_service.py`)
- [x] PlacementService: CRUD + status transitions
- [x] JobService: Create, list, update jobs
- [x] VisaProcessService: IGI submission, approval, embassy scheduling
- [x] RelocationService: Flight booking, accommodation, arrival tracking
- [x] Status validation with allowed transitions
- [x] Audit logging for all changes

#### API Routes (`gjc_platform_routes.py`)
- [x] Health endpoint: `GET /api/v1/gjc/health`
- [x] Company Portal:
  - `POST /api/v1/gjc/company/jobs` - Create job with embedding
  - `GET /api/v1/gjc/company/jobs` - List company jobs
  - `GET /api/v1/gjc/company/jobs/{id}` - Job details
  - `GET /api/v1/gjc/company/jobs/{id}/candidates` - AI-matched candidates
  - `GET /api/v1/gjc/company/pipeline` - Kanban view
  - `GET /api/v1/gjc/company/tracking/{id}` - Placement tracking
- [x] Agency Portal:
  - `POST /api/v1/gjc/agency/candidates/batch` - Batch upload
  - `GET /api/v1/gjc/agency/jobs/available` - Available jobs
  - `POST /api/v1/gjc/agency/apply` - Single application
  - `POST /api/v1/gjc/agency/apply/bulk` - Bulk applications
  - `GET /api/v1/gjc/agency/performance` - Metrics
- [x] Candidate Portal:
  - `GET /api/v1/gjc/candidate/matching-jobs` - Matching jobs
  - `GET /api/v1/gjc/candidate/status/{id}` - Application status
- [x] Admin Portal:
  - `GET /api/v1/gjc/admin/dashboard` - Global metrics
  - `POST /api/v1/gjc/admin/placement/{id}/status` - Status transition
  - `POST /api/v1/gjc/admin/visa/{id}/*` - Visa process management
  - `POST /api/v1/gjc/admin/relocation/{id}/*` - Relocation management
  - `GET /api/v1/gjc/admin/audit-log` - Audit trail
- [x] Matching Utilities:
  - `POST /api/v1/gjc/matching/generate-embedding` - Generate embedding
  - `GET /api/v1/gjc/matching/score` - Calculate match score

## API Testing Results

**Test Date**: March 14, 2026
**Result**: 100% (20/20 tests passed)
**Report**: `/app/test_reports/iteration_16.json`

## Database Schema

### PostgreSQL Tables
- `users` - Platform users with roles
- `companies` - Employer companies
- `agencies` - Recruitment agencies
- `candidates` - Worker candidates (with profile_embedding vector)
- `jobs` - Job postings (with job_embedding vector)
- `placements` - Job applications/placements
- `visa_processes` - Visa application tracking
- `relocation_tickets` - Relocation logistics
- `status_audit_log` - Change history
- `invoices` / `invoice_items` - Billing

### MongoDB Collections
- `users` - User authentication
- `candidate_profiles` - Detailed candidate data
- `employer_profiles` - Employer profiles
- `agency_profiles` - Agency profiles
- `documents` - Uploaded documents
- `chat_history` - Paula AI assistant conversations

## Environment Configuration

### Backend (.env)
```
MONGO_URL=mongodb://...
DB_NAME=...
EMERGENT_LLM_KEY=sk-emergent-...
OPENAI_API_KEY=sk-proj-...  # Direct OpenAI key for embeddings
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gjc_platform
POSTGRES_USER=gjc_admin
POSTGRES_PASSWORD=gjc_secure_2024!
```

## Prioritized Backlog

### P0 - Completed ✅
- [x] Hybrid database setup
- [x] AI matching with pgvector
- [x] Core CRUD APIs
- [x] Status transition pipeline

### P1 - Next Priority
- [ ] Complete visa process workflow (IGI -> Embassy -> Approval)
- [ ] Relocation workflow (Flight -> Arrival -> Onboarding)
- [ ] Document OCR integration (Claude Vision API)
- [ ] MongoDB ↔ PostgreSQL profile sync automation

### P2 - Future
- [ ] Company Portal frontend
- [ ] Agency Portal frontend
- [ ] Candidate Portal frontend
- [ ] Admin Dashboard frontend
- [ ] Real-time notifications
- [ ] Batch processing queue

### P3 - Enhancements
- [ ] Payment/invoice generation
- [ ] Performance analytics
- [ ] Multi-language support
- [ ] Mobile app

## Known Issues

### Production Deployment (BLOCKED)
- Production site `gjc.ro` still serves legacy React app
- Requires Emergent Support intervention for supervisor config update
- Does not affect development/API functionality

## Technical Debt
- None identified in Phase P0

## Files of Reference
- `/app/backend/database/db_config.py` - Database connections
- `/app/backend/database/postgresql_schema.sql` - PostgreSQL schema
- `/app/backend/services/ai_matching_service.py` - AI matching engine
- `/app/backend/services/pipeline_service.py` - Business logic
- `/app/backend/routes/gjc_platform_routes.py` - API endpoints
- `/app/backend/server.py` - FastAPI main app
- `/app/test_reports/iteration_16.json` - Test results
