@echo off
setlocal

echo === Marden SEO Audit Tool - Netlify Deployment ===
echo Starting deployment process...

:: Build the project
echo Building project...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo Build failed! Exiting.
  exit /b 1
)
echo Build completed successfully.

:: Open Netlify Drop in browser
echo Opening Netlify Drop in your browser...
echo Please drag the dist folder from your file explorer to the Netlify Drop page.
start "" "https://app.netlify.com/drop"

:: Open the dist folder
echo Opening dist folder...
explorer "dist"

echo.
echo Instructions:
echo 1. Drag the entire dist folder to the Netlify Drop page
echo 2. Wait for upload to complete
echo 3. Your site will be deployed automatically
echo 4. Set up your custom domain in the Netlify dashboard

echo.
echo Press any key to exit...
pause > nul
