# Global Jobs Consulting - Ghid Deployment Self-Hosted
## DataHost cPanel/Apache + Backend Server

**Versiune:** 1.0  
**Data:** 28 Februarie 2026  
**Domeniu:** gjc.ro

---

## 📦 Conținut Pachet Export

```
export_gjc/
├── frontend_build/          # Fișiere statice pentru Apache
│   ├── index.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── asset-manifest.json
│   └── static/
│       ├── css/
│       └── js/
├── backend/                 # Cod FastAPI
│   ├── server.py
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/
├── database/                # Export MongoDB
│   ├── employer_submissions.json
│   ├── candidate_submissions.json
│   ├── contact_submissions.json
│   └── blog_posts.json
└── docs/
    └── DEPLOYMENT_GUIDE.md  # Acest fișier
```

---

## 🖥️ CERINȚE SISTEM

### Frontend (Apache/cPanel)
- Apache 2.4+ cu mod_rewrite activat
- cPanel standard

### Backend
- **Python:** 3.9+ (recomandat 3.10 sau 3.11)
- **MongoDB:** 4.4+ sau 5.0+
- **RAM:** Minim 1GB
- **Disk:** Minim 5GB

### Porturi necesare
- 80/443 (HTTP/HTTPS) - Frontend
- 8001 (intern) - Backend API
- 27017 (intern) - MongoDB

---

## 🚀 PARTEA 1: DEPLOYMENT FRONTEND (cPanel/Apache)

### Pas 1.1: Upload fișiere
1. Conectați-vă la cPanel DataHost
2. Deschideți **File Manager**
3. Navigați la `/public_html`
4. **Ștergeți** tot conținutul existent (backup mai întâi!)
5. Uploadați tot conținutul din folderul `frontend_build/`

### Pas 1.2: Creați fișierul .htaccess
În `/public_html`, creați fișierul `.htaccess` cu conținutul:

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React SPA Routing - Handle client-side routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Proxy API requests to backend
RewriteCond %{REQUEST_URI} ^/api
RewriteRule ^api/(.*)$ http://localhost:8001/api/$1 [P,L]

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/html "access plus 1 day"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### Pas 1.3: Verificare
- Accesați https://www.gjc.ro
- Verificați că pagina se încarcă corect
- Verificați că navigarea funcționează (toate paginile)

---

## 🔧 PARTEA 2: DEPLOYMENT BACKEND (Server Linux/VPS)

### Pas 2.1: Instalare dependențe sistem
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip python3-venv mongodb

# CentOS/RHEL
sudo yum install -y python3 python3-pip mongodb-server
```

### Pas 2.2: Pornire MongoDB
```bash
# Pornire serviciu
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificare status
sudo systemctl status mongod
```

### Pas 2.3: Creare director și upload fișiere
```bash
# Creare director aplicație
sudo mkdir -p /var/www/gjc-backend
sudo chown $USER:$USER /var/www/gjc-backend

# Uploadați conținutul folderului backend/ în /var/www/gjc-backend/
```

### Pas 2.4: Setup mediu virtual Python
```bash
cd /var/www/gjc-backend

# Creare virtual environment
python3 -m venv venv

# Activare
source venv/bin/activate

# Instalare dependențe
pip install --upgrade pip
pip install -r requirements.txt
```

### Pas 2.5: Configurare variabile de mediu
```bash
# Copiere și editare .env
cp .env.example .env
nano .env
```

**Editați `.env` cu valorile reale:**
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="gjc_database"
CORS_ORIGINS="https://www.gjc.ro,https://gjc.ro"
SMTP_HOST=mail.gjc.ro
SMTP_PORT=465
SMTP_USER=office@gjc.ro
SMTP_PASS=it+oN_yE5JPt+c2L
ADMIN_EMAIL=office@gjc.ro
```

### Pas 2.6: Import date în MongoDB
```bash
# Import colecții
mongoimport --db gjc_database --collection employer_submissions --file /path/to/database/employer_submissions.json
mongoimport --db gjc_database --collection candidate_submissions --file /path/to/database/candidate_submissions.json
mongoimport --db gjc_database --collection contact_submissions --file /path/to/database/contact_submissions.json
mongoimport --db gjc_database --collection blog_posts --file /path/to/database/blog_posts.json
```

### Pas 2.7: Test manual backend
```bash
cd /var/www/gjc-backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001

# În alt terminal, testați:
curl http://localhost:8001/api/
# Ar trebui să returneze: {"message":"Global Jobs Consulting API","version":"1.0.0"}
```

### Pas 2.8: Setup Systemd Service (pentru rulare permanentă)
```bash
sudo nano /etc/systemd/system/gjc-backend.service
```

Conținut:
```ini
[Unit]
Description=Global Jobs Consulting Backend API
After=network.target mongod.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/gjc-backend
Environment="PATH=/var/www/gjc-backend/venv/bin"
ExecStart=/var/www/gjc-backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# Activare și pornire serviciu
sudo systemctl daemon-reload
sudo systemctl start gjc-backend
sudo systemctl enable gjc-backend

# Verificare status
sudo systemctl status gjc-backend
```

---

## 🔀 PARTEA 3: CONFIGURARE REVERSE PROXY

### Opțiunea A: Apache (dacă backend-ul este pe același server)

Adăugați în configurația Apache sau .htaccess:
```apache
# Proxy pentru API
ProxyPreserveHost On
ProxyPass /api http://localhost:8001/api
ProxyPassReverse /api http://localhost:8001/api
```

Activați modulele necesare:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

### Opțiunea B: Nginx (recomandat pentru backend separat)
```nginx
server {
    listen 80;
    server_name api.gjc.ro;

    location / {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Opțiunea C: Backend pe server separat
Dacă backend-ul rulează pe alt server, modificați în frontend:
1. Reconstruiți frontend-ul cu variabila de mediu corectă:
```bash
REACT_APP_BACKEND_URL=https://api.gjc.ro yarn build
```

---

## 📧 PARTEA 4: CONFIGURARE EMAIL

### Verificare SMTP
Email-urile sunt trimise folosind serverul SMTP existent:
- **Host:** mail.gjc.ro
- **Port:** 465 (SSL)
- **User:** office@gjc.ro

### Configurare DNS (SPF/DKIM/DMARC)
În DNS-ul domeniului gjc.ro, adăugați:

**SPF Record (TXT):**
```
v=spf1 include:mail.gjc.ro ~all
```

**DMARC Record (TXT la _dmarc.gjc.ro):**
```
v=DMARC1; p=quarantine; rua=mailto:office@gjc.ro
```

---

## 📊 PARTEA 5: API ENDPOINTS

### Endpoints disponibile:

| Endpoint | Metodă | Descriere |
|----------|--------|-----------|
| `/api/` | GET | Health check API |
| `/api/health` | GET | Status server |
| `/api/stats` | GET | Statistici companie |
| `/api/employers/submit` | POST | Formular angajatori |
| `/api/employers/submissions` | GET | Lista aplicații angajatori |
| `/api/candidates/submit` | POST | Formular candidați (multipart) |
| `/api/candidates/submissions` | GET | Lista aplicații candidați |
| `/api/contact/submit` | POST | Formular contact |
| `/api/blog/posts` | GET | Lista articole blog |
| `/api/blog/posts/{slug}` | GET | Articol individual |
| `/api/blog/init-sample` | POST | Inițializare articole demo |

### Exemple cURL:

**Test API:**
```bash
curl https://www.gjc.ro/api/
```

**Trimitere formular contact:**
```bash
curl -X POST https://www.gjc.ro/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+40700000000",
    "subject": "Test",
    "message": "Acesta este un mesaj de test."
  }'
```

---

## 🗄️ PARTEA 6: SCHEMA BAZĂ DE DATE

### Colecții MongoDB:

**employer_submissions:**
```json
{
  "id": "uuid",
  "company_name": "string",
  "contact_person": "string",
  "email": "string",
  "phone": "string",
  "country": "RO|AT|RS",
  "industry": "string",
  "workers_needed": "number",
  "qualification_type": "string",
  "salary_offered": "string",
  "accommodation_provided": "boolean",
  "meals_provided": "boolean",
  "message": "string|null",
  "created_at": "datetime",
  "email_sent": "boolean"
}
```

**candidate_submissions:**
```json
{
  "id": "uuid",
  "full_name": "string",
  "email": "string",
  "phone": "string",
  "whatsapp": "string",
  "citizenship": "string",
  "experience_years": "number",
  "english_level": "string",
  "industry_preference": "string",
  "cv_filename": "string|null",
  "video_cv_url": "string|null",
  "message": "string|null",
  "created_at": "datetime",
  "email_sent": "boolean"
}
```

**contact_submissions:**
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "message": "string",
  "created_at": "datetime",
  "email_sent": "boolean"
}
```

**blog_posts:**
```json
{
  "id": "uuid",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "image_url": "string",
  "category": "string",
  "author": "string",
  "created_at": "datetime",
  "published": "boolean"
}
```

---

## ✅ CHECKLIST DEPLOYMENT

### Frontend
- [ ] Fișiere uploadate în /public_html
- [ ] .htaccess creat și funcțional
- [ ] SSL certificat activ (HTTPS)
- [ ] Navigare între pagini funcționează
- [ ] Imagini se încarcă corect

### Backend
- [ ] Python 3.9+ instalat
- [ ] MongoDB instalat și rulează
- [ ] Virtual environment creat
- [ ] Dependențe instalate
- [ ] .env configurat cu valori reale
- [ ] Serviciu systemd configurat și activ
- [ ] API răspunde la /api/

### Integrare
- [ ] Reverse proxy configurat (API la /api)
- [ ] Formulare trimit date corect
- [ ] Email-uri se trimit

### Verificări finale
- [ ] https://www.gjc.ro se încarcă
- [ ] Formularul de contact funcționează
- [ ] Formularul angajatori funcționează
- [ ] Formularul candidați funcționează
- [ ] Email-urile ajung la office@gjc.ro

---

## 🆘 TROUBLESHOOTING

### Frontend nu se încarcă
1. Verificați că .htaccess există și are conținut corect
2. Verificați că mod_rewrite este activat în Apache
3. Verificați permisiunile fișierelor (644 pentru fișiere, 755 pentru directoare)

### API returnează erori
1. Verificați că backend-ul rulează: `sudo systemctl status gjc-backend`
2. Verificați logurile: `sudo journalctl -u gjc-backend -f`
3. Verificați că MongoDB rulează: `sudo systemctl status mongod`

### Email-uri nu se trimit
1. Verificați credențialele SMTP în .env
2. Testați conexiunea SMTP manual
3. Verificați că portul 465 nu este blocat

### CORS errors
1. Verificați că CORS_ORIGINS în .env include domeniul corect
2. Asigurați-vă că include atât `www.gjc.ro` cât și `gjc.ro`

---

## 📞 SUPORT

Pentru întrebări tehnice suplimentare sau asistență:
- **Email:** office@gjc.ro
- **Telefon:** +40 732 403 464

---

*Document generat pentru Global Jobs Consulting SRL*  
*CUI: 48270947 | J05/1458/2023*
