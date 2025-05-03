import { load } from 'cheerio';

/**
 * Content Analyzer
 *
 * Provides functions to analyze HTML content for various SEO factors.
 */
const contentAnalyzer = {
  /**
   * Analyzes headings structure in the HTML content.
   *
   * @param {string} html - HTML content to analyze.
   * @returns {Object} - Analysis results.
   */
  analyzeHeadings(html) {
    const $ = load(html);
    const headings = $('h1, h2, h3, h4, h5, h6').toArray().map(el => ({
      tag: el.tagName,
      text: $(el).text().trim(),
    }));
    const hasH1 = headings.some(h => h.tag === 'h1');

    return {
      headings,
      hasH1,
    };
  },

  /**
   * Analyzes content length and keyword density.
   *
   * @param {string} html - HTML content to analyze.
   * @returns {Object} - Analysis results.
   */
  analyzeContent(html) {
    const $ = load(html);
    const text = $('body').text().trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length; // Filter out empty strings
    const paragraphs = $('p').length;

    return {
      text,
      wordCount,
      paragraphs,
    };
  },

  /**
   * Analyzes images for alt text and loading attributes.
   *
   * @param {string} html - HTML content to analyze.
   * @returns {Object} - Analysis results.
   */
  analyzeImages(html) {
    const $ = load(html);
    const images = $('img').toArray().map(el => ({
      src: $(el).attr('src'),
      alt: $(el).attr('alt'),
      loading: $(el).attr('loading'),
    }));
    const imagesWithAlt = images.filter(img => img.alt && img.alt.trim() !== '');

    return {
      images,
      imagesWithAlt,
    };
  },

  /**
   * Analyzes links for anchor text and rel attributes.
   *
   * @param {string} html - HTML content to analyze.
   * @returns {Object} - Analysis results.
   */
  analyzeLinks(html) {
    const $ = load(html);
    const links = $('a').toArray().map(el => ({
      href: $(el).attr('href'),
      text: $(el).text().trim(),
      rel: $(el).attr('rel'),
    }));
    const internalLinks = links.filter(link => link.href && !link.href.startsWith('http'));
    const externalLinks = links.filter(link => link.href && link.href.startsWith('http'));

    return {
      links,
      internalLinks,
      externalLinks,
    };
  },

  /**
   * Runs all content analyses.
   *
   * @param {string} html - HTML content to analyze.
   * @returns {Object} - All analysis results.
   */
  runAll(html) {
    return {
      headings: this.analyzeHeadings(html),
      content: this.analyzeContent(html),
      images: this.analyzeImages(html),
      links: this.analyzeLinks(html),
    };
  }
};

export default contentAnalyzer;