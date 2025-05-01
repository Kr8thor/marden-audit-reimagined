// API service for Marden SEO Audit
import { useState } from 'react';
import apiClient from '../api/client';
import type { HealthCheckResponse } from '../api/types';

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