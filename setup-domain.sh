#!/bin/bash
# Script to set up a custom domain for the frontend in Railway

echo "Setting up custom domain for Marden SEO Audit Frontend..."
echo "========================================================"

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

# Add the custom domain
echo "Adding custom domain audit.mardenseo.com to the project..."
railway domain add audit.mardenseo.com

# List all domains
echo "Current domains for this project:"
railway domain list

echo ""
echo "Domain setup complete!"
echo "IMPORTANT: Follow these steps to finalize domain setup:"
echo "1. Add a CNAME record in your DNS settings pointing audit.mardenseo.com to your Railway domain"
echo "2. Wait for DNS propagation (can take up to 24 hours)"
echo "3. Verify the domain in Railway dashboard if required"