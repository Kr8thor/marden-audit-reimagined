import express from 'express';
import routes from './routes.mjs';
import morgan from 'morgan';
import cors from 'cors';
import logger from '../utils/logger.mjs';
import { processNextJob } from '../services/queue/job-queue.mjs';
import config from '../config/index.mjs';

/**
 * Create the express server instance
 */
function createServer() {
  const app = express();
  
  // Middleware
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  
  // Logging
  app.use(morgan('combined', { stream: logger.stream }));
  
  // CORS
  app.use(cors());
  
  // API routes
  app.use('/api', routes);
  
  // Root path for health check
  app.get('/', (req, res) => {
    res.status(200).json({
      name: 'Marden SEO Audit API',
      version: process.env.npm_package_version || '1.0.0',
      status: 'running',
    });
  });
  
  // Handle 404s
  app.use((req, res, next) => {
    res.status(404).json({
      status: 'error',
      message: `Not found: ${req.originalUrl}`,
    });
  });
  
  // Error handler
  app.use((err, req, res, next) => {
    logger.error('Express error:', err);
    res.status(err.status || 500).json({
      status: 'error',
      message: err.message || 'Internal server error',
    });
  });
  
  return app;
};

export default createServer;