/**
 * Robust API Service - Real Data Only
 * This service ensures connection to the backend API without fallback to mock data
 * Implements proper error handling instead of returning fake data
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

// Create axios-like client with extended timeout
const createApiClient = () => {
  const baseURL = API_URL;
  const timeout = 120000; // 2 minutes for long operations

  return {
    post: async (endpoint, data) => {
      const url = `${baseURL}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('Request timed out - the analysis is taking longer than expected');
        }
        
        throw error;
      }
    },
    
    get: async (endpoint) => {
      const url = `${baseURL}${endpoint}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for GET requests
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        
        throw error;
      }
    }
  };
};

const apiClient = createApiClient();

/**
 * Validate response data to ensure it's real (not mock)
 */
const validateResponseData = (data) => {
  if (!data || !data.data) {
    throw new Error('Invalid response: No data received');
  }
  
  // Check for common mock data indicators
  const mockIndicators = [
    'fallback',
    'mock',
    'sample',
    'placeholder',
    'unavailable',
    'simulated'
  ];
  
  const dataStr = JSON.stringify(data).toLowerCase();
  const hasMockData = mockIndicators.some(indicator => dataStr.includes(indicator));
  
  if (hasMockData) {
    console.warn('⚠️ Response contains mock data indicators:', data);
    throw new Error('Received mock data instead of real analysis');
  }
  
  // Additional validation - check if URL analysis makes sense
  if (data.data.url && data.data.pageData) {
    const { title, metaDescription } = data.data.pageData;
    
    // If title or description seem generic, flag it
    if (title && (
      title.text.includes('Website') ||
      title.text.includes('Fallback') ||
      title.text.includes('Main Heading')
    )) {
      console.warn('⚠️ Title seems generic:', title.text);
      throw new Error('Received generic/mock data instead of real analysis');
    }
  }
  
  return true;
};

/**
 * Enhanced SEO analysis with endpoint priority
 */
const robustApiService = {
  /**
   * Check API health
   */
  checkHealth: async () => {
    try {
      console.log('🔍 Checking API health...');
      const response = await apiClient.get('/health');
      console.log('✅ API health check successful:', response);
      return response;
    } catch (error) {
      console.error('❌ API health check failed:', error);
      throw new Error(`API is not accessible: ${error.message}`);
    }
  },

  /**
   * Perform SEO analysis with real data only
   */
  analyzeSeo: async (url, options = {}) => {
    if (!url || !url.trim()) {
      throw new Error('URL is required for analysis');
    }

    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`🚀 Starting real SEO analysis for: ${normalizedUrl}`);

    // Try endpoints in priority order (most likely to work first)
    const endpoints = [
      '/seo-analyze',
      '/basic-audit',
      '/api/seo-analyze',
      '/api/basic-audit'
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${endpoint}`);
        
        const response = await apiClient.post(endpoint, {
          url: normalizedUrl,
          options,
          timestamp: Date.now() // Prevent caching issues
        });

        // Validate the response data
        validateResponseData(response);

        console.log(`✅ Success with ${endpoint}!`);
        return response;

      } catch (error) {
        console.warn(`⚠️ ${endpoint} failed:`, error.message);
        lastError = error;

        // If it's a 404, continue to next endpoint
        if (error.message.includes('404')) {
          continue;
        }

        // For other errors, we might want to retry or continue
        // depending on the error type
        if (error.message.includes('timeout')) {
          continue; // Try next endpoint
        }

        // If it's a validation error (mock data), continue
        if (error.message.includes('mock data') || error.message.includes('generic')) {
          continue;
        }

        // For server errors (5xx), throw immediately
        if (error.message.includes('500') || error.message.includes('503')) {
          throw new Error(`Server error: ${error.message}`);
        }
      }
    }

    // If all endpoints failed, provide a clear error message
    throw new Error(
      `All analysis endpoints failed. Last error: ${lastError?.message || 'Unknown error'}. ` +
      'Please check if the backend API is running and accessible.'
    );
  },

  /**
   * Enhanced SEO analysis with crawling
   */
  analyzeEnhanced: async (url, options = {}) => {
    if (!url || !url.trim()) {
      throw new Error('URL is required for enhanced analysis');
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    console.log(`🚀 Starting enhanced SEO analysis for: ${normalizedUrl}`);

    const endpoints = [
      '/enhanced-seo-analyze',
      '/site-crawl',
      '/site-audit'
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying enhanced endpoint: ${endpoint}`);
        
        const response = await apiClient.post(endpoint, {
          url: normalizedUrl,
          options: {
            maxPages: options.maxPages || 5,
            maxDepth: options.maxDepth || 2,
            ...options
          },
          timestamp: Date.now()
        });

        // Validate the response data
        validateResponseData(response);

        console.log(`✅ Enhanced analysis success with ${endpoint}!`);
        return response;

      } catch (error) {
        console.warn(`⚠️ Enhanced ${endpoint} failed:`, error.message);
        lastError = error;

        if (error.message.includes('404')) {
          continue;
        }

        if (error.message.includes('timeout')) {
          continue;
        }

        if (error.message.includes('mock data') || error.message.includes('generic')) {
          continue;
        }

        if (error.message.includes('500') || error.message.includes('503')) {
          throw new Error(`Server error during enhanced analysis: ${error.message}`);
        }
      }
    }

    // If enhanced endpoints fail, fall back to basic analysis
    console.log('⚠️ Enhanced analysis failed, falling back to basic analysis...');
    return await robustApiService.analyzeSeo(url, options);
  }
};

export default robustApiService;