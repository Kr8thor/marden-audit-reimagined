import logger from '../utils/logger.js';

/**
 * Generates comprehensive SEO reports from analysis results
 */
const reportGenerator = {
  /**
   * Generate a full SEO report for a given page or site
   * @param {Object} analysisResults - Analysis results from seoAnalyzer
   * @param {Object} options - Report generation options
   * @returns {Object} Full SEO report
   */
  generate