import React, { useState } from 'react';
import { directSiteCrawl } from '../services/bypassApiService';
import { setupNetworkInspector } from '../utils/apiNetworkInspector';
import { scanForMockData } from '../utils/mockDataDetector';

const TestCrawl = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    maxPages: 5,
    maxDepth: 2,
    respectRobots: true
  });
  const [apiTrace, setApiTrace] = useState([]);
  const [mockDataInfo, setMockDataInfo] = useState(null);

  // Initialize network inspector when component mounts
  React.useEffect(() => {
    setupNetworkInspector();
    return () => {
      // Cleanup when component unmounts
      if (window.__restoreNetworkInspector) {
        window.__restoreNetworkInspector();
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResults(null);
    setRawResponse(null);
    setApiTrace([]);
    
    // Add to trace log
    const addTrace = (message) => {
      setApiTrace(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };
    
    // Scan for mock data
    const mockData = scanForMockData();
    setMockDataInfo(mockData);
    
    addTrace(`Starting crawl for URL: ${url}`);
    addTrace(`Mock data scan found ${mockData.sources.length} potential sources`);
    
    try {
      // Process URL - ensure it has http/https prefix
      let processedUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        processedUrl = 'https://' + url;
        addTrace(`URL processed to: ${processedUrl}`);
      }      
      addTrace('Calling directSiteCrawl...');
      console.log('Starting crawl with BYPASS API service');
      
      const response = await directSiteCrawl(processedUrl, options);
      
      addTrace(`Received response: ${response ? 'success' : 'empty'}`);
      console.log('Crawl raw response:', response);
      
      // Store the raw response for debugging
      setRawResponse(response);
      
      // Check if we got an actual result or mock data
      const isMockData = !response || 
                         (typeof response === 'object' && 
                          response.data && 
                          response.data.isMockData === true);
      
      if (isMockData) {
        addTrace('⚠️ DETECTED MOCK DATA in response!');
        setError('Received mock data instead of real results. Check the raw response for details.');
      } else {
        addTrace('✅ Received real data from API');
        setResults(response);
      }
    } catch (err) {
      console.error('Crawl failed:', err);
      addTrace(`❌ Error: ${err.message}`);
      setError(err.message || 'Failed to crawl site');
    } finally {
      setIsLoading(false);
      addTrace('Request completed');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Site Crawl (Bypassing All Fallbacks)</h1>
      <p className="mb-4 text-gray-700">
        This page uses a direct API service that bypasses all potential fallback mechanisms to test if real data can be retrieved.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium mb-1">URL to crawl</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g. example.com"
            className="w-full p-2 border rounded"
            required
          />
        </div>        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="maxPages" className="block text-sm font-medium mb-1">Max Pages</label>
            <input
              type="number"
              id="maxPages"
              value={options.maxPages}
              onChange={(e) => setOptions({...options, maxPages: parseInt(e.target.value)})}
              min="1"
              max="50"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label htmlFor="maxDepth" className="block text-sm font-medium mb-1">Max Depth</label>
            <input
              type="number"
              id="maxDepth"
              value={options.maxDepth}
              onChange={(e) => setOptions({...options, maxDepth: parseInt(e.target.value)})}
              min="1"
              max="5"
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.respectRobots}
                onChange={(e) => setOptions({...options, respectRobots: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm">Respect robots.txt</span>
            </label>
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? 'Crawling...' : 'Start Direct Crawl'}
        </button>
      </form>      
      {/* Mock Data Info */}
      {mockDataInfo && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h3 className="text-lg font-bold mb-2">Mock Data Detection</h3>
          <p className="mb-2">
            {mockDataInfo.sources.length > 0 ? 
              `Found ${mockDataInfo.sources.length} potential mock data sources` : 
              'No mock data sources detected in current modules'}
          </p>
          
          {Object.keys(mockDataInfo.globalFlags).length > 0 && (
            <div className="mb-2">
              <p className="font-medium">Global Flags:</p>
              <ul className="list-disc list-inside">
                {Object.entries(mockDataInfo.globalFlags).map(([flag, value]) => (
                  <li key={flag}>{flag}: {String(value)}</li>
                ))}
              </ul>
            </div>
          )}
          
          {Object.keys(mockDataInfo.envFlags).length > 0 && (
            <div>
              <p className="font-medium">Environment Flags:</p>
              <ul className="list-disc list-inside">
                {Object.entries(mockDataInfo.envFlags).map(([flag, value]) => (
                  <li key={flag}>{flag}: {String(value)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}      
      {isLoading && (
        <div className="flex justify-center items-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3">Crawling site... This may take a while for larger sites.</p>
        </div>
      )}
      
      {/* API Execution Trace */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">API Execution Trace</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-auto max-h-60">
          {apiTrace.length === 0 ? (
            <p className="text-gray-500">No API calls made yet...</p>
          ) : (
            apiTrace.map((trace, i) => (
              <div key={i}>{trace}</div>
            ))
          )}
        </div>
      </div>
      
      {/* Raw Response Data */}
      {rawResponse && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2">Raw Response Data</h3>
          <div className="bg-black text-white p-4 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify(rawResponse, null, 2)}</pre>
          </div>
        </div>
      )}
      
      {results && !isLoading && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Processed Crawl Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Pages Crawled</div>
              <div className="text-2xl font-bold">{results.data?.crawlStats?.pagesAnalyzed || 0}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Max Depth Reached</div>
              <div className="text-2xl font-bold">{results.data?.crawlStats?.maxDepthReached || 0}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Unique URLs</div>
              <div className="text-2xl font-bold">{results.data?.crawlStats?.uniqueUrls || 0}</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded">
              <div className="text-sm text-blue-600">Errors</div>
              <div className="text-2xl font-bold">{results.data?.crawlStats?.errors || 0}</div>
            </div>
          </div>          
          {results.data?.pages && results.data.pages.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-2">Pages Analyzed</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">URL</th>
                      <th className="py-2 px-4 border-b text-left">Title</th>
                      <th className="py-2 px-4 border-b text-left">Links</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.data.pages.map((page, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="py-2 px-4 border-b truncate max-w-xs">{page.url}</td>
                        <td className="py-2 px-4 border-b">{page.title || 'No title'}</td>
                        <td className="py-2 px-4 border-b">{page.links?.length || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TestCrawl;