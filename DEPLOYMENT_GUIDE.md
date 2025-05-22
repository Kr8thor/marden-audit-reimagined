<<<<<<< HEAD
# Marden SEO Audit Tool - Complete Deployment Guide

This guide will help you properly deploy and verify the Marden SEO Audit Tool to ensure all functionality works correctly.

## Prerequisites

- Netlify account
- Node.js 16+ and npm
- Git

## Deployment Steps

### 1. Clone and Prepare the Repository

```bash
# Clone the repository
=======
# Marden SEO Audit Tool - Railway Deployment Guide

This guide provides step-by-step instructions for deploying the Marden SEO Audit Tool to Railway.

## Prerequisites

1. [Node.js](https://nodejs.org/) v16+ installed
2. [Railway CLI](https://docs.railway.app/develop/cli) installed
3. Railway account with access to the project
4. Git installed

## Step 1: Initial Setup (First-time only)

### Backend Setup

```bash
# Clone the repository (if not already done)
git clone https://github.com/Kr8thor/marden-audit-backend.git
cd marden-audit-backend

# Install dependencies
npm install

# Login to Railway
railway login

# Link to the project (first-time setup)
railway init
# OR
railway link
```

### Frontend Setup

```bash
# Clone the repository (if not already done)
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93
git clone https://github.com/Kr8thor/marden-audit-reimagined.git
cd marden-audit-reimagined

# Install dependencies
npm install
<<<<<<< HEAD
```

### 2. Set Up Environment Variables in Netlify

The most common reason for missing functionality is incorrectly configured environment variables.

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Add these variables:
=======

# Login to Railway
railway login

# Link to the project (first-time setup)
railway init
# OR
railway link
```

## Step 2: Deployment Process

### Backend Deployment

```bash
# Navigate to backend directory
cd marden-audit-backend

# Ensure you're on the master branch
git checkout master

# Pull latest changes
git pull

# Deploy to Railway
./deploy.sh
# OR
railway up
```

### Frontend Deployment

```bash
# Navigate to frontend directory
cd marden-audit-reimagined

# Ensure you're on the main branch
git checkout main

# Pull latest changes
git pull

# Deploy to Railway
./deploy.sh --railway
# OR
railway up
```

## Step 3: Verify Deployment

### Backend Verification

1. Check the Railway deployment status:
   ```bash
   railway status
   ```

2. Test the health endpoint:
   ```bash
   curl https://marden-audit-backend-production.up.railway.app/health
   ```

3. Verify Redis connectivity in the health response.

### Frontend Verification

1. Check the Railway deployment status:
   ```bash
   railway status
   ```

2. Visit the frontend URL:
   - Railway: https://marden-audit-reimagined-production.up.railway.app
   - Production: https://audit.mardenseo.com

3. Test basic functionality by submitting a URL for analysis.

## Environment Variables

### Backend Environment Variables

```
NODE_ENV=production
PORT=3000
MAX_CONCURRENCY=3
MAX_MEMORY_PERCENT=80
CORS_ORIGIN=https://audit.mardenseo.com,http://localhost:9090
UPSTASH_REDIS_REST_URL=https://smiling-shrimp-21387.upstash.io
UPSTASH_REDIS_REST_TOKEN=AVOLAAIjcDFmNzVjNDVjZGM3MGY0NDczODEyMTA0NTAyOGNkMTc5OXAxMA
NODE_OPTIONS=--max-old-space-size=256
```

### Frontend Environment Variables
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93

```
VITE_API_URL=https://marden-audit-backend-production.up.railway.app
VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app
<<<<<<< HEAD
```

4. After adding variables, trigger a new deployment from the Deploys tab

### 3. Deploy to Netlify

Either use Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Log in to Netlify
netlify login

# Initialize Netlify site (first time only)
netlify init

# Deploy to Netlify
netlify deploy --prod
```

Or use the Netlify Drop interface:

```bash
# Build the project locally
npm run build

# Open Netlify Drop in your browser
# Drag and drop the 'dist' folder to the Netlify Drop interface
```

## Verifying the Deployment

After deployment, check that all functionality is working:

1. Visit the main site and test the basic SEO analyzer
2. Go to `/batch-audit` and test the batch analysis feature
3. Go to `/enhanced-analyzer` and test the enhanced features
4. Go to `/diagnostics` to see detailed API connection information

If any feature is missing, use the diagnostics page to identify the issue.

## Troubleshooting

If features are not working:

1. **Check Environment Variables**:
   - Verify in Netlify dashboard that variables are correctly set
   - Redeploy after any changes

2. **Check API Connectivity**:
   - Use the `/diagnostics` page to test all API endpoints
   - Verify the backend API is operating correctly

3. **Check for Console Errors**:
   - Open browser developer tools and check the console for errors
   - Network tab can show if API requests are failing

4. **Redirect Issues**:
   - Ensure the Netlify redirects are working correctly
   - Test direct navigation to routes like `/enhanced-analyzer`

## Contact for Support

If issues persist, contact:
- Email: support@mardenseo.com
- GitHub: @Kr8thor
=======
PORT=9090
NODE_ENV=production
```

## Troubleshooting

### Redis Connection Issues

If Redis connection fails:

1. Verify Upstash credentials in environment variables
2. Test Redis connection:
   ```bash
   cd marden-audit-backend
   node test-redis.js
   ```
3. Check Redis status via health endpoint

### Memory Usage Issues

If memory usage is high:

1. Check memory stats via health endpoint
2. Adjust `MAX_MEMORY_PERCENT` if needed
3. Consider reducing `MAX_CONCURRENCY`

### Deployment Failures

If deployment fails:

1. Check Railway logs:
   ```bash
   railway logs
   ```
2. Verify all required environment variables are set
3. Check for syntax errors in code

## Maintenance

### Weekly Tasks

1. Monitor error logs: `railway logs --error`
2. Check Redis connectivity 
3. Monitor memory usage patterns
4. Validate cache efficiency

### Monthly Tasks

1. Update dependencies: `npm update`
2. Perform security audit: `npm audit`
3. Review performance metrics
4. Check for outdated cache entries

---

Last updated: May 20, 2025
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93
