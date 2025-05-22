import React, { useState } from 'react';
import realApiService from '../services/realApiService';

const ApiTestPage = () => {
  const [url, setUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Test API health
  const testHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const health = await realApiService.checkHealth();
      setHealthStatus(health);
    } catch (err) {
      setError(err.message);
      setHealthStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Test SEO analysis
  const testSeoAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResults(null);
      
      console.log('🚀 Testing SEO analysis...');
      const result = await realApiService.analyzeSeo(url);
      setResults(result);
      
    } catch (err) {
      console.error('❌ SEO analysis test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Test enhanced analysis
  const testEnhancedAnalysis = async () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setResults(null);
      
      console.log('🚀 Testing enhanced analysis...');
      const result = await realApiService.analyzeEnhanced(url, {
        maxPages: 3,
        maxDepth: 1
      });
      setResults(result);
      
    } catch (err) {
      console.error('❌ Enhanced analysis test failed:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 API Fix Test Page
          </h1>
          
          <p className="text-gray-600 mb-6">
            This page tests the backend API fix to ensure we're getting real data instead of mock data.
          </p>

          {/* Health Check Section */}
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Health Check</h2>
            <button 
              onClick={testHealth}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test API Health'}
            </button>
            
            {healthStatus && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-green-800">
                  ✅ API Health: {healthStatus.status} - {healthStatus.message}
                </p>
              </div>
            )}
          </div>

          {/* URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test URL:
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Test Buttons */}
          <div className="flex gap-4 mb-6">
            <button 
              onClick={testSeoAnalysis}
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Test Basic SEO Analysis'}
            </button>
            
            <button 
              onClick={testEnhancedAnalysis}
              disabled={isLoading}
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing...' : 'Test Enhanced Analysis'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="text-red-800 font-semibold">❌ Error:</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">📊 Analysis Results:</h3>
              
              {/* Mock Data Detection */}
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
                <h4 className="font-semibold text-blue-800">Mock Data Check:</h4>
                {results.data?.pageData?.title?.text?.includes('Test') ? (
                  <p className="text-red-600">🚨 WARNING: Response may contain mock data</p>
                ) : (
                  <p className="text-green-600">✅ Real data detected - title looks authentic</p>
                )}
              </div>

              {/* Key Data Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 rounded">
                  <strong>URL:</strong> {results.url}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Status:</strong> {results.status}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Title:</strong> {results.data?.pageData?.title?.text || 'No title'}
                </div>
                <div className="p-3 bg-gray-50 rounded">
                  <strong>Score:</strong> {results.data?.score || 'No score'}
                </div>
              </div>

              {/* Raw Response */}
              <details className="mb-4">
                <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
                  🔍 View Raw Response
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-96">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;