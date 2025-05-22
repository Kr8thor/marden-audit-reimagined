import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, Clock, Zap } from 'lucide-react';
import { 
  analyzeSeo, 
  analyzeEnhanced, 
  checkHealth, 
  testConnection 
} from '../services/robustApiService';

const ApiTestPage = () => {
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({});
  const [healthStatus, setHealthStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Check API health on component mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const health = await checkHealth();
        setHealthStatus({ status: 'ok', data: health });
      } catch (error) {
        setHealthStatus({ status: 'error', message: error.message });
      }
    };

    checkApiHealth();
  }, []);

  const runTest = async (testType, testFunction) => {
    setIsLoading(true);
    setResults(prev => ({
      ...prev,
      [testType]: { status: 'loading', message: 'Running test...' }
    }));

    try {
      const result = await testFunction();
      setResults(prev => ({
        ...prev,
        [testType]: { 
          status: 'success', 
          data: result,
          message: 'Test completed successfully'
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [testType]: { 
          status: 'error', 
          message: error.message,
          error: error
        }
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const testBasicAnalysis = () => {
    return runTest('basicAnalysis', () => analyzeSeo(testUrl));
  };

  const testEnhancedAnalysis = () => {
    return runTest('enhancedAnalysis', () => analyzeEnhanced(testUrl, { maxPages: 3 }));
  };

  const testApiConnection = () => {
    return runTest('connection', testConnection);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'loading':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Running</Badge>;
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Integration Test Suite</h1>
        <p className="text-gray-600">
          Verify that the frontend is properly integrated with the backend API
        </p>
      </div>

      {/* API Health Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthStatus ? (
            <div className="flex items-center gap-2">
              {healthStatus.status === 'ok' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700">API is healthy</span>
                  <Badge variant="success">Connected</Badge>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700">{healthStatus.message}</span>
                  <Badge variant="destructive">Disconnected</Badge>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 animate-spin" />
              <span>Checking API health...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test URL Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
          <CardDescription>
            Enter a URL to test the API integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
            />
            <Button 
              onClick={testApiConnection}
              variant="outline"
              disabled={isLoading}
            >
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connection Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              API Connection Test
              {getStatusBadge(results.connection?.status)}
            </CardTitle>
            <CardDescription>
              Tests overall API connectivity and data integrity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testApiConnection}
              disabled={isLoading}
              className="w-full mb-4"
            >
              {getStatusIcon(results.connection?.status)}
              Run Connection Test
            </Button>
            
            {results.connection && (
              <Alert className={results.connection.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                <AlertDescription>
                  {results.connection.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Basic Analysis Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Basic SEO Analysis
              {getStatusBadge(results.basicAnalysis?.status)}
            </CardTitle>
            <CardDescription>
              Tests the core SEO analysis functionality
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testBasicAnalysis}
              disabled={isLoading}
              className="w-full mb-4"
            >
              {getStatusIcon(results.basicAnalysis?.status)}
              Run Basic Analysis
            </Button>
            
            {results.basicAnalysis && (
              <div>
                <Alert className={results.basicAnalysis.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                  <AlertDescription>
                    {results.basicAnalysis.message}
                  </AlertDescription>
                </Alert>
                
                {results.basicAnalysis.data && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Analysis Results:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Score: <strong>{results.basicAnalysis.data.data?.score || 'N/A'}</strong></div>
                      <div>Status: <strong>{results.basicAnalysis.data.data?.status || 'N/A'}</strong></div>
                      <div>Title: <strong>{results.basicAnalysis.data.data?.pageData?.title?.text || 'N/A'}</strong></div>
                      <div>Issues: <strong>{results.basicAnalysis.data.data?.totalIssuesCount || 0}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Analysis Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Enhanced Analysis
              {getStatusBadge(results.enhancedAnalysis?.status)}
            </CardTitle>
            <CardDescription>
              Tests the enhanced analysis features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testEnhancedAnalysis}
              disabled={isLoading}
              className="w-full mb-4"
            >
              {getStatusIcon(results.enhancedAnalysis?.status)}
              Run Enhanced Analysis
            </Button>
            
            {results.enhancedAnalysis && (
              <Alert className={results.enhancedAnalysis.status === 'error' ? 'border-red-200' : 'border-green-200'}>
                <AlertDescription>
                  {results.enhancedAnalysis.message}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Results Summary */}
      {Object.keys(results).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(results).map(([testType, result]) => (
                <div key={testType} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="capitalize">{testType.replace(/([A-Z])/g, ' $1')}</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ApiTestPage;