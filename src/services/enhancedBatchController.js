/**
 * Enhanced Batch Audit Controller
 * This module enhances the batch audit functionality with direct API access
 */

import directCrawlingService from './directCrawlingService';

/**
 * A wrapper around the direct crawling service for batch operations
 */
const enhancedBatchController = {
  /**
   * Perform batch SEO analysis with direct API connection
   * @param {string[]} urls Array of URLs to analyze
   * @param {Object} options Analysis options
   * @param {Function} onProgress Optional progress callback
   * @returns {Promise<Object>} Batch analysis results
   */
  batchAnalyze: async (urls, options = {}, onProgress) => {
    if (!urls || urls.length === 0) {
      throw new Error('At least one URL is required for batch analysis');
    }
    
    console.log(`Starting enhanced batch analysis for ${urls.length} URLs`);
    
    // Initialize result structure
    const batchResults = {
      status: 'ok',
      message: 'Batch analysis completed',
      totalUrls: urls.length,
      timestamp: new Date().toISOString(),
      cached: false,
      results: []
    };
    
    // Process each URL
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      // Update progress
      if (onProgress) {
        onProgress({
          currentUrl: url,
          currentIndex: i,
          totalUrls: urls.length,
          percentComplete: Math.round((i / urls.length) * 100)
        });
      }
      
      try {
        console.log(`Processing URL ${i+1}/${urls.length}: ${url}`);
        
        // Use the direct crawling service
        const result = await directCrawlingService.crawlSite(url, {
          maxPages: 1, // Just analyze the main page for batch operations
          maxDepth: 0,
          ...options
        });
        
        // Add to results
        batchResults.results.push(result.data || {
          url,
          score: result.score || 0,
          status: result.status || 'unknown',
          analyzedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error.message);
        
        // Add error result
        batchResults.results.push({
          url,
          score: 0,
          status: 'error',
          error: {
            type: 'analysis_error',
            message: error.message || 'Unknown error'
          },
          analyzedAt: new Date().toISOString()
        });
      }
    }
    
    // Final progress update
    if (onProgress) {
      onProgress({
        currentIndex: urls.length,
        totalUrls: urls.length,
        percentComplete: 100,
        completed: true
      });
    }
    
    return batchResults;
  }
};

export default enhancedBatchController;