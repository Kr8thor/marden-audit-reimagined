/**
 * Unified API service for all Marden SEO Audit Tool endpoints
 * Ensures consistent communication with the backend
 */
import axios from 'axios';

// Primary API client with error handling and retry logic
const createApiClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Add response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      console.error('API error:', error.message);
      
      // Retry on network errors or 5xx responses
      if (
        (error.code === 'ECONNABORTED' || 
        (error.response && error.response.status >= 500)) && 
        error.config && 
        !error.config.__isRetry
      ) {
        try {
          error.config.__isRetry = true;
          error.config.timeout = 45000; // Extend timeout for retry
          return await client(error.config);
        } catch (retryError) {
          console.error('Retry failed:', retryError.message);
          return Promise.reject(retryError);
        }
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Create API clients
const primaryApiClient = createApiClient(
  import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app'
);

const fallbackApiClient = createApiClient(
  import.meta.env.VITE_API_FALLBACK_URL || 'https://marden-seo-audit-api.vercel.app'
);

/**
 * Try a request with the primary API client, falling back to secondary if needed
 */
const tryWithFallback = async (endpoint, data, options = {}) => {
  try {
    console.log(`Making request to ${endpoint}`, data);
    const response = await primaryApiClient.post(endpoint, data, options);
    return response.data;
  } catch (error) {
    console.warn(`Primary API failed for ${endpoint}, trying fallback...`, error.message);
    
    if (error.code === 'ECONNABORTED' || !error.response || error.response.status >= 500) {
      try {
        const fallbackResponse = await fallbackApiClient.post(endpoint, data, options);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Fallback API also failed:', fallbackError.message);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

/**
 * Unified API service
 */const unifiedApiService = {
  /**
   * Standard SEO Analysis
   */
  analyzeSeo: async (url, options = {}) => {
    return tryWithFallback('/seo-analyze', { url, options });
  },
  
  /**
   * Batch SEO Analysis for multiple URLs
   */
  batchAnalyzeSeo: async (urls, options = {}) => {
    return tryWithFallback('/batch-audit', { urls, options });
  },
  
  /**
   * Schema.org Structured Data Analysis
   */
  analyzeSchema: async (url, options = {}) => {
    return tryWithFallback('/schema-analyze', { url, options });
  },
  
  /**
   * Mobile-friendliness Analysis
   */
  analyzeMobileFriendliness: async (url, options = {}) => {
    return tryWithFallback('/mobile-analyze', { url, options });
  },
  
  /**
   * Enhanced SEO Analysis with all features
   */
  analyzeEnhanced: async (url, options = {}) => {
    return tryWithFallback('/enhanced-seo-analyze', { url, options });
  },
  
  /**
   * Site Audit with crawling
   */
  analyzeSite: async (url, options = {}) => {
    return tryWithFallback('/site-audit', { 
      url, 
      options: {
        maxPages: options.maxPages || 10,
        depth: options.maxDepth || 2,
        ...options
      }
    });
  },
  
  /**
   * Health check to verify API status
   */
  checkHealth: async () => {
    try {
      const response = await primaryApiClient.get('/health');
      return response.data;
    } catch (error) {
      console.warn('Health check failed:', error.message);
      return {
        status: 'error',
        message: 'API health check failed',
        timestamp: new Date().toISOString()
      };
    }
  }
};

export default unifiedApiService;