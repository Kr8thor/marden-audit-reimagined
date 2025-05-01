/**
 * API Client for interacting with the Marden SEO Audit backend
 */
import {
  JobCreationResponse,
  JobStatusResponse,
  JobResultsResponse,
  HealthCheckResponse,
  SeoAnalysisResponse
} from './types';

// Backend API URL - will use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Generic function to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error('API Error Response:', response.status, response.statusText);
    try {
      const errorData = await response.json();
      console.error('Error Data:', errorData);
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
  }
  
  return response.json() as Promise<T>;
}

/**
 * Retry function for API requests with exponential backoff
 */
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit, 
  retries = 3, 
  backoff = 300
): Promise<T> {
  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, options);
    return await handleResponse<T>(response);
  } catch (error) {
    console.error(`Fetch error (retries left: ${retries}):`, error);
    if (retries <= 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry<T>(url, options, retries - 1, backoff * 2);
  }
}

/**
 * Normalize URL to ensure proper format
 */
function normalizeUrl(url: string): string {
  return url.startsWith('http') ? url : `https://${url}`;
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
  submitSiteAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    console.log(`Submitting site audit for URL: ${url}`);
    
    const normalizedUrl = normalizeUrl(url);
    
    return fetchWithRetry<JobCreationResponse>(
      `${API_BASE_URL}/v2/audit/site`,
      {
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
      }
    );
  },
  
  /**
   * Submit a URL for page audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitPageAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    console.log(`Submitting page audit for URL: ${url} to ${API_BASE_URL}/v2/audit/page`);
    
    const normalizedUrl = normalizeUrl(url);
    
    // Try with the v2 API first
    try {
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
      
      // If v2 API returns 404, try the old endpoint as fallback
      if (response.status === 404) {
        console.log('V2 API not found, falling back to quick analysis');
        return apiClient.quickSeoAnalysis(url) as Promise<JobCreationResponse>;
      }
      
      return handleResponse<JobCreationResponse>(response);
    } catch (error) {
      console.error('Error with v2 API, trying fallback:', error);
      // Fallback to the older API
      return apiClient.quickSeoAnalysis(url) as Promise<JobCreationResponse>;
    }
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
  quickSeoAnalysis: async (url: string): Promise<SeoAnalysisResponse> => {
    console.log(`Performing quick SEO analysis for URL: ${url}`);
    
    const normalizedUrl = normalizeUrl(url);
    
    try {
      // Try v2 endpoint first
      const response = await fetch(`${API_BASE_URL}/v2/seo-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      
      if (response.status === 404) {
        // Fallback to v1 endpoint
        console.log('V2 seo-analyze not found, falling back to /api/real-seo-audit');
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/real-seo-audit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: normalizedUrl }),
        });
        
        return handleResponse<SeoAnalysisResponse>(fallbackResponse);
      }
      
      return handleResponse<SeoAnalysisResponse>(response);
    } catch (error) {
      console.error('Error with v2 seo-analyze, trying fallback:', error);
      
      // Fallback to v1 endpoint with retry and exponential backoff
      return fetchWithRetry<SeoAnalysisResponse>(
        `${API_BASE_URL}/api/real-seo-audit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: normalizedUrl }),
        }
      );
    }
  },
  
  /**
   * Polling function to check job status until completion
   * @param jobId Job ID
   * @param onProgress Progress callback
   * @param maxAttempts Maximum number of attempts
   * @returns Promise with job results
   */
  pollJobUntilCompletion: async (
    jobId: string, 
    onProgress?: (status: JobStatusResponse) => void,
    maxAttempts = 30,
    initialDelay = 2000
  ): Promise<JobResultsResponse> => {
    let attempts = 0;
    let delay = initialDelay;
    
    while (attempts < maxAttempts) {
      try {
        const status = await apiClient.getJobStatus(jobId);
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress(status);
        }
        
        // Check job status
        if (status.job.status === 'completed') {
          return await apiClient.getJobResults(jobId);
        }
        
        // If job failed, throw error
        if (status.job.status === 'failed') {
          throw new Error(`Job failed: ${status.job.error || 'Unknown error'}`);
        }
        
        // Wait before next attempt with increasing delay (capped at 10 seconds)
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 10000); // Increase delay but cap at 10 seconds
        attempts++;
      } catch (error) {
        console.error(`Error polling job status:`, error);
        throw error;
      }
    }
    
    throw new Error(`Job didn't complete after ${maxAttempts} attempts`);
  }
};

export default apiClient;