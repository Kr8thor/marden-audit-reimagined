/**
 * Real Batch API Service - Uses working endpoints
 * NO MOCK DATA - Performs real SEO analysis for multiple URLs
 */
import { performEnhancedAnalysis } from './realEnhancedApiService';

/**
 * Batch analyze multiple URLs using the working API
 * @param {string[]} urls - Array of URLs to analyze
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<object>} Batch results
 */
export const performBatchAnalysis = async (urls, onProgress = null) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error('At least one URL is required for batch analysis');
  }
  
  console.log(`🚀 Starting REAL batch analysis for ${urls.length} URLs`);
  
  const results = {
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
      const percentComplete = Math.round(((i + 1) / urls.length) * 100);
      onProgress({
        currentUrl: url,
        currentIndex: i,
        totalUrls: urls.length,
        percentComplete
      });
    }
    
    try {
      console.log(`📍 Analyzing URL ${i + 1}/${urls.length}: ${url}`);
      
      // Use the real enhanced analysis
      const analysisResult = await performEnhancedAnalysis(url, { enhanced: true });
      
      // Extract the relevant data
      const urlResult = {
        url: analysisResult.url || url,
        score: analysisResult.data?.score || 0,
        status: analysisResult.data?.status || 'unknown',
        criticalIssuesCount: analysisResult.data?.criticalIssuesCount || 0,
        totalIssuesCount: analysisResult.data?.totalIssuesCount || 0,
        categories: analysisResult.data?.categories || {},
        pageData: analysisResult.data?.pageData || {},
        analyzedAt: analysisResult.timestamp || new Date().toISOString()
      };
      
      results.results.push(urlResult);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${url}:`, error.message);
      
      // Add error result
      results.results.push({
        url,
        score: 0,
        status: 'error',
        error: {
          type: 'analysis_error',
          message: error.message || 'Unknown error occurred'
        },
        analyzedAt: new Date().toISOString()
      });
    }
  }
  
  // Calculate aggregate statistics
  const successfulResults = results.results.filter(r => r.status !== 'error');
  const totalScore = successfulResults.reduce((sum, r) => sum + (r.score || 0), 0);
  
  results.aggregateData = {
    averageScore: successfulResults.length > 0 ? Math.round(totalScore / successfulResults.length) : 0,
    successfulAnalyses: successfulResults.length,
    failedAnalyses: results.results.length - successfulResults.length,
    totalCriticalIssues: successfulResults.reduce((sum, r) => sum + (r.criticalIssuesCount || 0), 0),
    totalIssues: successfulResults.reduce((sum, r) => sum + (r.totalIssuesCount || 0), 0)
  };
  
  console.log('✅ Batch analysis complete:', results);
  return results;
};

export default performBatchAnalysis;
