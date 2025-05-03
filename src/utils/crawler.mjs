import puppeteer from 'puppeteer';
import { URL } from 'url';
import logger from './logger.mjs';

/**
 * Crawler utility for SEO audits
 */
const crawler = {
  /**
   * Initialize the browser
   * @param {Object} options - Browser options
   * @returns {Promise<Object>} Browser instance
   */
  async init(options = {}) {
    logger.info('Initializing browser', options);

    this.browser = await puppeteer.launch({
      headless: options.headless || 'new',
      args: options.args || [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    return this.browser;
  },

  /**
   * Close the browser
   * @returns {Promise<void>}
   */
  async close() {
    if (this.browser) {
      logger.info('Closing browser');
      await this.browser.close();
    }
  },

  /**
   * Crawl a site
   * @param {string} baseUrl - Base URL to crawl
   * @param {Object} options - Crawling options
   * @returns {Promise<Object>} Crawl results
   */
  async crawl(baseUrl, options = {}) {
    logger.info(`Starting crawl of ${baseUrl}`, { options });

    // Validate base URL
    try {
      new URL(baseUrl);
    } catch (error) {
      logger.error(`Invalid base URL: ${baseUrl}`);
      throw new Error(`Invalid base URL: ${baseUrl}`);
    }

    // Initialize data structures
    const crawlData = {
      baseUrl,
      timestamp: new Date().toISOString(),
      pages: {}, // Map of visited pages and their data
      pagesVisited: 0,
      pagesError: 0,
      maxPages: options.maxPages || 100,
      robots: {
        allowed: [], // Allowed pages
        disallowed: [], // Disallowed pages
        sitemaps: [], // Sitemap URLs
      },
      duration: 0,
      startTime: Date.now(),
    };

    // Fetch and parse robots.txt
    await this.fetchRobotsTxt(crawlData);

    // Start with base URL
    const initialUrl = new URL(baseUrl);
    await this.crawlPage(crawlData, initialUrl, options);

    crawlData.duration = Date.now() - crawlData.startTime;

    logger.info(`Completed crawl of ${baseUrl}`, {
      pagesVisited: crawlData.pagesVisited,
      pagesError: crawlData.pagesError,
      duration: crawlData.duration,
    });

    return crawlData;
  },

  /**
   * Fetch robots.txt
   * @param {Object} crawlData - Crawl data
   * @returns {Promise<void>}
   */
  async fetchRobotsTxt(crawlData) {
    const robotsUrl = new URL('/robots.txt', crawlData.baseUrl);

    try {
      logger.debug(`Fetching robots.txt: ${robotsUrl}`);

      const response = await fetch(robotsUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'MardenSEOAuditBot',
        },
      });

      if (!response.ok) {
        logger.warn(`Error fetching robots.txt (${response.status})`);
        crawlData.robots.status = response.status;
        return;
      }

      const robotsTxt = await response.text();
      crawlData.robots.content = robotsTxt;

      logger.debug(`Fetched robots.txt:\n${robotsTxt}`);

      this.parseRobotsTxt(crawlData, robotsTxt);
    } catch (error) {
      logger.error(`Error fetching robots.txt:`, error);
      crawlData.robots.error = error.message;
    }
  },

  /**
   * Parse robots.txt content
   * @param {Object} crawlData - Crawl data
   * @param {string} robotsTxt - robots.txt content
   */
  parseRobotsTxt(crawlData, robotsTxt) {
    const lines = robotsTxt.split('\n');

    let isForUs = false;
    for (const line of lines) {
      const trimmedLine = line.trim();
      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const [key, value] = trimmedLine.split(':').map((s) => s.trim());

      // Check User-agent
      if (key === 'User-agent') {
        if (value === '*' || value.toLowerCase().includes('marden')) {
          isForUs = true;
        } else {
          isForUs = false;
        }
        continue;
      }

      if (!isForUs) {
        continue;
      }

      if (key === 'Disallow') {
        crawlData.robots.disallowed.push(value);
      } else if (key === 'Allow') {
        crawlData.robots.allowed.push(value);
      } else if (key === 'Sitemap') {
        crawlData.robots.sitemaps.push(value);
      }
    }

    logger.info(`Parsed robots.txt`, {
      allowed: crawlData.robots.allowed.length,
      disallowed: crawlData.robots.disallowed.length,
      sitemaps: crawlData.robots.sitemaps.length,
    });
  },

  /**
   * Check if a URL should be crawled
   * @param {Object} crawlData - Crawl data
   * @param {URL} url - URL to check
   * @returns {boolean} True if URL should be crawled, false otherwise
   */
  shouldCrawl(crawlData, url) {
    // Only crawl pages from the base domain
    if (url.origin !== crawlData.baseUrl) {
      return false;
    }

    // Check if max pages limit is reached
    if (crawlData.pagesVisited >= crawlData.maxPages) {
      logger.info('Max pages limit reached');
      return false;
    }

    // Check robots.txt
    const path = url.pathname;
    for (const disallow of crawlData.robots.disallowed) {
      if (path.startsWith(disallow)) {
        return false;
      }
    }

    // Check if already visited
    const pageId = url.href;
    if (crawlData.pages[pageId]) {
      return false;
    }

    return true;
  },

  /**
   * Crawl a single page
   * @param {Object} crawlData - Crawl data
   * @param {URL} url - URL to crawl
   * @param {Object} options - Crawling options
   */
  async crawlPage(crawlData, url, options) {
    const pageId = url.href;

    logger.debug(`Crawling page: ${pageId}`);

    if (!this.shouldCrawl(crawlData, url)) {
      logger.debug(`Skipping page: ${pageId}`);
      return;
    }

    try {
      // Create a new page in the browser
      const page = await this.browser.newPage();

      // Set User-Agent
      await page.setUserAgent(options.userAgent || 'MardenSEOAuditBot');

      // Set up the page
      await this.setupPage(crawlData, page, options);

      // Visit the URL
      const response = await page.goto(pageId, {
        waitUntil: 'domcontentloaded',
        timeout: options.timeout || 30000,
      });

      if (response && !response.ok()) {
        logger.warn(`Error crawling page ${pageId}: ${response.status()}`);

        crawlData.pages[pageId] =  {// Changed from = to : to assign object
          url: pageId,
          status: 'error',
          statusCode: response.status(),
          contentType: response.headers()['content-type'],
          loadTime: 0,
        };

        crawlData.pagesError++;
      } else {
        // Extract content
        const [title, metaDescription, headings, metrics] = await Promise.all([
          page.title(),
          page.$eval('meta[name="description"]', (element) => element.content).catch(() => ''),
          page.evaluate(() => {
            const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const headings = {};
            headingElements.forEach(el => {
              const level = el.tagName.toLowerCase();
              if (!headings[level]) {
                headings[level] = [];
              }
              headings[level].push(el.textContent.trim());
            });
            return headings;
          }),
          page.metrics(),
        ]);

        // Count h1 and h2 headings
        const h1Count = headings.h1 ? headings.h1.length : 0;
        const h2Count = headings.h2 ? headings.h2.length : 0;

        // Store page data
        crawlData.pages[pageId] = {// Changed from = to : to assign object
          url: pageId,
          status: 'success',
          statusCode: response?.status() || 0,
          contentType: response?.headers()['content-type'],
          loadTime: response?.timing().responseEnd || 0,
          metrics,
          content: {
            title,
            metaDescription,
            headings: {
              h1Count,
              h1Texts: headings.h1 || [],
              h2Count,
              h2Texts: headings.h2 || [],
            },
          },
        };

        crawlData.pagesVisited++;

        // Find links and crawl them recursively
        const links = await page.$$eval('a[href]', (anchors) =>
          anchors.map((a) => a.href)
        );

        // Enqueue new URLs for crawling
        for (const link of links) {
          const linkUrl = new URL(link, pageId);
          await this.crawlPage(crawlData, linkUrl, options);
        }
      }

      // Close the page
      await page.close();
    } catch (error) {
      logger.error(`Error crawling page ${pageId}:`, error);

      crawlData.pages[pageId] = {
        url: pageId,
        status: 'error',
        error: error.message,
      };

      crawlData.pagesError++;
    }
  },

  /**
   * Set up the page before crawling
   * @param {Object} crawlData - Crawl data
   * @param {Object} page - Puppeteer page object
   * @param {Object} options - Crawling options
   */
  async setupPage(crawlData, page, options) {
    page.on('error', (error) => {
      logger.error('Page error:', error);
    });

    page.on('pageerror', (error) => {
      logger.error('Page error:', error);
    });

    await page.setViewport({
      width: 1280,
      height: 720,
      isMobile: false,
    });

    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (
        ['image', 'stylesheet', 'font'].includes(
          request.resourceType()
        )
      ) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // Set custom headers if available
    if (options.headers) {
      await page.setExtraHTTPHeaders(options.headers);
    }
  },
};

export default crawler;