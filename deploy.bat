@echo off
echo Deploying Marden Audit Frontend to GitHub and Vercel...

echo Committing changes to GitHub...
git add .
git commit -m "Update frontend implementation with integrated backend API"
git push origin main

echo Installing dependencies...
call npm install

echo Building application...
call npm run build

echo Installing vercel CLI if not already installed...
call npm install -g vercel

echo Deploying to production...
call vercel --prod

echo Deployment completed!
pause