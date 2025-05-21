@echo off
REM Script to initialize the frontend project in Railway

echo Initializing Marden SEO Audit Frontend in Railway...
echo ===================================================

REM Check if Railway CLI is installed
where railway >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Railway CLI not found. Please install it with: npm install -g @railway/cli
    exit /b 1
)

REM Check Railway login status
railway whoami >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo You are not logged in to Railway. Please run:
    echo railway login
    exit /b 1
)

REM Create a new project in Railway
echo Creating new Railway project: marden-seo-audit-frontend...
railway project create --name marden-seo-audit-frontend

REM Link to the newly created project
echo Linking to the project...
railway link

REM Set environment variables
echo Setting environment variables...
railway variables set VITE_API_URL=https://marden-audit-backend-production.up.railway.app NODE_ENV=production

echo Frontend project initialization complete!
echo You can now run deploy.bat to deploy the frontend