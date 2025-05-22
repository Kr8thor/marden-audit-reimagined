/**
 * Scans through imported modules to find mock data sources
 * This is a development utility to help identify where mock data is coming from
 */
export function scanForMockData() {
  console.log('🔍 SCANNING FOR MOCK DATA SOURCES');
  
  // Track identified mock data sources
  const mockDataSources = [];
  
  // Check for common mock data patterns in global variables
  const globalMocks = {};
  
  // Check for common mock flags
  [
    'USE_MOCK_DATA',
    'useMockData',
    'REACT_APP_USE_MOCK_DATA', 
    'VITE_USE_MOCK_DATA',
    'MOCK_API',
    'mockApi',
    'OFFLINE_MODE',
    'offlineMode'
  ].forEach(flag => {
    if (window[flag] !== undefined) {
      globalMocks[flag] = window[flag];
    }
  });
  
  // Check environment variables
  const envMocks = {};
  if (import.meta && import.meta.env) {
    [
      'VITE_USE_MOCK_DATA',
      'VITE_MOCK_API',
      'VITE_OFFLINE_MODE',
      'VITE_MOCK_RESPONSES'
    ].forEach(flag => {
      if (import.meta.env[flag] !== undefined) {
        envMocks[flag] = import.meta.env[flag];
      }
    });
  }
  
  // Scan current scripts on the page
  try {
    const scriptTags = document.querySelectorAll('script');
    scriptTags.forEach(script => {
      if (script.textContent && 
          (script.textContent.includes('mockData') || 
           script.textContent.includes('mock_data') ||
           script.textContent.includes('fakeData'))) {
        mockDataSources.push({
          type: 'script',
          src: script.src || 'inline script',
          snippet: script.textContent.substring(0, 100) + '...'
        });
      }
    });
  } catch (e) {
    console.error('Error scanning script tags:', e);
  }
  
  // Try to find mock modules in webpack
  try {
    // Check for webpack modules (if available)
    if (window.__NEXT_DATA__ && window.__NEXT_DATA__.buildId) {
      mockDataSources.push({
        type: 'next.js',
        info: 'Next.js application detected, may have client-side mocking'
      });
    }
    
    // Look through module cache if it exists
    if (window.webpackJsonp || window.__webpack_module_cache__) {
      mockDataSources.push({
        type: 'webpack',
        info: 'Webpack detected, modules may contain mock data'
      });
    }
  } catch (e) {
    console.error('Error checking webpack modules:', e);
  }
  
  // Look for known libraries that provide mocking
  [
    'msw',
    'miragejs',
    'json-server',
    'axios-mock-adapter',
    'mock-service-worker'
  ].forEach(lib => {
    if (window[lib]) {
      mockDataSources.push({
        type: 'library',
        name: lib,
        info: `${lib} detected - provides API mocking capabilities`
      });
    }
  });
  
  return {
    sources: mockDataSources,
    globalFlags: globalMocks,
    envFlags: envMocks
  };
}