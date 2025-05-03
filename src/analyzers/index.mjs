import contentAnalyzer from './content-analyzer.mjs';
import metaAnalyzer from './meta-analyzer.mjs';
import technicalAnalyzer from './technical-analyzer.mjs';
import logger from '../utils/logger.mjs';

/**
 * Main SEO analyzer for web pages
 */
const seoAnalyzer = {
  /**
   * Analyze a page
   * @param {Object} page - Page data from crawler
   * @param {Object} options - Analysis options
   * @returns {Object} Analysis results
   */
  analyze(page, options = {}) {
    try {
      const results = {
        url: page.url,
        title: page.title,
        description: page.description,
        content: contentAnalyzer.analyze(page, options),
        meta: metaAnalyzer.analyze(page, options),
        technical: technicalAnalyzer.analyze(page, options),
      };
      
      // Calculate overall score
      results.score = Math.round(
        (results.content.score + results.meta.score + results.technical.score) / 3
      );
      
      logger.debug(`SEO analysis for ${page.url}`, {
        score: results.score,
        contentScore: results.content.score,
        metaScore: results.meta.score,
        technicalScore: results.technical.score,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing page ${page.url}:`, error);
      return {
        url: page.url,
        score: 0,
        error: `Error analyzing page: ${error.message}`,
      };
    }
  },
};

export default seoAnalyzer;