@echo off
echo === Marden SEO Audit Tool - Complete Netlify Deployment ===
echo Starting deployment process...

:: Create production env file
echo Creating production environment variables...
echo VITE_API_URL=https://marden-audit-backend-production.up.railway.app > .env.production
echo VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app >> .env.production

:: Build the project with production env
echo Building project with production environment...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Build failed! Exiting.
  exit /b 1
)
echo Build completed successfully.

:: Create _redirects file for SPA routing
echo Creating Netlify _redirects file...
echo /* /index.html 200 > dist/_redirects
echo _redirects file created.

:: Create netlify.toml if it doesn't exist
echo Ensuring netlify.toml exists...
if not exist netlify.toml (
  echo Creating netlify.toml...
  echo [build] > netlify.toml
  echo   command = "npm run build" >> netlify.toml
  echo   publish = "dist" >> netlify.toml
  echo. >> netlify.toml
  echo [build.environment] >> netlify.toml
  echo   NODE_VERSION = "16" >> netlify.toml
  echo. >> netlify.toml
  echo [[redirects]] >> netlify.toml
  echo   from = "/*" >> netlify.toml
  echo   to = "/index.html" >> netlify.toml
  echo   status = 200 >> netlify.toml
)

:: Open Netlify Drop in browser
echo Opening Netlify Drop in your browser...
echo Please drag the dist folder from your file explorer to the Netlify Drop page.
start "" "https://app.netlify.com/drop"

:: Open the dist folder
echo Opening dist folder...
explorer "dist"

echo.
echo Instructions:
echo 1. Make sure you drag the ENTIRE dist folder to the Netlify Drop page
echo 2. After deployment, go to Site settings in Netlify dashboard
echo 3. Under "Build & deploy" > "Environment", add these variables:
echo    - VITE_API_URL = https://marden-audit-backend-production.up.railway.app
echo    - VITE_API_FALLBACK_URL = https://marden-seo-audit-api.vercel.app
echo 4. Trigger a new deploy after setting environment variables
echo.
echo Press any key to exit...
pause > nul
