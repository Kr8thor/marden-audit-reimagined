@echo off
REM Deployment script for Netlify

echo Building frontend for deployment to Netlify...
call npm run build

echo Installing netlify-cli if not already installed...
call npm install -g netlify-cli

echo Deploying to Netlify...
call netlify deploy --prod

echo Frontend deployment complete!
echo Check your Netlify dashboard for the deployment URL.