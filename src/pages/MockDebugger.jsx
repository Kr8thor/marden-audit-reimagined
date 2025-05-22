import React, { useEffect, useState } from 'react';
import { scanForMockData } from '../utils/mockDataDetector';
import { setupNetworkInspector } from '../utils/apiNetworkInspector';

const MockDebugger = () => {
  const [mockSources, setMockSources] = useState([]);
  const [mockFlags, setMockFlags] = useState({});
  const [mockEnvFlags, setMockEnvFlags] = useState({});
  const [networkRequests, setNetworkRequests] = useState([]);
  const [networkInspector, setNetworkInspector] = useState(null);
  
  useEffect(() => {
    // Scan for mock data on component mount
    const results = scanForMockData();
    setMockSources(results.sources);
    setMockFlags(results.globalFlags);
    setMockEnvFlags(results.envFlags);
    
    // Set up network inspector
    const inspector = setupNetworkInspector();
    setNetworkInspector(inspector);
    
    // Clean up network inspector on unmount
    return () => {
      if (inspector) {
        inspector.restore();
      }
    };
  }, []);
  
  // Update network requests list
  const updateNetworkRequests = () => {
    if (networkInspector) {
      setNetworkRequests(networkInspector.getRequests());
    } else if (window.__getNetworkRequests) {
      setNetworkRequests(window.__getNetworkRequests());
    }
  };
  
  // Periodically update network requests
  useEffect(() => {
    const interval = setInterval(updateNetworkRequests, 1000);
    return () => clearInterval(interval);
  }, [networkInspector]);
  
  // Filter requests to show only API calls
  const apiRequests = networkRequests.filter(req => 
    req.url.includes('/api/') || 
    req.url.includes('seo-analyze') || 
    req.url.includes('site-crawl') ||
    req.url.includes('site-audit')
  );  
  // Function to search for mock data in project files
  const handleSearchServices = () => {
    try {
      console.log('Searching for API services in the project to identify mock data sources');
      
      // List API service modules that might contain mock data
      const potentialServices = [
        'apiService.js',
        'seoService.js',
        'crawlService.js',
        'enhancedApiService.js'
      ];
      
      // Trigger an alert to suggest manual search
      alert(`Please manually check the following files in the src/services directory for mock data:\n\n${potentialServices.join('\n')}`);
      
    } catch (error) {
      console.error('Error searching files:', error);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mock Data Debugger</h1>
      <p className="mb-4 text-gray-700">
        This tool helps find where mock data is coming from in the application.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Mock Data Flags</h2>
          {Object.keys(mockFlags).length === 0 && Object.keys(mockEnvFlags).length === 0 ? (
            <p className="text-gray-500">No mock data flags detected</p>
          ) : (
            <div>
              {Object.keys(mockFlags).length > 0 && (
                <div className="mb-4">
                  <p className="font-medium mb-1">Global Flags:</p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Flag</th>
                        <th className="py-2 px-4 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(mockFlags).map(([flag, value]) => (
                        <tr key={flag} className="border-t">
                          <td className="py-2 px-4">{flag}</td>
                          <td className="py-2 px-4">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}              
              {Object.keys(mockEnvFlags).length > 0 && (
                <div>
                  <p className="font-medium mb-1">Environment Flags:</p>
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Flag</th>
                        <th className="py-2 px-4 text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(mockEnvFlags).map(([flag, value]) => (
                        <tr key={flag} className="border-t">
                          <td className="py-2 px-4">{flag}</td>
                          <td className="py-2 px-4">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Mock Data Sources</h2>
          {mockSources.length === 0 ? (
            <p className="text-gray-500">No mock data sources detected in loaded modules</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Type</th>
                  <th className="py-2 px-4 text-left">Info</th>
                </tr>
              </thead>
              <tbody>
                {mockSources.map((source, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-4">{source.type}</td>
                    <td className="py-2 px-4 font-mono text-xs overflow-hidden">
                      {source.name || source.src || source.info || 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">API Network Requests</h2>
        <div className="flex justify-between mb-2">
          <button 
            onClick={updateNetworkRequests}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Refresh Requests
          </button>
          <button 
            onClick={() => {
              if (networkInspector) {
                networkInspector.clearRequests();
              } else if (window.__clearNetworkRequests) {
                window.__clearNetworkRequests();
              }
              setNetworkRequests([]);
            }}
            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
          >
            Clear Requests
          </button>
        </div>
        
        {apiRequests.length === 0 ? (
          <p className="text-gray-500 bg-white p-4 rounded-lg shadow-md">No API requests detected yet. Try using the application features that should make API calls.</p>
        ) : (
          <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">URL</th>
                  <th className="py-2 px-4 text-left">Method</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Mock Data?</th>
                </tr>
              </thead>
              <tbody>
                {apiRequests.map((req) => {
                  // Check if response contains mock data
                  const hasMockData = req.response && 
                      (req.response.isMockData || 
                       JSON.stringify(req.response).includes('"isMockData":true'));
                  
                  return (
                    <tr key={req.id} className="border-t hover:bg-gray-50">
                      <td className="py-2 px-4 truncate max-w-xs" title={req.url}>{req.url}</td>
                      <td className="py-2 px-4">{req.method}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          req.status === 'success' ? 'bg-green-100 text-green-800' :
                          req.status === 'error' ? 'bg-red-100 text-red-800' :
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status} {req.statusCode ? `(${req.statusCode})` : ''}
                        </span>
                      </td>                      <td className="py-2 px-4">
                        {hasMockData ? (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs">
                            MOCK DATA
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs">
                            Real Data
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-2">Service File Analysis</h2>
        <p className="mb-2 text-gray-700">
          Analyze API service files for mock data implementations.
        </p>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSearchServices}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Check API Services
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-bold">Common Mock Data Implementation Patterns:</h3>
          <ul className="list-disc list-inside mt-2">
            <li>Flag-based fallbacks (if no API response, return mock)</li>
            <li>Environment variable checks (e.g., if dev/test mode)</li>
            <li>Catch blocks that return mock data when API fails</li>
            <li>Imported mock data files (mock/, mocks/, __mocks__)</li>
            <li>Return values may include "isMockData: true" property</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Manual API Testing</h2>
        <p className="mb-4 text-gray-700">
          Test API endpoints directly to see if they return mock data.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">Site Crawl Test</h3>
            <button 
              onClick={() => {
                const apiUrl = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';
                window.open(`${apiUrl}/site-crawl?url=https://example.com&maxPages=1&maxDepth=1`, '_blank');
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-full"
            >
              Test Site Crawl
            </button>
          </div>
          
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-2">SEO Analysis Test</h3>
            <button 
              onClick={() => {
                const apiUrl = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';
                window.open(`${apiUrl}/seo-analyze?url=https://example.com`, '_blank');
              }}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 w-full"
            >
              Test SEO Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MockDebugger;