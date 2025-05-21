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

:: Method 1: Try Netlify CLI
echo Attempting Method 1: Netlify CLI deployment...
echo This may take a while...

:: Set a timeout for Netlify CLI (2 minutes)
echo Deploying with Netlify CLI (timeout: 2 minutes)...
set TIMEOUT_SECONDS=120
set "START_TIME=%TIME%"

:: Start Netlify deployment with timeout
start /b cmd /c npx netlify deploy --prod --dir=dist > netlify_output.txt 2>&1
set NETLIFY_PID=%ERRORLEVEL%

:: Wait loop with timeout
:wait_loop
timeout /t 5 /nobreak > nul
if exist netlify_output.txt (
  findstr /C:"Deploy is live!" netlify_output.txt > nul
  if %ERRORLEVEL% equ 0 (
    echo Netlify CLI deployment succeeded!
    goto :deployment_succeeded
  )
  
  findstr /C:"Error" netlify_output.txt > nul
  if %ERRORLEVEL% equ 0 (
    echo Netlify CLI deployment failed. Trying alternative method...
    goto :method2
  )
)

:: Check if we've exceeded the timeout
set "CURRENT_TIME=%TIME%"
call :calculate_elapsed_time "%START_TIME%" "%CURRENT_TIME%"
if %elapsed_seconds% gtr %TIMEOUT_SECONDS% (
  echo Netlify CLI is taking too long. Trying alternative method...
  goto :method2
)

goto :wait_loop

:method2
echo Attempting Method 2: Direct deployment...
echo Please use the Netlify Drop method by dragging the dist folder to:
echo https://app.netlify.com/drop
echo.
echo Alternatively, use the Netlify GitHub integration by connecting your repository.
echo.
explorer "dist"
start "" "https://app.netlify.com/drop"

echo Manual deployment steps initiated.
goto :end

:deployment_succeeded
echo Deployment completed successfully!
type netlify_output.txt | findstr /C:"Website Draft URL:"
echo.
echo Check your Netlify dashboard for details.

:end
if exist netlify_output.txt del netlify_output.txt
echo Deployment process completed!
exit /b 0

:calculate_elapsed_time
:: Convert start time to seconds
for /f "tokens=1-4 delims=:." %%a in ("%~1") do (
  set /a start_h=1%%a %% 100
  set /a start_m=1%%b %% 100
  set /a start_s=1%%c %% 100
  set /a start_hs=1%%d %% 100
)
set /a start_seconds=(((start_h*60)+start_m)*60+start_s)

:: Convert end time to seconds
for /f "tokens=1-4 delims=:." %%a in ("%~2") do (
  set /a end_h=1%%a %% 100
  set /a end_m=1%%b %% 100
  set /a end_s=1%%c %% 100
  set /a end_hs=1%%d %% 100
)
set /a end_seconds=(((end_h*60)+end_m)*60+end_s)

:: Calculate elapsed time
set /a elapsed_seconds=end_seconds-start_seconds
if %elapsed_seconds% lss 0 set /a elapsed_seconds+=86400
goto :eof
