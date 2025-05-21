import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Info, AlertTriangle, Check, X } from 'lucide-react';

interface DebugPanelProps {
  apiUrl: string;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ apiUrl }) => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [siteAuditStatus, setSiteAuditStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      
      setHealthStatus(data);
    } catch (error) {
      setError(`Health check failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSiteAudit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${apiUrl}/site-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: 'https://example.com',
          maxPages: 1,
          maxDepth: 1
        })
      });
      
      const data = await response.json();
      setSiteAuditStatus(data);
    } catch (error) {
      setError(`Site audit test failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-md mt-4">
      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900 dark:to-yellow-900">
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-amber-600" />
          API Debug Panel
        </CardTitle>
        <CardDescription>
          Debug connection to backend API
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
          <div>
            <h3 className="font-medium">API URL</h3>
            <p className="text-sm text-gray-600">{apiUrl}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkHealth}
              disabled={isLoading}
            >
              Check Health
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testSiteAudit}
              disabled={isLoading}
            >
              Test Site Audit
            </Button>
          </div>
        </div>
        
        {/* Health Status */}
        {healthStatus && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium mb-2">Health Status</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={healthStatus.status === 'ok' ? 'success' : 'destructive'}>
                {healthStatus.status === 'ok' ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {healthStatus.status}
              </Badge>
              <span className="text-sm">{healthStatus.message}</span>
            </div>
            
            {healthStatus.components && (
              <div className="text-sm space-y-1">
                <h4 className="font-medium">Components:</h4>
                {Object.entries(healthStatus.components).map(([name, info]: [string, any]) => (
                  <div key={name} className="flex items-center gap-2">
                    <Badge variant={info.status === 'ok' ? 'outline' : 'secondary'} className="capitalize">
                      {name}
                    </Badge>
                    <span>{info.status}</span>
                    {info.error && <span className="text-red-500 text-xs">{info.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Site Audit Test */}
        {siteAuditStatus && (
          <div className="border rounded-md p-3">
            <h3 className="font-medium mb-2">Site Audit Test</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={siteAuditStatus.status === 'ok' ? 'success' : 'destructive'}>
                {siteAuditStatus.status === 'ok' ? (
                  <Check className="h-3 w-3 mr-1" />
                ) : (
                  <X className="h-3 w-3 mr-1" />
                )}
                {siteAuditStatus.status}
              </Badge>
              <span className="text-sm">{siteAuditStatus.message}</span>
            </div>
            
            <div className="max-h-48 overflow-auto text-xs bg-gray-50 p-2 rounded">
              <pre>{JSON.stringify(siteAuditStatus, null, 2)}</pre>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 dark:bg-gray-800">
        <p className="text-sm text-gray-500">
          This panel is for debugging API connectivity issues only
        </p>
      </CardFooter>
    </Card>
  );
};

export default DebugPanel;