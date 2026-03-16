# 🌍 GJC - Global Job Connect Platform

**Platformă B2B/B2C de Recrutare și Imigrare pentru Forță de Muncă Non-EU**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-green)](https://www.mongodb.com/)

---

## 📋 Despre Proiect

GJC (Global Job Connect) este o platformă completă de recrutare și imigrare care conectează:
- **Companii** din România, Austria, Serbia care au nevoie de forță de muncă
- **Candidați** din Asia și Africa care caută oportunități de muncă în Europa
- **Agenții de recrutare** partenere din țările sursă

### Funcționalități Principale

✅ **AI Matching Engine** - Potrivire semantică candidați-joburi cu OpenAI embeddings  
✅ **Pipeline Complet** - De la candidatură la angajare activă (PENDING → ACTIVE)  
✅ **Gestionare Vize** - Flux IGI, ambasadă, permise de muncă  
✅ **Tracking Relocare** - Zboruri, cazare, onboarding  
✅ **4 Portaluri** - Company, Agency, Candidate, Admin  
✅ **AI Chat Assistant** - "Paula" pentru suport recrutare  
✅ **Multi-limbă** - RO, EN, DE, SR  

---

## 🏗️ Arhitectură

```
┌─────────────────────────────────────────────────────────────────┐
│                       GJC PLATFORM                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   React     │  │  Next.js    │  │   FastAPI   │              │
│  │  Frontend   │  │  Frontend   │  │   Backend   │              │
│  │  (Legacy)   │  │   (New)     │  │   (Python)  │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
│         │                │                │                      │
│         └────────────────┼────────────────┘                      │
│                          │                                       │
│                          ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    REST API (/api/v1/gjc)                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                          │                                       │
│         ┌────────────────┴────────────────┐                      │
│         ▼                                 ▼                      │
│  ┌─────────────┐                   ┌─────────────┐              │
│  │ PostgreSQL  │                   │   MongoDB   │              │
│  │  + pgvector │                   │             │              │
│  │ (Tranzacții)│                   │ (Profile)   │              │
│  └─────────────┘                   └─────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │           OpenAI Embeddings (text-embedding-3-small)        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Structura Proiectului

```
/
├── backend/                    # FastAPI Backend
│   ├── server.py              # Main application
│   ├── database/
│   │   ├── db_config.py       # Database connections
│   │   └── postgresql_schema.sql
│   ├── services/
│   │   ├── ai_matching_service.py
│   │   └── pipeline_service.py
│   ├── routes/
│   │   └── gjc_platform_routes.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # React Frontend (Legacy)
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   └── components/
│   ├── package.json
│   └── .env.example
│
├── frontend-next/              # Next.js Frontend (New)
│   ├── app/
│   ├── components/
│   ├── package.json
│   └── .env.example
│
└── memory/
    └── PRD.md                  # Product Requirements Document
```

---

## 🚀 Instalare

### Cerințe
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (cu extensia pgvector)
- MongoDB 6+

### 1. Backend

```bash
cd backend

# Crează virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# sau: venv\Scripts\activate  # Windows

# Instalează dependențe
pip install -r requirements.txt

# Configurează environment
cp .env.example .env
# Editează .env cu valorile tale

# Pornește serverul
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### 2. PostgreSQL

```bash
# Instalează pgvector
# Ubuntu/Debian:
sudo apt install postgresql-15-pgvector

# Creează baza de date
sudo -u postgres psql
CREATE DATABASE gjc_platform;
CREATE USER gjc_admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE gjc_platform TO gjc_admin;

# Aplică schema
psql -U gjc_admin -d gjc_platform -f backend/database/postgresql_schema.sql
```

### 3. Frontend React

```bash
cd frontend

# Instalează dependențe
yarn install

# Configurează environment
cp .env.example .env

# Pornește dev server
yarn start
```

### 4. Frontend Next.js

```bash
cd frontend-next

# Instalează dependențe
yarn install

# Configurează environment
cp .env.example .env.local

# Pornește dev server
yarn dev
```

---

## 🔌 API Endpoints

### Health Check
```
GET /api/v1/gjc/health
```

### Company Portal
```
POST /api/v1/gjc/company/jobs           # Crează job
GET  /api/v1/gjc/company/jobs/{id}/candidates  # AI matching
GET  /api/v1/gjc/company/pipeline       # Kanban view
```

### Agency Portal
```
POST /api/v1/gjc/agency/candidates/batch  # Upload batch
POST /api/v1/gjc/agency/apply            # Aplică candidat
```

### Admin Portal
```
GET  /api/v1/gjc/admin/dashboard         # God view
POST /api/v1/gjc/admin/placement/{id}/status  # Tranziție status
```

### AI Matching
```
POST /api/v1/gjc/matching/generate-embedding
GET  /api/v1/gjc/matching/score
```

---

## 🧠 AI Matching

Sistemul folosește **OpenAI text-embedding-3-small** pentru a genera vectori de 1536 dimensiuni pentru profiluri candidați și descrieri joburi.

Căutarea se face cu **pgvector** folosind distanța cosinus pentru similaritate semantică.

### Niveluri de Potrivire
| Scor | Nivel | 
|------|-------|
| ≥90% | EXCELLENT |
| ≥85% | HIGH |
| ≥70% | GOOD |
| ≥60% | MODERATE |
| <60% | LOW |

---

## 📊 Schema Baze de Date

### PostgreSQL (Transactional)
- `users` - Utilizatori platformă
- `companies` - Companii angajatoare
- `agencies` - Agenții partenere
- `candidates` - Candidați (cu vector embedding)
- `jobs` - Joburi (cu vector embedding)
- `placements` - Plasări/aplicații
- `visa_processes` - Procese viză
- `relocation_tickets` - Relocări
- `status_audit_log` - Audit

### MongoDB (Profile Data)
- `users` - Autentificare
- `candidate_profiles` - Profiluri detaliate
- `employer_profiles` - Profiluri angajatori
- `documents` - Documente încărcate
- `chat_history` - Istoric chat AI

---

## 🔐 Securitate

⚠️ **IMPORTANT**: Nu comite niciodată fișiere `.env` cu chei reale!

- Folosește `.env.example` ca template
- Toate cheile API sunt în `.env` (exclus din git)
- Parolele sunt hash-uite cu salt
- JWT pentru autentificare

---

## 📝 Licență

Copyright © 2024 Global Jobs Consulting SRL

---

## 📞 Contact

- **Website**: [gjc.ro](https://gjc.ro)
- **Email**: office@gjc.ro
- **Telefon**: +40 732 403 464
