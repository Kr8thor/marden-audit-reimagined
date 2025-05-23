/**
 * Fixed Crawling Service - Uses real API endpoints
 * NO MOCK DATA - This service connects to the actual backend
 */
import { performEnhancedAnalysis } from './realEnhancedApiService';

/**
 * Force a site crawl using the real API
 * @param {string} url URL to crawl
 * @param {Object} options Crawling options
 * @returns {Promise<Object>} Real crawl results
 */
export const forceCrawlSite = async (url, options = {}) => {
  if (!url) throw new Error('URL is required');
  
  console.log(`🚀 REAL crawl request for ${url} with options:`, options);
  
  // Use the real enhanced analysis service
  const analysisResult = await performEnhancedAnalysis(url, {
    ...options,
    crawlSite: true,
    enhanced: true
  });
  
  console.log('✅ Received real analysis data');
  return analysisResult;
};

export default forceCrawlSite;
