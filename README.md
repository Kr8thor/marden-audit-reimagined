# MardenSEO Audit Backend

This is the backend API for the MardenSEO Audit tool, providing SEO analysis capabilities for websites and pages.

## Features

- Comprehensive SEO auditing for websites and individual pages
- Asynchronous job processing with Redis queue
- Detailed meta tag analysis
- Content quality assessment
- Technical SEO evaluation
- Performance metrics analysis
- Robust report generation

## Tech Stack

- Node.js
- Express.js
- Redis (Upstash) for queue and caching
- Vercel Serverless Functions

## Vercel Deployment Optimization

This project has been optimized for deployment on Vercel's Hobby plan, which has a limit of 12 serverless functions. The optimization includes:

- Consolidated API endpoints in the `api/consolidated` directory
- Route configuration in `vercel.json` to map standard API paths to consolidated endpoints
- Simplified CORS handling built into each endpoint

## API Endpoints

The following endpoints are available:

- `GET /api` - API status and health check
- `GET /api/health` - Detailed health check
- `POST /api/audit/site` - Submit a URL for site audit
- `POST /api/audit/page` - Submit a URL for page audit
- `GET /api/job/:id` - Get job status
- `GET /api/job/:id/results` - Get job results
- `GET /api/worker` - Process jobs from queue (also run on schedule)

## Deployment Instructions

### Prerequisites

- Vercel CLI installed and configured
- Git for version control

### Deployment Steps

1. Ensure you have the latest code:
   ```
   git pull origin main
   ```

2. Use the provided deployment script:
   ```
   # On Linux/Mac
   ./deploy.sh
   
   # On Windows
   deploy.bat
   ```

3. Or deploy manually:
   ```
   vercel --prod
   ```

## Environment Variables

The following environment variables are configured in Vercel:

- `UPSTASH_REDIS_REST_URL` - Upstash Redis URL
- `UPSTASH_REDIS_REST_TOKEN` - Upstash Redis auth token
- `QUEUE_NAME` - Name of the main job queue
- `PROCESSING_QUEUE_NAME` - Name of the processing queue
- `JOB_PREFIX` - Prefix for job keys in Redis
- `MAX_PAGES` - Maximum pages to crawl per site
- `CRAWL_DEPTH` - Maximum crawl depth
- `TIMEOUT` - Request timeout in milliseconds
- `USER_AGENT` - Custom user agent for crawling
- `ALLOWED_ORIGINS` - CORS allowed origins
- `LOG_LEVEL` - Logging level

## Local Development

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-backend.git
   cd marden-audit-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Configure Redis and other settings

4. Start the development server:
   ```
   npm run dev
   ```

## Troubleshooting

- If you encounter deployment issues, check the Vercel logs
- For Redis connectivity issues, verify your Upstash credentials
- For CORS issues, check the ALLOWED_ORIGINS environment variable
