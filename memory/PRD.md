# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională cu sediul în Oradea, România. Specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **AI Chat**: OpenAI GPT-4o-mini via Emergent LLM Key
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font
- **Multilingv**: Română, English, Deutsch, Srpski

## Updates (28 Feb 2026 - v5)
- ✅ **FIX CRITIC Helmet**: Rezolvată eroarea "Helmet expects a string as child of <title>" care făcea paginile să nu se încarce
- ✅ **Traduceri Complete**: Toate paginile (Candidați, Servicii, Blog, Contact, Angajatori, Privacy) au traduceri în 4 limbi
- ✅ **Testing 100%**: Toate testele de multilingv trec (iteration_5.json)

## Updates (28 Feb 2026 - v4)
- ✅ **Multilingv complet**: 4 limbi (RO/EN/DE/SR) cu selector în navbar
- ✅ **Paula AI Chat**: Asistent de recrutare cu OpenAI GPT
- ✅ **WhatsApp Button**: Buton flotant cu link direct (+40732403464)
- ✅ **Video Hero**: Videoclip nave de croazieră în slider
- ✅ **Imagini noi**: Imagini originale de la client (muncitori la aeroport)
- ✅ **Cookie Banner**: Banner GDPR cu opțiuni accept/decline
- ✅ **Privacy Checkbox**: Pe toate formularele (Contact, Angajatori, Candidați)

## Updates Anterioare
- v3: Deploy FTP, date fiscale (CUI: 48270947, J05/1458/2023)
- v2: Traduceri DE/SR, serviciu nave de croazieră, statistici actualizate
- v1: Implementare inițială, formulare, SMTP

## Funcționalități Implementate

### ✅ Multilingv (4 limbi)
- **Română (RO)** - limba implicită
- **English (EN)** - nou adăugat
- **Deutsch (DE)** - pentru Austria
- **Srpski (SR)** - pentru Serbia
- Selector vizibil în navbar cu steaguri
- Persistență în localStorage
- Traduceri pentru toate paginile și componentele

### ✅ Paula AI Chat
- **Model**: OpenAI GPT-4o-mini via Emergent LLM Key
- **Funcționalități**:
  - Răspunde în limba selectată de utilizator
  - Cunoaște informațiile companiei
  - Poate răspunde la întrebări despre: aplicare job, documente necesare, sectoare de activitate, colaborare angajatori
  - Conversații multi-turn cu istoric
- **API Endpoint**: POST /api/chat/paula

### ✅ WhatsApp Integration
- Buton flotant verde (bottom-left)
- Link direct: wa.me/40732403464
- Mesaj pre-completat

### ✅ Hero Slider cu Video
- Slide 1: Video nave de croazieră (autoplay, muted)
- Slide 2-6: Imagini originale de la client
- Navigare cu săgeți și indicatori
- Auto-rotație la 6 secunde

### ✅ Cookie Banner GDPR
- Opțiuni: "Accept toate" / "Doar esențiale"
- Link către Politica de Confidențialitate
- Persistență în localStorage

### ✅ Pagină Politică de Confidențialitate
- URL: /politica-confidentialitate
- Secțiuni: Date colectate, Scopuri, Temei legal, Stocare, Drepturi utilizatori
- Date fiscale: CUI 48270947, J05/1458/2023

### ✅ Privacy Consent pe Formulare
- Checkbox obligatoriu pe toate formularele
- Link către Politica de Confidențialitate
- Validare frontend

## Configurații Producție

### SMTP (Funcțional)
```
Host: mail.gjc.ro
Port: 465
User: office@gjc.ro
```

### FTP DataHost
```
Host: 194.102.218.32
User: caiden@gjc.ro
Target: /public_html
```

### OpenAI (Paula Chat)
```
EMERGENT_LLM_KEY=sk-emergent-***
Model: gpt-4o-mini
```

## API Endpoints
- `GET /api/` - Health check
- `GET /api/health` - Server status
- `GET /api/stats` - Statistici companie
- `POST /api/contact/submit` - Formular contact
- `POST /api/employers/submit` - Formular angajatori
- `POST /api/candidates/submit` - Formular candidați (multipart)
- `GET /api/blog/posts` - Lista articole
- `GET /api/blog/posts/{slug}` - Articol individual
- `POST /api/chat/paula` - AI Chat Assistant

## Teste
- **Test Report**: /app/test_reports/iteration_4.json
- **Success Rate**: 100% backend, 100% frontend
- **Toate testele trec**

## Backlog

### P1 (Important)
- Dashboard admin pentru vizualizare aplicații
- Notificări email către candidați
- reCAPTCHA pe formulare

### P2 (Nice to have)
- CMS pentru blog
- Tracking status aplicație
- Analytics dashboard

## Date Companie
- **Denumire**: Global Jobs Consulting SRL
- **CUI**: 48270947
- **J**: J05/1458/2023
- **Adresă**: Str. Parcul Traian nr. 1, ap. 10, Oradea
- **Telefon**: +40 732 403 464
- **Email**: office@gjc.ro
- **WhatsApp**: +40 732 403 464

## Status: ✅ COMPLET - Gata pentru Deploy Final
