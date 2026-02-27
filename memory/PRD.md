# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională cu sediul în Oradea, România. Specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font

## Design Update (27 Feb 2026)
- Logo oficial Global Jobs Consulting integrat
- Font Montserrat (cald și prietenos)
- Butoane rotunjite cu culoare coral
- Imagini autentice cu muncitori asiatici și africani
- Eliminat stilul uppercase rigid
- Design mai cald și primitor

## Funcționalități Implementate

### ✅ Pagini și Secțiuni
- **Home Page**: Hero slider cu 5 imagini autentice, statistici, servicii grid, proces de recrutare
- **Angajatori**: Formular complet de solicitare personal (companie, cerințe, logistică)
- **Portal Candidați**: Formular aplicare cu upload CV și Video-CV link
- **Servicii All-Inclusive**: Descriere proces 6 pași, industrii acoperite, avantaje
- **Blog**: Articole dinamice din MongoDB
- **Contact**: Formular contact, hartă, informații SEO local

### ✅ API Endpoints
- `POST /api/employers/submit` - Formular angajator
- `POST /api/candidates/submit` - Formular candidat cu upload fișiere
- `POST /api/contact/submit` - Formular contact
- `GET /api/blog/posts` - Lista articole blog
- `GET /api/stats` - Statistici globale

### ✅ SEO și Tehnic
- Meta tags optimizate (title, description, keywords)
- Open Graph și Twitter Cards
- sitemap.xml și robots.txt generate
- Adresă SEO local în footer (Str. Parcul Traian nr. 1, ap. 10, Oradea)

### ✅ Script Deploy
- `/app/scripts/upload_to_server.py` - Script FTP pentru deploy pe 194.102.218.32

## Configurații Necesare Pentru Producție
1. **SMTP** - Adăugați în `/app/backend/.env`:
   ```
   SMTP_HOST=smtp.yourprovider.com
   SMTP_PORT=587
   SMTP_USER=office@gjc.ro
   SMTP_PASS=your_password
   ADMIN_EMAIL=office@gjc.ro
   ```

## User Personas
- **Angajatori**: Companii din RO/AT/RS care caută forță de muncă stabilă
- **Candidați**: Lucrători din Asia și Africa care caută oportunități în Europa

## Backlog P0/P1/P2

### P0 (Critice)
- [NECONFIGURAT] Credențiale SMTP pentru trimitere email

### P1 (Important)
- Dashboard admin pentru vizualizare aplicații
- Notificări email către candidați (confirmare primire)
- Multilingv (RO, EN, DE, SR)

### P2 (Nice to have)
- Chat live cu potențiali clienți
- Tracking status aplicație pentru candidați
- Integrare cu platforme de job-uri

## Data Implementare
- **MVP**: 27 Februarie 2026
- **Design Update**: 27 Februarie 2026
- **Status**: Complet, gata de deploy
