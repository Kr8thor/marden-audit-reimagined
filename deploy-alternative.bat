@echo off
echo Deploying Marden SEO Audit Tool to Netlify...

echo Creating zip file of the dist folder...
powershell -Command "Compress-Archive -Path dist\* -DestinationPath dist.zip -Force"

echo Deploy using alternative method...
echo Manual deployment steps:
echo 1. Go to https://app.netlify.com/sites/melodious-gingersnap-1c7067/deploys
echo 2. Click "Deploy manually"
echo 3. Drag and drop the dist.zip file or the dist folder

echo Alternatively, try another deployment when Netlify CLI is working:
echo netlify deploy --prod --site melodious-gingersnap-1c7067 --dir dist

echo Deployment preparation complete!
echo Zip file created at: %CD%\dist.zip