/**
 * Forced Crawling Service - No fallbacks to mock data
 * This service ensures direct API communication without any mock data fallbacks
 */
import axios from 'axios';

// Create a dedicated client with increased debugging
const apiClient = axios.create({
  baseURL: 'https://marden-audit-backend-production.up.railway.app',
  timeout: 180000, // 3 minute timeout for crawling
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store',
    'Pragma': 'no-cache'
  }
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  config => {
    console.log(`API Request to ${config.url}:`, config.data);
    // Add timestamp to prevent caching
    if (config.method === 'post' && config.data) {
      config.data.timestamp = Date.now();
    }
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  response => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  error => {
    console.error('Response error:', error);
    // Don't fall back to mock data, just reject with the error
    return Promise.reject(error);
  }
);

/**
 * Force a site crawl with no fallbacks
 * @param {string} url URL to crawl
 * @param {Object} options Crawling options
 * @returns {Promise<Object>} Crawl results
 */
export const forceCrawlSite = async (url, options = {}) => {
  if (!url) throw new Error('URL is required');
  
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  console.log(`FORCED CRAWL: Starting site crawl for ${normalizedUrl} with options:`, options);
  
  // First try the test endpoint to verify API connection
  try {
    console.log('Testing API connection with test endpoint...');
    const testResponse = await apiClient.post('/test-endpoint', {
      url: normalizedUrl,
      options: {
        test: true,
        ...options
      }
    });
    
    console.log('Test endpoint response:', testResponse.data);
    
    // If test endpoint works, try the actual endpoint
    console.log('Test successful, trying enhanced-seo-analyze endpoint');
    
    const response = await apiClient.post('/enhanced-seo-analyze', {
      url: normalizedUrl,
      options: {
        siteCrawl: true,
        maxPages: options.maxPages || 5,
        maxDepth: options.maxDepth || 2,
        ...options
      }
    });
    
    console.log('FORCED CRAWL SUCCESS: Got real data from enhanced-seo-analyze endpoint');
    return response.data;
  } catch (error) {
    console.error('FORCED CRAWL ERROR:', error.message);
    
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    // Throw the error directly instead of falling back to mock data
    throw new Error(`API error: ${error.message}`);
  }
};

export default forceCrawlSite;