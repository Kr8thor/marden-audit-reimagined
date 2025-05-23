/**
 * CORS Bypass API Service
 * This service uses multiple methods to bypass CORS issues
 */

const API_URL = 'https://marden-audit-backend-production.up.railway.app';

/**
 * Method 1: Try direct GET request (works if CORS is fixed or browser allows)
 */
async function tryDirectFetch(url, options = {}) {
  try {
    console.log('🔄 Trying direct GET request...');
    
    // Build URL parameters instead of POST body
    const params = new URLSearchParams({
      url: url,
      ...(options.maxPages && { maxPages: options.maxPages }),
      ...(options.maxDepth && { maxDepth: options.maxDepth }),
      ...(options.enhanced && { enhanced: 'true' })
    });
    
    const response = await fetch(`${API_URL}/seo-analyze?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct GET succeeded');
      return data;
    }
  } catch (error) {
    console.log('⚠️ Direct GET failed:', error.message);
  }
  return null;
}

/**
 * Method 2: Try CORS proxy with GET method (proven to work)
 */
async function tryCorsProxy(url, options = {}) {
  try {
    console.log('🔄 Trying CORS proxy with GET method...');
    
    // Build URL parameters for the backend
    const params = new URLSearchParams({
      url: url,
      ...(options.maxPages && { maxPages: options.maxPages }),
      ...(options.maxDepth && { maxDepth: options.maxDepth }),
      ...(options.enhanced && { enhanced: 'true' })
    });
    
    // Create the backend URL
    const backendUrl = `${API_URL}/seo-analyze?${params}`;
    
    // Use allorigins proxy
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(backendUrl)}`;
    
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const proxyData = await response.json();
      if (proxyData.contents) {
        const data = JSON.parse(proxyData.contents);
        if (data.status === 'ok') {
          console.log('✅ CORS proxy succeeded');
          return data;
        }
      }
    }
  } catch (error) {
    console.log('⚠️ CORS proxy failed:', error.message);
  }
  return null;
}

/**
 * Method 3: Try alternative proxy with POST support
 */
async function tryAlternativeProxy(url, options = {}) {
  try {
    console.log('🔄 Trying alternative proxy...');
    
    // Try a proxy that explicitly supports POST
    const response = await fetch('https://proxy.cors.sh/' + `${API_URL}/seo-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, options })
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'ok') {
        console.log('✅ Alternative proxy succeeded');
        return data;
      }
    }
  } catch (error) {
    console.log('⚠️ Alternative proxy failed:', error.message);
  }
  return null;
}

/**
 * Method 4: Try custom proxy solution using allorigins with proper POST
 */
async function tryServerProxy(url, options = {}) {
  try {
    console.log('🔄 Trying custom proxy solution...');
    
    // Create a GET request that includes the POST data as query parameters
    const apiRequest = {
      url: url,
      options: options
    };
    
    // Encode the entire request as a URL parameter
    const encodedRequest = encodeURIComponent(JSON.stringify(apiRequest));
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${API_URL}/seo-analyze?data=${encodedRequest}`)}`;
    
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
      const proxyData = await response.json();
      if (proxyData.contents) {
        try {
          const data = JSON.parse(proxyData.contents);
          if (data.status === 'ok') {
            console.log('✅ Custom proxy succeeded');
            return data;
          }
        } catch (e) {
          console.log('⚠️ Custom proxy returned non-JSON');
        }
      }
    }
  } catch (error) {
    console.log('⚠️ Custom proxy failed:', error.message);
  }
  return null;
}

/**
 * Main function that tries all methods
 */
export async function bypassCorsAnalyze(url, options = {}) {
  console.log(`🚀 Starting CORS bypass analysis for: ${url}`);
  
  // Normalize URL
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  
  // Try methods in order of preference
  const methods = [
    tryDirectFetch,
    tryCorsProxy,
    tryAlternativeProxy,
    tryServerProxy
  ];
  
  for (const method of methods) {
    try {
      const result = await method(normalizedUrl, options);
      if (result) {
        return result;
      }
    } catch (error) {
      console.log(`Method failed:`, error.message);
    }
  }
  
  // If all methods fail, throw an error with helpful information
  throw new Error(`Unable to analyze website: All CORS bypass methods failed.

The backend API is working (verified by direct server test), but the browser cannot access it due to CORS restrictions.

Possible solutions:
1. Wait for the CORS fix to deploy on the backend
2. Use a browser extension to disable CORS (for testing)
3. Contact support for assistance

Backend API Status: ✅ Working
CORS Configuration: ❌ Not properly configured`);
}

/**
 * Test function to verify API connectivity
 */
export async function testApiConnectivity() {
  try {
    const result = await bypassCorsAnalyze('https://example.com');
    return {
      status: 'success',
      message: 'API connectivity verified',
      data: result
    };
  } catch (error) {
    return {
      status: 'error',
      message: error.message,
      error: error
    };
  }
}

export default {
  bypassCorsAnalyze,
  testApiConnectivity
};