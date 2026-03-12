# GJC Recruitment Platform - Product Requirements Document

## Project Overview
**Platform:** Global Jobs Consulting (GJC) SaaS Platform  
**Purpose:** Full recruitment and immigration management for Non-EU workers in Romania, Austria, and Serbia  
**Last Updated:** 2026-03-12

---

## 🚀 CURRENT STATUS: Next.js 14 Migration - Phase 3 In Progress

### ✅ Completed (2026-03-12)

**Phase 1: Foundation & Public SEO Pages** ✓
1. **Project Setup** (`/app/frontend-next`)
   - Next.js 14 with App Router
   - TypeScript configuration
   - TailwindCSS with custom theme (navy, coral colors)
   - i18n middleware for 8 languages (ro, en, de, sr, ne, bn, hi, si)
   - next-sitemap configuration

2. **Core Components Created**
   - `Navbar.tsx` - Responsive navbar with language selector, mobile menu
   - `Footer.tsx` - Full footer with contact info, SEO schema markup
   - `ContactForm.tsx` - Client-side form with API integration

3. **Public Pages Migrated (All with SSG & SEO Metadata)**
   - ✅ Homepage (`/[locale]/page.tsx`) - Hero, stats, about, industries, CTA
   - ✅ Employers Page (`/[locale]/employers/page.tsx`)
   - ✅ Candidates Page (`/[locale]/candidates/page.tsx`)
   - ✅ About Page (`/[locale]/about/page.tsx`)
   - ✅ Contact Page (`/[locale]/contact/page.tsx`)
   - ✅ Blog Page (`/[locale]/blog/page.tsx`)
   - ✅ Industries Index (`/[locale]/industries/page.tsx`)
   - ✅ Industry Detail Pages (`/[locale]/industries/[industry]/page.tsx`) - With `generateStaticParams`

4. **SEO Implementation**
   - `generateMetadata` on all pages
   - Alternates/hreflang for all 8 languages
   - OpenGraph tags
   - Canonical URLs
   - Sitemap auto-generation

5. **Translation Dictionaries**
   - All 8 languages: ro, en, de, sr, ne, bn, hi, si
   - Located in `/app/frontend-next/i18n/dictionaries/`

---

**Phase 2: Authentication & Dashboards** ✓ (Completed 2026-03-12)

1. **Authentication System**
   - `AuthContext.tsx` - Auth provider with login, register, logout, Google OAuth
   - `Providers.tsx` - Wrapper component with AuthProvider and Toaster
   - JWT session management via HTTP-only cookies
   - Google OAuth integration via Emergent Auth

2. **Auth Pages Created**
   - ✅ Login Page (`/login`) - Email/password + Google login
   - ✅ Register Page (`/register`) - With account type selection via query param
   - ✅ My Account Page (`/my-account`) - Service selection hub (4 card types)
   - ✅ Auth Callback (`/auth/callback`) - Google OAuth callback handler

3. **Protected Dashboard Pages**
   - ✅ Candidate Dashboard (`/portal/candidate`) - Profile progress, documents, applications
   - ✅ Employer Dashboard (`/portal/employer`) - Company profile, job requests, candidates
   - ✅ Student Dashboard (`/portal/student`) - Study application status
   - ✅ Immigration Dashboard (`/portal/immigration`) - Immigration services status
   - ✅ Admin Dashboard (`/admin`) - Platform management, user validation

4. **Route Protection**
   - `ProtectedLayout.tsx` - HOC for protected routes with role checking
   - Middleware updated to bypass i18n for auth/dashboard routes
   - Automatic redirect to login for unauthenticated users
   - Role-based access control (admin routes restricted)

5. **UI Components Added**
   - Button, Input, Label, Card, Alert, Progress, Sheet, Dropdown Menu

---

**Phase 3: AI Candidate Registration** 🔄 (In Progress 2026-03-12)

1. **Pages Created (Next.js)**
   - ✅ Profile Wizard Page (`/portal/candidate/profile/page.tsx`) - 5-step wizard
   - ✅ Documents Page (`/portal/candidate/documents/page.tsx`) - Document management
   - ✅ Updated Dashboard (`/portal/candidate/page.tsx`) - Real API data

2. **Components Created**
   - ✅ `DocumentUploader.tsx` - File upload with OCR integration

3. **Backend Verification**
   - ✅ All OCR endpoints functional (`/api/auth/candidate/ocr/passport`, `/api/auth/candidate/ocr/cv`)
   - ✅ Profile endpoints functional (`GET/POST /api/portal/candidate/profile`)
   - ✅ Document upload endpoints functional (`POST /api/portal/candidate/documents/upload`)
   - ✅ Dashboard endpoint functional (`GET /api/portal/candidate/dashboard`)

4. **Bug Fixes Applied**
   - ✅ Fixed OCR endpoint paths in DocumentUploader.tsx (from `/portal/...` to `/auth/...`)
   - ✅ Fixed profile save method (from PUT to POST)
   - ✅ Updated logo URLs across login/register pages

5. **Testing Status**
   - ✅ Backend: 100% (13/13 tests passed)
   - ✅ Frontend: 95% (login, dashboard, profile form functional)
   - ⚠️ Minor: Logo visibility issue on white background (design asset issue)

---

### 📋 Upcoming Tasks

1. **Phase 3: Candidate Features** (Remaining)
   - [ ] End-to-end OCR testing with actual passport/CV images
   - [ ] Auto-save functionality in profile wizard
   - [ ] Document expiry notifications

2. **Phase 4: Full Migration**
   - [ ] Switch production frontend from React to Next.js
   - [ ] Set up redirects for old URLs
   - [ ] Configure Supervisor to run Next.js instead of React

---

## Legacy React App Status (Still Active)
The original React SPA (`/app/frontend`) is still serving the live site on port 3000.

## Recent Changes (2026-03-09)

### ✅ Major Navigation & Homepage Redesign - COMPLETE

**Implementation Summary:**
Complete redesign of main navigation and homepage structure to improve UX, SEO and lead generation.

**New Header Structure:**
- **Left:** Company Logo
- **Center:** Home | Employers | Candidates | Industries (dropdown) | How It Works | About Us | Blog | Contact
- **Right:** Login | My Account | **Request Workers** (Primary CTA - red button)

**New Pages Created:**
1. `/solicita-muncitori` (Request Workers) - Lead capture form for employers
2. `/cum-functioneaza` (How It Works) - 5-step process explanation
3. `/industrii/:industry` - Industry-specific landing pages:
   - `/industrii/constructii` (Construction)
   - `/industrii/horeca` (HoReCa/Hospitality)
   - `/industrii/agricultura` (Agriculture)
   - `/industrii/productie` (Manufacturing)
   - `/industrii/logistica` (Logistics)

**Homepage Slider Optimizations:**
- Reduced from 6 slides to 3 slides
- Clear headlines and CTAs per slide
- Mobile: Static images instead of video
- Slide 1: "Muncitori Internaționali pentru Companii Românești" → CTA: "Solicită Muncitori"
- Slide 2: "Soluții de Forță de Muncă pentru Multiple Industrii" → CTA: "Explorează Industriile"
- Slide 3: "Partenerul Tău de Încredere în Recrutare" → CTA: "Programează Consultația"

**Backend:**
- New endpoint: `POST /api/leads/request-workers` - Captures employer leads
- Email notification on new lead submission

**Files Modified/Created:**
- `/app/frontend/src/components/Navbar.jsx` - Complete rewrite
- `/app/frontend/src/components/HeroSlider.jsx` - Optimized to 3 slides
- `/app/frontend/src/pages/RequestWorkersPage.jsx` - NEW
- `/app/frontend/src/pages/HowItWorksPage.jsx` - NEW
- `/app/frontend/src/pages/IndustryPage.jsx` - NEW
- `/app/frontend/src/pages/CandidateRegisterPage.jsx` - Simplified (fixed babel error)
- `/app/backend/server.py` - Added leads endpoints

---

### ✅ Design System Conflict Resolution (2026-03-06) - COMPLETE
**Issue:** Previous agent made conflicting design changes - first updated global styles, then created separate homepage styles without reverting global changes.

**Resolution (Opțiunea B implementată):**
- ✅ Reverted `index.css` to original (Montserrat font, original navy variables)
- ✅ Reverted `tailwind.config.js` to original configuration
- ✅ Reverted `button.jsx` to original Shadcn/UI version
- ✅ Preserved `/app/frontend/src/styles/gjc-homepage-new.css` intact
- ✅ Imported `gjc-homepage-new.css` ONLY in `HomePage.jsx`
- ✅ Verified all portals work correctly: `/login`, `/register`, `/admin`, `/portal/candidate`, `/portal/employer`
- ✅ No CSS conflicts between global styles and `gjc-new-*` classes

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
- **AI/OCR:** Claude Sonnet 4.5 (via Emergent LLM Key)

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

### ✅ Phase 2.5 - AI-Powered Candidate Registration (COMPLETE - 2026-03-06)
- [x] **7-Step Registration Wizard** (`/register/candidate`)
  - Step 1: Welcome screen with 3 icons
  - Step 2: Document upload (passport, CV, diploma, criminal record)
  - Step 3: AI processing animation
  - Step 4: Confirm extracted data with status indicators
  - Step 5: Fill missing fields (account, personal, professional)
  - Step 6: Document checklist
  - Step 7: Final confirmation with profile score
- [x] **Claude AI OCR Integration**
  - Passport extraction: name, DOB, citizenship, passport number, expiry, sex
  - CV extraction: email, phone, profession, experience, employers, languages
  - Field status indicators (green/yellow/red)
- [x] **Auto-save** every 30 seconds with localStorage draft persistence
- [x] **Profile Score Calculator** with improvement suggestions

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
- [x] **Admin Dashboard UI Pages** ✅ COMPLETE - 2026-03-05
  - Admin Candidates page - listare, căutare, validare/respingere
  - Admin Employers page - listare, detalii companie, eligibilitate IGI
  - Admin Jobs page - statistici status, matching candidați, schimbare status
  - Admin Projects page - pipeline vizual, actualizare stadii, note
  - Admin Users page - listare toți utilizatorii, filtrare pe rol
  - Admin Documents page - vizualizare toate documentele, download

### ⏳ Phase 4 - Document Management & Expiry
- [ ] Document expiry tracking and alerts
- [ ] Document verification workflow in Admin
- [ ] Bulk document operations
- [ ] Background job for expiry alert emails

### 📋 Backlog (P2)
- [ ] Stripe payment integration
- [x] ~~Full Admin CRUD for users/projects/jobs~~ ✅ COMPLETE - 2026-03-05
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
- POST `/candidate/ocr/passport` - Extract data from passport (AI OCR)
- POST `/candidate/ocr/cv` - Extract data from CV (AI OCR)
- POST `/candidate/register-with-profile` - Register candidate with pre-filled profile

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
4. **Claude Sonnet 4.5** - Document OCR extraction (passport, CV)

---

## Notes

- Profile validation workflow: draft → pending_validation → validated
- IGI eligibility requirements apply only to Romanian employers
- Document types mapped to specific profile fields
- All file uploads limited to 50MB
- Supported formats: PDF, JPG, PNG, WEBP, MP4, MOV
- OCR extraction uses Claude AI via Emergent LLM Key
- Candidate registration auto-saves every 30 seconds
