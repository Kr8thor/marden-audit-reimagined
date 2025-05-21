#!/bin/bash

# Complete Netlify Deployment Script for Marden SEO Audit Tool
# This script verifies environment variables, builds the project, and deploys it to Netlify

echo "====================================================="
echo "  Marden SEO Audit Tool - Complete Netlify Deployment"
echo "====================================================="

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  echo "⚠️ .env.production file not found, creating with default values..."
  echo "VITE_API_URL=https://marden-audit-backend-production.up.railway.app" > .env.production
  echo "VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app" >> .env.production
  echo "✅ Created .env.production file with default values"
else
  echo "✅ Found existing .env.production file"
fi

# Validate environment file contents
if ! grep -q "VITE_API_URL" .env.production; then
  echo "⚠️ VITE_API_URL not found in .env.production, adding default value..."
  echo "VITE_API_URL=https://marden-audit-backend-production.up.railway.app" >> .env.production
fi

if ! grep -q "VITE_API_FALLBACK_URL" .env.production; then
  echo "⚠️ VITE_API_FALLBACK_URL not found in .env.production, adding default value..."
  echo "VITE_API_FALLBACK_URL=https://marden-seo-audit-api.vercel.app" >> .env.production
fi

echo "🔍 Checking environment variables:"
echo "  - VITE_API_URL: $(grep VITE_API_URL .env.production | cut -d '=' -f2)"
echo "  - VITE_API_FALLBACK_URL: $(grep VITE_API_FALLBACK_URL .env.production | cut -d '=' -f2)"

# Check for netlify.toml
if [ ! -f "netlify.toml" ]; then
  echo "⚠️ netlify.toml file not found, creating with default configuration..."
  cat > netlify.toml << EOL
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "16"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOL
  echo "✅ Created netlify.toml file with default configuration"
else
  echo "✅ Found existing netlify.toml file"
fi

# Check for _redirects
if [ ! -f "public/_redirects" ]; then
  echo "⚠️ public/_redirects file not found, creating..."
  mkdir -p public
  echo "/* /index.html 200" > public/_redirects
  echo "✅ Created public/_redirects file"
else
  echo "✅ Found existing public/_redirects file"
fi
# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Build failed! Exiting."
  exit 1
fi

echo "✅ Build completed successfully"

# Check for Netlify CLI
if ! command -v netlify &> /dev/null; then
  echo "⚠️ Netlify CLI not found, installing..."
  npm install -g netlify-cli
  if [ $? -ne 0 ]; then
    echo "❌ Failed to install Netlify CLI"
    echo "⚠️ Continuing with alternative deployment method"
  else
    echo "✅ Netlify CLI installed successfully"
  fi
fi

# Try to deploy with Netlify CLI if available
if command -v netlify &> /dev/null; then
  echo "🚀 Deploying with Netlify CLI..."
  
  # Check if already logged in
  if netlify status &> /dev/null; then
    echo "✅ Already logged in to Netlify"
  else
    echo "⚠️ Not logged in to Netlify, attempting login..."
    netlify login
    
    if [ $? -ne 0 ]; then
      echo "❌ Failed to log in to Netlify"
      echo "⚠️ Continuing with alternative deployment method"
    fi
  fi
  
  # Try to deploy
  netlify deploy --prod
  
  if [ $? -eq 0 ]; then
    echo "✅ Deployment successful using Netlify CLI!"
    exit 0
  else
    echo "❌ Deployment with Netlify CLI failed"
    echo "⚠️ Trying alternative deployment method..."
  fi
fi

# Alternative method: Open Netlify Drop in browser
echo "🔄 Opening Netlify Drop in your browser..."
echo "Please drag the 'dist' folder to the Netlify Drop page when it opens."

# Open the dist folder
case "$(uname -s)" in
  Darwin)  open "dist" ;; # macOS
  Linux)   xdg-open "dist" || nautilus "dist" || thunar "dist" || pcmanfm "dist" ;; # Linux
  CYGWIN*|MINGW*|MSYS*) explorer "dist" ;; # Windows
  *)       echo "Unable to open folder automatically. Please navigate to the 'dist' folder." ;;
esac

# Open Netlify Drop
case "$(uname -s)" in
  Darwin)  open "https://app.netlify.com/drop" ;; # macOS
  Linux)   xdg-open "https://app.netlify.com/drop" ;; # Linux
  CYGWIN*|MINGW*|MSYS*) start "" "https://app.netlify.com/drop" ;; # Windows
  *)       echo "Unable to open browser automatically. Please visit https://app.netlify.com/drop" ;;
esac

echo "======================================================"
echo "  IMPORTANT POST-DEPLOYMENT STEPS"
echo "======================================================"
echo "1. After deployment, go to 'Site settings' in Netlify dashboard"
echo "2. Navigate to 'Build & deploy' > 'Environment'"
echo "3. Add these variables:"
echo "   - VITE_API_URL = https://marden-audit-backend-production.up.railway.app"
echo "   - VITE_API_FALLBACK_URL = https://marden-seo-audit-api.vercel.app"
echo "4. Trigger a new deployment after setting environment variables"
echo "5. Check the diagnostics page at '/diagnostics' to verify API connections"
echo "======================================================"

echo "🎉 Deployment script completed!"