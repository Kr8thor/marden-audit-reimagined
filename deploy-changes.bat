@echo off
echo Deploying Marden Audit Frontend changes to GitHub and Vercel...

echo Committing changes to local repository...
git add .
git commit -m "Improve error handling and CSP configuration"

echo Pushing changes to GitHub...
git push origin main

echo Deploying to Vercel...
call vercel --prod

echo Deployment complete!
pause
