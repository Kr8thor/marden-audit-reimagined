import { useState } from 'react';

// Result interface matching the backend response
export interface AuditResult {
  url: string;
  score: number;
  issuesFound: number;
  opportunities: number;
  performanceMetrics: {
    lcp: {
      value: number;
      unit: string;
      score: number;
    };
    cls: {
      value: number;
      score: number;
    };
    fid: {
      value: number;
      unit: string;
      score: number;
    };
  };
  topIssues: Array<{
    severity: 'critical' | 'warning' | 'info';
    description: string;
  }>;
  pageAnalysis?: any;
  siteAnalysis?: any;
  realDataFlag?: boolean;
  cached?: boolean;
}

// Set the backend API URL - using environment variable with fallback
// Make sure it doesn't have a trailing slash
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://marden-audit-backend-se9t.vercel.app/api').replace(/\/$/, '');

// Simple hook for SEO audit
export function useSimpleAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Function to run an audit
  const runAudit = async (url: string) => {
    try {
      // Reset state
      setIsLoading(true);
      setProgress(0);
      setError(null);
      
      // Show progress animation
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      try {
        // Normalize URL
        let auditUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          auditUrl = `https://${url}`;
        }
        
        // FIXED: Use the correct API endpoint for basic audit
        const encodedUrl = encodeURIComponent(auditUrl);
        const apiUrl = `https://marden-audit-backend-se9t.vercel.app/api/basic-audit?url=${encodedUrl}`;
        
        console.log('Calling API endpoint:', apiUrl);
        
        // Make the API request
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          },
          mode: 'cors',
          signal: AbortSignal.timeout(15000) // 15 second timeout
        });
        
        if (!response.ok) {
          console.error('API response not OK:', response.status, response.statusText);
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        // Parse the response
        const data = await response.json();
        console.log('Using REAL data from API:', data);
        
        // Complete progress animation
        clearInterval(interval);
        setProgress(100);
        
        // FIXED: Use the API data directly without any modifications
        setTimeout(() => {
          setResult(data);
          setIsLoading(false);
        }, 500);
      } catch (e) {
        console.error('API error:', e);
        
        // Clean up
        clearInterval(interval);
        setProgress(0);
        
        // FIXED: Just show error message, don't generate mock results
        const errorMessage = e instanceof Error 
          ? `Error: ${e.message}`
          : 'Failed to connect to the audit service. Please try again.';
        
        setError(errorMessage);
        setIsLoading(false);
      }
    } catch (e) {
      console.error('Unexpected error:', e);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    progress,
    result,
    error,
    runAudit
  };
}