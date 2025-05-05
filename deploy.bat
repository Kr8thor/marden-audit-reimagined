@echo off
REM Deploy script for Marden SEO Audit Frontend to Railway

REM NOTE: Before running this script, you must manually run:
REM 1. railway login
REM 2. railway init (if this is the first deployment)
REM 3. railway link (if the project is already created)

echo Deploying Marden SEO Audit Frontend to Railway...
echo Building and preparing for deployment...

REM Ensure we're using the production environment
set NODE_ENV=production

REM Deploy to Railway
railway up
