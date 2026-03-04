# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web + Platformă SaaS pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **AI Chat**: OpenAI GPT-4o-mini via Emergent LLM Key (Maria)
- **Auth**: JWT email/password + Google OAuth (Emergent Auth)
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font
- **Multilingv**: Română, English, Deutsch, Srpski

## FAZA 1 - FUNDAȚIA SaaS (COMPLETĂ) ✅

### 1. Sistem Autentificare (03 Mar 2026)
- ✅ JWT-based auth cu email/password
- ✅ Google OAuth via Emergent Auth
- ✅ Roluri: candidate, employer, admin
- ✅ Session management cu cookies httpOnly
- ✅ Admin implicit: admin@gjc.ro / admin123

### 2. Modele de Date
- ✅ Users (user_id, email, name, role, auth_provider)
- ✅ CandidateProfile (profile_id, user_id, personal info, documents, status)
- ✅ EmployerProfile (profile_id, company info, IGI eligibility, status)
- ✅ JobRequest (job_id, employer_id, requirements, conditions)
- ✅ Project (project_id, candidate_id, employer_id, workflow stages)
- ✅ Document (doc_id, owner, file info, expiry tracking)
- ✅ Notification (notification_id, user_id, message, read status)

### 3. Dashboard-uri de bază
- ✅ **Login Page** - email/password + Google OAuth
- ✅ **Register Page** - selector rol (Candidat/Angajator)
- ✅ **Candidate Portal** - dashboard cu stats, profile status, quick actions
- ✅ **Employer Portal** - dashboard cu company status, jobs, projects
- ✅ **Admin Dashboard** - overview complet, pipeline proiecte, stats

### 4. API Endpoints Implementate
**Auth:**
- POST /api/auth/register - înregistrare
- POST /api/auth/login - autentificare
- POST /api/auth/google/session - Google OAuth
- GET /api/auth/me - user curent
- POST /api/auth/logout - deconectare
- POST /api/auth/password/reset-request
- POST /api/auth/password/reset

**Portal Candidat:**
- GET /api/portal/candidate/profile
- POST /api/portal/candidate/profile
- POST /api/portal/candidate/profile/submit
- GET /api/portal/candidate/applications
- GET /api/portal/candidate/dashboard
- GET /api/portal/candidate/notifications

**Portal Angajator:**
- GET /api/portal/employer/profile
- POST /api/portal/employer/profile
- POST /api/portal/employer/profile/submit
- GET /api/portal/employer/jobs
- POST /api/portal/employer/jobs
- GET /api/portal/employer/projects
- GET /api/portal/employer/dashboard

**Admin:**
- GET /api/admin/dashboard
- GET /api/admin/candidates
- PUT /api/admin/candidates/{id}/validate
- GET /api/admin/employers
- PUT /api/admin/employers/{id}/validate
- GET /api/admin/jobs
- GET /api/admin/projects
- POST /api/admin/projects
- PUT /api/admin/projects/{id}/stage
- GET /api/admin/matching/candidates/{job_id}

## BACKLOG - FAZE URMĂTOARE

### FAZA 2 - Portaluri Complete (P0)
- [ ] Formular complet profil candidat (personal, experiență, preferințe)
- [ ] Formular complet profil angajator (companie, eligibilitate IGI)
- [ ] Upload documente (pașaport, CV, diplome, cazier)
- [ ] Crearea cereri de personal cu toate câmpurile
- [ ] Matching engine funcțional cu scor compatibilitate
- [ ] Liste și filtrare în admin (candidați, angajatori, joburi)

### FAZA 3 - Workflow Imigrare (P1)
- [ ] 21 etape de workflow complet
- [ ] Update stage cu notificări automate
- [ ] Timeline vizual pentru progres
- [ ] Tracking documente cu expiry alerts
- [ ] Generare contract PDF
- [ ] Generare factură PDF

### FAZA 4 - Notificări & Storage (P1)
- [ ] Sistem notificări complet (dashboard + email)
- [ ] Integrare AWS S3 pentru documente
- [ ] Email templates pentru fiecare etapă
- [ ] Dashboard notificări în timp real

### P2 - Nice to Have
- [ ] Stripe pentru plăți online
- [ ] reCAPTCHA pe formulare
- [ ] Schema.org structured data
- [ ] Analytics (GA, GSC, Facebook Pixel)
- [ ] CMS pentru blog
- [ ] Landing pages SEO industrii

## Credențiale Test
- **Admin**: admin@gjc.ro / admin123
- **Test Candidat**: test.candidat@example.com / test123

## Fișiere Importante
```
/app/backend/
├── server.py          # Main server + routes existente
├── models.py          # Toate modelele de date
├── auth_routes.py     # Autentificare
├── portal_routes.py   # Portal candidat/angajator
├── admin_routes.py    # Admin dashboard

/app/frontend/src/
├── contexts/AuthContext.jsx   # Auth state management
├── pages/
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── AuthCallback.jsx
│   ├── portal/
│   │   ├── CandidateLayout.jsx
│   │   ├── CandidateDashboard.jsx
│   │   ├── EmployerLayout.jsx
│   │   └── EmployerDashboard.jsx
│   └── admin/
│       ├── AdminLayout.jsx
│       └── AdminDashboard.jsx
```

## Status: ✅ FAZA 1 COMPLETĂ - Fundație SaaS funcțională
