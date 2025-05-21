import React, { useState, useEffect } from 'react';
import unifiedApiService from '../services/unifiedApiService';

/**
 * API Diagnostics tool to verify connections and test endpoints
 */
const ApiDiagnostics = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [activeTest, setActiveTest] = useState(null);
  
  // Run health check on mount
  useEffect(() => {
    checkApiHealth();
  }, []);
  
  // Check API health
  const checkApiHealth = async () => {
    setLoading(true);
    try {
      const health = await unifiedApiService.checkHealth();
      setHealthStatus(health);
      console.log('Health check result:', health);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({
        status: 'error',
        message: error.message || 'Failed to connect to API',
        error: error.toString()
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Run a test for a specific endpoint
  const runTest = async (endpoint) => {
    if (!testUrl) {
      alert('Please enter a URL to test');
      return;
    }
    
    setActiveTest(endpoint);
    setLoading(true);
    
    try {
      let result;
      
      switch (endpoint) {
        case 'basic':
          result = await unifiedApiService.analyzeSeo(testUrl);
          break;
        case 'schema':
          result = await unifiedApiService.analyzeSchema(testUrl);
          break;
        case 'mobile':
          result = await unifiedApiService.analyzeMobileFriendliness(testUrl);
          break;
        case 'enhanced':
          result = await unifiedApiService.analyzeEnhanced(testUrl);
          break;
        case 'site':
          result = await unifiedApiService.analyzeSite(testUrl, { maxPages: 3, maxDepth: 1 });
          break;
        default:
          throw new Error('Unknown endpoint');
      }
      
      setTestResults({
        ...testResults,
        [endpoint]: {
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Test for ${endpoint} failed:`, error);
      setTestResults({
        ...testResults,
        [endpoint]: {
          success: false,
          error: error.message || error.toString(),
          timestamp: new Date().toISOString()
        }
      });
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };  
  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-lg">
      <div>
        <h2 className="text-2xl font-bold mb-2">API Diagnostics Tool</h2>
        <p className="text-gray-400 mb-4">
          Test connectivity and functionality of the Marden SEO Audit API endpoints
        </p>
        
        {/* Environment Variables */}
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h3 className="text-sm font-semibold mb-2">Environment Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400">Primary API URL:</span>
              <div className="bg-gray-700 p-2 rounded mt-1 break-all">
                {import.meta.env.VITE_API_URL || 
                 'https://marden-audit-backend-production.up.railway.app'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Fallback API URL:</span>
              <div className="bg-gray-700 p-2 rounded mt-1 break-all">
                {import.meta.env.VITE_API_FALLBACK_URL || 
                'https://marden-seo-audit-api.vercel.app'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Health Check */}
        <div className="bg-gray-800 p-4 rounded mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold">API Health Status</h3>
            <button 
              onClick={checkApiHealth}
              disabled={loading}
              className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 rounded"
            >
              Refresh
            </button>
          </div>
          
          {healthStatus ? (
            <div className="bg-gray-700 p-3 rounded text-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  healthStatus.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  Status: {healthStatus.status}
                </span>
              </div>
              <div className="mb-1">Message: {healthStatus.message}</div>
              {healthStatus.components && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(healthStatus.components).map(([name, component]) => (
                    <div key={name} className="bg-gray-800 p-2 rounded text-xs">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          component.status === 'ok' ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        <span className="font-medium capitalize">{name}</span>
                      </div>
                      <div className="text-gray-400 mt-1">
                        {component.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {healthStatus.error && (
                <div className="mt-2 text-red-400 text-xs break-all bg-red-900/30 p-2 rounded">
                  {healthStatus.error}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-700 p-3 rounded flex justify-center">
              <div className="animate-pulse">Loading health status...</div>
            </div>
          )}
        </div>        
        {/* Test URL Input */}
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h3 className="text-sm font-semibold mb-2">Test URL</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1 bg-gray-700 px-3 py-2 rounded text-sm"
              placeholder="Enter a URL to test (e.g., https://example.com)"
            />
          </div>
        </div>
        
        {/* Test Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => runTest('basic')}
            disabled={loading || !testUrl}
            className={`px-3 py-2 text-xs rounded ${
              activeTest === 'basic' ? 'bg-indigo-500' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            Basic SEO
          </button>
          <button
            onClick={() => runTest('schema')}
            disabled={loading || !testUrl}
            className={`px-3 py-2 text-xs rounded ${
              activeTest === 'schema' ? 'bg-indigo-500' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            Schema
          </button>
          <button
            onClick={() => runTest('mobile')}
            disabled={loading || !testUrl}
            className={`px-3 py-2 text-xs rounded ${
              activeTest === 'mobile' ? 'bg-indigo-500' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            Mobile
          </button>
          <button
            onClick={() => runTest('enhanced')}
            disabled={loading || !testUrl}
            className={`px-3 py-2 text-xs rounded ${
              activeTest === 'enhanced' ? 'bg-indigo-500' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            Enhanced
          </button>
          <button
            onClick={() => runTest('site')}
            disabled={loading || !testUrl}
            className={`px-3 py-2 text-xs rounded ${
              activeTest === 'site' ? 'bg-indigo-500' : 'bg-indigo-700 hover:bg-indigo-600'
            }`}
          >
            Site Audit
          </button>
        </div>
        
        {/* Test Results */}
        {Object.keys(testResults).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-2">Test Results</h3>
            
            {Object.entries(testResults).map(([endpoint, result]) => (
              <div key={endpoint} className="bg-gray-800 p-4 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium capitalize">{endpoint} Analysis</h4>
                  <div className={`px-2 py-1 text-xs rounded ${
                    result.success ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mb-2">
                  {new Date(result.timestamp).toLocaleString()}
                </div>
                
                {result.success ? (
                  <div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Status:</span>{' '}
                      <span className="text-sm">{result.data.status}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Message:</span>{' '}
                      <span className="text-sm">{result.data.message}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-gray-400 text-sm">Cached:</span>{' '}
                      <span className="text-sm">{result.data.cached ? 'Yes' : 'No'}</span>
                    </div>                    
                    {/* Data Preview */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Data Preview</span>
                        <button
                          onClick={() => {
                            console.log(result.data);
                          }}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Log to Console
                        </button>
                      </div>
                      
                      <div className="bg-gray-900 p-3 rounded max-h-60 overflow-auto">
                        <pre className="text-xs">{JSON.stringify(result.data, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-900/30 p-3 rounded text-sm text-red-400">
                    {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiDiagnostics;