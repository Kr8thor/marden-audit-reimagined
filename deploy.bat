@echo off
echo Deploying Marden Audit Frontend to Vercel...

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