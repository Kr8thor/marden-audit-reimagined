// Storage utilities for serverless functions
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export async function createJob(job) {
  await redis.set(`job:${job.id}`, JSON.stringify(job));
  return job;
}

export async function getJob(id) {
  const data = await redis.get(`job:${id}`);
  return data ? JSON.parse(data) : null;
}

export async function updateJob(id, updates) {
  const job = await getJob(id);
  if (job) {
    const updatedJob = { ...job, ...updates };
    await redis.set(`job:${id}`, JSON.stringify(updatedJob));
    return updatedJob;
  }
  return null;
}

export async function setJobCompleted(id) {
  const job = await getJob(id);
  if (job) {
    job.status = 'completed';
    await redis.set(`job:${id}`, JSON.stringify(job));
    return job;
  }
  return null;
}

export async function setJobResults(id, results) {
  const job = await getJob(id);
  if (job) {
    job.results = results;
    await redis.set(`job:${id}`, JSON.stringify(job));
    return job;
  }
  return null;
}

export async function getQueueStats() {
  const keys = await redis.keys('job:*');
  const jobs = await Promise.all(keys.map(async (key) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }));

  const validJobs = jobs.filter(job => job !== null);

  const total = validJobs.length;
  const completed = validJobs.filter(job => job.status === 'completed').length;
  const pending = total - completed;

  return {
    total,
    completed,
    pending,
  };
}