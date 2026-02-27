# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională cu sediul în Oradea, România. Specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font
- **Multilingv**: Română, Germană, Sârbă

## Updates (27 Feb 2026 - v2)
- ✅ Experiență actualizată la 4 ani
- ✅ 11 agenții partenere în Asia și Africa
- ✅ Nou serviciu: **Nave de Croazieră** (personal înalt calificat)
- ✅ Headline: "Soluții Globale pentru Deficitul de Forță de Muncă"
- ✅ Motto: "Conectăm Talente Globale cu Oportunități Locale"
- ✅ Contact: "Hai să Discutăm"
- ✅ Traduceri complete în Germană (DE) și Sârbă (SR)
- ✅ Logo mai mare și vizibil
- ✅ Imagini unice și calde (muncitori asiatici/africani zâmbind)

## Funcționalități Implementate

### ✅ Pagini și Secțiuni
- **Home Page**: Hero slider cu 6 categorii (incluzând Nave de Croazieră), statistici, servicii grid, proces de recrutare
- **Angajatori**: Formular complet de solicitare personal
- **Portal Candidați**: Formular aplicare cu upload CV și Video-CV link
- **Servicii All-Inclusive**: 6 industrii acoperite (nou: Nave de Croazieră)
- **Blog**: Articole dinamice din MongoDB
- **Contact**: "Hai să Discutăm" cu formular și info SEO

### ✅ Multilingv
- `/app/frontend/src/i18n/translations.js` - Traduceri RO/DE/SR
- `/app/frontend/src/i18n/LanguageContext.jsx` - Context pentru limba curentă
- Selector de limbă în navbar (🇷🇴 RO | 🇦🇹 DE | 🇷🇸 SR)

### ✅ API Endpoints
- `POST /api/employers/submit` - Formular angajator
- `POST /api/candidates/submit` - Formular candidat cu upload fișiere
- `POST /api/contact/submit` - Formular contact
- `GET /api/blog/posts` - Lista articole blog
- `GET /api/stats` - Statistici (11 parteneri, 4 ani)

### ✅ SEO și Tehnic
- Meta tags optimizate
- sitemap.xml și robots.txt
- Adresă SEO local: Str. Parcul Traian nr. 1, ap. 10, Oradea

### ✅ Script Deploy
- `/app/scripts/upload_to_server.py` - Script FTP pentru 194.102.218.32

## Configurații Necesare Pentru Producție
```bash
# Backend .env
SMTP_HOST=smtp.yourprovider.com
SMTP_PORT=587
SMTP_USER=office@gjc.ro
SMTP_PASS=your_password
ADMIN_EMAIL=office@gjc.ro
```

## User Personas
- **Angajatori**: Companii din RO/AT/RS care caută forță de muncă stabilă
- **Candidați**: Lucrători din Asia și Africa căutând oportunități în Europa

## Backlog

### P0 (Critice)
- [NECONFIGURAT] Credențiale SMTP pentru trimitere email

### P1 (Important)
- Dashboard admin pentru vizualizare aplicații
- Notificări email către candidați

### P2 (Nice to have)
- Chat live cu potențiali clienți
- Tracking status aplicație

## Statistici Site
- 11 Agenții Partenere (Asia & Africa)
- 4 Ani de Experiență
- 2 Continente
- 3 Piețe Europene (RO, AT, RS)
- 6 Industrii (Construcții, HoReCa, Nave de Croazieră, Agricultură, Logistică, Producție)

## Status: Complet, gata de deploy
