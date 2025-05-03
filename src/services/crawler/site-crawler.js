import PageCrawler from './page-crawler.js';
import logger from '../../utils/logger.js';

class SiteCrawler {
  constructor() {
    this.pageCrawler = new PageCrawler();
  }

  async crawl(baseUrl) {
    logger.info(`Crawling site: ${baseUrl}`);

    try {
      const response = await fetch(baseUrl);

      if (!response.ok) {
        logger.error(`Error fetching ${baseUrl}: ${response.status}`);
        return { pages: {} };
      }

      const html = await response.text();

      // Regex to match any website link (absolute or relative) within <a> tags, excluding mailto:, tel:, etc.
      const linkRegex = /<a.*?href=["'](https?:\/\/[^"']+|[^"']+)["'].*?>/g;
      const links = new Set();
      let match;

      while ((match = linkRegex.exec(html)) !== null) {
        const href = match[1];
        // Exclude links that start with non-HTTP protocols like mailto:, tel:, etc.
        if (!href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:') && !href.startsWith('#')) {
          links.add(href);
        }
      }

      // Convert links Set to an array
      const internalLinks = Array.from(links);
      
      const pages = {};
      for (const link of internalLinks) {
          const fullUrl = new URL(link, baseUrl).toString();
          pages[fullUrl] = await this.pageCrawler.crawl(fullUrl);
      }
      
      logger.info(`Crawled ${Object.keys(pages).length} pages`);
      return { pages };

    } catch (error) {
      logger.error(`Error crawling ${baseUrl}:`, error);
      return { pages: {} };
    }
  }
}

export default new SiteCrawler();