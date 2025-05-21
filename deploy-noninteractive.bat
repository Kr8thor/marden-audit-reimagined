@echo off
echo Deploying Marden SEO Audit Frontend to Railway (Non-interactive mode)...

echo Copying Railway environment...
copy /Y .env.railway .env

echo Building the application...
call npm run build

echo Checking for server dependencies...
call npm list express || (
  echo Installing express for server...
  call npm install express --save
)

echo Creating deployment instructions...
echo 1. First, make sure you've deployed the backend and have its URL
echo 2. Update the .env.railway file with the backend URL:
echo    Open .env.railway and set VITE_API_URL=https://your-backend-url
echo 3. Open a command prompt in this directory
echo 4. Run the following commands manually:
echo.
echo    railway login
echo    railway init
echo    - When prompted, create a new project for the frontend
echo    railway up
echo    railway deploy
echo    railway domain
echo.
echo 5. Test the frontend by visiting the domain URL
echo.
echo The frontend files are now prepared for deployment!
