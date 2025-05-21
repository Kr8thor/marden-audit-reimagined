# Netlify Post-Deployment Verification Guide

After deploying your site to Netlify through the Netlify Drop interface, follow these steps to verify and complete the setup:

## 1. Verify Environment Variables

1. Go to your Netlify dashboard
2. Select your newly deployed site
3. Navigate to: **Site settings** → **Build & deploy** → **Environment**
4. Verify that these variables are set:
   - `VITE_API_URL` = `https://marden-audit-backend-production.up.railway.app`
   - `VITE_API_FALLBACK_URL` = `https://marden-seo-audit-api.vercel.app`
5. If not, add them using the "Add variable" button

## 2. Trigger a New Deployment

After setting the environment variables:

1. Go to the "Deploys" tab
2. Click "Trigger deploy" → "Deploy site"
3. Wait for deployment to complete

## 3. Verify Routes and Redirects

To ensure React routing works properly:

1. Navigate directly to `/enhanced-analyzer`
2. Verify the Enhanced Analyzer page loads correctly
3. Check the Network tab in developer tools - you should see 200 responses, not 404s

## 4. Test API Integration

1. On the Enhanced Analyzer page, enter a test URL
2. Click "Analyze Website"
3. Verify if the analysis completes and displays results
4. Check Console for any errors

## 5. Domain Setup

If using a custom domain:

1. Go to **Site settings** → **Domain management**
2. Add your custom domain (`audit.mardenseo.com`)
3. Follow Netlify's instructions to configure DNS settings

## Debugging Common Issues

### Issue: Routes return 404
Solution: Verify your Netlify redirects configuration:
1. Check that `netlify.toml` includes the redirect rule
2. Verify `_redirects` file exists in the published site
3. Check for any custom routing rules that might interfere

### Issue: API calls fail
Solution: 
1. Check environment variables are correctly set
2. Verify CORS settings on the backend API
3. Ensure backend API is operational
4. Check for typos in API endpoint URLs

### Issue: Missing components
Solution:
1. Check browser console for JavaScript errors
2. Verify imports in component files are correct
3. Ensure all required dependencies are installed

## Contact Support

If you encounter persistent issues, contact:
- Email: support@mardenseo.com
- GitHub: @Kr8thor