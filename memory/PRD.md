# GJC Recruitment Platform - Product Requirements Document

## Project Overview
**Platform:** Global Jobs Consulting (GJC) SaaS Platform  
**Purpose:** Full recruitment and immigration management for Non-EU workers in Romania, Austria, and Serbia  
**Last Updated:** 2026-03-04

---

## Core Architecture

### Multi-Portal Structure
1. **Public Website** - Marketing and lead generation (existing)
2. **Candidate Portal** - Profile creation, document upload, application tracking
3. **Employer Portal** - Company profile, job requests, candidate matching
4. **Admin Dashboard** - Full CRUD for all entities, validation workflow

### Tech Stack
- **Frontend:** React, TailwindCSS, Shadcn/UI
- **Backend:** FastAPI, Python
- **Database:** MongoDB
- **Storage:** Emergent Object Storage (cloud)
- **Auth:** JWT + Google OAuth (Emergent Auth)

---

## Phase Status

### ✅ Phase 1 - Foundation (COMPLETE)
- [x] JWT email/password authentication
- [x] Google OAuth integration
- [x] User access flow via `/my-account`
- [x] Four account types: candidate, employer, student, immigration_client
- [x] Role-based dashboards for all user types
- [x] Admin panel foundation

### ✅ Phase 2 - Complete Portals (COMPLETE - 2026-03-04)
- [x] **Candidate Profile Form** - All 5 sections implemented:
  - Section 1: Personal Information (name, DOB, gender, religion, citizenship)
  - Section 2: Family (parents, spouse, children)
  - Section 3: Professional Experience (profession, COR code, languages)
  - Section 4: Documents (CV, passport, criminal record, photo, video)
  - Section 5: Additional Info (salary, residence permits)
- [x] **Employer Profile Form** - All 4 sections implemented:
  - Section 1: Company Information (CUI, J number, address, administrator)
  - Section 2: Contact Person
  - Section 3: Documents (CUI certificate, administrator ID, criminal record)
  - Section 4: IGI Eligibility Requirements (Romania only)
- [x] **Cloud Storage Integration** - Emergent Object Storage for documents
- [x] **Profile Validation Workflow** - draft → pending_validation → validated

### ✅ Notification System (COMPLETE - 2026-03-04)
- [x] **In-App Notifications**
  - Bell icon with unread badge in portal header
  - Dropdown panel with notification list
  - Mark as read / Delete functionality
  - 30-second polling for real-time updates
- [x] **Email Notifications** (SMTP configured)
  - HTML email templates for: candidate match, profile validated, profile rejected
  - Automatic email on profile validation events
- [x] **Advanced Matching Algorithm**
  - Profession/COR code matching (30 pts)
  - Experience years (20 pts)
  - Language/English level (20 pts)
  - Nationality preference (15 pts)
  - Age range (10 pts)
  - Gender preference (5 pts)
  - Minimum 60% score to trigger match notification

### 🔄 Phase 3 - Core Workflow (IN PROGRESS)
- [x] **Job Request UI (Employer Portal)** ✅ COMPLETE - 2026-03-04
  - Job list page (`/portal/employer/jobs`) with search functionality
  - Create/Edit job form (`/portal/employer/jobs/new`, `/jobs/:jobId/edit`)
  - All fields: title, COR code, positions, industry, location, experience, nationalities, languages, salary, benefits
  - Delete/Cancel job with confirmation dialog
  - Profile validation check before job creation
- [ ] Candidate-to-Job matching UI (Admin Dashboard)
- [ ] Automated contract PDF generation
- [ ] Automated invoice PDF generation
- [ ] Visual progress tracker for immigration stages

### ⏳ Phase 4 - Document Management & Expiry
- [ ] Document expiry tracking and alerts
- [ ] Document verification workflow in Admin
- [ ] Bulk document operations

### 📋 Backlog (P2)
- [ ] Stripe payment integration
- [ ] Full Admin CRUD for users/projects/jobs
- [ ] SEO landing pages (Construction, HoReCa, etc.)
- [ ] reCAPTCHA on public forms
- [ ] Testimonials section

---

## Database Models

### Users Collection
```javascript
{
  user_id: "user_xxx",
  email: "email@example.com",
  name: "Full Name",
  role: "candidate|employer|student|immigration_client|admin",
  account_type: "candidate|employer|student|immigration_client|admin",
  is_active: true,
  is_verified: false,
  created_at: ISODate()
}
```

### Candidate Profiles Collection
```javascript
{
  profile_id: "cand_xxx",
  user_id: "user_xxx",
  // Section 1 - Personal
  first_name, last_name, country_of_origin, date_of_birth,
  gender, marital_status, religion, citizenship,
  // Section 2 - Family
  father_name, mother_name, spouse_name, children_count, children_ages,
  // Section 3 - Professional
  current_profession, target_position_cor, experience_years,
  worked_abroad, countries_worked_in, languages_known, english_level,
  // Section 4 - Documents (doc_ids)
  cv_doc_id, passport_doc_id, criminal_record_doc_id, passport_photo_doc_id,
  profile_photo_url, video_presentation_url, diploma_doc_ids,
  // Section 5 - Additional
  salary_expectation, existing_residence_permit,
  // Status
  status: "draft|pending_validation|validated|rejected",
  validation_notes
}
```

### Employer Profiles Collection
```javascript
{
  profile_id: "emp_xxx",
  user_id: "user_xxx",
  // Company Info
  company_name, company_cui, company_j_number, address, phone, email,
  administrator_name, country, city, industry, employees_count,
  // Contact
  contact_person, contact_email, contact_phone,
  // Documents (doc_ids)
  cui_certificate_doc_id, administrator_id_doc_id, company_criminal_record_doc_id,
  // IGI Eligibility (Romania)
  has_no_debts, has_no_sanctions, has_min_employees, company_age_over_1_year,
  // Status
  status: "draft|pending_validation|validated|rejected"
}
```

### Documents Collection
```javascript
{
  doc_id: "doc_xxx",
  owner_id: "cand_xxx|emp_xxx",
  owner_type: "candidate|employer|project",
  filename, original_filename, file_type, file_size, storage_path,
  document_type: "passport|cv|diploma|criminal_record|...",
  status: "uploaded|verified|rejected|expired",
  is_deleted: false
}
```

---

## API Endpoints

### Authentication (`/api/auth`)
- POST `/register` - New user registration
- POST `/login` - Email/password login
- GET `/me` - Get current user
- POST `/logout` - End session
- GET `/google/auth` - Start Google OAuth
- GET `/google/callback` - Google OAuth callback
- POST `/google/exchange` - Exchange session for token

### Candidate Portal (`/api/portal/candidate`)
- GET `/profile` - Get profile with documents
- POST `/profile` - Create/update profile
- POST `/profile/submit` - Submit for validation
- POST `/documents/upload` - Upload document
- GET `/documents` - List documents
- DELETE `/documents/{doc_id}` - Delete document
- GET `/dashboard` - Dashboard statistics
- GET `/applications` - Job applications
- GET `/notifications` - User notifications

### Employer Portal (`/api/portal/employer`)
- GET `/profile` - Get company profile
- POST `/profile` - Create/update profile
- POST `/profile/submit` - Submit for validation
- POST `/documents/upload` - Upload document
- GET `/documents` - List documents
- GET `/jobs` - Job requests
- POST `/jobs` - Create job request
- PUT `/jobs/{job_id}` - Update job
- GET `/projects` - Active projects
- GET `/dashboard` - Dashboard statistics

### Admin (`/api/admin`)
- GET `/candidates/pending` - Candidates for validation
- POST `/candidates/{id}/validate` - Approve candidate
- POST `/candidates/{id}/reject` - Reject candidate
- GET `/employers/pending` - Employers for validation
- POST `/employers/{id}/validate` - Approve employer
- POST `/employers/{id}/reject` - Reject employer

---

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gjc.ro | admin123 |
| Test Candidate | test.candidate@example.com | test123 |
| Test Employer | test.employer@example.com | test123 |

---

## Key Integrations

1. **Emergent Object Storage** - Document uploads (cloud)
2. **Emergent Auth** - Google OAuth social login
3. **Emergent LLM (GPT)** - Maria AI Chat Assistant

---

## Notes

- Profile validation workflow: draft → pending_validation → validated
- IGI eligibility requirements apply only to Romanian employers
- Document types mapped to specific profile fields
- All file uploads limited to 50MB
- Supported formats: PDF, JPG, PNG, WEBP, MP4, MOV
