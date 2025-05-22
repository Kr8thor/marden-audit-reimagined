/**
 * Real API Service - Direct connection to backend without fallbacks
 * This service is designed to test and use the fixed backend API
 * without any mock data fallbacks
 */

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

/**
 * Normalize URL to ensure proper format
 */
function normalizeUrl(url) {
  if (!url) return '';
  
  let normalizedUrl = url.trim();
  
  // Ensure proper protocol
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  return normalizedUrl;
}

/**
 * Check if response contains mock data indicators
 */
function validateRealData(responseData) {
  const mockIndicators = [
    'Test Analysis Result',
    'simple-test-handler',
    'This is a test analysis',
    'test analysis to verify',
    'analyzedWith: simple'
  ];
  
  const dataString = JSON.stringify(responseData).toLowerCase();
  const hasMockData = mockIndicators.some(indicator => 
    dataString.includes(indicator.toLowerCase())
  );
  
  if (hasMockData) {
    console.error('🚨 MOCK DATA DETECTED in API response:', responseData);
    throw new Error('API returned mock data instead of real analysis');
  }
  
  console.log('✅ Real data validated - no mock indicators found');
  return true;
}

/**
 * Real API Service
 */
export const realApiService = {
  /**
   * Check API health
   */
  checkHealth: async () => {
    console.log('🔍 Checking API health...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Health Check successful:', data);
      return data;
    } catch (error) {
      console.error('❌ API Health Check failed:', error);
      throw error;
    }
  },
  
  /**
   * Perform real SEO analysis (no fallbacks)
   */
  analyzeSeo: async (url, options = {}) => {
    console.log(`🚀 Starting REAL SEO analysis for: ${url}`);
    
    if (!url || !url.trim()) {
      throw new Error('URL is required for analysis');
    }
    
    const normalizedUrl = normalizeUrl(url);
    console.log(`📋 Normalized URL: ${normalizedUrl}`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/seo-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          url: normalizedUrl,
          options: options
        })
      });
      
      console.log(`📡 API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 API Response received:', data);
      
      // Validate that we got real data, not mock data
      validateRealData(data);
      
      return data;
    } catch (error) {
      console.error('❌ SEO Analysis failed:', error);
      
      // Re-throw the error instead of providing fallback
      throw new Error(`SEO Analysis failed: ${error.message}`);
    }
  },
  
  /**
   * Perform enhanced SEO analysis with crawling
   */
  analyzeEnhanced: async (url, options = {}) => {
    console.log(`🚀 Starting ENHANCED SEO analysis for: ${url}`);
    
    if (!url || !url.trim()) {
      throw new Error('URL is required for enhanced analysis');
    }
    
    const normalizedUrl = normalizeUrl(url);
    console.log(`📋 Normalized URL: ${normalizedUrl}`);
    
    // Try enhanced endpoints in order of preference
    const endpoints = [
      '/enhanced-seo-analyze',
      '/site-crawl',
      '/site-audit'
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`📡 Trying endpoint: ${endpoint}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            url: normalizedUrl,
            options: {
              maxPages: options.maxPages || 5,
              maxDepth: options.maxDepth || 2,
              ...options
            }
          })
        });
        
        console.log(`📡 ${endpoint} response status: ${response.status}`);
        
        if (response.status === 404) {
          console.log(`⚠️ Endpoint ${endpoint} not found, trying next...`);
          continue;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ ${endpoint} error:`, errorText);
          lastError = new Error(`${endpoint} failed: ${response.status} - ${errorText}`);
          continue;
        }
        
        const data = await response.json();
        console.log(`✅ ${endpoint} success:`, data);
        
        // Validate that we got real data
        validateRealData(data);
        
        return data;
      } catch (error) {
        console.error(`❌ Error with ${endpoint}:`, error);
        lastError = error;
      }
    }
    
    // If all endpoints failed, throw the last error
    throw lastError || new Error('All enhanced analysis endpoints failed');
  },
  
  /**
   * Analyze schema.org structured data
   */
  analyzeSchema: async (url) => {
    console.log(`🔍 Starting schema analysis for: ${url}`);
    
    if (!url || !url.trim()) {
      throw new Error('URL is required for schema analysis');
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      const response = await fetch(`${API_BASE_URL}/schema-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          url: normalizedUrl
        })
      });
      
      console.log(`📡 Schema API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Schema API Error:', errorText);
        throw new Error(`Schema Analysis Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 Schema analysis response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Schema analysis failed:', error);
      throw new Error(`Schema analysis failed: ${error.message}`);
    }
  },
  
  /**
   * Analyze mobile-friendliness
   */
  analyzeMobile: async (url) => {
    console.log(`📱 Starting mobile analysis for: ${url}`);
    
    if (!url || !url.trim()) {
      throw new Error('URL is required for mobile analysis');
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      const response = await fetch(`${API_BASE_URL}/mobile-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          url: normalizedUrl
        })
      });
      
      console.log(`📡 Mobile API Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mobile API Error:', errorText);
        throw new Error(`Mobile Analysis Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 Mobile analysis response:', data);
      
      return data;
    } catch (error) {
      console.error('❌ Mobile analysis failed:', error);
      throw new Error(`Mobile analysis failed: ${error.message}`);
    }
  }
};

export default realApiService;