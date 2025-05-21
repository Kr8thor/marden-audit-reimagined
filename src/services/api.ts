// API service for Marden SEO Audit
import { useState } from 'react';
import apiClient from '../api/client';
import clientSiteAudit from './clientSiteAudit';
import type { HealthCheckResponse, SiteAuditResponse } from '../api/types';

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
export const checkApiStatus = async (): Promise<HealthCheckResponse> => {
  try {
    return await apiClient.checkHealth();
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
export const runSeoAudit = async (url: string): Promise<any> => {
  try {
    console.log('Running SEO audit for URL:', url);
    
    // First try the quick analysis endpoint
    try {
      const quickResult = await apiClient.quickSeoAnalysis(url);
      
      // If it's cached, we can return it immediately
      if (quickResult.cached) {
        console.log('Using cached SEO analysis');
        return quickResult;
      }
    } catch (quickError) {
      console.warn('Quick analysis not available, falling back to job-based audit');
    }
    
    // If quick analysis didn't work or wasn't cached, use the job system
    const jobResponse = await apiClient.submitPageAudit(url);
    
    // Poll for job completion
    let jobStatus = await apiClient.getJobStatus(jobResponse.jobId);
    
    // If job is already completed (from cache), get results
    if (jobStatus.job.status === 'completed' && jobStatus.job.hasResults) {
      return apiClient.getJobResults(jobResponse.jobId);
    }
    
    // Otherwise, we need to wait for the job to complete
    // This would typically be handled by a polling mechanism
    // in the UI rather than blocking here
    throw new Error('Job started but not yet completed. Use jobId to check status: ' + jobResponse.jobId);
    
  } catch (error) {
    console.error('SEO audit failed:', error);
    throw error;
  }
};

/**
 * Run a full site audit for the given URL
 * @param url The website URL to audit
 * @param options Additional audit options
 * @returns Promise with site audit results
 */
export const runSiteAudit = async (url: string, options: any = {}): Promise<SiteAuditResponse> => {
  try {
    console.log('Running site audit for URL:', url, 'with options:', options);
    
    // Set up progress callback
    const progressCallback = options.onProgress || (() => {});
    
    // First try the server-side endpoint
    try {
      progressCallback(10, 'Connecting to audit server...');
      
      // Try the direct site audit method with short timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/site-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ 
          url,
          ...options
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const siteAuditResult = await response.json();
        return siteAuditResult;
      }
      
      console.log(`Server-side site audit failed with status ${response.status}, trying client-side approach`);
    } catch (siteAuditError) {
      console.warn('Server-side site audit failed, using client-side implementation:', siteAuditError);
    }
    
    // If server-side audit failed, use client-side implementation
    progressCallback(20, 'Using client-side audit implementation...');
    
    // Use the client-side implementation
    const clientSideResult = await clientSiteAudit.performClientSideAudit(url, {
      ...options,
      onProgress: (progress, message) => {
        // Scale progress to 20-90% range
        const scaledProgress = Math.round(progress * 0.7) + 20;
        progressCallback(scaledProgress, message);
      }
    });
    
    // Return the result in the standard format
    progressCallback(100, 'Site audit completed');
    
    return {
      status: 'ok',
      message: 'Site audit completed (client-side implementation)',
      url,
      cached: false,
      timestamp: new Date().toISOString(),
      data: clientSideResult
    };
  } catch (error) {
    console.error('Site audit failed:', error);
    
    throw error instanceof Error ? error : new Error('Unknown error during site audit');
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

/**
 * Custom hook for site audit
 */
export const useSiteAudit = () => {
  const [result, setResult] = useState<SiteAuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const runAudit = async (url: string, options: any = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      setStatusMessage('Initializing site audit...');
      
      // Add progress callback to options
      const optionsWithProgress = {
        ...options,
        onProgress: (progressValue: number, message: string) => {
          setProgress(progressValue);
          setStatusMessage(message);
        }
      };
      
      // Run the audit
      const response = await runSiteAudit(url, optionsWithProgress);
      
      setProgress(100);
      setStatusMessage('Site audit completed');
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      setStatusMessage('Site audit failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    result,
    isLoading,
    error,
    progress,
    statusMessage,
    runAudit
  };
};