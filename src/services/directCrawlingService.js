import axios from 'axios';

const API_URL = 'https://marden-audit-backend-production.up.railway.app';

const crawlerClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minute timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

export const crawlSite = async (url, options = {}) => {
  if (!url) throw new Error('URL is required');
  
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  console.log(`Directly crawling ${normalizedUrl} with options:`, options);
  
  // Try multiple endpoints
  const endpoints = [
    '/site-crawl',
    '/site-audit',
    '/enhanced-site-audit',
    '/api/site-crawl'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Trying endpoint: ${endpoint}`);
      const response = await crawlerClient.post(endpoint, {
        url: normalizedUrl,
        options: {
          maxPages: options.maxPages || 5,
          maxDepth: options.maxDepth || 2,
          ...options
        }
      });
      
      console.log(`Success with ${endpoint}:`, response.status);
      return response.data;
    } catch (error) {
      console.error(`Error with ${endpoint}:`, error.message);
      // Continue to next endpoint unless it's the last one
      if (endpoints.indexOf(endpoint) === endpoints.length - 1) {
        throw error;
      }
    }
  }
};