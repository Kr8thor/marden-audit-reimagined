#!/bin/bash

# Configuration for direct deployment
DOMAIN="audit.mardenseo.com"
USER="mardenseo"
REMOTE_SERVER="mardenseo.com"
REMOTE_PATH="/var/www/audit.mardenseo.com"

# Railway deployment section
if [[ "$1" == "--railway" ]]; then
  echo "Deploying to Railway..."
  
  # NOTE: Before running this script with --railway, you must manually run:
  # 1. railway login
  # 2. railway init (if this is the first deployment)
  # 3. railway link (if the project is already created)
  
  # Deploy to Railway
  railway up
  echo "Railway deployment completed!"
  exit 0
fi

# Traditional server deployment
echo "Building the project for server deployment..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Exiting."
  exit 1
fi

# Create a tarball of the dist directory
echo "Creating tarball of the dist directory..."
tar -czf dist.tar.gz -C dist .

# Upload to server
echo "Uploading to $REMOTE_SERVER..."
scp dist.tar.gz $USER@$REMOTE_SERVER:/tmp/

# SSH into the server and extract the files
echo "Extracting files on the server..."
ssh $USER@$REMOTE_SERVER "mkdir -p $REMOTE_PATH && \
  rm -rf $REMOTE_PATH/* && \
  tar -xzf /tmp/dist.tar.gz -C $REMOTE_PATH && \
  rm /tmp/dist.tar.gz"

echo "Deployment completed successfully."
echo "Your application is now available at http://$DOMAIN"
