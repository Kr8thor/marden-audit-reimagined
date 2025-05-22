/**
 * Enhanced API Service with Better Error Handling
 * This service provides robust error detection and reporting
 */

import axios from 'axios';

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

console.log('🔗 Enhanced API Service initialized with URL:', API_URL);

// Create axios instance with enhanced settings
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Enhanced error handling
const handleApiError = (error, operation) => {
  console.error(`❌ ${operation} failed:`, error);
  
  if (error.code === 'ECONNABORTED') {
    throw new Error(`${operation} timed out. The server might be overloaded.`);
  }
  
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const message = error.response.data?.message || error.response.statusText;
    
    if (status >= 500) {
      throw new Error(`Server error (${status}): ${message}`);
    } else if (status === 404) {
      throw new Error(`Endpoint not found (${status}): The requested service is not available.`);
    } else if (status >= 400) {
      throw new Error(`Request error (${status}): ${message}`);
    }
    
    throw new Error(`HTTP ${status}: ${message}`);
  } else if (error.request) {
    // Network error - no response received
    console.error('Network error details:', error.request);
    throw new Error(`Network error: Cannot connect to API server. Please check your internet connection.`);
  } else {
    // Something else happened
    throw new Error(`Unexpected error: ${error.message}`);
  }
};

/**
 * Enhanced Health Check with detailed error reporting
 */
export const checkHealth = async () => {
  try {
    console.log('🏥 Checking API health...');
    
    const response = await api.get('/health');
    
    console.log('✅ API health check completed:', response.data);
    return response.data;
    
  } catch (error) {
    handleApiError(error, 'Health check');
  }
};

/**
 * Enhanced SEO Analysis with better error handling
 */
export const analyzeSeo = async (url, options = {}) => {
  try {
    console.log(`🔍 Starting SEO analysis for: ${url}`);
    
    const response = await api.post('/seo-analyze', {
      url: url,
      options: options
    });
    
    if (response.data.status === 'ok' && response.data.data) {
      console.log('✅ SEO analysis completed successfully');
      return response.data;
    } else {
      throw new Error(`Invalid response: ${response.data.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    handleApiError(error, 'SEO analysis');
  }
};

/**
 * Test connection with multiple fallbacks
 */
export const testConnection = async () => {
  const results = {
    apiUrl: API_URL,
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  // Test 1: Health Check
  try {
    console.log('🧪 Testing API health...');
    const health = await checkHealth();
    results.tests.health = { success: true, data: health };
    console.log('✅ Health check passed');
  } catch (error) {
    results.tests.health = { success: false, error: error.message };
    console.log('❌ Health check failed:', error.message);
  }
  
  // Test 2: Simple Analysis
  try {
    console.log('🧪 Testing SEO analysis...');
    const analysis = await analyzeSeo('https://example.com');
    results.tests.analysis = { success: true, score: analysis.data.score };
    console.log('✅ Analysis test passed');
  } catch (error) {
    results.tests.analysis = { success: false, error: error.message };
    console.log('❌ Analysis test failed:', error.message);
  }
  
  // Test 3: CORS Test
  try {
    console.log('🧪 Testing CORS...');
    const corsTest = await fetch(`${API_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (corsTest.ok) {
      results.tests.cors = { success: true, status: corsTest.status };
      console.log('✅ CORS test passed');
    } else {
      results.tests.cors = { success: false, error: `HTTP ${corsTest.status}` };
    }
  } catch (error) {
    results.tests.cors = { success: false, error: error.message };
    console.log('❌ CORS test failed:', error.message);
  }
  
  return results;
};

export default {
  checkHealth,
  analyzeSeo,
  testConnection
};
