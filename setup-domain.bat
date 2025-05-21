@echo off
REM Script to set up a custom domain for the frontend in Railway

echo Setting up custom domain for Marden SEO Audit Frontend...
echo ========================================================

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

REM Check if project is linked
railway environment >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo No Railway project linked. Please run one of these commands:
    echo railway link   (to link to an existing project)
    echo railway init   (to create a new project)
    exit /b 1
)

REM Add the custom domain
echo Adding custom domain audit.mardenseo.com to the project...
railway domain add audit.mardenseo.com

REM List all domains
echo Current domains for this project:
railway domain list

echo.
echo Domain setup complete!
echo IMPORTANT: Follow these steps to finalize domain setup:
echo 1. Add a CNAME record in your DNS settings pointing audit.mardenseo.com to your Railway domain
echo 2. Wait for DNS propagation (can take up to 24 hours)
echo 3. Verify the domain in Railway dashboard if required