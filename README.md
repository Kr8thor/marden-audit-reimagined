# MardenSEO Audit Frontend

This is the frontend application for MardenSEO Audit tool, a comprehensive SEO analysis tool designed to provide actionable insights for website optimization.

## Features

- Modern UI built with React, TypeScript, and TailwindCSS
- Responsive design for all device sizes
- Real-time SEO auditing
- Interactive visualizations
- Actionable SEO recommendations

## Tech Stack

- React + TypeScript
- Vite for fast development and optimized builds
- TailwindCSS for styling
- Shadcn UI components
- Lucide React for icons
- Recharts for data visualization

## Deployment Optimization

This project has been optimized for deployment on Vercel with fixes for:

- Dependency conflicts by using the `--legacy-peer-deps` flag
- API routing to the backend through Vercel rewrites
- Build configuration optimized for Vercel

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Kr8thor/marden-audit-reimagined.git
   cd marden-audit-reimagined
   ```

2. Install dependencies:
   ```
   npm install --legacy-peer-deps
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Build for production:
   ```
   npm run build
   ```

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

## Backend Integration

The frontend is configured to connect to the backend API through the `/api` endpoint. In production, all API requests are automatically proxied to the deployed backend via Vercel rewrites configured in `vercel.json`.

For local development, set the `VITE_API_URL` environment variable in your `.env` file to point to your local or development backend.

## Troubleshooting

### Dependency Issues

If you encounter dependency conflicts during installation, use the `--legacy-peer-deps` flag:

```
npm install --legacy-peer-deps
```

### API Connection Issues

If the frontend can't connect to the backend:

1. Check the backend deployment status
2. Verify the API URL in `vercel.json` is correct
3. Check for CORS issues in browser developer tools

## Development Notes

- All API calls are made through the API client in `src/api/client.ts`
- The main audit functionality is in the `useAudit` hook
- Update API endpoints in the client if your backend routes differ
