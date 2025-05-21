#!/bin/bash
# Deployment script for Netlify

echo "Building frontend for deployment to Netlify..."
npm run build

echo "Installing netlify-cli if not already installed..."
npm install -g netlify-cli

echo "Deploying to Netlify..."
netlify deploy --prod

echo "Frontend deployment complete!"
echo "Check your Netlify dashboard for the deployment URL."