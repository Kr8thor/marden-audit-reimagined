#!/bin/bash

# Reliable Netlify Deploy Script
# This script provides multiple deployment methods in case one fails

echo "=== Marden SEO Audit Tool - Netlify Deployment ==="
echo "Starting deployment process..."

# Build the project
echo "Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "Build failed! Exiting."
  exit 1
fi
echo "Build completed successfully."

# Method 1: Try Netlify CLI (fastest but might be slow)
echo "Attempting Method 1: Netlify CLI deployment..."
echo "This may take a while..."
npx netlify deploy --prod --dir=dist --timeout=300 &
NETLIFY_PID=$!

# Wait up to 2 minutes for Netlify CLI
echo "Waiting for Netlify CLI deployment (max 2 minutes)..."
TIMEOUT=120
COUNT=0
while kill -0 $NETLIFY_PID 2>/dev/null && [ $COUNT -lt $TIMEOUT ]; do
  sleep 1
  COUNT=$((COUNT+1))
  if [ $((COUNT % 10)) -eq 0 ]; then
    echo "Still waiting for Netlify deployment... ($COUNT seconds)"
  fi
done

# Check if Netlify CLI succeeded
if kill -0 $NETLIFY_PID 2>/dev/null; then
  echo "Netlify CLI is taking too long. Trying alternative method..."
  kill $NETLIFY_PID
  METHOD1_SUCCESS=false
else
  wait $NETLIFY_PID
  if [ $? -eq 0 ]; then
    echo "Netlify CLI deployment succeeded!"
    METHOD1_SUCCESS=true
  else
    echo "Netlify CLI deployment failed. Trying alternative method..."
    METHOD1_SUCCESS=false
  fi
fi

# Method 2: Direct to Netlify Drop via API if Method 1 failed
if [ "$METHOD1_SUCCESS" = false ]; then
  echo "Attempting Method 2: Netlify API deployment..."
  
  # Create a zip file of the dist directory
  echo "Creating deployment package..."
  cd dist && zip -r ../deploy.zip * && cd ..
  
  # Upload directly via Netlify API
  echo "Uploading to Netlify..."
  NETLIFY_AUTH_TOKEN=$(cat ~/.netlify/config.json | grep "auth" | cut -d'"' -f4)
  
  if [ -z "$NETLIFY_AUTH_TOKEN" ]; then
    echo "Netlify auth token not found. Please run 'netlify login' first."
    exit 1
  fi
  
  SITE_ID=$(cat .netlify/state.json | grep "siteId" | cut -d'"' -f4)
  
  if [ -z "$SITE_ID" ]; then
    echo "Site ID not found. Has this site been initialized with Netlify?"
    echo "Trying to create a new site..."
    SITE_ID=$(curl -s -X POST "https://api.netlify.com/api/v1/sites" \
      -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name":"marden-audit-tool"}' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "$SITE_ID" ]; then
      echo "Failed to create new site. Exiting."
      exit 1
    else
      echo "Created new site with ID: $SITE_ID"
      mkdir -p .netlify
      echo "{\"siteId\":\"$SITE_ID\"}" > .netlify/state.json
    fi
  fi
  
  echo "Deploying to site ID: $SITE_ID"
  DEPLOY_RESPONSE=$(curl -s -X POST "https://api.netlify.com/api/v1/sites/$SITE_ID/deploys" \
    -H "Authorization: Bearer $NETLIFY_AUTH_TOKEN" \
    -H "Content-Type: application/zip" \
    --data-binary "@deploy.zip")
  
  DEPLOY_URL=$(echo $DEPLOY_RESPONSE | grep -o '"url":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$DEPLOY_URL" ]; then
    echo "Deployment failed via API. Please try manual deployment."
    echo "You can upload the dist folder manually at https://app.netlify.com/drop"
    exit 1
  else
    echo "Deployment succeeded via API!"
    echo "Deployed to: $DEPLOY_URL"
  fi
  
  # Clean up zip file
  rm deploy.zip
fi

echo "Deployment process completed!"
