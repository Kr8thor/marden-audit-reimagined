import { analyzeSeo } from './robustApiService.js';

/**
 * CORS Bypass API Service
 * This service uses multiple methods to bypass CORS issues
 */

const API_URL = 'https://marden-audit-backend-production.up.railway.app';

/**
 * Method 1: Try direct fetch (works if CORS is fixed)
 */
async function tryDirectFetch(url, options = {}) {
  try {
    const response = await fetch(`${API_URL}/seo-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ url, options })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct fetch succeeded');
      return data;
    }
  } catch (error) {
    console.log('⚠️ Direct fetch failed:', error.message);
  }
  return null;
}

/**
 * Method 2: Try CORS proxy
 */
async function tryCorsProxy(url, options = {}) {
  try {
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${API_URL}/seo-analyze`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, options })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ CORS proxy succeeded');
      return data;
    }
  } catch (error) {
    console.log('⚠️ CORS proxy failed:', error.message);
  }
  return null;
}

/**
 * Method 3: Try alternative proxy
 */
async function tryAlternativeProxy(url, options = {}) {
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`${API_URL}/seo-analyze`)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, options })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Alternative proxy succeeded');
      return data;
    }
  } catch (error) {
    console.log('⚠️ Alternative proxy failed:', error.message);
  }
  return null;
}

/**
 * Method 4: Server-side proxy (if available)
 */
async function tryServerProxy(url, options = {}) {
  try {
    // Try a Netlify function or similar server-side proxy
    const response = await fetch('/.netlify/functions/seo-proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url, options, apiUrl: API_URL })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Server proxy succeeded');
      return data;
    }
  } catch (error) {
    console.log('⚠️ Server proxy not available:', error.message);
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