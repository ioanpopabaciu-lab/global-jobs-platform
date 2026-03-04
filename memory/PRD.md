# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web + Platformă SaaS pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională și servicii de imigrare specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **AI Chat**: OpenAI GPT-4o-mini via Emergent LLM Key (Maria)
- **Auth**: JWT email/password + Google OAuth (Emergent Auth)
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font
- **Multilingv**: Română, English, Deutsch, Srpski

---

## FAZA 1 - FUNDAȚIA SaaS (COMPLETĂ) ✅

### 1. Sistem Autentificare
- ✅ JWT-based auth cu email/password
- ✅ Google OAuth via Emergent Auth
- ✅ Session management cu cookies httpOnly

### 2. Pagina "My Account" - Punct Central de Acces (NOU)
- ✅ Buton **"MY ACCOUNT"** în navbar (înlocuiește "Portal Candidați")
- ✅ Pagină intermediară cu 4 carduri de servicii
- ✅ Design responsive și optimizat pentru mobil

### 3. Tipuri de Cont în Sistem
| Account Type | Descriere | Dashboard |
|--------------|-----------|-----------|
| `employer` | Recruit workers for your company | /portal/employer |
| `candidate` | Apply for jobs in Romania | /portal/candidate |
| `student` | Apply to study in Romania | /portal/student |
| `immigration_client` | Visas, residence permits, family reunification | /portal/immigration |
| `admin` | Agency admin | /admin |

### 4. Dashboard-uri Implementate
- ✅ **Candidate Portal** - Dashboard cu stats, status profil
- ✅ **Employer Portal** - Dashboard companie, joburi, proiecte
- ✅ **Student Portal** (NOU) - Application process, timeline, universities
- ✅ **Immigration Services Portal** (NOU) - Visa, residence, family, citizenship
- ✅ **Admin Dashboard** - Overview complet, pipeline proiecte

### 5. Modele de Date
- ✅ Users cu `account_type` field
- ✅ CandidateProfile, EmployerProfile
- ✅ JobRequest, Project, Document, Notification

---

## CREDENȚIALE TEST
- **Admin**: admin@gjc.ro / admin123
- **Test Candidat**: test.candidat@example.com / test123
- **Test Student**: test.student@example.com / test123
- **Test Immigration**: test.immigration@example.com / test123

---

## BACKLOG - FAZE URMĂTOARE

### FAZA 2 - Portaluri Complete (P0) 🟡 NEXT
- [ ] Formular complet profil candidat (personal, experiență, preferințe)
- [ ] Formular complet profil angajator (companie, eligibilitate IGI)
- [ ] Upload documente (pașaport, CV, diplome, cazier)
- [ ] Formular aplicație student
- [ ] Formular cerere servicii imigrare
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

### FAZA 4 - Storage & Notificări (P1)
- [ ] Integrare AWS S3/Cloudflare R2 pentru documente
- [ ] Sistem notificări complet (dashboard + email)
- [ ] Email templates pentru fiecare etapă

### P2 - Nice to Have
- [ ] Stripe pentru plăți online
- [ ] reCAPTCHA pe formulare
- [ ] Schema.org structured data
- [ ] Analytics (GA, GSC, Facebook Pixel)
- [ ] CMS pentru blog

---

## FIȘIERE IMPORTANTE

```
/app/backend/
├── server.py          # Main server
├── models.py          # Toate modelele (cu account_type)
├── auth_routes.py     # Autentificare + account_type
├── portal_routes.py   # Portal candidat/angajator
├── admin_routes.py    # Admin dashboard

/app/frontend/src/
├── contexts/AuthContext.jsx   # Auth state
├── pages/
│   ├── MyAccountPage.jsx      # Pagina selectare serviciu (NOU)
│   ├── LoginPage.jsx          # Login cu redirect account_type
│   ├── RegisterPage.jsx       # Register cu account_type din URL
│   ├── AuthCallback.jsx       # OAuth callback
│   ├── portal/
│   │   ├── CandidateLayout.jsx + Dashboard
│   │   ├── EmployerLayout.jsx + Dashboard
│   │   ├── StudentLayout.jsx + Dashboard (NOU)
│   │   └── ImmigrationLayout.jsx + Dashboard (NOU)
│   └── admin/
│       ├── AdminLayout.jsx
│       └── AdminDashboard.jsx
├── components/
│   └── Navbar.jsx            # Actualizat cu "MY ACCOUNT"
```

---

## Status: ✅ FAZA 1.2 COMPLETĂ - Reorganizare acces utilizatori finalizată
