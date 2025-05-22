import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const ApiDiagnostics = () => {
  const [diagnostics, setDiagnostics] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runDiagnostics = async () => {
    setIsRunning(true);
    setDiagnostics(null);
    
    try {
      // Import the enhanced API service
      const { testConnection } = await import('../services/enhancedApiService.js');
      const results = await testConnection();
      setDiagnostics(results);
    } catch (error) {
      setDiagnostics({
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  const getStatusIcon = (success) => {
    if (success) return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Diagnostics</h1>
        <p className="text-gray-600">Detailed testing of API connectivity and functionality</p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>
              Real-time diagnostics of API connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={runDiagnostics} 
                disabled={isRunning}
                className="w-full"
              >
                {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
              </Button>
              
              {diagnostics && (
                <div className="space-y-4">
                  {diagnostics.error ? (
                    <Alert variant="destructive">
                      <AlertDescription>
                        <strong>Critical Error:</strong> {diagnostics.error}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="font-semibold">Connection Details</h3>
                        <p className="text-sm"><strong>API URL:</strong> {diagnostics.apiUrl}</p>
                        <p className="text-sm"><strong>Test Time:</strong> {new Date(diagnostics.timestamp).toLocaleString()}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <h3 className="font-semibold">Test Results</h3>
                        
                        {/* Health Check */}
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostics.tests.health?.success)}
                            <span>Health Check</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {diagnostics.tests.health?.success 
                              ? `Status: ${diagnostics.tests.health.data?.status}`
                              : diagnostics.tests.health?.error
                            }
                          </div>
                        </div>
                        
                        {/* SEO Analysis */}
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostics.tests.analysis?.success)}
                            <span>SEO Analysis Test</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {diagnostics.tests.analysis?.success 
                              ? `Score: ${diagnostics.tests.analysis.score}`
                              : diagnostics.tests.analysis?.error
                            }
                          </div>
                        </div>
                        
                        {/* CORS Test */}
                        <div className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(diagnostics.tests.cors?.success)}
                            <span>CORS Test</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {diagnostics.tests.cors?.success 
                              ? `Status: ${diagnostics.tests.cors.status}`
                              : diagnostics.tests.cors?.error
                            }
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Frontend URL:</strong> {window.location.origin}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
              <p><strong>API URL (env):</strong> {import.meta.env.VITE_API_URL || 'Not set'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ApiDiagnostics;
