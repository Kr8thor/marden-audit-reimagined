import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import robustApiService from '../services/robustApiService';
import AuditResults from '../components/audit/AuditResults';
import AuditError from '../components/audit/AuditError';
import CircularProgress from '../components/CircularProgress';

const AuditPage: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get audit type from URL query parameters (default to 'quick')
  const queryParams = new URLSearchParams(location.search);
  const auditType = queryParams.get('type') === 'site' ? 'site' : 'quick';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [analysisType, setAnalysisType] = useState<string>('basic');
  
  // Perform the analysis
  useEffect(() => {
    if (!url) {
      setError('No URL provided for analysis');
      setIsLoading(false);
      return;
    }
    
    performAnalysis();
  }, [url, auditType]);
  
  const performAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(10);
    
    try {
      console.log(`🚀 Starting ${auditType} analysis for:`, url);
      
      // First, check if API is healthy
      setProgress(20);
      try {
        await robustApiService.checkHealth();
        console.log('✅ API health check passed');
      } catch (healthError) {
        console.error('❌ API health check failed:', healthError);
        throw new Error(`API is not accessible: ${healthError.message}`);
      }
      
      setProgress(30);
      
      let analysisResult;
      
      if (auditType === 'site') {
        // Enhanced analysis with site crawling
        setAnalysisType('enhanced');
        setProgress(40);
        
        analysisResult = await robustApiService.analyzeEnhanced(url, {
          maxPages: 10,
          maxDepth: 2,
          crawlSite: true
        });
      } else {
        // Basic SEO analysis
        setAnalysisType('basic');
        setProgress(40);
        
        analysisResult = await robustApiService.analyzeSeo(url);
      }
      
      setProgress(80);
      
      if (!analysisResult || !analysisResult.data) {
        throw new Error('No analysis data received from API');
      }
      
      console.log('✅ Analysis completed successfully:', analysisResult);
      
      // Validate the data one more time
      if (analysisResult.data.pageData && analysisResult.data.pageData.title) {
        const title = analysisResult.data.pageData.title.text;
        if (title.includes('Fallback') || title.includes('Website') || 
            analysisResult.message.includes('fallback')) {
          console.warn('⚠️ Received suspicious data that might be mock');
          throw new Error('Received mock data instead of real analysis. Please try again.');
        }
      }
      
      setResults(analysisResult);
      setProgress(100);
      
      // Show success message
      toast.success('Analysis completed successfully!');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(error.message || 'Analysis failed');
      toast.error(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRetry = () => {
    performAnalysis();
  };
  
  const handleNewAnalysis = () => {
    navigate('/');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <CircularProgress progress={progress} />
          <h2 className="text-xl font-semibold mt-4 mb-2">
            Analyzing Website
          </h2>
          <p className="text-gray-600 mb-4">
            {progress < 30 ? 'Connecting to API...' :
             progress < 50 ? 'Starting analysis...' :
             progress < 80 ? `Performing ${analysisType} analysis...` :
             'Finalizing results...'}
          </p>
          <p className="text-sm text-gray-500">
            URL: {url}
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Analysis Type: {auditType === 'site' ? 'Site-wide Crawl' : 'Quick Analysis'}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <AuditError 
          error={error}
          onRetry={handleRetry}
          onNewAnalysis={handleNewAnalysis}
        />
      </div>
    );
  }
  
  if (!results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="text-gray-500 mb-4">
            No results available
          </div>
          <button 
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analysis info header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                SEO Analysis Results
              </h1>
              <p className="text-gray-600 mt-1">
                Analysis for: <span className="font-medium">{url}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">
                Analysis Type: {auditType === 'site' ? 'Site-wide Crawl' : 'Quick Analysis'}
              </div>
              <div className="text-sm text-gray-500">
                {results.cached ? 'Cached Result' : 'Fresh Analysis'}
              </div>
              {results.cached && results.cachedAt && (
                <div className="text-xs text-gray-400">
                  Cached: {new Date(results.cachedAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Results */}
        <AuditResults results={results} />
        
        {/* Action buttons */}
        <div className="mt-8 text-center">
          <button
            onClick={handleNewAnalysis}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 mr-4"
          >
            Analyze Another Website
          </button>
          <button
            onClick={handleRetry}
            className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
          >
            Re-analyze This Website
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditPage;