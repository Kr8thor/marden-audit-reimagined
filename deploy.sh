#!/bin/bash

# Configuration
DOMAIN="audit.mardenseo.com"
USER="yourusername"
REMOTE_SERVER="yourdomain.com"
REMOTE_PATH="/var/www/audit.mardenseo.com"

# Build the project
echo "Building the project..."
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
