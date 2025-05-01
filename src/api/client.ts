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
   * Check API health
   * @returns Promise with health status
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    return fetchWithRetry<HealthCheckResponse>(
      `${API_BASE_URL}/health`,
      {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  },
  
  /**
   * Perform SEO analysis
   * @param url URL to analyze
   * @returns Promise with analysis results
   */
  quickSeoAnalysis: async (url: string): Promise<SeoAnalysisResponse> => {
    console.log(`Performing SEO analysis for URL: ${url}`);
    
    const normalizedUrl = normalizeUrl(url);
    
    // Try v2 endpoint first
    try {
      const response = await fetch(`${API_BASE_URL}/v2/seo-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: normalizedUrl }),
      });
      
      if (response.status === 404) {
        // Fallback to other endpoint
        console.log('V2 endpoint not found, trying alternative endpoint');
        return fetchWithRetry<SeoAnalysisResponse>(
          `${API_BASE_URL}/seo-analyze`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: normalizedUrl }),
          }
        );
      }
      
      return handleResponse<SeoAnalysisResponse>(response);
    } catch (error) {
      console.error('Error with endpoint, trying alternative:', error);
      
      // Fallback to other endpoint
      return fetchWithRetry<SeoAnalysisResponse>(
        `${API_BASE_URL}/seo-analyze`,
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
  
  // For compatibility with existing code, provide these as wrappers
  submitPageAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    console.log('Using direct SEO analysis instead of job-based page audit');
    const analysisResult = await apiClient.quickSeoAnalysis(url);
    
    // Convert analysis to job creation response format
    return {
      status: 'ok',
      message: 'Analysis completed directly',
      jobId: 'direct-analysis',
      url: normalizeUrl(url),
      cached: false,
      timestamp: new Date().toISOString(),
      data: analysisResult.data
    };
  },
  
  submitSiteAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    console.log('Using direct SEO analysis instead of job-based site audit');
    return apiClient.submitPageAudit(url, options);
  },
  
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    console.log('Direct analysis used - no job status to check');
    
    // Return mocked job status for compatibility
    return {
      status: 'ok',
      message: 'Direct analysis used - no job status available',
      jobId,
      job: {
        id: jobId,
        type: 'direct_analysis',
        status: 'completed',
        progress: 100,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        url: '',
        options: {},
        message: 'Direct analysis used'
      },
      timestamp: new Date().toISOString()
    };
  },
  
  getJobResults: async (jobId: string): Promise<JobResultsResponse> => {
    console.log('Direct analysis used - checking stored results');
    
    // Return mocked job results for compatibility
    return {
      status: 'ok',
      message: 'Direct analysis results',
      jobId,
      url: '',
      results: {},
      cached: false,
      timestamp: new Date().toISOString()
    };
  },
  
  // This is a simplified version since we don't need polling with direct analysis
  pollJobUntilCompletion: async (
    jobId: string, 
    onProgress?: (status: JobStatusResponse) => void
  ): Promise<JobResultsResponse> => {
    return apiClient.getJobResults(jobId);
  }
};

export default apiClient;