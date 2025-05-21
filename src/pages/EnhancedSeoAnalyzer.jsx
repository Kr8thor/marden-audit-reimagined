import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';
import EnhancedAnalysisResults from '../components/EnhancedAnalysisResults';
import { analyzeEnhanced } from '../services/enhancedApiService';

const EnhancedSeoAnalyzer = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState(null);
  
  // Analysis options
  const [options, setOptions] = useState({
    mobileAnalysis: true,
    schemaAnalysis: true,
    siteCrawl: false,
    maxPages: 10,
    maxDepth: 2
  });
  
  // Update option value
  const updateOption = (key, value) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Handle URL input change
  const handleUrlChange = (e) => {
    setUrl(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url) {
      setError('Please enter a URL to analyze');
      return;
    }
    
    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Perform enhanced analysis
      const response = await analyzeEnhanced(url, options);
      
      if (response.status === 'error') {
        throw new Error(response.message || 'Failed to analyze URL');
      }
      
      // Set results
      setAnalysisResults(response.data);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Enhanced SEO Analyzer</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Analyze Website SEO</CardTitle>
          <CardDescription>
            Get comprehensive SEO insights with our enhanced analysis tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isAnalyzing}
                className="whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
            
            {/* Analysis options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="mobileAnalysis" 
                  checked={options.mobileAnalysis}
                  onCheckedChange={(checked) => updateOption('mobileAnalysis', checked)}
                />
                <Label htmlFor="mobileAnalysis">Mobile-Friendliness Analysis</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="schemaAnalysis" 
                  checked={options.schemaAnalysis}
                  onCheckedChange={(checked) => updateOption('schemaAnalysis', checked)}
                />
                <Label htmlFor="schemaAnalysis">Structured Data Analysis</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="siteCrawl" 
                  checked={options.siteCrawl}
                  onCheckedChange={(checked) => updateOption('siteCrawl', checked)}
                />
                <Label htmlFor="siteCrawl">Full Site Crawl</Label>
              </div>
            </div>
            
            {/* Site crawl options - show only when siteCrawl is checked */}
            {options.siteCrawl && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-md">
                <div>
                  <Label htmlFor="maxPages" className="block mb-1">Max Pages</Label>
                  <Input
                    type="number"
                    id="maxPages"
                    min={1}
                    max={50}
                    value={options.maxPages}
                    onChange={(e) => updateOption('maxPages', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum number of pages to crawl (1-50)</p>
                </div>
                
                <div>
                  <Label htmlFor="maxDepth" className="block mb-1">Max Depth</Label>
                  <Input
                    type="number"
                    id="maxDepth"
                    min={1}
                    max={5}
                    value={options.maxDepth}
                    onChange={(e) => updateOption('maxDepth', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum crawl depth (1-5)</p>
                </div>
              </div>
            )}
          </form>
          
          {/* Error message */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Basic Analysis
          </Button>
          <div className="text-sm text-gray-500">
            Powered by Marden SEO Audit Tool
          </div>
        </CardFooter>
      </Card>
      
      {/* Results section */}
      <div id="results-section" className="mt-8">
        <EnhancedAnalysisResults data={analysisResults} isLoading={isAnalyzing} />
      </div>
    </div>
  );
};

export default EnhancedSeoAnalyzer;