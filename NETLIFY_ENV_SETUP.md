# Netlify Environment Variables Guide

After deploying your site to Netlify, you need to set up environment variables to ensure the frontend connects to your backend API correctly.

## Required Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://marden-audit-backend-production.up.railway.app` | Points to your production backend API |
| `VITE_API_FALLBACK_URL` | `https://marden-seo-audit-api.vercel.app` | Fallback API in case the main one fails |

## Setting Up Variables in Netlify

1. **Go to Netlify Dashboard**: Log in to your Netlify account
2. **Select Your Site**: Click on the site you just deployed
3. **Navigate to Environment Variables**:
   - Click "Site settings" in the top navigation
   - Select "Environment variables" from the left sidebar
4. **Add Variables**:
   - Click "Add variable"
   - Enter the variable name and value as listed above
   - Repeat for each variable
5. **Redeploy Site**:
   - After adding variables, trigger a new deployment
   - Go to "Deploys" tab
   - Click "Trigger deploy" → "Deploy site"

## Verifying Configuration

After setting up the environment variables:

1. **Test Enhanced Analyzer Page**:
   - Navigate to `/enhanced-analyzer` on your site
   - Enter a URL to analyze
   - Verify the analysis completes successfully
   - Check browser console for any API errors

2. **Check API Connectivity**:
   - Open browser developer tools
   - Look at the Network tab
   - Verify requests to the API are successful

## Troubleshooting

If your frontend can't connect to the backend:

1. **Check Environment Variables**: Verify they're set correctly in Netlify
2. **Check CORS Settings**: Ensure the backend allows requests from your Netlify domain
3. **Try the Fallback API**: If main API fails, verify fallback works
4. **Test API Directly**: Use tools like Postman to test API endpoints directly

For any issues, contact support@mardenseo.com