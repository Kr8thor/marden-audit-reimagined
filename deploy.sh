#!/bin/bash
# Deploy script for frontend

# Deploy with legacy-peer-deps to fix dependency issues
echo "Deploying frontend with legacy-peer-deps..."
vercel --prod
