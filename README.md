# Marden SEO Audit Backend

A comprehensive SEO audit backend system with asynchronous job processing and detailed recommendations.

## Features

- **Asynchronous Architecture**: Queue-based workflow for serverless environments
- **Decoupled Components**: API, job queue, state store, and worker services
- **Comprehensive Analysis**:
  - On-page SEO (meta tags, headings, content)
  - Technical SEO (status codes, redirects, URL structure)
  - Performance metrics
- **Prioritized Recommendations**: Smart recommendation engine
- **Scalable Processing**: Handle sites of any size with batch processing

## System Architecture

The system is built with the following components:

- **API Layer**: Express.js routes that accept audit requests
- **State Store**: Vercel KV-based storage for maintaining job state
- **Job Queue**: Asynchronous job processing system
- **Worker Service**: Performs crawling and analysis in batches
- **Analyzer**: Identifies SEO issues and generates recommendations
- **Reporter**: Creates structured reports with prioritized fixes

## Prerequisites

- Node.js 18+ or 20+
- Vercel account (for Vercel KV)
- (Optional) Google PageSpeed Insights API key

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Fill in the required environment variables in `.env`
5. Start the development server:

```bash
npm run dev
```

## Running the Worker

The worker service processes jobs from the queue:

```bash
npm run dev:worker
```

## API Endpoints

- `POST /api/audit/site`: Submit a site audit job
- `POST /api/audit/page`: Submit a single page audit
- `GET /api/job/:id`: Get job status
- `GET /api/job/:id/results`: Get job results
- `GET /api/status`: Get queue status
- `GET /api/health`: Health check endpoint

### Example API Usage

Submit a site audit job:

```bash
curl -X POST http://localhost:3000/api/audit/site \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "options": {"maxPages": 10, "depth": 2}}'
```

Check job status:

```bash
curl http://localhost:3000/api/job/JOB_ID
```

Get job results:

```bash
curl http://localhost:3000/api/job/JOB_ID/results
```

## Deployment

The project is designed to be deployed to Vercel with Vercel KV:

1. Set up Vercel KV in your Vercel dashboard
2. Link the project with Vercel CLI:

```bash
vercel link
```

3. Add environment variables to Vercel:

```bash
vercel env add
```

4. Deploy to Vercel:

```bash
vercel --prod
```

## Development

### Project Structure

```
src/
  ├── api/            # API routes and server
  ├── analyzers/      # SEO analyzers
  │   ├── index.js            # Main analyzer
  │   ├── meta-analyzer.js    # Meta tag analysis
  │   ├── content-analyzer.js # Content analysis
  │   └── technical-analyzer.js # Technical SEO analysis
  ├── config/         # Configuration
  ├── reporters/      # Report generators
  ├── services/       # Core services
  │   ├── queue/      # Job queue
  │   ├── storage/    # Storage service
  │   └── worker/     # Worker service
  ├── utils/          # Utility functions
  │   ├── crawler.js  # Web crawler
  │   └── logger.js   # Logging utility
  └── index.js        # Entry point
```

### Testing

The `test` directory contains sample request payloads for testing:

```bash
# Test API
curl -X POST http://localhost:3000/api/audit/site -H "Content-Type: application/json" -d @test/site-audit-request.json
```

## License

ISC
