// Consolidated API index
import { handleCors } from '../utils.mjs';

// Define the handler function
export default function handler(req, res) {
  // Handle CORS preflight requests
  if (handleCors(req, res)) {
    return; // Preflight request handled, exit early
  }

  // Health check endpoint
  if (req.url === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      service: 'Marden SEO Audit API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    });
  }

  // Default 404 response
  res.status(404).json({
    status: 'error',
    message: 'Not found'
  });
}