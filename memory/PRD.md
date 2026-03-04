# Global Jobs Consulting (GJC) - PRD

## Problema Originală
Site web pentru Global Jobs Consulting (www.gjc.ro) - agenție de recrutare internațională cu sediul în Oradea, România. Specializată în plasarea forței de muncă din Asia și Africa în România, Austria și Serbia.

## Arhitectura Tehnică
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + Motor (MongoDB async)
- **Database**: MongoDB
- **AI Chat**: OpenAI GPT-4o-mini via Emergent LLM Key (Maria)
- **Styling**: Navy Blue (#003366) + Coral (#E74C3C), Montserrat font
- **Multilingv**: Română, English, Deutsch, Srpski cu URL-uri specifice pentru SEO

## Updates (03 Mar 2026 - v11) - FAZA 3 CRO/UX OPTIMIZATION
- ✅ **Fix Hero Overlap**: Adăugat padding-top pe content pentru a compensa header-ul fix (270px gap)
- ✅ **Subtitlu Diferențiator**: Adăugat în Hero section în toate cele 4 limbi:
  - RO: "Specialiști în Recrutare Legală Non-UE, Proceduri IGI și Soluții Complete de Imigrare pentru Companii și Persoane Fizice."
- ✅ **Social Media Icons Header**: Facebook, Instagram, LinkedIn în top bar cu link-uri corecte
- ✅ **Social Media Icons Footer**: Link-uri actualizate către paginile oficiale:
  - Facebook: facebook.com/globaljobsconsulting
  - Instagram: instagram.com/globaljobsconsulting
  - LinkedIn: linkedin.com/company/global-jobs-consulting
- ✅ **Open Graph / Twitter Cards**: Meta tags configurate în SEOHead.jsx cu imagine og:image
- ✅ **Blog Share Buttons**: Butoane pentru Facebook, LinkedIn, WhatsApp, Copy Link pe paginile de blog
- ✅ **Mobile Sticky CTA Actualizat**: 
  - "Sună Acum" (verde) → tel:+40732403464
  - "Solicită Ofertă" (coral) → /formular-angajator
- ✅ **Blog HTML Rendering**: Content-ul articolelor renderizează corect HTML (headings, liste, etc.)

## Updates (02 Mar 2026 - v10) - FAZA 2 PAGINI PACHETE + STICKY CTA
- ✅ **5 Pagini Noi Pachete Servicii** (fiecare cu 4 limbi):
  - `/servicii/student-advisor` - Pentru studenți internaționali
  - `/servicii/work-career` - Angajare, schimbare angajator, prelungire
  - `/servicii/family-reunion` - Reunificarea familiei
  - `/servicii/settlement-citizenship` - Rezidență permanentă și cetățenie
  - `/servicii/administrative` - Traduceri, legalizări, echivalări
- ✅ **Fiecare pagină include**:
  - Hero section cu label pachet
  - Secțiune "Cui se adresează"
  - Ce include pachetul (6 servicii)
  - Proces pas cu pas (6-8 etape)
  - Documente necesare
  - FAQ (4 întrebări)
  - CTA cu formular precompletat
- ✅ **Butoane Sticky Mobile** (MobileStickyCTA.jsx):
  - "Solicită Consultanță" → /contact
  - "Recrutare Non-UE" → /formular-angajator
- ✅ **Meniu Services actualizat** cu toate cele 6 pachete în dropdown

## Updates (02 Mar 2026 - v9) - FAZA 1 RESTRUCTURARE MENIU
- ✅ **Meniu Principal Restructurat cu Dropdown-uri**:
  - **ACASĂ** - cu submeniu "Despre Noi"
  - **SERVICII** - cu submeniu (Recrutare Internațională + viitoarele pachete)
  - **ANGAJATORI** - cu submeniu:
    - Procedură Recrutare Non-UE
    - Eligibilitate Companie
    - Costuri & Termene
    - 🔴 Solicită Ofertă Personalizată (link coral evidențiat)
  - **PORTAL CANDIDAȚI** - link direct
  - **BLOG** - link direct
  - **CONTACT** - link direct
- ✅ **Pagină nouă /despre-noi**: 
  - Secțiuni: Misiune, Scop, Obiective Strategice
  - Statistici: 11+ Parteneri, 4+ Ani, 3 Piețe, 500+ Candidați
  - Multilingv: RO, EN (/en/about-us), DE (/de/uber-uns), SR (/sr/o-nama)
- ✅ **Pagină nouă /angajatori/procedura**:
  - Ghid complet 6 etape pentru recrutare Non-UE
  - Timeline vizual: 60-120 zile
  - FAQ și documente necesare
- ✅ **Pagină nouă /angajatori/eligibilitate**:
  - 6 cerințe obligatorii IGI
  - Situații de excludere
  - Proces de verificare în 4 pași
- ✅ **Pagină nouă /angajatori/costuri**:
  - Structura costurilor: Taxe IGI, Consolat, Angajator
  - Timeline detaliat
  - Tabel comparativ (cu/fără agenție)
- ✅ **Meniu Mobil cu Acordeon**: Funcțional pe toate dispozitivele
- ✅ **SEO Complet**: Toate paginile noi au hreflang și canonical pentru cele 4 limbi

## Updates (02 Mar 2026 - v8)
- ✅ **Pagină nouă /formular-angajator**: Formular detaliat pentru angajatori Non-UE
  - Rute multilingve: `/formular-angajator` (RO), `/en/employer-form` (EN), `/de/arbeitgeber-formular` (DE), `/sr/formular-poslodavac` (SR)
  - Secțiuni: Informații Companie, Necesarul de Personal, Condiții Oferite, Verificare Eligibilitate
  - Câmpuri noi: CUI, Funcție, Tip Angajare (permanent/sezonier/detașat), Țară de Origine Preferată, Posturi Disponibile
  - Verificare eligibilitate IGI: checkbox-uri obligatorii pentru condițiile legale
  - Cards informative: Termen de Procesare (30-45 zile), Cerințe Minime, Documentație Completă
  - Mesaj de succes detaliat cu lista de ce va primi angajatorul
- ✅ **Maria AI actualizată**: Redirecționează angajatorii către /formular-angajator în loc să afișeze formularul în chat
- ✅ **SEO complet**: hreflang tags și canonical URLs pentru noua pagină în toate cele 4 limbi

## Updates (01 Mar 2026 - v7)
- ✅ **Logo GJC mai mare**: Mărit dimensiunea logo-ului în navbar (h-20 md:h-24)
- ✅ **Chat Maria (redenumit din Elisabeth)**: 
  - Butonul de chat arată acum imaginea cu femeia care vorbește la telefon în loc de bulina roșie
  - Numele asistentului schimbat din "Elisabeth" în "Maria" în toată aplicația
  - Endpoint API actualizat de la `/api/chat/paula` la `/api/chat/maria`
- ✅ **Slide Construcții actualizat**:
  - Titlu schimbat din "Forță de muncă calificată" în "Muncitori Calificați și Necalificați în Construcții"
  - Video de fundal nou cu muncitori în construcții
- ✅ **Imagine "Despre Noi" actualizată**: Înlocuită imaginea cu muncitorul din fermă cu noua imagine cu harta și muncitori internaționali

## Updates (01 Mar 2026 - v6)
- ✅ **URL-uri SEO Multilingv**: Implementate URL-uri specifice pentru fiecare limbă
  - Română: `/contact`, `/angajatori`, `/servicii`, `/candidati`, `/blog`
  - Engleză: `/en/contact`, `/en/employers`, `/en/services`, `/en/candidates`, `/en/blog`
  - Germană: `/de/kontakt`, `/de/arbeitgeber`, `/de/dienstleistungen`, `/de/kandidaten`, `/de/blog`
  - Sârbă: `/sr/kontakt`, `/sr/poslodavci`, `/sr/usluge`, `/sr/kandidati`, `/sr/blog`
- ✅ **Hreflang Tags**: Adăugate tag-uri hreflang pentru toate paginile (ro, en, de, sr, x-default)
- ✅ **Canonical URLs**: Tag-uri canonical dinamice bazate pe limba curentă
- ✅ **Video Personal Depozite**: Adăugat videoclip de fundal pe slide-ul "Personal Depozite" (Logistică)
- ✅ **SEOHead Component**: Component nou pentru gestiunea centralizată a tag-urilor SEO
- ✅ **Language Switcher URL**: Selectorul de limbă navigează acum la URL-ul corect localizat
- ✅ **Test Report**: iteration_6.json - 95% success (bug canonical duplicat fixat)

## Updates (28 Feb 2026 - v5)
- ✅ **FIX CRITIC Helmet**: Rezolvată eroarea "Helmet expects a string as child of <title>" care făcea paginile să nu se încarce
- ✅ **Traduceri Complete**: Toate paginile (Candidați, Servicii, Blog, Contact, Angajatori, Privacy) au traduceri în 4 limbi
- ✅ **Redenumire Paula -> Elisabeth**: Asistentul AI a fost redenumit în "Elisabeth" cu textul "Hai sa vorbim?"
- ✅ **Video Hero Agricultură**: Adăugat videoclip de fundal pe slide-ul "Lucrători Agricoli"
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

### ✅ Maria AI Chat (redenumit din Elisabeth/Paula)
- **Model**: OpenAI GPT-4o-mini via Emergent LLM Key
- **Funcționalități**:
  - Răspunde în limba selectată de utilizator
  - Cunoaște informațiile companiei
  - Poate răspunde la întrebări despre: aplicare job, documente necesare, sectoare de activitate, colaborare angajatori
  - Conversații multi-turn cu istoric
  - Text vizibil: "Hai sa vorbim?" în limba curentă
  - Butonul arată imaginea cu femeia care vorbește la telefon
- **API Endpoint**: POST /api/chat/maria

### ✅ WhatsApp Integration
- Buton flotant verde (bottom-left)
- Link direct: wa.me/40732403464
- Mesaj pre-completat

### ✅ Hero Slider cu Video
- Slide 1: Video nave de croazieră (autoplay, muted)
- Slide 2: Video muncitori în construcții (autoplay, muted) - NOU v7
- Slide 4: Video lucrători agricoli (autoplay, muted)
- Slide 6: Video personal depozite (autoplay, muted) - NOU v6
- Slide 3, 5: Imagini originale de la client
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
- `POST /api/employers/submit` - Formular angajatori (folosit și de /formular-angajator)
- `POST /api/candidates/submit` - Formular candidați (multipart)
- `GET /api/blog/posts` - Lista articole
- `GET /api/blog/posts/{slug}` - Articol individual
- `POST /api/chat/maria` - AI Chat Assistant Maria

## Pagini Disponibile
- `/` - Homepage cu Hero Slider
- `/angajatori` - Pagină angajatori (formular simplu)
- `/formular-angajator` - **NOU v8** - Formular detaliat Non-EU cu verificare eligibilitate IGI
- `/servicii` - Servicii oferite
- `/candidati` - Portal candidați
- `/blog` - Lista articole blog
- `/blog/:slug` - Articol individual
- `/contact` - Pagină contact
- `/politica-confidentialitate` - Privacy Policy

## Teste
- **Test Report**: /app/test_reports/iteration_6.json (ultimul)
- **Success Rate**: 95% frontend (URL-uri multilingv + hreflang)
- **Funcționalități verificate**: URL routing, hreflang tags, canonical URLs, language switcher, navigation links, hero slider cu 3 videouri

## Backlog

### P0 (Important - Faza 3 - În Progres)
- ✅ Fix Hero Overlap - COMPLET
- ✅ Subtitlu diferențiator - COMPLET
- ✅ Social Media Icons (header/footer) - COMPLET
- ✅ Open Graph / Twitter Cards - COMPLET
- ✅ Blog Share Buttons - COMPLET
- ✅ Mobile Sticky CTA nou - COMPLET
- 🟡 CTA-uri diferențiate pentru user types (angajatori, candidați, studenți)
- 🟡 Mini-formular Homepage pentru nevoi urgente
- 🟡 Secțiune Urgență (contingent limitat Non-UE)
- 🟡 UX review general (spacing, button sizes mobile)

### P1 (Pagini SEO Industrii)
- **Pagini Landing SEO**: Construcții, Manufacturing, HoReCa, Maritime

### P2 (Nice to have)
- reCAPTCHA pe formulare
- Schema.org structured data (Organization)
- Secțiune testimoniale
- Dashboard admin pentru vizualizare aplicații
- CMS pentru blog
- Analytics dashboard (Google Analytics, GSC, Facebook Pixel)

## Status: ✅ v11 COMPLET - Faza 3 CRO/UX (Prima parte) finalizată

## Date Companie
- **Denumire**: Global Jobs Consulting SRL
- **CUI**: 48270947
- **J**: J05/1458/2023
- **Adresă**: Str. Parcul Traian nr. 1, ap. 10, Oradea
- **Telefon**: +40 732 403 464
- **Email**: office@gjc.ro
- **WhatsApp**: +40 732 403 464

## Status: ✅ v7 COMPLET - Toate modificările vizuale și chat Maria implementate
