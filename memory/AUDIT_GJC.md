# 🔍 AUDIT COMPLET - Global Jobs Consulting (gjc.ro)

**Data Auditului:** Martie 2026  
**Auditor:** Web Developer & Designer Audit  
**Platforma:** React + FastAPI + MongoDB

---

## 📋 CUPRINS

1. [Structura Generală a Site-ului](#1-structura-generală)
2. [Meniul Principal - Detalii](#2-meniul-principal)
3. [Sistemul de Autentificare](#3-autentificare)
4. [Pagini Publice - Descriere](#4-pagini-publice)
5. [Portaluri Private](#5-portaluri-private)
6. [Panou Admin](#6-panou-admin)
7. [Plan de Optimizare și Dezvoltare](#7-plan-optimizare)

---

## 1. STRUCTURA GENERALĂ

### 1.1 Arhitectură Tehnică
```
Frontend: React 18 + TailwindCSS + Shadcn/UI
Backend: FastAPI (Python)
Bază de date: MongoDB
Autentificare: JWT + Google OAuth (Emergent Auth)
Multilingv: 8 limbi (RO, EN, DE, SR, NE, BN, HI, SI)
```

### 1.2 Tipuri de Utilizatori
| Tip | Descriere | Portal Dedicat |
|-----|-----------|----------------|
| **Admin** | Administrare completă | `/admin` |
| **Employer** | Companii care recrutează | `/portal/employer` |
| **Candidate** | Persoane care caută job | `/portal/candidate` |
| **Student** | Studenți internaționali | `/portal/student` |
| **Immigration** | Clienți servicii imigrare | `/portal/immigration` |

### 1.3 Componente Globale
- **Navbar** - Meniu principal responsive
- **Footer** - Informații contact, linkuri rapide
- **CookieBanner** - Consimțământ GDPR
- **WhatsAppButton** - Buton flotant WhatsApp
- **PhoneButton** - Buton flotant telefon
- **MariaChat** - Chatbot AI asistent
- **MobileStickyCTA** - CTA sticky pe mobil

---

## 2. MENIUL PRINCIPAL

### 2.1 Structura Navigării

```
┌─────────────────────────────────────────────────────────────────┐
│ [LOGO]  Angajatori  Candidați  Industrii▼  Cum Funcționează     │
│         Despre Noi  Blog  Contact           [🌐Lang] [Cont]     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Linkuri Principale

| Link | URL | Descriere |
|------|-----|-----------|
| **Acasă** | `/` | Homepage cu Hero Slider |
| **Angajatori** | `/employers` | Informații pentru companii |
| **Candidați** | `/candidates` | Portal aplicare candidați |
| **Industrii** | Dropdown | Construcții, HoReCa, Agricultură, Producție, Logistică |
| **Cum Funcționează** | `/how-it-works` | Procesul în 5 pași |
| **Despre Noi** | `/despre-noi` | Misiune, viziune, echipă |
| **Blog** | `/blog` | Articole și noutăți |
| **Contact** | `/contact` | Formular + date contact |

### 2.3 Dropdown Industrii
- `/industries/construction` - Construcții
- `/industries/horeca` - HoReCa (Hoteluri, Restaurante)
- `/industries/agriculture` - Agricultură
- `/industries/manufacturing` - Producție
- `/industries/logistics` - Logistică

### 2.4 Selector de Limbă (🌐)
| Steag | Cod | Limba |
|-------|-----|-------|
| 🇷🇴 | ro | Română |
| 🇬🇧 | en | English |
| 🇦🇹 | de | Deutsch |
| 🇷🇸 | sr | Srpski |
| 🇳🇵 | ne | नेपाली (Nepali) |
| 🇧🇩 | bn | বাংলা (Bengali) |
| 🇮🇳 | hi | हिन्दी (Hindi) |
| 🇱🇰 | si | සිංහල (Sinhala) |

### 2.5 Buton Cont (👤)
- **Neautentificat:** Arată "Autentificare" → `/login`
- **Autentificat:** Arată "Contul Meu" → Redirect la portal specific

---

## 3. SISTEMUL DE AUTENTIFICARE

### 3.1 Pagina Login (`/login`)

**Funcționalități:**
- ✅ Login cu email/parolă
- ✅ Login cu Google (OAuth)
- ✅ Redirect automat la portal specific după login
- ✅ Link "Ai uitat parola?" (nefuncțional încă)
- ✅ Link către înregistrare

**UI Components:**
- Card centrat cu logo
- Input email cu icon
- Input parolă cu icon
- Buton Google OAuth
- Separator "sau"
- Loading state cu spinner

### 3.2 Pagina Register (`/register`)

**Funcționalități:**
- ✅ Înregistrare cu email/parolă
- ✅ Selectare tip cont (employer, candidate, student, immigration)
- ✅ Validare email format
- ✅ Confirmare parolă

**Tipuri de Înregistrare:**
1. **Employer** (`/register/employer`) - Formular extins cu date companie + ANAF lookup
2. **Candidate** (`/register?type=candidate`) - Formular standard
3. **Student** (`/register?type=student`) - Formular standard
4. **Immigration** (`/register?type=immigration_client`) - Formular standard

### 3.3 Pagina "Contul Meu" (`/my-account`)

**Funcționalități:**
- ✅ Hub central pentru alegerea tipului de serviciu
- ✅ 4 carduri pentru tipurile de cont
- ✅ Redirect automat dacă utilizatorul e deja autentificat
- ✅ Link către login pentru conturi existente

**Carduri Disponibile:**
| Card | Icon | Descriere | Redirect |
|------|------|-----------|----------|
| Employer Account | 🏢 | Recrutare muncitori | `/register?type=employer` |
| Candidate Account | 👤 | Aplicare la joburi | `/register?type=candidate` |
| Student Application | 🎓 | Studii în România | `/register?type=student` |
| Immigration Services | 📄 | Vize, permise, cetățenie | `/register?type=immigration_client` |

### 3.4 Fluxul de Autentificare

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   /login     │ ──► │   Backend    │ ──► │   Portal     │
│              │     │   /api/auth  │     │   Specific   │
└──────────────┘     └──────────────┘     └──────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Redirect based on     │
              │  account_type:         │
              │  - admin → /admin      │
              │  - employer → /portal/ │
              │    employer            │
              │  - candidate → /portal/│
              │    candidate           │
              │  - student → /portal/  │
              │    student             │
              │  - immigration_client  │
              │    → /portal/immigration│
              └────────────────────────┘
```

---

## 4. PAGINI PUBLICE - DESCRIERE DETALIATĂ

### 4.1 Homepage (`/`)

**Secțiuni:**
1. **Hero Slider** - 3 slide-uri cu mesaje cheie, background video
2. **About Section** - Despre companie, statistici
3. **Avantaje** - 4 carduri cu beneficii
4. **Piețe Acoperite** - România, Austria, Serbia
5. **CTA Final** - Buton pentru angajatori și candidați

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.2 Despre Noi (`/despre-noi`)

**Secțiuni:**
1. **Hero** - Titlu + descriere
2. **Statistici** - 11+ parteneri, 4+ ani, 3 piețe, 500+ candidați
3. **Misiune** - Text + 3 puncte cheie
4. **Scop** - 4 categorii de beneficiari (companii, studenți, muncitori, familii)
5. **Obiective Strategice** - 5 obiective numerotate
6. **CTA** - Angajator sau Candidat

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.3 Pagina Angajatori (`/employers`)

**Secțiuni:**
1. **Hero** - "Găsește muncitorii de care ai nevoie"
2. **Avantaje** - De ce să alegi GJC
3. **Proces** - Cum funcționează
4. **Industries** - Sectoare acoperite
5. **CTA** - Solicită muncitori

**Status Traduceri:** ⚠️ Parțial (lipsesc NE, BN, HI, SI)

---

### 4.4 Pagina Candidați (`/candidates`)

**Funcționalități:**
- ✅ Formular aplicare complet
- ✅ Upload CV (PDF, DOC, DOCX)
- ✅ Selectare țară de origine (16 opțiuni)
- ✅ Nivel engleza
- ✅ Preferință industrie
- ✅ Link video CV opțional
- ✅ Confirmare succes

**Sidebar:**
- Țări destinație (RO, AT, RS)
- Pașii următori (1-4)

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.5 Contact (`/contact`)

**Funcționalități:**
- ✅ Formular contact complet
- ✅ Hartă Google Maps integrată
- ✅ Date contact (telefon, email, adresă)
- ✅ Program lucru
- ✅ Date fiscale (CUI, Reg. Com.)

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.6 Cum Funcționează (`/how-it-works`)

**Conținut:**
- 5 pași ai procesului de recrutare
- Durate estimate pentru fiecare pas
- 3 feature cards (Proces Rapid, 100% Legal, Suport 24/7)

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.7 Solicită Muncitori (`/request-workers`)

**Funcționalități:**
- ✅ Formular lead capture
- ✅ Câmpuri: companie, contact, email, telefon, nr. muncitori, industrie
- ✅ Beneficii în sidebar
- ✅ Statistici (11 parteneri, 4+ ani, 3 piețe)

**Status Traduceri:** ✅ Complet (8 limbi)

---

### 4.8 Pagini Industrii (`/industries/:industry`)

**Template Generic pentru:**
- Construcții (`/industries/construction`)
- HoReCa (`/industries/horeca`)
- Agricultură (`/industries/agriculture`)
- Producție (`/industries/manufacturing`)
- Logistică (`/industries/logistics`)

**Status:** ⚠️ Template simplu, necesită conținut specific

---

### 4.9 Blog (`/blog`)

**Funcționalități:**
- ✅ Listă articole
- ✅ Categorii
- ✅ Pagină articol individual (`/blog/:slug`)

**Status:** ⚠️ Conținut static, necesită CMS

---

### 4.10 Alte Pagini Publice

| Pagină | URL | Status |
|--------|-----|--------|
| Politica Confidențialitate | `/privacy-policy` | ✅ Complet |
| Procedura IGI | `/procedura-igi` | ⚠️ Doar RO |
| Eligibilitate | `/eligibilitate` | ⚠️ Doar RO |
| Costuri | `/costuri` | ⚠️ Doar RO |
| Studii în România | `/studii-romania` | ⚠️ Doar RO |
| Muncă și Carieră | `/munca-cariera` | ⚠️ Doar RO |
| Reunificare Familie | `/reunificare-familie` | ⚠️ Doar RO |
| Stabilire și Cetățenie | `/stabilire-cetatenie` | ⚠️ Doar RO |
| Servicii Administrative | `/servicii-administrative` | ⚠️ Doar RO |

---

## 5. PORTALURI PRIVATE

### 5.1 Portal Angajator (`/portal/employer`)

**Layout:** Sidebar + Content Area

**Pagini:**
| Rută | Funcționalitate |
|------|-----------------|
| `/portal/employer` | Dashboard - Statistici, status companie |
| `/portal/employer/profile` | Profil companie - Date, documente |
| `/portal/employer/jobs` | Cereri de personal |
| `/portal/employer/jobs/new` | Creare cerere nouă |

**Dashboard arată:**
- Status companie (Draft/În validare/Validată/Respinsă)
- Joburi deschise
- Proiecte active
- Notificări

---

### 5.2 Portal Candidat (`/portal/candidate`)

**Layout:** Sidebar + Content Area

**Pagini:**
| Rută | Funcționalitate |
|------|-----------------|
| `/portal/candidate` | Dashboard - Status profil, proiecte |
| `/portal/candidate/profile` | Profil personal - Date, CV |
| `/portal/candidate/documents` | Upload documente |

**Dashboard arată:**
- Status profil (Draft/În validare/Validat/Respins)
- Proiecte active
- Notificări necitite
- Progress completare profil

---

### 5.3 Portal Student (`/portal/student`)

**Layout:** Sidebar + Content Area

**Funcționalități:**
- Dashboard cu status aplicație
- Upload documente studii
- Tracking dosar

---

### 5.4 Portal Imigrare (`/portal/immigration`)

**Layout:** Sidebar + Content Area

**Funcționalități:**
- Dashboard servicii imigrare
- Status vize/permise
- Documente necesare

---

## 6. PANOU ADMIN (`/admin`)

### 6.1 Pagini Admin

| Rută | Funcționalitate |
|------|-----------------|
| `/admin` | Dashboard principal |
| `/admin/candidates` | Management candidați |
| `/admin/employers` | Management angajatori |
| `/admin/jobs` | Management cereri job |
| `/admin/projects` | Management proiecte |
| `/admin/users` | Management utilizatori |
| `/admin/documents` | Management documente |

### 6.2 Funcționalități Admin

- ✅ Vizualizare toate înregistrările
- ✅ Validare/Respingere profiluri
- ✅ Editare date
- ✅ Export date (în dezvoltare)
- ✅ Statistici generale

---

## 7. PLAN DE OPTIMIZARE ȘI DEZVOLTARE

### 7.1 PRIORITĂȚI CRITICE (P0)

| # | Task | Pagină/Secțiune | Descriere |
|---|------|-----------------|-----------|
| 1 | 🔴 **Fix Deploy Production** | Infrastructură | gjc.ro nu reflectă modificările din preview |
| 2 | 🔴 **Traduceri Complete** | Employers, Industries, Servicii | Lipsesc traducerile pentru NE, BN, HI, SI |
| 3 | 🔴 **Restore CandidateRegisterPage** | `/register/candidate` | Pagina AI cu OCR este spartă |

---

### 7.2 PAGINI - PLAN OPTIMIZARE

#### 📄 Homepage (`/`)

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P1 | SEO Meta Tags | Adăugare meta tags dinamice per limbă |
| P1 | Hero Videos Fallback | Imagine statică dacă video-ul nu se încarcă |
| P2 | Testimoniale | Secțiune nouă cu testimoniale clienți |
| P2 | Parteneri Logo | Secțiune logo-uri parteneri |
| P3 | Animații Scroll | Animații la scroll pentru secțiuni |

#### 📄 Despre Noi (`/despre-noi`)

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P1 | Echipa | Adăugare secțiune echipă cu poze |
| P2 | Timeline | Istoricul companiei vizual |
| P2 | Certificări | Secțiune certificări și acreditări |

#### 📄 Angajatori (`/employers`)

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P0 | Traduceri | Completare NE, BN, HI, SI |
| P1 | Calculator Costuri | Tool interactiv estimare costuri |
| P1 | Case Studies | Exemple de succes |
| P2 | FAQ | Întrebări frecvente |

#### 📄 Candidați (`/candidates`)

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P1 | Progress Bar | Indicator progres completare formular |
| P1 | Validare Real-time | Validare câmpuri în timp real |
| P2 | Job Listings | Listă joburi disponibile |
| P2 | Match Algorithm | Algoritm potrivire job-candidat |

#### 📄 Contact (`/contact`)

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P1 | Live Chat | Integrare chat live cu operator |
| P2 | Booking Calendar | Programare întâlniri online |
| P2 | Sucursale | Hartă cu toate locațiile |

#### 📄 Pagini Industrii

| Prioritate | Optimizare | Descriere |
|------------|------------|-----------|
| P0 | Traduceri | Toate 8 limbile |
| P1 | Conținut Specific | Text unic per industrie |
| P1 | Joburi per Industrie | Listă joburi disponibile |
| P2 | Statistici Industrie | Date specifice (salarii, cerere) |

---

### 7.3 PORTALURI - PLAN DEZVOLTARE

#### 🔐 Portal Angajator

| Prioritate | Feature | Descriere |
|------------|---------|-----------|
| P1 | Notificări Email | Email automat la schimbări status |
| P1 | Chat cu GJC | Comunicare directă din portal |
| P1 | Document Preview | Previzualizare documente uploadate |
| P2 | Multi-user | Mai mulți utilizatori per companie |
| P2 | Rapoarte | Export rapoarte PDF |
| P3 | API Integrare | API pentru sisteme HR externe |

#### 🔐 Portal Candidat

| Prioritate | Feature | Descriere |
|------------|---------|-----------|
| P1 | Video Interview | Înregistrare video prezentare |
| P1 | Document OCR | Extragere automată date din acte |
| P1 | Progress Tracker | Urmărire vizuală status dosar |
| P2 | Job Alerts | Notificări joburi noi |
| P2 | Skill Assessment | Test competențe online |

#### 🔐 Portal Admin

| Prioritate | Feature | Descriere |
|------------|---------|-----------|
| P1 | Bulk Actions | Acțiuni în masă |
| P1 | Export Excel/CSV | Export date |
| P1 | Audit Log | Istoric modificări |
| P2 | Dashboard Analytics | Grafice și statistici avansate |
| P2 | Email Templates | Șabloane email personalizabile |

---

### 7.4 FUNCȚIONALITĂȚI NOI

| Prioritate | Feature | Descriere |
|------------|---------|-----------|
| P1 | **Sistem Alertă Documente** | Notificare documente expirante |
| P1 | **Immigration Tracker** | Tracker vizual pentru dosare imigrare |
| P2 | **Stripe Integration** | Plăți online |
| P2 | **PDF Generator** | Generare contracte/facturi PDF |
| P2 | **SMS Notifications** | Notificări SMS importante |
| P3 | **Mobile App** | Aplicație mobilă React Native |
| P3 | **AI Matching** | Algoritm AI potrivire candidat-job |

---

### 7.5 OPTIMIZĂRI TEHNICE

| Prioritate | Task | Descriere |
|------------|------|-----------|
| P1 | Performance | Optimizare încărcare imagini (lazy load) |
| P1 | SEO | Sitemap.xml, robots.txt |
| P1 | Accessibility | WCAG 2.1 compliance |
| P2 | PWA | Progressive Web App |
| P2 | Error Handling | Pagini eroare personalizate (404, 500) |
| P2 | Analytics | Google Analytics 4 setup |

---

### 7.6 SECURITATE

| Prioritate | Task | Descriere |
|------------|------|-----------|
| P0 | Rate Limiting | Limitare request-uri API |
| P1 | CSRF Protection | Token-uri CSRF |
| P1 | Input Sanitization | Curățare input utilizator |
| P2 | 2FA | Autentificare doi factori |
| P2 | Session Management | Expirare sesiuni inactiv |

---

## 📊 REZUMAT PRIORITĂȚI

| Prioritate | Total Tasks | Status |
|------------|-------------|--------|
| **P0 (Critic)** | 5 | 🔴 De făcut urgent |
| **P1 (Important)** | 18 | 🟡 Planificat |
| **P2 (Nice-to-have)** | 22 | 🟢 Backlog |
| **P3 (Viitor)** | 5 | ⚪ Long-term |

---

**Document generat:** Martie 2026  
**Următorul review:** După implementare P0
