@echo off
echo Deploying Marden SEO Audit Frontend to Railway...

REM Stop any current instances
echo Stopping current deployment...
railway down

REM Copy Railway environment variables
echo Copying Railway environment...
copy /Y .env.railway .env

REM Build the app
echo Building the application...
call npm run build

echo Checking for server dependencies...
call npm list express || (
  echo Installing express for server...
  call npm install express --save
)

echo Deploying...
railway up
railway deploy --detach

echo Done! Your frontend should now be deployed.
echo Checking railway status...
railway status
