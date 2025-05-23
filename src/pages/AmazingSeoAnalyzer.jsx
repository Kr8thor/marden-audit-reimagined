import React, { useState } from 'react';
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Globe,
  TrendingUp,
  AlertTriangle,
  FileText,
  Link
} from 'lucide-react';
import amazingApiService from '../services/amazingApiService';

const AmazingSeoAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('full-crawl');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  
  const [crawlOptions, setCrawlOptions] = useState({
    maxPages: 50,
    maxDepth: 3,
    respectRobots: true,
    includeSubdomains: false
  });

  const handleAnalysis = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setResults(null);
    setProgress({ message: 'Starting analysis...', progress: 10 });
    
    try {
      let result;
      
      if (analysisType === 'full-crawl') {
        result = await amazingApiService.fullSiteCrawl(url, crawlOptions, (prog) => {
          setProgress(prog);
        });
      } else if (analysisType === 'comprehensive') {
        setProgress({ message: 'Running comprehensive analysis...', progress: 50 });
        result = await amazingApiService.comprehensiveAnalysis(url);
      } else {
        setProgress({ message: 'Analyzing page...', progress: 50 });
        result = await amazingApiService.analyzeSeo(url);
      }
      
      setResults(result);
      setProgress(null);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze website');
      setProgress(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const AnalysisResults = ({ data }) => {
    if (!data) return null;
    
    // Full site crawl results
    if (data.type === 'site-crawl' && data.pages) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">Full Site Analysis Results</h2>
          
          {/* Site Summary */}
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Site Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{data.pages.length}</div>
                <div className="text-sm text-gray-600">Pages Analyzed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {Math.round(data.summary?.averageScore || 0)}
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {data.summary?.totalIssues || 0}
                </div>
                <div className="text-sm text-gray-600">Total Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {data.crawlTime ? `${(data.crawlTime / 1000).toFixed(1)}s` : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Crawl Time</div>
              </div>
            </div>
          </div>
          
          {/* Site Health */}
          {data.siteHealth && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Overall Site Health</h3>
              <div className="flex items-center space-x-4">
                <div className={`text-5xl font-bold ${
                  data.siteHealth.status === 'good' ? 'text-green-500' :
                  data.siteHealth.status === 'needs_improvement' ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {data.siteHealth.grade}
                </div>
                <div>
                  <div className="text-lg text-gray-900">{data.siteHealth.status.replace('_', ' ').toUpperCase()}</div>
                  <div className="text-sm text-gray-600">Score: {data.siteHealth.score}/100</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Common Issues */}
          {data.summary?.commonIssues?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Most Common Issues</h3>
              <div className="space-y-2">
                {data.summary.commonIssues.slice(0, 5).map((issue, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium text-gray-900">{issue.type.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded">
                      {issue.count} pages affected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Site-wide Recommendations */}
          {data.recommendations?.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Key Recommendations</h3>
              <div className="space-y-3">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${
                    rec.priority === 'high' ? 'border-red-300 bg-red-50' :
                    rec.priority === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-blue-300 bg-blue-50'
                  }`}>
                    <div className="flex items-start">
                      <AlertCircle className={`h-5 w-5 mr-2 flex-shrink-0 ${
                        rec.priority === 'high' ? 'text-red-500' :
                        rec.priority === 'medium' ? 'text-yellow-500' :
                        'text-blue-500'
                      }`} />
                      <div>
                        <div className="font-medium text-sm uppercase text-gray-700">
                          {rec.category} - {rec.priority} priority
                        </div>
                        <div className="mt-1 text-gray-900">{rec.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Individual Page Results */}
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Page-by-Page Analysis</h3>
            <div className="space-y-4">
              {data.pages.map((page, idx) => (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-600 break-all">{page.url}</h4>
                      <p className="text-sm text-gray-700 mt-1">{page.title || 'No title'}</p>
                    </div>
                    <div className={`text-2xl font-bold ml-4 ${
                      page.seo.score >= 80 ? 'text-green-500' :
                      page.seo.score >= 60 ? 'text-yellow-500' :
                      'text-red-500'
                    }`}>
                      {page.seo.score}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Words:</span> <span className="text-gray-900">{page.content?.wordCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Images:</span> <span className="text-gray-900">{page.images?.total || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Links:</span> <span className="text-gray-900">{
                        (page.links?.internal?.length || 0) + (page.links?.external?.length || 0)
                      }</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Issues:</span> <span className="text-gray-900">{page.seo?.issues?.length || 0}</span>
                    </div>
                  </div>
                  
                  {/* Mobile & Schema Status */}
                  <div className="flex space-x-4 mt-3">
                    {page.mobileData && (
                      <div className={`text-sm px-2 py-1 rounded ${
                        page.mobileData.score >= 80 ? 'bg-green-100 text-green-700' :
                        page.mobileData.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        📱 Mobile: {page.mobileData.score}
                      </div>
                    )}
                    {page.schemaData && (
                      <div className={`text-sm px-2 py-1 rounded ${
                        page.schemaData.present ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        📊 Schema: {page.schemaData.present ? 'Yes' : 'No'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    // Single page or comprehensive results
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Analysis Results</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-gray-900">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 AMAZING SEO Analyzer
          </h1>
          <p className="text-lg text-gray-600">
            Full site crawling, comprehensive analysis, and detailed insights!
          </p>
        </div>
        
        {/* Analysis Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <form onSubmit={handleAnalysis}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  disabled={isAnalyzing}
                />
              </div>
            </div>
            
            {/* Analysis Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setAnalysisType('full-crawl')}
                  disabled={isAnalyzing}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    analysisType === 'full-crawl' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full">
                    <span className="block text-sm font-medium text-gray-900">
                      🕷️ Full Site Crawl
                    </span>
                    <span className="mt-1 text-sm text-gray-600">
                      Analyze entire website (up to {crawlOptions.maxPages} pages)
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAnalysisType('comprehensive')}
                  disabled={isAnalyzing}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    analysisType === 'comprehensive' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full">
                    <span className="block text-sm font-medium text-gray-900">
                      🎯 Comprehensive
                    </span>
                    <span className="mt-1 text-sm text-gray-600">
                      All analyses on single page
                    </span>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setAnalysisType('single-page')}
                  disabled={isAnalyzing}
                  className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                    analysisType === 'single-page' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  } ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="w-full">
                    <span className="block text-sm font-medium text-gray-900">
                      📄 Single Page
                    </span>
                    <span className="mt-1 text-sm text-gray-600">
                      Basic SEO analysis only
                    </span>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Crawl Options (shown only for full crawl) */}
            {analysisType === 'full-crawl' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium mb-3 text-gray-900">Crawl Settings</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Max Pages</label>
                    <input
                      type="number"
                      value={crawlOptions.maxPages}
                      onChange={(e) => setCrawlOptions({...crawlOptions, maxPages: parseInt(e.target.value) || 50})}
                      min="1"
                      max="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Max Depth</label>
                    <input
                      type="number"
                      value={crawlOptions.maxDepth}
                      onChange={(e) => setCrawlOptions({...crawlOptions, maxDepth: parseInt(e.target.value) || 3})}
                      min="1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 bg-white"
                      disabled={isAnalyzing}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crawlOptions.respectRobots}
                        onChange={(e) => setCrawlOptions({...crawlOptions, respectRobots: e.target.checked})}
                        className="mr-2"
                        disabled={isAnalyzing}
                      />
                      <span className="text-sm text-gray-700">Respect robots.txt</span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={crawlOptions.includeSubdomains}
                        onChange={(e) => setCrawlOptions({...crawlOptions, includeSubdomains: e.target.checked})}
                        className="mr-2"
                        disabled={isAnalyzing}
                      />
                      <span className="text-sm text-gray-700">Include subdomains</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing || !url}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                isAnalyzing || !url
                  ? 'bg-gray-300 text-gray-700 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  <span>Analyzing... {progress?.message || ''}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Search className="h-5 w-5 mr-2" />
                  <span>Start Analysis</span>
                </span>
              )}
            </button>
          </form>
        </div>
        
        {/* Progress Bar */}
        {isAnalyzing && progress && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-700">
              <span>{progress.message}</span>
              <span>{progress.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start">
              <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Analysis Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results */}
        {results && <AnalysisResults data={results} />}
      </div>
    </div>
  );
};

export default AmazingSeoAnalyzer;