# 📋 RAPORT COMPLET - PLATFORMA GJC (Global Jobs Consulting)
## www.gjc.ro

**Data Raport:** 6 Martie 2026  
**Versiune Platformă:** 2.5  
**Status:** LIVE ✅

---

## 🏗️ ARHITECTURA PLATFORMEI

### Stack Tehnologic
| Componenta | Tehnologie |
|------------|------------|
| **Frontend** | React 18, TailwindCSS, Shadcn/UI |
| **Backend** | FastAPI (Python 3.11) |
| **Bază de Date** | MongoDB |
| **Stocare Fișiere** | Emergent Object Storage (Cloud) |
| **Autentificare** | JWT + Google OAuth |
| **AI/OCR** | Claude Sonnet 4.5 (Anthropic) |
| **Email** | SMTP (mail.gjc.ro) |

### Structura Multi-Portal
1. **Website Public** - Landing pages, marketing, formular contact
2. **Portal Candidați** - Înregistrare, profil, documente, aplicații
3. **Portal Angajatori** - Profil companie, cereri de job-uri, proiecte
4. **Dashboard Admin** - Validare, CRUD complet, statistici

---

## ✅ FUNCȚIONALITĂȚI IMPLEMENTATE

### 1. SISTEMUL DE AUTENTIFICARE

#### 1.1 Autentificare Email/Parolă
- ✅ Înregistrare utilizatori noi
- ✅ Login cu email și parolă
- ✅ Sesiuni JWT cu expirare 7 zile
- ✅ Logout și invalidare sesiune
- ✅ Recuperare parolă (în dezvoltare)

#### 1.2 Google OAuth
- ✅ Login cu cont Google
- ✅ Înregistrare automată la primul login
- ✅ Sincronizare avatar și nume din Google
- ✅ Redirect securizat `/auth/callback`

#### 1.3 Tipuri de Conturi
| Tip Cont | Acces Portal | Rol |
|----------|--------------|-----|
| `candidate` | Portal Candidați | Căutare loc de muncă |
| `employer` | Portal Angajatori | Recrutare personal |
| `student` | Portal Studenți | Programe educaționale |
| `immigration_client` | Portal Imigrație | Servicii permise de ședere |
| `admin` | Dashboard Admin | Administrare platformă |

---

### 2. PORTAL CANDIDAȚI (`/portal/candidate`)

#### 2.1 Formular Profil Candidat (5 Secțiuni)

**Secțiunea 1 - Date Personale:**
- Nume și prenume
- Data nașterii
- Gen (masculin/feminin)
- Stare civilă
- Religie
- Cetățenie / Naționalitate
- Țara de origine

**Secțiunea 2 - Familie:**
- Nume tată
- Nume mamă
- Nume soț/soție
- Număr copii
- Vârste copii

**Secțiunea 3 - Experiență Profesională:**
- Profesia actuală
- Cod COR poziție dorită (autocomplete)
- Ani de experiență
- Lucrat în străinătate (Da/Nu)
- Țările în care a lucrat
- Limbi străine cunoscute
- Nivel engleză (A1-C2)

**Secțiunea 4 - Documente:**
| Document | Obligatoriu | Format |
|----------|-------------|--------|
| CV | ✅ Da | PDF, DOC, DOCX |
| Pașaport | ✅ Da | JPG, PNG, PDF |
| Cazier judiciar | ✅ Da | PDF, JPG |
| Foto tip pașaport | ✅ Da | JPG, PNG |
| Video prezentare | ❌ Nu | MP4, MOV |
| Diplome/Certificate | ❌ Nu | PDF, JPG |

**Secțiunea 5 - Informații Adiționale:**
- Așteptări salariale (EUR/lună)
- Permis de ședere existent
- Disponibilitate (imediat, 2 săpt, 1 lună, etc.)
- Acceptă part-time (Da/Nu)

#### 2.2 Workflow Validare Profil
```
DRAFT → PENDING_VALIDATION → VALIDATED/REJECTED
```
- Profilul începe în starea `draft`
- Candidatul completează și trimite pentru validare
- Admin validează sau respinge cu notă
- Notificare email automată la validare/respingere

#### 2.3 Dashboard Candidat
- Statistici: aplicații trimise, în așteptare, acceptate
- Lista aplicațiilor recente
- Status profil cu procent completare
- Notificări noi de matching

---

### 3. PORTAL ANGAJATORI (`/portal/employer`)

#### 3.1 Înregistrare Angajator cu Verificare CUI

**Flux în 3 Pași:**

**Pasul 1 - Căutare CUI:**
- Input CUI (cu sau fără prefix RO)
- Validare format CUI românesc
- Interogare registre publice

**Pasul 2 - Verificare Date Companie:**
Datele preluate automat:
- Denumire companie
- CUI și cod numeric
- Nr. Registru Comerțului (J-number)
- Adresa sediului social
- Cod CAEN și descriere activitate
- Data înființării și vechime
- Stare firmă (ACTIVA/SUSPENDATĂ/RADIATĂ)
- Plătitor TVA (Da/Nu)

**Verificare Eligibilitate IGI:**
| Criteriu | Descriere |
|----------|-----------|
| Firmă activă | Stare = ACTIVA |
| Vechime > 1 an | Data înființării > 12 luni |
| Cod CAEN eligibil | Construcții, HoReCa, Agricultură, etc. |

**Pasul 3 - Informații Contact:**
- Persoană de contact (nume, funcție)
- Telefon și email
- Număr angajați actuali
- Domenii de recrutare (checkbox-uri)
- Parolă cont

#### 3.2 Bază de Date Companii Cunoscute
Companii pre-înregistrate pentru verificare rapidă:
- DEDEMAN SRL (CUI: 14520045)
- KAUFLAND ROMANIA SCS (CUI: 6563869)
- CARREFOUR ROMANIA SA (CUI: 3717381)
- STRABAG SRL (CUI: 361540)
- PORR CONSTRUCT SRL (CUI: 1555838)
- MCDONALD'S ROMANIA SRL (CUI: 15328832)
- + generare automată pentru CUI-uri valide

#### 3.3 Formular Profil Angajator (4 Secțiuni)

**Secțiunea 1 - Informații Companie:**
- Denumire oficială
- CUI și J-number
- Adresă completă
- Administrator/reprezentant legal
- Industrie și număr angajați

**Secțiunea 2 - Persoană Contact:**
- Nume și prenume
- Funcție în companie
- Telefon direct
- Email contact

**Secțiunea 3 - Documente:**
| Document | Obligatoriu |
|----------|-------------|
| Certificat CUI | ✅ Da |
| CI Administrator | ✅ Da |
| Cazier judiciar firmă | ✅ Da |

**Secțiunea 4 - Eligibilitate IGI (doar România):**
- Fără datorii la buget
- Fără sancțiuni ANAF
- Minim 3 angajați
- Vechime peste 1 an

#### 3.4 Gestionare Cereri de Job-uri

**Creare Job Nou** (`/portal/employer/jobs/new`):
- Titlu poziție
- Cod COR (autocomplete din nomenclator)
- Număr poziții disponibile
- Industrie (Construcții, HoReCa, etc.)
- Locație (țară, oraș)
- Experiență minimă cerută
- Naționalități preferate
- Limbi străine cerute
- Salariu oferit (EUR)
- Beneficii (cazare, masă, transport)
- Descriere detaliată

**Status Job-uri:**
```
DRAFT → ACTIVE → FILLED/CANCELLED
```

**Lista Job-uri:**
- Căutare și filtrare
- Statistici per job (candidați, aplicații)
- Editare și ștergere
- Duplicare job existent

---

### 4. ÎNREGISTRARE CANDIDAT CU AI/OCR (`/register/candidate`)

#### 4.1 Wizard 7 Pași

**Pasul 1 - Ecran de Bun Venit:**
- Titlu: "Creează-ți profilul în 3 minute"
- 3 iconițe: Încarcă documente → Verifică date → Completează
- Buton verde "Începe acum"

**Pasul 2 - Upload Documente:**
| Zonă Upload | Status | Detalii |
|-------------|--------|---------|
| Pașaport (față) | Obligatoriu | JPG, PNG, PDF - max 10MB |
| CV | Obligatoriu | PDF, DOC, DOCX - max 5MB |
| Diplomă | Opțional | Badge "Crește șansele cu 40%" |
| Cazier judiciar | Opțional la început | "Poți adăuga mai târziu" |

**Pasul 3 - Procesare AI:**
- Animație "⏳ Citim documentele tale..."
- Progress bar 0-100%
- Timp aproximativ: 10 secunde

**Pasul 4 - Confirmare Date Extrase:**

*Din Pașaport (Claude AI OCR):*
- Nume complet și prenume
- Data nașterii (DD.MM.YYYY)
- Cetățenie și naționalitate
- Numărul pașaportului
- Data eliberării
- Data expirării
- Sex (M/F)
- Țara emitentă

*Din CV (Claude AI OCR):*
- Email și telefon
- Profesia/titlul jobului
- Ani de experiență
- Lista angajatorilor anteriori
- Țările în care a lucrat
- Limbile străine cunoscute
- Nivelul de studii

**Indicatori Câmpuri:**
| Culoare | Semnificație |
|---------|--------------|
| 🟢 Verde | Completat automat - sigur |
| 🟡 Galben | Necesită verificare |
| 🔴 Roșu | Negăsit - de completat manual |

**Pasul 5 - Completare Câmpuri Lipsă:**
- Creare cont (email + parolă)
- Date personale: stare civilă, religie, adresă
- Informații profesionale: post vizat, salariu (range slider), disponibilitate
- Disponibilitate specială: deja în România, permis muncă valid

**Pasul 6 - Checklist Documente:**
- ✅ Pașaport - Încărcat
- ✅ CV - Încărcat
- ☐ Cazier judiciar - obligatoriu
- ☐ Foto tip pașaport - obligatoriu
- ☐ Diplome - opțional
- ☐ Video prezentare - opțional (Badge: "Crește șansele cu 60%")

**Pasul 7 - Confirmare Finală:**
- Scor profil vizual: "Profilul tău este XX% complet"
- Bară colorată verde
- Sugestii îmbunătățire: "+15% dacă adaugi cazierul"
- Buton: "Trimite profilul pentru validare"
- Mesaj: "Vei primi răspuns în 24 ore"

#### 4.2 Funcționalități Extra
- **Auto-save** la fiecare 30 secunde în localStorage
- **Restore draft** - recuperare date la revenire
- **Validare în timp real** - erori afișate instant

---

### 5. DASHBOARD ADMIN (`/admin`)

#### 5.1 Pagina Candidați (`/admin/candidates`)
- Tabel cu toți candidații
- Coloane: Nume, Email, Țară, Profesie, Status, Data
- Filtre: status (all/draft/pending/validated/rejected)
- Căutare după nume sau email
- Acțiuni: Vizualizare, Validare, Respingere

#### 5.2 Pagina Angajatori (`/admin/employers`)
- Tabel cu toate companiile
- Coloane: Companie, CUI, Contact, Status, Data
- Detalii companie expandabile
- Verificare eligibilitate IGI
- Acțiuni: Vizualizare, Validare, Respingere

#### 5.3 Pagina Job-uri (`/admin/jobs`)
- Statistici per status (active, filled, cancelled)
- Tabel cu toate job-urile
- Matching candidați per job
- Schimbare status job

#### 5.4 Pagina Proiecte (`/admin/projects`)
- Pipeline vizual cu stadii
- Actualizare stadiu proiect
- Note și comentarii
- Timeline activități

#### 5.5 Pagina Utilizatori (`/admin/users`)
- Lista toți utilizatorii
- Filtrare pe rol
- Activare/dezactivare cont
- Schimbare rol

#### 5.6 Pagina Documente (`/admin/documents`)
- Toate documentele încărcate
- Filtrare pe tip și status
- Preview și download
- Verificare și aprobare

---

### 6. SISTEM NOTIFICĂRI

#### 6.1 Notificări In-App
- Icon clopoțel în header portal
- Badge cu număr notificări necitite
- Dropdown cu lista notificărilor
- Marcare ca citită / Ștergere
- Polling la 30 secunde

#### 6.2 Notificări Email (SMTP)
| Eveniment | Template | Destinatar |
|-----------|----------|------------|
| Profil validat | `profile_validated` | Candidat/Angajator |
| Profil respins | `profile_rejected` | Candidat/Angajator |
| Match candidat | `candidate_match` | Angajator |
| Aplicație nouă | `new_application` | Angajator |

---

### 7. ALGORITM DE MATCHING

Calculare scor compatibilitate candidat-job:

| Criteriu | Puncte Max | Descriere |
|----------|------------|-----------|
| Profesie/Cod COR | 30 | Potrivire exactă sau similară |
| Ani experiență | 20 | Îndeplinește minimul cerut |
| Limbi străine | 20 | Vorbește limbile cerute |
| Naționalitate | 15 | În lista preferată |
| Vârstă | 10 | În intervalul dorit |
| Gen | 5 | Preferință angajator |

**Notificare declanșată la scor ≥ 60%**

---

### 8. STOCARE DOCUMENTE

#### 8.1 Emergent Object Storage
- Upload securizat în cloud
- URLs semnate temporar (expirare 1 oră)
- Organizare pe foldere: `/candidates/{id}/`, `/employers/{id}/`

#### 8.2 Tipuri Documente Suportate
| Categorie | Extensii | Mărime Max |
|-----------|----------|------------|
| Imagini | JPG, PNG, WEBP | 10 MB |
| Documente | PDF, DOC, DOCX | 10 MB |
| Video | MP4, MOV | 50 MB |

#### 8.3 Versionare Documente
- La încărcare document nou de același tip → versiunea veche devine `archived`
- Păstrare istoric complet
- Restaurare versiuni anterioare (admin)

---

## 🔗 ENDPOINT-URI API

### Autentificare (`/api/auth`)
```
POST /register                    - Înregistrare utilizator
POST /login                       - Autentificare
GET  /me                          - Utilizator curent
POST /logout                      - Deconectare
GET  /google/auth                 - Start Google OAuth
GET  /google/callback             - Callback Google
POST /google/exchange             - Schimb token
POST /lookup-company              - Căutare companie după CUI
POST /register/employer           - Înregistrare angajator
POST /candidate/ocr/passport      - OCR pașaport (AI)
POST /candidate/ocr/cv            - OCR CV (AI)
POST /candidate/register-with-profile - Înregistrare cu profil
```

### Portal Candidați (`/api/portal/candidate`)
```
GET  /profile                     - Profil cu documente
POST /profile                     - Salvare profil
POST /profile/submit              - Trimitere pentru validare
POST /documents/upload            - Upload document
GET  /documents                   - Lista documente
DELETE /documents/{doc_id}        - Ștergere document
GET  /dashboard                   - Statistici dashboard
GET  /applications                - Aplicațiile mele
GET  /notifications               - Notificări
POST /notifications/{id}/read     - Marcare citită
```

### Portal Angajatori (`/api/portal/employer`)
```
GET  /profile                     - Profil companie
POST /profile                     - Salvare profil
POST /profile/submit              - Trimitere validare
POST /documents/upload            - Upload document
GET  /documents                   - Lista documente
GET  /jobs                        - Job-urile mele
POST /jobs                        - Creare job nou
PUT  /jobs/{job_id}               - Editare job
DELETE /jobs/{job_id}             - Ștergere job
GET  /projects                    - Proiecte active
GET  /dashboard                   - Statistici
GET  /notifications               - Notificări
```

### Admin (`/api/admin`)
```
GET  /candidates                  - Toți candidații
GET  /candidates/pending          - Candidați în așteptare
POST /candidates/{id}/validate    - Validare candidat
POST /candidates/{id}/reject      - Respingere candidat
GET  /employers                   - Toți angajatorii
GET  /employers/pending           - Angajatori în așteptare
POST /employers/{id}/validate     - Validare angajator
POST /employers/{id}/reject       - Respingere angajator
GET  /jobs                        - Toate job-urile
PUT  /jobs/{id}/status            - Schimbare status job
GET  /projects                    - Toate proiectele
PUT  /projects/{id}/stage         - Actualizare stadiu
GET  /users                       - Toți utilizatorii
PUT  /users/{id}/status           - Activare/dezactivare
GET  /documents                   - Toate documentele
```

---

## 🔐 CREDENȚIALE TEST

| Rol | Email | Parolă |
|-----|-------|--------|
| **Admin** | admin@gjc.ro | admin123 |
| **Candidat Test** | test.candidate@emergent.ro | test1234 |
| **Angajator Test** | test.employer@emergent.ro | test1234 |

---

## 📊 METRICI PLATFORMĂ

### Capabilități Actuale
- ✅ Înregistrare și autentificare utilizatori
- ✅ 4 tipuri de conturi + admin
- ✅ Profil candidat complet (5 secțiuni)
- ✅ Profil angajator cu verificare CUI
- ✅ Upload documente în cloud
- ✅ OCR AI pentru pașaport și CV
- ✅ Sistem notificări (in-app + email)
- ✅ Algoritm matching candidat-job
- ✅ Dashboard admin complet
- ✅ Workflow validare profiluri

### În Dezvoltare
- 🔄 Alerte expirare documente
- 🔄 Generare PDF contracte
- 🔄 Tracker vizual imigrație
- 🔄 Integrare plăți Stripe

---

## 📁 STRUCTURA FIȘIERE PRINCIPALE

```
/app/
├── backend/
│   ├── server.py                 # FastAPI main
│   ├── auth_routes.py            # Autentificare (800+ linii)
│   ├── portal_routes.py          # Portal candidați/angajatori
│   ├── admin_routes.py           # Dashboard admin
│   ├── anaf_service.py           # Verificare companii CUI
│   ├── candidate_ocr_service.py  # OCR AI pașaport/CV
│   ├── notification_service.py   # Notificări email
│   ├── matching_service.py       # Algoritm matching
│   └── storage.py                # Emergent Object Storage
│
├── frontend/
│   └── src/
│       ├── App.js                # Routing principal
│       ├── contexts/
│       │   └── AuthContext.jsx   # Stare autentificare
│       ├── pages/
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── CandidateRegisterPage.jsx  # Wizard 7 pași
│       │   ├── EmployerRegisterPage.jsx   # Verificare CUI
│       │   └── portal/
│       │       ├── CandidateProfileForm.jsx
│       │       ├── EmployerProfileForm.jsx
│       │       └── JobRequestForm.jsx
│       │   └── admin/
│       │       ├── AdminCandidates.jsx
│       │       ├── AdminEmployers.jsx
│       │       ├── AdminJobs.jsx
│       │       └── ...
│       └── components/
│           └── ui/               # Shadcn components
│
└── memory/
    ├── PRD.md                    # Product Requirements
    └── AUDIT_REPORT.md           # Audit platformă
```

---

**Raport generat automat - GJC Platform v2.5**  
**© 2026 Global Jobs Consulting**
