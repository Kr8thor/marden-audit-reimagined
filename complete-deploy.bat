@echo off
setlocal

echo =====================================================
echo   Marden SEO Audit Tool - Complete Netlify Deployment
echo =====================================================

:: Check if .env.production exists
if not exist .env.production (
  echo ⚠️ .env.production file not found, creating with default values...
  echo VITE_API_URL=https://marden-audit-backend-production.up.railway.app > .env.production
  echo VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app >> .env.production
  echo ✅ Created .env.production file with default values
) else (
  echo ✅ Found existing .env.production file
)

:: Check for _redirects
if not exist public\_redirects (
  echo ⚠️ public\_redirects file not found, creating...
  if not exist public mkdir public
  echo /* /index.html 200 > public\_redirects
  echo ✅ Created public\_redirects file
) else (
  echo ✅ Found existing public\_redirects file
)

:: Check for netlify.toml
if not exist netlify.toml (
  echo ⚠️ netlify.toml file not found, creating with default configuration...
  (
    echo [build]
    echo   command = "npm run build"
    echo   publish = "dist"
    echo.
    echo [build.environment]
    echo   NODE_VERSION = "16"
    echo.
    echo [[redirects]]
    echo   from = "/*"
    echo   to = "/index.html"
    echo   status = 200
  ) > netlify.toml
  echo ✅ Created netlify.toml file with default configuration
) else (
  echo ✅ Found existing netlify.toml file
)

:: Build the project
echo 🔨 Building the project...
call npm run build

if %ERRORLEVEL% neq 0 (
  echo ❌ Build failed! Exiting.
  exit /b 1
)

echo ✅ Build completed successfully

:: Try to deploy with Netlify CLI if available
where netlify >nul 2>nul
if %ERRORLEVEL% equ 0 (
  echo 🚀 Deploying with Netlify CLI...
  call netlify deploy --prod
  
  if %ERRORLEVEL% equ 0 (
    echo ✅ Deployment successful using Netlify CLI!
    goto :end
  ) else (
    echo ❌ Deployment with Netlify CLI failed
    echo ⚠️ Trying alternative deployment method...
  )
) else (
  echo ⚠️ Netlify CLI not found, using alternative deployment method...
)
:: Alternative method: Open Netlify Drop in browser
echo 🔄 Opening Netlify Drop in your browser...
echo Please drag the 'dist' folder to the Netlify Drop page when it opens.

:: Open the dist folder
explorer "dist"

:: Open Netlify Drop
start "" "https://app.netlify.com/drop"

echo ======================================================
echo   IMPORTANT POST-DEPLOYMENT STEPS
echo ======================================================
echo 1. After deployment, go to 'Site settings' in Netlify dashboard
echo 2. Navigate to 'Build ^& deploy' ^> 'Environment'
echo 3. Add these variables:
echo    - VITE_API_URL = https://marden-audit-backend-production.up.railway.app
echo    - VITE_API_FALLBACK_URL = https://marden-seo-audit-api.vercel.app
echo 4. Trigger a new deployment after setting environment variables
echo 5. Check the diagnostics page at '/diagnostics' to verify API connections
echo ======================================================

echo 🎉 Deployment script completed!

:end
pause