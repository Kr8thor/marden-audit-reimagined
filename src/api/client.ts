/**
 * API Client for interacting with the Marden SEO Audit backend
 */
import {
  JobCreationResponse,
  JobStatusResponse,
  JobResultsResponse,
  HealthCheckResponse
} from './types';

// Backend API URL - will use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json() as Promise<T>;
}

/**
 * Retry function for API requests
 */
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  backoff = 300
): Promise<T> {
  try {
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry<T>(url, options, retries - 1, backoff * 2);
  }
}

/**
 * API client for the Marden SEO Audit service
 */
const apiClient = {
  /**
   * Submit a URL for site audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitSiteAudit: async (url: string, options = {}): Promise<JobCreationResponse> => {
    console.log(`Submitting site audit for URL: ${url}`);
    
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(`${API_BASE_URL}/v2/audit/site`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: normalizedUrl, 
        options: {
          ...options,
          maxPages: options.maxPages || 10,
          crawlDepth: options.crawlDepth || 2
        }
      }),
    });
    
    return handleResponse<JobCreationResponse>(response);
  },
  
  /**
   * Submit a URL for page audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitPageAudit: async (url: string, options = {}): Promise<JobCreationResponse> => {
    console.log(`Submitting page audit for URL: ${url}`);
    
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(`${API_BASE_URL}/v2/audit/page`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        url: normalizedUrl, 
        options
      }),
    });
    
    return handleResponse<JobCreationResponse>(response);
  },
  
  /**
   * Get status of a job
   * @param jobId Job ID
   * @returns Promise with job status
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    console.log(`Getting status for job: ${jobId}`);
    
    return fetchWithRetry<JobStatusResponse>(
      `${API_BASE_URL}/v2/job/${jobId}`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  },
  
  /**
   * Get results of a completed job
   * @param jobId Job ID
   * @returns Promise with job results
   */
  getJobResults: async (jobId: string): Promise<JobResultsResponse> => {
    console.log(`Getting results for job: ${jobId}`);
    
    return fetchWithRetry<JobResultsResponse>(
      `${API_BASE_URL}/v2/job/${jobId}/results`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  },
  
  /**
   * Check API health
   * @returns Promise with health status
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    return fetchWithRetry<HealthCheckResponse>(
      `${API_BASE_URL}/v2/health`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  },
  
  /**
   * Perform quick SEO analysis
   * @param url URL to analyze
   * @returns Promise with analysis results
   */
  quickSeoAnalysis: async (url: string): Promise<any> => {
    console.log(`Performing quick SEO analysis for URL: ${url}`);
    
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    const response = await fetch(`${API_BASE_URL}/v2/seo-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: normalizedUrl }),
    });
    
    return handleResponse<any>(response);
  }
};

export default apiClient;