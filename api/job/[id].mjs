import { getJob } from '../_lib/storage.mjs';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Extract job ID from the URL
    const jobId = req.query.id;

    // Check if job ID is provided
    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required',
      });
    }

    // Get job from Redis
    const job = await getJob(jobId);

    // Check if job exists
    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: `Job ${jobId} not found`,
      });
    }

    // Return job details
    return res.status(200).json({
      status: 'ok',
      job,
    });
  } catch (error) {
    // Handle errors
    console.error(`Error getting job ${req.query.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to get job details',
      error: error.message,
    });
  }
}