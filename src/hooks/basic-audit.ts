// Extremely simple hook for SEO audit
import { useState } from 'react';

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
  topIssues: any[];
  pageAnalysis?: any;
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
      
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => Math.min(95, prev + Math.random() * 10));
      }, 200);
      
      // Clean the URL
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      // This is the simplest possible approach - just a GET request with a query parameter
      const encodedUrl = encodeURIComponent(cleanUrl);
      const apiUrl = `https://marden-audit-backend-se9t.vercel.app/api/basic-audit?url=${encodedUrl}`;
      
      console.log('Calling API:', apiUrl);
      
      // Make the request
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      console.log('API response:', data);
      
      // Fill in page analysis
      const enhancedData = {
        ...data,
        pageAnalysis: {
          title: `${url.replace('https://', '').replace('http://', '').split('/')[0]} Website`,
          metaDescription: 'Sample meta description for SEO analysis.',
          headings: { h1: 1, h2: 3, h3: 5 },
          wordCount: 500,
        }
      };
      
      // Complete progress
      clearInterval(interval);
      setProgress(100);
      
      // Update state
      setTimeout(() => {
        setResult(enhancedData);
        setIsLoading(false);
      }, 500);
      
    } catch (e) {
      console.error('Error running audit:', e);
      setError('Failed to connect to the audit service. Please try again.');
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