// Redis client and utility functions
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Job prefixes and keys
const JOB_PREFIX = 'job:';
const QUEUE_KEY = 'audit:queue';
const PROCESSING_QUEUE_KEY = 'audit:processing';

/**
 * Get a job by ID
 */
async function getJob(jobId) {
  try {
    const jobKey = `${JOB_PREFIX}${jobId}`;
    const jobData = await redis.get(jobKey);
    return jobData ? JSON.parse(jobData) : null;
  } catch (error) {
    console.error(`Error getting job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Create a new job
 */
async function createJob(jobData) {
  try {
    const { id, ...rest } = jobData;
    const jobId = id;
    const jobKey = `${JOB_PREFIX}${jobId}`;

    // Save the job data
    await redis.set(jobKey, JSON.stringify({ id: jobId, ...rest }));

    // Add to queue
    await redis.rpush(QUEUE_KEY, jobId);

    return jobId;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  try {
    const queueLength = await redis.llen(QUEUE_KEY);
    const processingLength = await redis.llen(PROCESSING_QUEUE_KEY);

    return {
      queue: {
        waiting: queueLength,
        processing: processingLength,
        total: queueLength + processingLength,
      },
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    throw error;
  }
}

export { redis, getJob, createJob, getQueueStats };