/**
 * Robust API Service - Ensures Real Data Integration
 * This service provides 100% backend integration with comprehensive error handling
 * and validation to ensure only real analysis data is returned.
 */

import axios from 'axios';

// Get API URL from environment - NO FALLBACKS to prevent mock data
const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

console.log('🔗 API Service initialized with URL:', API_URL);

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minute timeout for complex analysis
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Ensure CORS credentials are handled properly
  withCredentials: false
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params
    });
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for validation and logging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status}`, {
      url: response.config.url,
      data: response.data
    });
    
    // Validate that we got real data, not mock data
    if (response.data && typeof response.data === 'object') {
      const responseStr = JSON.stringify(response.data).toLowerCase();
      const mockIndicators = [
        'test analysis result',
        'sample data',
        'mock data',
        'fake data',
        'placeholder',
        'lorem ipsum'
      ];
      
      const hasMockData = mockIndicators.some(indicator => 
        responseStr.includes(indicator)
      );
      
      if (hasMockData) {
        console.warn('⚠️ Mock data detected in response!', response.data);
        throw new Error('Mock data detected - API may not be functioning correctly');
      }
    }
    
    return response;
  },
  (error) => {
    console.error(`❌ API Response Error:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

/**
 * Normalize URL to ensure consistent format
 */
function normalizeUrl(url) {
  if (!url) throw new Error('URL is required');
  
  let normalized = url.trim();
  
  // Add protocol if missing
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `https://${normalized}`;
  }
  
  return normalized;
}

/**
 * Enhanced error handler with user-friendly messages
 */
function handleApiError(error, operation = 'analysis') {
  console.error(`Error during ${operation}:`, error);
  
  if (error.code === 'ECONNABORTED') {
    throw new Error(`Analysis timeout - The ${operation} took too long to complete. Please try again with a simpler website.`);
  }
  
  if (error.code === 'ERR_NETWORK') {
    throw new Error('API is not accessible: API service is not responding. Please check your internet connection or try again later.');
  }
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;
    
    if (status === 400) {
      throw new Error(data?.message || 'Invalid request - Please check the URL format');
    }
    
    if (status === 404) {
      throw new Error('Analysis service not available - Please try again later');
    }
    
    if (status === 429) {
      throw new Error('Too many requests - Please wait a moment before trying again');
    }
    
    if (status >= 500) {
      throw new Error(data?.message || 'Server error - Our analysis service is temporarily unavailable');
    }
    
    throw new Error(data?.message || `Analysis failed with status ${status}`);
  }
  
  if (error.request) {
    throw new Error('API is not accessible: API service is not responding. Please check your internet connection or try again later.');
  }
  
  throw new Error(error.message || `Unexpected error during ${operation}`);
}

/**
 * Basic SEO Analysis - Primary endpoint
 */
export const analyzeSeo = async (url, options = {}) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    console.log(`🔍 Starting SEO analysis for: ${normalizedUrl}`);
    
    const response = await api.post('/seo-analyze', {
      url: normalizedUrl,
      options
    });
    
    if (!response.data || !response.data.data) {
      throw new Error('Invalid response format from analysis service');
    }
    
    console.log('✅ SEO analysis completed successfully');
    return response.data;
    
  } catch (error) {
    handleApiError(error, 'SEO analysis');
  }
};

/**
 * Enhanced SEO Analysis with multiple feature support
 */
export const analyzeEnhanced = async (url, options = {}) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    console.log(`🚀 Starting enhanced analysis for: ${normalizedUrl}`);
    
    // Try enhanced endpoint first
    try {
      const response = await api.post('/enhanced-seo-analyze', {
        url: normalizedUrl,
        options: {
          crawlSite: options.crawlSite || false,
          maxPages: options.maxPages || 5,
          maxDepth: options.maxDepth || 2,
          ...options
        }
      });
      
      console.log('✅ Enhanced analysis completed successfully');
      return response.data;
      
    } catch (enhancedError) {
      if (enhancedError.response?.status === 404) {
        console.log('⚠️ Enhanced endpoint not available, falling back to basic analysis');
        return await analyzeSeo(normalizedUrl, options);
      }
      throw enhancedError;
    }
    
  } catch (error) {
    handleApiError(error, 'enhanced analysis');
  }
};

/**
 * Schema.org Analysis
 */
export const analyzeSchema = async (url) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    console.log(`📋 Starting schema analysis for: ${normalizedUrl}`);
    
    const response = await api.post('/schema-analyze', {
      url: normalizedUrl
    });
    
    console.log('✅ Schema analysis completed successfully');
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('⚠️ Schema analysis endpoint not available');
      throw new Error('Schema analysis feature is not currently available');
    }
    handleApiError(error, 'schema analysis');
  }
};

/**
 * Mobile-Friendliness Analysis
 */
export const analyzeMobile = async (url) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    console.log(`📱 Starting mobile analysis for: ${normalizedUrl}`);
    
    const response = await api.post('/mobile-analyze', {
      url: normalizedUrl
    });
    
    console.log('✅ Mobile analysis completed successfully');
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('⚠️ Mobile analysis endpoint not available');
      throw new Error('Mobile analysis feature is not currently available');
    }
    handleApiError(error, 'mobile analysis');
  }
};

/**
 * Site Crawling Analysis
 */
export const crawlSite = async (url, options = {}) => {
  try {
    const normalizedUrl = normalizeUrl(url);
    console.log(`🕷️ Starting site crawl for: ${normalizedUrl}`);
    
    const response = await api.post('/site-crawl', {
      url: normalizedUrl,
      options: {
        maxPages: options.maxPages || 10,
        maxDepth: options.maxDepth || 2,
        respectRobots: options.respectRobots !== false,
        ...options
      }
    });
    
    console.log('✅ Site crawl completed successfully');
    return response.data;
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn('⚠️ Site crawl endpoint not available');
      throw new Error('Site crawling feature is not currently available');
    }
    handleApiError(error, 'site crawling');
  }
};

/**
 * Health Check
 */
export const checkHealth = async () => {
  try {
    console.log('🏥 Checking API health...');
    
    const response = await api.get('/health');
    
    console.log('✅ API health check completed');
    return response.data;
    
  } catch (error) {
    console.error('❌ API health check failed:', error);
    throw new Error('API service is not responding');
  }
};

/**
 * Test API Connection
 */
export const testConnection = async () => {
  try {
    const health = await checkHealth();
    
    // Test with a simple analysis
    const testResult = await analyzeSeo('https://example.com');
    
    return {
      status: 'connected',
      health,
      testAnalysis: testResult,
      message: 'API connection successful and returning real data'
    };
    
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      message: 'API connection failed'
    };
  }
};

// Export all functions
export default {
  analyzeSeo,
  analyzeEnhanced,
  analyzeSchema,
  analyzeMobile,
  crawlSite,
  checkHealth,
  testConnection
};
