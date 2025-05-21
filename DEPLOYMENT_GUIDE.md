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
git clone https://github.com/Kr8thor/marden-audit-reimagined.git
cd marden-audit-reimagined

# Install dependencies
npm install
```

### 2. Set Up Environment Variables in Netlify

The most common reason for missing functionality is incorrectly configured environment variables.

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Add these variables:

```
VITE_API_URL=https://marden-audit-backend-production.up.railway.app
VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app
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