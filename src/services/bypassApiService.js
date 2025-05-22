// Direct API service that bypasses all potential fallbacks
// This will make raw fetch calls directly to the backend API

// Get API URL from environment or use fallback
const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';
console.log('🔍 BYPASS: Using API URL:', API_URL);

/**
 * Make a direct site crawl request bypassing all other services
 */
export async function directSiteCrawl(url, options = {}) {
  console.log('🔍 BYPASS: Starting direct site crawl', { url, options });
  
  // Format the URL correctly
  let processedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    processedUrl = 'https://' + url;
  }
  
  // Build request body
  const requestBody = JSON.stringify({
    url: processedUrl,
    options: options
  });
  console.log('🔍 BYPASS: Request body:', requestBody);
  
  try {
    // Try different endpoints in sequence
    const endpoints = [
      '/site-crawl',
      '/enhanced-site-audit',
      '/site-audit'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔍 BYPASS: Trying endpoint: ${API_URL}${endpoint}`);
      
      try {
        // Make the direct fetch call
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestBody
        });
        
        console.log(`🔍 BYPASS: Response status:`, response.status);
        
        // If response is not ok, throw error
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`🔍 BYPASS: Error from ${endpoint}:`, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log(`🔍 BYPASS: Success from ${endpoint}`);
        
        // Check if response has expected data structure
        if (!data || !data.data) {
          console.warn('🔍 BYPASS: Response missing data property');
        }
        
        return data;
      } catch (endpointError) {
        console.error(`🔍 BYPASS: Error with ${endpoint}:`, endpointError.message);
        
        // If this is the last endpoint, throw the error
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw endpointError;
        }
        // Otherwise continue to next endpoint
      }
    }
    
    throw new Error('All endpoints failed');
  } catch (error) {
    console.error('🔍 BYPASS: All crawl attempts failed:', error);
    throw error;
  }
}

/**
 * Make a direct SEO analysis request bypassing all other services
 */
export async function directSeoAnalyze(url, options = {}) {
  console.log('🔍 BYPASS: Starting direct SEO analysis', { url, options });
  
  // Format the URL correctly
  let processedUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    processedUrl = 'https://' + url;
  }
  
  // Build request body
  const requestBody = JSON.stringify({
    url: processedUrl,
    options: options
  });
  
  try {
    // Try different endpoints in sequence
    const endpoints = [
      '/seo-analyze',
      '/basic-audit',
      '/api/seo-analyze'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔍 BYPASS: Trying endpoint: ${API_URL}${endpoint}`);
      
      try {
        // Make the direct fetch call
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: requestBody
        });
        
        // If response is not ok, throw error
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`🔍 BYPASS: Error from ${endpoint}:`, errorText);
          throw new Error(`API returned ${response.status}: ${errorText}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        console.log(`🔍 BYPASS: Success from ${endpoint}`);
        
        return data;
      } catch (endpointError) {
        console.error(`🔍 BYPASS: Error with ${endpoint}:`, endpointError.message);
        
        // If this is the last endpoint, throw the error
        if (endpoint === endpoints[endpoints.length - 1]) {
          throw endpointError;
        }
        // Otherwise continue to next endpoint
      }
    }
    
    throw new Error('All endpoints failed');
  } catch (error) {
    console.error('🔍 BYPASS: All SEO analysis attempts failed:', error);
    throw error;
  }
}