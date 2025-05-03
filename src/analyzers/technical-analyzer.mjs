import logger from '../utils/logger.mjs';

/**
 * Analyzes technical aspects of a page
 */
const technicalAnalyzer = {
  /**
   * Analyze page technical aspects
   * @param {Object} page - Page data from crawler
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results
   */
  analyze(page, options = {}) {
    try {
      const results = {
        issues: [],
        score: 0,
        maxScore: 0,
        recommendations: [],
      };
      
      // Check HTTP status
      this.checkHttpStatus(page, results);

      // Check redirects
      this.checkRedirects(page, results);

      // Check URL structure
      this.checkUrlStructure(page, results);
      
      // Check load time
      this.checkLoadTime(page, results);
      
      // Check mobile friendliness
      this.checkMobileFriendliness(page, results);
      
      // Calculate score
      results.score = Math.min(
        results.maxScore - results.issues.length,
        results.maxScore
      );
      
      // Calculate percentage
      results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100)
        : 100;
      
      logger.debug(`Technical analysis for ${page.url}`, {
        score: results.score,
        maxScore: results.maxScore,
        issues: results.issues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing technical aspects for ${page.url}:`, error);
      return {
        issues: [{
          type: 'error',
          message: `Error analyzing technical aspects: ${error.message}`,
          impact: 'high',
        }],
        score: 0,
        maxScore: 1,
        percentage: 0,
        recommendations: [],
      };
    }
  },
  
  /**
   * Check HTTP status code
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkHttpStatus(page, results) {
    results.maxScore += 3;
    
    // Check if page had HTTP errors
    if (page.statusCode >= 400) {
      results.issues.push({
        type: 'http_error',
        message: `Page returned HTTP error code ${page.statusCode}`,
        impact: 'high',
        details: {
          code: page.statusCode,
        },
      });
      
      results.recommendations.push({
        type: 'http_error',
        message: 'Check and fix the HTTP error code',
        impact: 'high',
        details: 'HTTP error codes prevent search engines and users from accessing the page content.',
      });
    } else if (page.statusCode >= 300) {
      // Check for redirects
      results.issues.push({
        type: 'http_redirect',
        message: `Page returned HTTP redirect code ${page.statusCode}`,
        impact: 'medium',
        details: {
          code: page.statusCode,
        },
      });
    }
  },

  /**
   * Check if page redirects
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkRedirects(page, results) {
    results.maxScore += 2;

    if(page.redirects && page.redirects.length > 0){
      results.issues.push({
        type: 'redirects',
        message: `Page has ${page.redirects.length} redirects`,
        impact: 'medium',
        details: {
          redirects: page.redirects
        },
      });

      results.recommendations.push({
        type: 'redirects',
        message: `Remove or limit the number of redirects to the page.`,
        impact: 'medium',
        details: 'Redirects increase load time and can dilute link equity.',
      });
    }
  },

  /**
   * Check URL structure
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkUrlStructure(page, results) {
    results.maxScore += 2;
    
    // Check for query parameters
    if (page.url.includes('?')) {
      results.issues.push({
        type: 'query_parameters',
        message: 'URL contains query parameters',
        impact: 'low',
        details: {
          url: page.url,
        },
      });
      
      results.recommendations.push({
        type: 'query_parameters',
        message: 'Consider removing unnecessary query parameters from the URL',
        impact: 'low',
        details: 'Clean URLs without query parameters are often preferred for SEO.',
      });
    }
    
    // Check for non-ASCII characters
    if (!/^[\x00-\x7F]*$/.test(page.url)) {
      results.issues.push({
        type: 'non_ascii_url',
        message: 'URL contains non-ASCII characters',
        impact: 'low',
        details: {
          url: page.url,
        },
      });
      
      results.recommendations.push({
        type: 'non_ascii_url',
        message: 'Consider using URL-encoded or ASCII-only characters in the URL',
        impact: 'low',
        details: 'Non-ASCII characters can cause issues with some systems and are not always ideal for sharing.',
      });
    }
  },
  
  /**
   * Check page load time
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkLoadTime(page, results) {
    results.maxScore += 3;

    if (page.loadTime > 3000) {
      results.issues.push({
        type: 'slow_load_time',
        message: `Page load time is slow (${page.loadTime}ms)`,
        impact: 'high',
        details: {
          loadTime: page.loadTime,
        },
      });
      
      results.recommendations.push({
        type: 'slow_load_time',
        message: 'Optimize the page to improve load time',
        impact: 'high',
        details: 'Slow load times can negatively impact user experience and search rankings.',
      });
    } else if (page.loadTime > 1000) {
      results.issues.push({
        type: 'moderate_load_time',
        message: `Page load time is moderate (${page.loadTime}ms)`,
        impact: 'medium',
        details: {
          loadTime: page.loadTime,
        },
      });

      results.recommendations.push({
        type: 'moderate_load_time',
        message: 'Improve page load time',
        impact: 'medium',
        details: 'Moderate load times can negatively impact user experience and search rankings.',
      });
    }
  },
  
  /**
   * Check mobile friendliness
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkMobileFriendliness(page, results) {
    results.maxScore += 2;
    
    // Check viewport
    if (!page.seoData?.viewport) {
      results.issues.push({
        type: 'missing_viewport',
        message: 'Page is missing viewport meta tag',
        impact: 'high',
      });
      
      results.recommendations.push({
        type: 'missing_viewport',
        message: 'Add a viewport meta tag to enable proper mobile display',
        impact: 'high',
        details: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      });
    }
    
    // Check text size
    if(page.fontSize < 16){
        results.issues.push({
            type: 'small_font_size',
            message: 'Page has a small font size',
            impact: 'medium',
        });

        results.recommendations.push({
            type: 'small_font_size',
            message: 'Increase the font size to improve mobile readability',
            impact: 'medium',
            details: 'Small font sizes can make it difficult to read content on mobile devices.',
        });
    }
  },
};

export default technicalAnalyzer;