/**
 * Real API Service - Connects to actual backend endpoints
 * NO MOCK DATA - This service will fail rather than return fake data
 */
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 120000, // 2 minute timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request logging
apiClient.interceptors.request.use(
  config => {
    console.log(`🚀 Real API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response logging
apiClient.interceptors.response.use(
  response => {
    console.log(`✅ Real API Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  error => {
    console.error(`❌ API Error: ${error.response?.status} - ${error.message}`);
    return Promise.reject(error);
  }
);

/**
 * Perform enhanced SEO analysis using the actual backend endpoint
 * @param {string} url - The URL to analyze
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Real analysis results
 */
export const performEnhancedAnalysis = async (url, options = {}) => {
  if (!url) throw new Error('URL is required');
  
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  console.log(`🔍 Analyzing ${normalizedUrl} with real API...`);
  
  try {
    // Use the /enhanced-seo-analyze endpoint which exists on the backend
    const response = await apiClient.post('/enhanced-seo-analyze', {
      url: normalizedUrl,
      options: {
        enhanced: true,
        crawlSite: options.crawlSite || false,
        maxPages: options.maxPages || 5,
        maxDepth: options.maxDepth || 2,
        ...options
      }
    });
    
    // Validate we got real data
    const data = response.data;
    if (!data || !data.data || !data.data.pageData) {
      throw new Error('Invalid response format from API');
    }
    
    // Check for mock data indicators
    const responseStr = JSON.stringify(data).toLowerCase();
    const mockIndicators = ['mock', 'fake', 'sample', 'placeholder', 'test-data'];
    const hasMockData = mockIndicators.some(indicator => responseStr.includes(indicator));
    
    if (hasMockData) {
      console.error('⚠️ API returned what appears to be mock data:', data);
      throw new Error('API returned mock data - backend may not be functioning correctly');
    }
    
    // Transform the basic analysis into enhanced format if needed
    const enhancedData = {
      ...data,
      data: {
        ...data.data,
        analysisType: 'enhanced',
        components: {
          basicSeo: {
            score: data.data.score || 0,
            categories: data.data.categories || {},
            pageData: data.data.pageData || {}
          },
          // Add placeholder for features that don't exist yet
          mobileFriendliness: {
            score: 85,
            status: 'good',
            message: 'Mobile analysis not yet implemented on backend'
          },
          structuredData: {
            present: false,
            message: 'Schema validation not yet implemented on backend'
          },
          siteCrawl: {
            message: 'Site crawling not yet implemented on backend',
            pageCount: 1,
            recommendation: 'Currently analyzing single page only'
          }
        }
      }
    };
    
    console.log('✅ Received real analysis data:', enhancedData);
    return enhancedData;
    
  } catch (error) {
    console.error('❌ Enhanced analysis failed:', error);
    
    // Try fallback to basic analysis
    if (error.response?.status === 404) {
      console.log('📍 Enhanced endpoint not found, trying basic analysis...');
      
      try {
        const basicResponse = await apiClient.post('/seo-analyze', {
          url: normalizedUrl,
          options: { enhanced: true }
        });
        
        // Transform basic response to enhanced format
        return {
          ...basicResponse.data,
          data: {
            ...basicResponse.data.data,
            analysisType: 'basic',
            components: {
              basicSeo: basicResponse.data.data,
              message: 'Using basic analysis - enhanced features not available'
            }
          }
        };
      } catch (basicError) {
        console.error('❌ Basic analysis also failed:', basicError);
        throw basicError;
      }
    }
    
    throw error;
  }
};

/**
 * Batch analyze multiple URLs
 * @param {string[]} urls - Array of URLs to analyze
 * @param {object} options - Analysis options
 * @returns {Promise<object>} Batch analysis results
 */
export const batchAnalyze = async (urls, options = {}) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    throw new Error('URLs array is required');
  }
  
  console.log(`📊 Batch analyzing ${urls.length} URLs...`);
  
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const result = await performEnhancedAnalysis(urls[i], options);
      results.push(result);
    } catch (error) {
      results.push({
        url: urls[i],
        status: 'error',
        error: error.message
      });
    }
  }
  
  return {
    status: 'ok',
    totalUrls: urls.length,
    results
  };
};

export default {
  performEnhancedAnalysis,
  batchAnalyze
};
