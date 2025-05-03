import express from 'express';
import jobQueue, { processNextJob } from '../services/queue/job-queue.mjs';
import logger from '../utils/logger.mjs';
import config from '../config/index.mjs';

const router = express.Router();
router.get('/status', async (req, res) => {
  const stats = await jobQueue.getStats();
  res.status(200).json({ status: 'ok', queue: stats });
});

/**
 * Worker status endpoint
 */
router.get('/worker', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Worker is running',
  });
});
/**
 * Submit a new site audit job
 */
router.post('/audit/site', async (req, res) => {
  try {
    const { url, options } = req.body;
    
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required',
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid URL provided',
      });
    }

    // Create job
    const jobId = await jobQueue.createJob({
      type: 'site_audit',
      params: {
        url,
        options: options || {},
      },
    });

    logger.info(`Created site audit job for ${url}`, { jobId });

    res.status(202).json({
      status: 'success',
      message: 'Site audit job created',
      jobId,
      url,
    });
  } catch (error) {
    logger.error('Error creating site audit job:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create site audit job',
      error: error.message,
    });
  }
});

/**
 * Submit a new page audit job
 */
router.post('/audit/page', async (req, res) => {
  try {
    logger.info('Received POST request on /audit/page', { body: req.body });

    const { url, options } = req.body;
    
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required',
      });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid URL provided',
      });
    }

    // Create job
    const jobId = await jobQueue.createJob({
      type: 'page_audit',
      params: {
        url,
        options: options || {},
      },
    });

    logger.info(`Created page audit job for ${url}`, { jobId });

    res.status(202).json({
      status: 'success',
      message: 'Page audit job created',
      jobId,
      url,
    });
  } catch (error) {
    logger.error('Error creating page audit job:', error);
    
    res.status(500).json({
      status: 'success',
      message: 'Failed to create page audit job',
      error: error.message,
    });
  }
});

/**
 * Get job status
 */
router.get('/job/:id', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await jobQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: `Job ${jobId} not found`,
      });
    }

    // Return job without potentially large result data
    const { results, ...jobData } = job;

    res.status(200).json({
      status: 'success',
      job: {
        ...jobData,
        hasResults: !!results,
      },
    });
  } catch (error) {
    logger.error(`Error getting job ${req.params.id}:`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get job details',
      error: error.message,
    });
  };
});

/**
 * Get job results
 */
router.get('/job/:id/results', async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await jobQueue.getJob(jobId);
    
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: `Job ${jobId} not found`,
      });
    }

    if (job.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: `Job ${jobId} is not completed (status: ${job.status})`,
        jobStatus: job.status,
      });
    }

    if (!job.results) {
      return res.status(404).json({
        status: 'error',
        message: `No results found for job ${jobId}`,
      });
    }

    res.status(200).json({
      status: 'ok',
      jobId,
      completed: job.completed,
      results: job.results,
    });
  } catch (error) {
    logger.error(`Error getting results for job ${req.params.id}:`, error);
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to get job results',
      error: error.message,
    }); 
  };
});
export default router;
