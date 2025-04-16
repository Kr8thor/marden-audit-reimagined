// API service for Marden SEO Audit
import { useState } from 'react';

// Define the base URL for our API
const API_URL = import.meta.env.PROD 
  ? 'https://marden-audit-backend-se9t.vercel.app' 
  : 'https://marden-audit-backend-se9t-qtsp5uw7a-leo-corbetts-projects.vercel.app';
// Using direct Vercel URL for now to ensure connection works

// Type definitions
export interface ApiResponse {
  status: string;
  message: string;
  timestamp: string;
  data?: any;
}

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
  // Add more fields as needed for your audit results
}

/**
 * Check if the API is running
 * @returns Promise with API status
 */
export const checkApiStatus = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_URL}/api`);
    console.log('Checking API status at:', `${API_URL}/api`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API status check failed:', error);
    throw error;
  }
};

/**
 * Run an SEO audit for the given URL
 * @param url The website URL to audit
 * @returns Promise with audit results
 */
export const runSeoAudit = async (url: string): Promise<AuditResult> => {
  try {
    console.log('Running SEO audit for URL:', url);
    console.log('API endpoint:', `${API_URL}/api/audit`);
    
    const response = await fetch(`${API_URL}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    // If the API returns an error status
    if (data.status === 'error') {
      throw new Error(data.message || 'Unknown API error');
    }
    
    return data;
  } catch (error) {
    console.error('SEO audit failed:', error);
    throw error;
  }
};

/**
 * Custom hook for API status
 */
export const useApiStatus = () => {
  const [isApiReady, setIsApiReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await checkApiStatus();
      setIsApiReady(response.status === 'ok');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setIsApiReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isApiReady,
    isLoading,
    error,
    checkStatus,
  };
};
