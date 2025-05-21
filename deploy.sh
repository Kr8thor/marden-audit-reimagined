#!/bin/bash
# Comprehensive Railway deployment script for Marden SEO Audit Frontend

echo "Deploying Marden SEO Audit Frontend to Railway..."
echo "================================================"

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

# Check if project is linked
RAILWAY_PROJECT=$(railway environment 2>&1 || echo "No project linked")
if [[ "$RAILWAY_PROJECT" == *"No project linked"* ]]; then
    echo "No Railway project linked. Please run one of these commands:"
    echo "railway link   (to link to an existing project)"
    echo "railway init   (to create a new project)"
    exit 1
fi
# Ensure we're on the right branch
git checkout main

# Check for uncommitted changes
if [[ $(git status --porcelain) ]]; then
  echo "Uncommitted changes detected. Committing..."
  git add .
  git commit -m "Automated deployment commit"
fi

# Push to GitHub
echo "Pushing changes to GitHub..."
git push origin main

# Set Railway environment variables
echo "Setting environment variables..."
railway variables set \
  VITE_API_URL=https://marden-audit-backend-production.up.railway.app \
  NODE_ENV=production

# Deploy to Railway
echo "Deploying to Railway..."
railway up

echo "Frontend deployment complete!"
echo "Frontend URL: $(railway domain)"

# Show environment status
echo "Environment status:"
railway status