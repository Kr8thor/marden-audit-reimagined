# Marden SEO Audit Tool - Frontend

This repository contains the frontend for the Marden SEO Audit Tool, built with React, Vite, and Tailwind CSS.

## Features

- Single page SEO analysis
- Batch analysis for multiple URLs
- Site-wide crawling and analysis
- Modern, responsive UI
- Optimized for Railway deployment

## Local Development

1. **Installation**

```bash
# Clone the repository
git clone https://github.com/Kr8thor/marden-audit-reimagined.git
cd marden-audit-reimagined

# Install dependencies
npm install
```

2. **Environment Setup**

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit the `.env` file to point to your backend API:

```
VITE_API_URL=http://localhost:3000
PORT=9090
NODE_ENV=development
```

3. **Start the development server**

```bash
npm run dev
```

This will start the Vite development server.

4. **Build for production**

```bash
npm run build
```

This will create a production build in the `dist` directory.

## Deployment on Railway

### Prerequisites

- [Railway CLI](https://docs.railway.app/develop/cli) installed
- Railway account

### Steps

1. **Login to Railway**

```bash
railway login
```

2. **Initialize a new project (first time only)**

```bash
railway init
```

3. **Link existing project (if already created)**

```bash
railway link
```

4. **Set environment variables**

Set the following environment variables in the Railway dashboard:

- `VITE_API_URL`: URL of the backend API (e.g., https://marden-audit-backend-production.up.railway.app)
- `PORT`: 9090
- `NODE_ENV`: production

5. **Deploy**

```bash
railway up
```

6. **Verify Deployment**

Navigate to your Railway dashboard to confirm successful deployment.

## Integration with Backend

The frontend integrates with the Marden SEO Audit Tool backend API for performing SEO analysis. It expects the following endpoints:

- `/health` - Health check endpoint
- `/seo-analyze` - Single page SEO analysis
- `/basic-audit` - Alias for SEO analysis
- `/batch-audit` - For analyzing multiple URLs

The frontend API client in `src/api/client.ts` includes fallback mechanisms for graceful degradation when endpoints are unavailable.

## Directory Structure

- `src/components` - React components
- `src/pages` - Page components
- `src/api` - API client and types
- `src/hooks` - Custom React hooks
- `src/lib` - Utility functions and shared code

## License

Proprietary - All rights reserved
