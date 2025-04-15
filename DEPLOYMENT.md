# Marden Audit - Deployment Guide

This document outlines the steps to deploy the Marden Audit frontend application to https://audit.mardenseo.com.

## Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)
- Git
- SSH access to the server
- Docker and Docker Compose (for Docker deployment option)

## Deployment Options

### Option 1: Manual Deployment

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-reimagined.git
   cd marden-audit-reimagined
   ```

2. Install dependencies:
   ```
   npm ci
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Upload the `dist` directory contents to your web server's root directory for the domain `audit.mardenseo.com`.

5. Configure your web server (Nginx, Apache, etc.) to serve the static files and handle SPA routing.

### Option 2: Using the Deployment Script

1. Edit the `deploy.sh` script with your server details:
   - Update `USER` with your SSH username
   - Update `REMOTE_SERVER` with your server domain/IP
   - Update `REMOTE_PATH` if needed

2. Make the script executable:
   ```
   chmod +x deploy.sh
   ```

3. Run the deployment script:
   ```
   ./deploy.sh
   ```

### Option 3: Docker Deployment

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-reimagined.git
   cd marden-audit-reimagined
   ```

2. Build and start the Docker container:
   ```
   docker-compose up -d
   ```

3. The application will be available on port 80. Configure your reverse proxy or load balancer to forward traffic from `audit.mardenseo.com` to this container.

## Nginx Configuration

If you're using Nginx as your web server, you can use the provided `nginx.conf` file as a template. Place it in `/etc/nginx/sites-available/audit.mardenseo.com` and create a symbolic link to `sites-enabled`.

## DNS Configuration

Ensure that the DNS records for `audit.mardenseo.com` point to your server's IP address:

1. Create an A record for `audit.mardenseo.com` pointing to your server's IP.
2. If using a CDN, follow their specific instructions for setting up a CNAME record.

## SSL/TLS Configuration

For HTTPS support:

1. Install Certbot:
   ```
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain an SSL certificate:
   ```
   sudo certbot --nginx -d audit.mardenseo.com
   ```

3. Certbot will update your Nginx configuration automatically.

## Troubleshooting

- If you encounter 404 errors for routes other than the root, ensure your web server is configured to redirect all requests to `index.html`.
- For CORS issues, ensure the appropriate headers are set in your web server configuration.
- Check the web server logs for any errors during the deployment process.
