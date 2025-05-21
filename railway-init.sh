#!/bin/bash
# Script to initialize the frontend project in Railway

echo "Initializing Marden SEO Audit Frontend in Railway..."
echo "==================================================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "Railway CLI not found. Please install it with: npm install -g @railway/cli"
    exit 1
fi

# Check Railway login status
RAILWAY_LOGIN_STATUS=$(railway whoami 2>&1 || echo "Not logged in")
if [[ "$RAILWAY_LOGIN_STATUS" == *"Not logged in"* ]]; then
    echo "You are not logged in to Railway. Please run:"
    echo "railway login"
    exit 1
fi

# Create a new project in Railway
echo "Creating new Railway project: marden-seo-audit-frontend..."
railway project create --name marden-seo-audit-frontend

# Link to the newly created project
echo "Linking to the project..."
railway link

# Set environment variables
echo "Setting environment variables..."
railway variables set \
  VITE_API_URL=https://marden-audit-backend-production.up.railway.app \
  NODE_ENV=production

echo "Frontend project initialization complete!"
echo "You can now run ./deploy.sh to deploy the frontend"