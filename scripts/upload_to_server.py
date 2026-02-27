#!/usr/bin/env python3
"""
FTP Upload Script for Global Jobs Consulting Website
Server: 194.102.218.32
User: gjcro
Target: /public_html

Usage:
    python3 upload_to_server.py --password YOUR_FTP_PASSWORD

Requirements:
    pip install ftplib

This script uploads the built React application to the Apache server.
"""

import os
import sys
import ftplib
import argparse
from pathlib import Path

# Server Configuration
FTP_HOST = "194.102.218.32"
FTP_USER = "gjcro"
FTP_TARGET_DIR = "/public_html"

def connect_ftp(host, user, password):
    """Establish FTP connection"""
    try:
        ftp = ftplib.FTP(host)
        ftp.login(user, password)
        print(f"✓ Connected to {host} as {user}")
        return ftp
    except ftplib.error_perm as e:
        print(f"✗ Login failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Connection failed: {e}")
        sys.exit(1)

def upload_file(ftp, local_path, remote_path):
    """Upload a single file"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_path}', f)
        print(f"  ↑ {local_path} -> {remote_path}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to upload {local_path}: {e}")
        return False

def ensure_remote_dir(ftp, path):
    """Create remote directory if it doesn't exist"""
    try:
        ftp.mkd(path)
    except ftplib.error_perm:
        pass  # Directory exists

def upload_directory(ftp, local_dir, remote_dir):
    """Recursively upload a directory"""
    local_path = Path(local_dir)
    
    for item in local_path.iterdir():
        local_item = str(item)
        remote_item = f"{remote_dir}/{item.name}"
        
        if item.is_dir():
            ensure_remote_dir(ftp, remote_item)
            upload_directory(ftp, local_item, remote_item)
        else:
            upload_file(ftp, local_item, remote_item)

def create_htaccess():
    """Create .htaccess for Apache with HTTPS redirect and SPA routing"""
    htaccess_content = """# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# React SPA Routing - Handle client-side routes
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

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
"""
    return htaccess_content

def main():
    parser = argparse.ArgumentParser(description='Upload GJC website to FTP server')
    parser.add_argument('--password', '-p', required=True, help='FTP password')
    parser.add_argument('--build-dir', '-b', default='./build', help='Build directory path')
    parser.add_argument('--dry-run', '-d', action='store_true', help='Show what would be uploaded')
    args = parser.parse_args()
    
    build_dir = Path(args.build_dir)
    
    if not build_dir.exists():
        print(f"✗ Build directory not found: {build_dir}")
        print("  Run 'yarn build' first to create the production build")
        sys.exit(1)
    
    # Create .htaccess in build directory
    htaccess_path = build_dir / '.htaccess'
    with open(htaccess_path, 'w') as f:
        f.write(create_htaccess())
    print(f"✓ Created .htaccess file")
    
    if args.dry_run:
        print("\n[DRY RUN] Files that would be uploaded:")
        for item in build_dir.rglob('*'):
            if item.is_file():
                print(f"  {item}")
        return
    
    # Connect and upload
    print(f"\nConnecting to {FTP_HOST}...")
    ftp = connect_ftp(FTP_HOST, FTP_USER, args.password)
    
    try:
        # Change to target directory
        ftp.cwd(FTP_TARGET_DIR)
        print(f"✓ Changed to {FTP_TARGET_DIR}")
        
        # Upload all files
        print(f"\nUploading files from {build_dir}...")
        upload_directory(ftp, build_dir, FTP_TARGET_DIR)
        
        print(f"\n✓ Upload complete!")
        print(f"  Website should be available at https://www.gjc.ro")
        
    finally:
        ftp.quit()
        print("✓ Disconnected from FTP server")

if __name__ == "__main__":
    main()
