# Marden SEO Audit Tool - Deployment Guide

This guide covers the deployment process for both the frontend and backend components of the Marden SEO Audit Tool on Railway's Hobby Plan.

## Prerequisites

1. Railway CLI installed and authenticated
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. Node.js and npm installed locally
3. Git installed and configured
4. Access to both repositories:
   - Backend: `https://github.com/Kr8thor/marden-audit-backend`
   - Frontend: `https://github.com/Kr8thor/marden-audit-reimagined`

## Step 1: Set Up Redis on Upstash

Before deploying to Railway, we need to set up a Redis instance for caching:

1. Create an account on [Upstash](https://upstash.com/) if you don't have one
2. Create a new Redis database:
   - Name: `marden-seo-cache`
   - Region: Choose the closest to your target audience
   - Type: Free tier
3. Once created, note the REST API details:
   - REST URL
   - REST Token

## Step 2: Deploy Backend to Railway

### Configure Environment

1. Clone the backend repository:
   ```bash
   git clone https://github.com/Kr8thor/marden-audit-backend.git
   cd marden-audit-backend
   ```

2. Update the Redis credentials in `.env.railway`:
   ```
   UPSTASH_REDIS_REST_URL=your-redis-rest-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-rest-token
   ```

### Deploy

1. Link the directory to a Railway project:
   ```bash
   railway init
   ```
   - Create a new project when prompted

2. Run the deployment script:
   ```bash
   # Windows
   deploy-railway.bat
   
   # Linux/Mac
   chmod +x deploy-railway.sh
   ./deploy-railway.sh
   ```

3. Verify the deployment:
   ```bash
   railway status
   ```

4. Test the health endpoint:
   - Get the URL from the Railway dashboard or by running `railway domain`
   - Open `https://your-backend-url.railway.app/health` in a browser
   - Verify it returns a valid JSON response with status "ok"

5. Note the backend URL for the frontend configuration

## Step 3: Deploy Frontend to Railway

### Configure Environment

1. Clone the frontend repository:
   ```bash
   git clone https://github.com/Kr8thor/marden-audit-reimagined.git
   cd marden-audit-reimagined
   ```

2. Update the API URL in `.env.railway`:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

### Deploy

1. Link the directory to a Railway project:
   ```bash
   railway init
   ```
   - Create a new project when prompted

2. Run the deployment script:
   ```bash
   # Windows
   deploy-railway.bat
   
   # Linux/Mac
   chmod +x deploy-railway.sh
   ./deploy-railway.sh
   ```

3. Verify the deployment:
   ```bash
   railway status
   ```

4. Test the frontend:
   - Get the URL from the Railway dashboard or by running `railway domain`
   - Open the URL in a browser
   - Verify the application loads and connects to the backend

## Step 4: Custom Domain Setup (Optional)

To set up a custom domain like `audit.mardenseo.com`:

1. Go to your Railway project in the dashboard
2. Navigate to Settings > Domains
3. Click "Add Domain" and enter your domain (e.g., `audit.mardenseo.com`)
4. Follow the DNS configuration instructions provided by Railway
5. Wait for DNS propagation (may take up to 24-48 hours)

## Step 5: Testing and Verification

After deployment, perform these tests to ensure everything is working:

1. **Health Check**:
   - Backend: `https://your-backend-url.railway.app/health`
   - Frontend: `https://your-frontend-url.railway.app/health`

2. **Basic SEO Audit**:
   - Enter a URL in the frontend interface
   - Verify analysis completes successfully
   - Check cache functionality by running the same URL again (should be faster)

3. **Error Handling**:
   - Test with an invalid URL to verify error handling
   - Temporarily disable Redis to test fallback behavior

4. **Resource Usage**:
   - Monitor CPU and memory usage in Railway dashboard
   - Ensure usage stays within Hobby plan limits

## Monitoring and Maintenance

### Regular Checks

1. **Weekly**:
   - Review error logs in Railway dashboard
   - Check memory usage patterns
   - Verify Redis connection status

2. **Monthly**:
   - Assess performance metrics
   - Review cached data utilization
   - Update dependencies if needed

### Troubleshooting Common Issues

1. **High Memory Usage**:
   - Decrease `MAX_CONCURRENCY` in backend `.env.railway`
   - Reduce memory cache size
   - Check for memory leaks using status endpoint

2. **Connection Timeouts**:
   - Verify Redis connection settings
   - Check network latency between Railway and Upstash
   - Adjust timeout settings in the backend

3. **Frontend-Backend Connection Issues**:
   - Verify CORS settings include the frontend URL
   - Check API URL configuration in frontend
   - Test direct API access to isolate the issue

## Scaling Considerations

The current configuration is optimized for Railway's Hobby plan. For scaling:

1. **Increase Resource Limits**:
   - Adjust memory and CPU limits in `railway.toml`
   - Upgrade to a higher Railway plan if needed

2. **Enhanced Caching**:
   - Increase Redis capacity
   - Implement request batching for high-load periods

3. **Load Distribution**:
   - Consider adding a queue service for high-volume analysis
   - Implement analysis sharding for complex URLs

## Backup and Recovery

1. **Regular Backups**:
   - Use `railway backup` command to create backups
   - Store configuration files in version control

2. **Recovery Procedure**:
   - Deploy from the latest known good version
   - Restore environment variables
   - Verify connections to external services

## Security Considerations

1. **Environment Variables**:
   - Never commit sensitive values to the repository
   - Use Railway's environment variable encryption

2. **API Protection**:
   - Consider adding rate limiting for production
   - Implement request validation

3. **Dependency Management**:
   - Regularly scan for security vulnerabilities
   - Keep dependencies updated
