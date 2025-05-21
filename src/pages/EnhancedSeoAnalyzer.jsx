import React, { useState } from 'react';
import { analyzeEnhanced } from '../services/enhancedApiService';
import EnhancedAnalysisResults from '../components/EnhancedAnalysisResults';

const EnhancedSeoAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [options, setOptions] = useState({
    crawlSite: false,
    maxPages: 5,
    maxDepth: 2
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url || !url.trim()) {
      setError({ message: 'Please enter a valid URL' });
      return;
    }
    
    // Ensure URL has http or https prefix
    let processedUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      processedUrl = 'https://' + url;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log("Starting enhanced analysis for: ", processedUrl, options);
      const results = await analyzeEnhanced(processedUrl, options);
      console.log("Analysis results:", results);
      setAnalysisResults(results);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(err.response?.data?.message ? 
        { message: err.response.data.message } : 
        { message: err.message || 'An error occurred during analysis' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions({
      ...options,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Enhanced SEO Analyzer</h1>
      
      <div className="max-w-3xl mx-auto mb-12 bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Website URL
            </label>
            <input
              type="text"
              id="url"
              placeholder="Enter website URL (e.g., example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Analysis Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="crawlSite"
                  name="crawlSite"
                  checked={options.crawlSite}
                  onChange={handleOptionChange}
                  className="h-4 w-4 text-blue-600"
                />
                <label htmlFor="crawlSite" className="ml-2 text-sm text-gray-700">
                  Crawl entire site
                </label>
              </div>
              
              {options.crawlSite && (
                <>
                  <div>
                    <label htmlFor="maxPages" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Pages
                    </label>
                    <input
                      type="number"
                      id="maxPages"
                      name="maxPages"
                      min="1"
                      max="50"
                      value={options.maxPages}
                      onChange={handleOptionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="maxDepth" className="block text-sm font-medium text-gray-700 mb-1">
                      Max Depth
                    </label>
                    <input
                      type="number"
                      id="maxDepth"
                      name="maxDepth"
                      min="1"
                      max="5"
                      value={options.maxDepth}
                      onChange={handleOptionChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>          
          <button
            type="submit"
            disabled={isAnalyzing}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Website'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error.message || 'An error occurred during analysis. Please try again.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results */}
      {(analysisResults || isAnalyzing) && (
        <div className="max-w-5xl mx-auto">
          <EnhancedAnalysisResults data={analysisResults} isLoading={isAnalyzing} />
        </div>
      )}
    </div>
  );
};

export default EnhancedSeoAnalyzer;