# Marden SEO Audit Tool - Netlify Deployment Guide

This document provides instructions for deploying the Marden SEO Audit Tool frontend to Netlify, which has proven to be more reliable than Railway for frontend hosting.

## Project Overview

- **Frontend**: React application with enhanced SEO analysis features
- **Backend API**: Node.js application hosted on Railway (remains unchanged)
- **Target Deployment**: Netlify (frontend) + Railway (backend)

## Prerequisites

- Node.js 16+ installed
- npm 7+ installed
- Git installed
- Netlify account (sign up at netlify.com if needed)

## Deployment Options

### Option 1: Netlify Drop (Easiest)

1. Build the project:
   ```bash
   cd C:\Users\Leo\marden-audit-reimagined
   npm run build
   ```

2. Navigate to [Netlify Drop](https://app.netlify.com/drop) in your browser

3. Drag and drop the entire `dist` folder from your local machine

4. Once deployed, you can configure:
   - Custom domain: Set to audit.mardenseo.com
   - Environment variables: Add `VITE_API_URL=https://marden-audit-backend-production.up.railway.app`

### Option 2: Netlify CLI (Automated)

1. Install the Netlify CLI (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Run the deployment script:
   ```bash
   # On Windows
   .\netlify-deploy.bat

   # On macOS/Linux
   ./netlify-deploy.sh
   ```

4. Follow the prompts. The script includes fallback mechanisms if the CLI is slow.

### Option 3: Netlify GitHub Integration (Continuous Deployment)

1. Push your changes to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. In the Netlify dashboard:
   - Click "New site from Git"
   - Connect to your GitHub account
   - Select the repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

## Post-Deployment Steps

After successful deployment, perform these steps:

1. **Configure Domain**:
   - In Netlify dashboard → Site settings → Domain management
   - Add custom domain: `audit.mardenseo.com`
   - Follow DNS setup instructions

2. **Set Environment Variables**:
   - In Netlify dashboard → Site settings → Environment
   - Add variable: `VITE_API_URL=https://marden-audit-backend-production.up.railway.app`
   - Trigger a new build for changes to take effect

3. **Test Enhanced Features**:
   - Navigate to `/enhanced-analyzer` route
   - Test the schema validation feature
   - Test the mobile-friendliness analysis
   - Verify all components render correctly

## Troubleshooting

If you encounter issues:

- **Netlify CLI Slowness**: Use the Netlify Drop option instead
- **Build Errors**: Check the build logs in Netlify dashboard
- **404 Errors**: Ensure `netlify.toml` is configured correctly with redirect rules
- **API Connection Issues**: Verify environment variables are set correctly

## Backend API Integration

The frontend is configured to connect to the backend at:
```
https://marden-audit-backend-production.up.railway.app
```

Make sure the backend API supports the endpoints:
- `/schema-analyze`
- `/mobile-analyze`
- `/enhanced-seo-analyze`

## Contact

For assistance, contact:
- Leo Mardenborough
- Email: support@mardenseo.com
- GitHub: @Kr8thor