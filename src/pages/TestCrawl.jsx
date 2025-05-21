import React, { useState } from 'react';
import forceCrawlSite from '../services/forcedCrawlingService';

// Simple test component to verify crawling functionality
const TestCrawl = () => {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState({
    maxPages: 3,
    maxDepth: 2
  });

  const handleTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('Testing crawl functionality for URL:', url);
      const response = await forceCrawlSite(url, options);
      console.log('Crawl result:', response);
      setResult(response);
    } catch (err) {
      console.error('Crawl failed:', err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Test Crawl Functionality</h1>
      <form onSubmit={handleTest} className="mb-6">
        <div className="mb-4">
          <label className="block mb-2">URL to Crawl:</label>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Max Pages:</label>
            <input 
              type="number" 
              value={options.maxPages} 
              onChange={(e) => setOptions({...options, maxPages: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block mb-2">Max Depth:</label>
            <input 
              type="number" 
              value={options.maxDepth} 
              onChange={(e) => setOptions({...options, maxDepth: parseInt(e.target.value)})}
              className="w-full p-2 border rounded"
              min="1"
              max="3"
            />
          </div>
        </div>
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Crawl'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 rounded mb-4">
          <h2 className="font-bold text-red-800 mb-2">Error:</h2>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-100 border border-green-400 rounded">
          <h2 className="font-bold text-green-800 mb-2">Result:</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TestCrawl;