#!/usr/bin/env python3
"""
FTP/SFTP Upload Script for Global Jobs Consulting Website
Server: 194.102.218.32
User: caiden
Target: /public_html

Usage:
    python3 upload_to_server.py --password YOUR_PASSWORD

This script uploads the built React application to the Apache server.
It tries FTP first, then falls back to SFTP if FTP fails.
"""

import os
import sys
import ftplib
import argparse
from pathlib import Path

# Server Configuration
FTP_HOST = "194.102.218.32"
FTP_USER = "caiden@gjc.ro"  # Format: user@domain required by Datahost
FTP_TARGET_DIR = "/public_html"
SFTP_PORT = 22

def connect_ftp(host, user, password):
    """Establish FTP connection"""
    try:
        print(f"[FTP] Attempting connection to {host} as {user}...")
        ftp = ftplib.FTP(host, timeout=30)
        ftp.login(user, password)
        print(f"✓ [FTP] Connected to {host} as {user}")
        return ftp, "ftp"
    except ftplib.error_perm as e:
        print(f"✗ [FTP] Login failed: {e}")
        return None, None
    except Exception as e:
        print(f"✗ [FTP] Connection failed: {e}")
        return None, None

def connect_sftp(host, user, password, port=22):
    """Establish SFTP connection using paramiko"""
    try:
        import paramiko
        print(f"[SFTP] Attempting connection to {host}:{port} as {user}...")
        
        transport = paramiko.Transport((host, port))
        transport.connect(username=user, password=password)
        sftp = paramiko.SFTPClient.from_transport(transport)
        
        print(f"✓ [SFTP] Connected to {host}:{port} as {user}")
        return sftp, transport, "sftp"
    except ImportError:
        print("✗ [SFTP] paramiko library not installed. Installing now...")
        os.system("pip install paramiko")
        # Retry after install
        try:
            import paramiko
            transport = paramiko.Transport((host, port))
            transport.connect(username=user, password=password)
            sftp = paramiko.SFTPClient.from_transport(transport)
            print(f"✓ [SFTP] Connected to {host}:{port} as {user}")
            return sftp, transport, "sftp"
        except Exception as e:
            print(f"✗ [SFTP] Connection failed after install: {e}")
            return None, None, None
    except Exception as e:
        print(f"✗ [SFTP] Connection failed: {e}")
        return None, None, None

def upload_file_ftp(ftp, local_path, remote_path):
    """Upload a single file via FTP"""
    try:
        with open(local_path, 'rb') as f:
            ftp.storbinary(f'STOR {remote_path}', f)
        print(f"  ↑ {local_path} -> {remote_path}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to upload {local_path}: {e}")
        return False

def upload_file_sftp(sftp, local_path, remote_path):
    """Upload a single file via SFTP"""
    try:
        sftp.put(str(local_path), remote_path)
        print(f"  ↑ {local_path} -> {remote_path}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to upload {local_path}: {e}")
        return False

def ensure_remote_dir_ftp(ftp, path):
    """Create remote directory via FTP if it doesn't exist"""
    try:
        ftp.mkd(path)
    except ftplib.error_perm:
        pass  # Directory exists

def ensure_remote_dir_sftp(sftp, path):
    """Create remote directory via SFTP if it doesn't exist"""
    try:
        sftp.stat(path)
    except FileNotFoundError:
        try:
            sftp.mkdir(path)
        except Exception:
            pass

def upload_directory_ftp(ftp, local_dir, remote_dir):
    """Recursively upload a directory via FTP"""
    local_path = Path(local_dir)
    
    for item in local_path.iterdir():
        local_item = str(item)
        remote_item = f"{remote_dir}/{item.name}"
        
        if item.is_dir():
            ensure_remote_dir_ftp(ftp, remote_item)
            upload_directory_ftp(ftp, local_item, remote_item)
        else:
            upload_file_ftp(ftp, local_item, remote_item)

def upload_directory_sftp(sftp, local_dir, remote_dir):
    """Recursively upload a directory via SFTP"""
    local_path = Path(local_dir)
    
    for item in local_path.iterdir():
        local_item = str(item)
        remote_item = f"{remote_dir}/{item.name}"
        
        if item.is_dir():
            ensure_remote_dir_sftp(sftp, remote_item)
            upload_directory_sftp(sftp, local_item, remote_item)
        else:
            upload_file_sftp(sftp, local_item, remote_item)

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
    parser = argparse.ArgumentParser(description='Upload GJC website to FTP/SFTP server')
    parser.add_argument('--password', '-p', required=True, help='Password')
    parser.add_argument('--build-dir', '-b', default='./build', help='Build directory path')
    parser.add_argument('--dry-run', '-d', action='store_true', help='Show what would be uploaded')
    parser.add_argument('--sftp-only', action='store_true', help='Skip FTP, use SFTP directly')
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
    
    connection = None
    connection_type = None
    transport = None
    
    # Try FTP first (unless --sftp-only is specified)
    if not args.sftp_only:
        connection, connection_type = connect_ftp(FTP_HOST, FTP_USER, args.password)
    
    # If FTP failed, try SFTP
    if connection is None:
        print("\n[INFO] FTP failed or skipped. Trying SFTP on port 22...")
        connection, transport, connection_type = connect_sftp(FTP_HOST, FTP_USER, args.password, SFTP_PORT)
    
    if connection is None:
        print("\n✗ Could not establish connection via FTP or SFTP")
        print("  Please verify:")
        print("  1. Username and password are correct")
        print("  2. Server allows FTP/SFTP connections")
        print("  3. No IP whitelist is blocking the connection")
        sys.exit(1)
    
    try:
        if connection_type == "ftp":
            # FTP workflow
            connection.cwd(FTP_TARGET_DIR)
            print(f"✓ Changed to {FTP_TARGET_DIR}")
            
            print(f"\nUploading files from {build_dir}...")
            upload_directory_ftp(connection, build_dir, FTP_TARGET_DIR)
            
            connection.quit()
        else:
            # SFTP workflow
            try:
                connection.chdir(FTP_TARGET_DIR)
            except Exception:
                # Create directory if it doesn't exist
                ensure_remote_dir_sftp(connection, FTP_TARGET_DIR)
                connection.chdir(FTP_TARGET_DIR)
            print(f"✓ Changed to {FTP_TARGET_DIR}")
            
            print(f"\nUploading files from {build_dir}...")
            upload_directory_sftp(connection, build_dir, FTP_TARGET_DIR)
            
            connection.close()
            if transport:
                transport.close()
        
        print(f"\n✓ Upload complete!")
        print(f"  Website should be available at https://www.gjc.ro")
        print("✓ Disconnected from server")
        
    except Exception as e:
        print(f"\n✗ Upload failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
