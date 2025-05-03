import dotenv from 'dotenv';

dotenv.config();

const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  keys: {
    jobPrefix: process.env.REDIS_KEY_PREFIX_JOB || 'job:',
    queueKey: process.env.REDIS_KEY_QUEUE || 'queue',
    processingQueueKey: process.env.REDIS_KEY_PROCESSING || 'processing',
  },
  queue: {
    batchSize: parseInt(process.env.QUEUE_BATCH_SIZE || '5', 10),
  },
  crawler: {
    timeout: parseInt(process.env.CRAWLER_TIMEOUT || '30000', 10),
    maxPages: parseInt(process.env.CRAWLER_MAX_PAGES || '100', 10),
    maxDepth: parseInt(process.env.CRAWLER_MAX_DEPTH || '3', 10),
    userAgent: process.env.CRAWLER_USER_AGENT || 'MardenSEOAuditBot/1.0',
    delay: parseInt(process.env.CRAWLER_DELAY || '500', 10),
  },
  analysis: {
    maxSitePages: parseInt(process.env.ANALYSIS_MAX_SITE_PAGES || '100', 10),
  },
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  }
};

export default config;