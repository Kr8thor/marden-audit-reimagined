import logger from '../utils/logger.mjs';

/**
 * Analyzes page meta tags for SEO best practices
 */
const metaAnalyzer = {
  /**
   * Analyze page meta tags
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
      
      // Check title tag
      this.checkTitle(page, results);
      
      // Check meta description
      this.checkMetaDescription(page, results);
      
      // Check canonical
      this.checkCanonical(page, results);
      
      // Check robots meta
      this.checkRobotsMeta(page, results);
      
      // Check Open Graph tags
      this.checkOpenGraphTags(page, results);
      
      // Check Twitter tags
      this.checkTwitterTags(page, results);
      
      // Calculate score
      results.score = Math.min(
        results.maxScore - results.issues.length,
        results.maxScore
      );
      
      // Calculate percentage
      results.percentage = results.maxScore > 0
        ? Math.round((results.score / results.maxScore) * 100)
        : 100;
      
      logger.debug(`Meta analysis for ${page.url}`, {
        score: results.score,
        maxScore: results.maxScore,
        issues: results.issues.length,
      });
      
      return results;
    } catch (error) {
      logger.error(`Error analyzing meta for ${page.url}:`, error);
      return {
        issues: [{
          type: 'error',
          message: `Error analyzing meta: ${error.message}`,
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
   * Check title tag
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkTitle(page, results) {
    results.maxScore += 3;
    
    if (!page.title) {
      results.issues.push({
        type: 'missing_title',
        message: 'Page is missing a title tag',
        impact: 'high',
      });
      
      results.recommendations.push({
        type: 'missing_title',
        message: 'Add a title tag to the page',
        impact: 'high',
        details: 'The title tag is a crucial element for both SEO and accessibility.',
      });
    } else if (page.title.length < 10) {
      results.issues.push({
        type: 'short_title',
        message: `Page title is too short (${page.title.length} characters)`,
        impact: 'medium',
        details: {
          title: page.title,
        },
      });
      
      results.recommendations.push({
        type: 'short_title',
        message: 'Make the title tag longer than 10 characters',
        impact: 'medium',
        details: 'Titles should be descriptive and should properly describe the content of the page.',
      });
    } else if (page.title.length > 60) {
      results.issues.push({
        type: 'long_title',
        message: `Page title is too long (${page.title.length} characters)`,
        impact: 'medium',
        details: {
          title: page.title,
        },
      });
      
      results.recommendations.push({
        type: 'long_title',
        message: 'Make the title tag shorter than 60 characters',
        impact: 'medium',
        details: 'Long titles can be truncated in search results, losing key context.',
      });
    }
  },
  
  /**
   * Check meta description
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkMetaDescription(page, results) {
    results.maxScore += 3;
    
    if (!page.metaDescription) {
      results.issues.push({
        type: 'missing_meta_description',
        message: 'Page is missing a meta description',
        impact: 'medium',
      });
      
      results.recommendations.push({
        type: 'missing_meta_description',
        message: 'Add a meta description to the page',
        impact: 'medium',
        details: 'A good meta description can improve click-through rates from search results.',
      });
    } else if (page.metaDescription.length < 50) {
      results.issues.push({
        type: 'short_meta_description',
        message: `Meta description is too short (${page.metaDescription.length} characters)`,
        impact: 'low',
        details: {
          metaDescription: page.metaDescription,
        },
      });
      
      results.recommendations.push({
        type: 'short_meta_description',
        message: 'Make the meta description longer than 50 characters',
        impact: 'low',
        details: 'Short descriptions provide limited context to potential visitors.',
      });
    } else if (page.metaDescription.length > 160) {
      results.issues.push({
        type: 'long_meta_description',
        message: `Meta description is too long (${page.metaDescription.length} characters)`,
        impact: 'low',
        details: {
          metaDescription: page.metaDescription,
        },
      });
      
      results.recommendations.push({
        type: 'long_meta_description',
        message: 'Make the meta description shorter than 160 characters',
        impact: 'low',
        details: 'Long descriptions can be truncated in search results, losing key context.',
      });
    }
  },
  
  /**
   * Check canonical tag
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkCanonical(page, results) {
    results.maxScore += 2;
    
    if (page.canonical && page.canonical !== page.url) {
      results.issues.push({
        type: 'incorrect_canonical',
        message: `Canonical tag (${page.canonical}) does not match page URL`,
        impact: 'low',
        details: {
          canonical: page.canonical,
          url: page.url,
        },
      });
      
      results.recommendations.push({
        type: 'incorrect_canonical',
        message: 'Make sure the canonical tag matches the page URL or remove it',
        impact: 'low',
        details: 'An incorrect canonical tag can lead to duplicate content issues.',
      });
    } else if (!page.canonical) {
      results.issues.push({
        type: 'missing_canonical',
        message: 'Page is missing a canonical tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_canonical',
        message: 'Add a canonical tag to the page',
        impact: 'low',
        details: 'The canonical tag helps avoid duplicate content issues.',
      });
    }
  },
  
  /**
   * Check robots meta
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkRobotsMeta(page, results) {
    results.maxScore += 2;
    
    if (page.robots && page.robots.includes('noindex')) {
      results.issues.push({
        type: 'noindex',
        message: 'Page has a noindex directive',
        impact: 'high',
        details: {
          robots: page.robots,
        },
      });
      
      results.recommendations.push({
        type: 'noindex',
        message: 'Remove the noindex directive if you want the page to be indexed',
        impact: 'high',
        details: 'A noindex directive prevents search engines from indexing the page.',
      });
    }
    
    if (page.robots && page.robots.includes('nofollow')) {
      results.issues.push({
        type: 'nofollow',
        message: 'Page has a nofollow directive',
        impact: 'low',
        details: {
          robots: page.robots,
        },
      });
      
      results.recommendations.push({
        type: 'nofollow',
        message: 'Review the use of the nofollow directive',
        impact: 'low',
        details: 'A nofollow directive prevents search engines from following links on the page.',
      });
    }
  },
  
  /**
   * Check Open Graph tags
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkOpenGraphTags(page, results) {
    results.maxScore += 1;
    
    if (!page.openGraph || page.openGraph.length === 0) {
      results.issues.push({
        type: 'missing_open_graph',
        message: 'Page is missing Open Graph tags',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_open_graph',
        message: 'Add Open Graph tags to the page',
        impact: 'low',
        details: 'Open Graph tags improve how the page is displayed when shared on social media.',
      });
    }
    
    // Check for og:title
    if (page.openGraph && !page.openGraph.find(tag => tag.property === 'og:title')) {
      results.issues.push({
        type: 'missing_og_title',
        message: 'Page is missing og:title tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_og_title',
        message: 'Add the og:title tag to the page',
        impact: 'low',
        details: 'The og:title tag specifies the title of the page when shared on social media.',
      });
    }

    // Check for og:description
    if (page.openGraph && !page.openGraph.find(tag => tag.property === 'og:description')) {
      results.issues.push({
        type: 'missing_og_description',
        message: 'Page is missing og:description tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_og_description',
        message: 'Add the og:description tag to the page',
        impact: 'low',
        details: 'The og:description tag specifies the description of the page when shared on social media.',
      });
    }
    
    // Check for og:image
    if (page.openGraph && !page.openGraph.find(tag => tag.property === 'og:image')) {
      results.issues.push({
        type: 'missing_og_image',
        message: 'Page is missing og:image tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_og_image',
        message: 'Add the og:image tag to the page',
        impact: 'low',
        details: 'The og:image tag specifies the image that should be displayed when the page is shared on social media.',
      });
    }
  },
  
  /**
   * Check Twitter tags
   * @param {Object} page - Page data
   * @param {Object} results - Results object to modify
   */
  checkTwitterTags(page, results) {
    results.maxScore += 1;
    
    if (!page.twitter || page.twitter.length === 0) {
      results.issues.push({
        type: 'missing_twitter_tags',
        message: 'Page is missing Twitter tags',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_tags',
        message: 'Add Twitter tags to the page',
        impact: 'low',
        details: 'Twitter tags improve how the page is displayed when shared on Twitter.',
      });
    }
    
    // Check for twitter:card
    if (page.twitter && !page.twitter.find(tag => tag.name === 'twitter:card')) {
      results.issues.push({
        type: 'missing_twitter_card',
        message: 'Page is missing twitter:card tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_card',
        message: 'Add the twitter:card tag to the page',
        impact: 'low',
        details: 'The twitter:card tag specifies the type of card to use when the page is shared on Twitter.',
      });
    }

    // Check for twitter:title
    if (page.twitter && !page.twitter.find(tag => tag.name === 'twitter:title')) {
      results.issues.push({
        type: 'missing_twitter_title',
        message: 'Page is missing twitter:title tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_title',
        message: 'Add the twitter:title tag to the page',
        impact: 'low',
        details: 'The twitter:title tag specifies the title of the page when shared on Twitter.',
      });
    }

    // Check for twitter:description
    if (page.twitter && !page.twitter.find(tag => tag.name === 'twitter:description')) {
      results.issues.push({
        type: 'missing_twitter_description',
        message: 'Page is missing twitter:description tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_description',
        message: 'Add the twitter:description tag to the page',
        impact: 'low',
        details: 'The twitter:description tag specifies the description of the page when shared on Twitter.',
      });
    }
    
    // Check for twitter:image
    if (page.twitter && !page.twitter.find(tag => tag.name === 'twitter:image')) {
      results.issues.push({
        type: 'missing_twitter_image',
        message: 'Page is missing twitter:image tag',
        impact: 'low',
      });
      
      results.recommendations.push({
        type: 'missing_twitter_image',
        message: 'Add the twitter:image tag to the page',
        impact: 'low',
        details: 'The twitter:image tag specifies the image that should be displayed when the page is shared on Twitter.',
      });
    }
  },
};

export default metaAnalyzer;