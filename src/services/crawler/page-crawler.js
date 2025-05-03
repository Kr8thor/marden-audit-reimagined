import logger from '../../utils/logger.js';

class PageCrawler {
    async crawl(url) {
        logger.info(`Crawling page: ${url}`);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                logger.error(`Error fetching ${url}: ${response.status}`);
                return {
                    issues: [{message: `Error fetching page: ${response.status}`}],
                    score: 0,
                    maxScore: 100,
                    html: null,
                };
            }

            const html = await response.text();
            return {issues: [], score: 100, maxScore: 100, html};
        } catch (error) {
            logger.error(`Error crawling ${url}:`, error);
            return {issues: [{message: `Error crawling page: ${error.message}`}], score: 0, maxScore: 100, html: null};
        }
    }
}

export default PageCrawler;

export default PageCrawler;