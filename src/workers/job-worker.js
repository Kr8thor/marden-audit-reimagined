import logger from '../utils/logger.js';
import siteCrawler from '../services/crawler/index.js';

const processJob = async (job) => {
  logger.info('Processing job', { job });
  const crawlResults = await siteCrawler.crawl(job.params.url);
  return Promise.resolve({
    results: crawlResults,
  });
};

export default processJob;