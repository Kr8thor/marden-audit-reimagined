// Extremely simple hook for SEO audit
import { useState } from 'react';

export interface AuditResult {
  url: string;
  score: number;
  realDataFlag: boolean;
  cached: boolean;
  pageAnalysis: {
    title: {
      text: string;
      length: number;
    };
    metaDescription: {
      text: string;
      length: number;
    };
    headings: {
      h1Count: number;
      h1Texts?: string[];
      h2Count: number;
      h2Texts?: string[];
    };
  };
}

export function useBasicAudit() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Simple function to run an audit
  const runAudit = async (url: string) => {
    try {
      // Reset state
      setIsLoading(true);
      setProgress(0);
      setError(null);
      
      // Simulate progress visually, but clear this later
      const interval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + Math.random() * 5));
      }, 300);
      
      // Clean the URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      // Use the new seo-analyze endpoint
      const encodedUrl = encodeURIComponent(cleanUrl);
      const apiUrl = `https://marden-audit-backend-se9t.vercel.app/api/seo-analyze?url=${encodedUrl}`;
      
      console.log('Calling API endpoint:', apiUrl);
      
      // Make the API request
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache', // Prevent caching
        },
      });
      
      console.log('Received response with status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API returned error status ${response.status}`);
      }
      
      // Parse the response data
      const data = await response.json();
      
      // Log the final data received from API
      console.log('Received FINAL data from API:', data);
      
      // Complete progress
      clearInterval(interval);
      setProgress(100);
      
      // Update state with the data directly from the API without any modification
      setTimeout(() => {
        setResult(data);
        setIsLoading(false);
      }, 300);
      
    } catch (e) {
      console.error('Error running audit:', e);
      
      clearInterval(interval);
      setProgress(0);
      
      // Provide detailed error message for debugging
      console.error('API ERROR OCCURRED:', e);
      
      const errorMessage = e instanceof Error 
        ? `Error: ${e.message}`
        : 'Error: Failed to connect to the audit service. Please try again.';
      
      setError(errorMessage);
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