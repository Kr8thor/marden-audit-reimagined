import contentAnalyzer from '../analyzers/content-analyzer.mjs';
import metaAnalyzer from '../analyzers/meta-analyzer.mjs';
import technicalAnalyzer from '../analyzers/technical-analyzer.mjs';
import logger from '../utils/logger.mjs';
import Crawler from '../utils/crawler.mjs';

/**
 * Process a job and call the correct analyzer
 * @param {Object} job - Job object with type and params
 * @returns {Promise<Object>} Results from the analyzer
 */
export default async function processJob(job) {
  logger.info(`Processing job ${job.id}`, { jobId: job.id, jobType: job.type });

  const crawler = new Crawler();
  await crawler.initialize();

  try {
    switch (job.type) {
      case 'site_audit':
        const siteCrawlResult = await crawler.crawl(job.params.url);
        const siteContentAnalysis = await contentAnalyzer.analyze(siteCrawlResult);
        const siteMetaAnalysis = await metaAnalyzer.analyze(siteCrawlResult);
        const siteTechnicalAnalysis = await technicalAnalyzer.analyze(siteCrawlResult);
        
        return {
          crawl: siteCrawlResult,
          content: siteContentAnalysis,
          meta: siteMetaAnalysis,
          technical: siteTechnicalAnalysis,
        };
      case 'page_audit':
        const pageCrawlResult = await crawler.crawl(job.params.url);
        const pageContentAnalysis = await contentAnalyzer.analyze(pageCrawlResult);
        const pageMetaAnalysis = await metaAnalyzer.analyze(pageCrawlResult);
        const pageTechnicalAnalysis = await technicalAnalyzer.analyze(pageCrawlResult);

        return {
          crawl: pageCrawlResult,
          content: pageContentAnalysis,
          meta: pageMetaAnalysis,
          technical: pageTechnicalAnalysis,
        };
      default:
        throw new Error(`Unknown job type: ${job.type}`);
    }
  } catch (error) {
    logger.error(`Error processing job ${job.id}:`, error);
    throw error;
  } finally {
    await crawler.close();
  }
}