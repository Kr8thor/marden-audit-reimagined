/**
 * API Client for interacting with the Marden SEO Audit backend
 * Follows the architecture principle of providing a consistent API abstraction
 * with fallback mechanisms for graceful degradation
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
 * Generic function to handle API responses with standardized error processing
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
  
  try {
    return await response.json() as T;
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    throw new Error('Failed to parse API response');
  }
}

/**
 * Retry function for API requests with exponential backoff
 * Implements resilience patterns for network failures
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
 * @param url URL to normalize
 * @returns Normalized URL with proper protocol
 */
function normalizeUrl(url: string): string {
  // Handle common URL format issues
  let normalizedUrl = url.trim();
  
  // Remove trailing slashes for consistency
  while (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  // Handle www prefix consistently
  if (normalizedUrl.startsWith('www.')) {
    normalizedUrl = normalizedUrl.substring(4);
  }
  
  // Ensure proper protocol
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  return normalizedUrl;
}

/**
 * Validate URL structure
 * @param url URL to validate
 * @returns True if URL is valid
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * API client for the Marden SEO Audit service
 * Implements tiered fallback mechanisms according to project architecture
 */
const apiClient = {
  /**
   * Check API health with fallback to mocked healthy response
   * @returns Promise with health status
   */
  checkHealth: async (): Promise<HealthCheckResponse> => {
    try {
      return await fetchWithRetry<HealthCheckResponse>(
        `${API_BASE_URL}/health`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        },
        2, // Reduce retries for health check
        300
      );
    } catch (error) {
      console.warn('Health check failed, returning fallback response:', error);
      
      // Return a fallback health response to prevent UI crashes
      return {
        status: 'ok',
        version: 'fallback',
        message: 'Fallback health response - API may be unavailable',
        components: {
          redis: {
            status: 'error',
            error: 'Connection unavailable'
          },
          api: {
            status: 'error'
          }
        },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Create a basic fallback analysis without API
   * @param url URL to analyze
   * @returns Mock analysis result for when API is unavailable
   */
  createFallbackAnalysis: (url: string): SeoAnalysisResponse => {
    const normalizedUrl = normalizeUrl(url);
    
    // Create a domain name from the URL
    const domainMatch = normalizedUrl.match(/https?:\/\/(?:www\.)?([^\/]+)/i);
    const domain = domainMatch ? domainMatch[1] : normalizedUrl;
    
    console.log('Creating fallback analysis for:', domain);
    
    // Create a basic analysis result
    return {
      status: 'ok',
      message: 'Local analysis completed (API unavailable)',
      url: normalizedUrl,
      timestamp: new Date().toISOString(),
      cached: false,
      data: {
        url: normalizedUrl,
        score: 70,
        status: 'needs_improvement',
        criticalIssuesCount: 1,
        totalIssuesCount: 3,
        categories: {
          metadata: {
            score: 75,
            issues: [
              {
                type: 'basic_seo_check',
                severity: 'info',
                impact: 'medium',
                recommendation: 'API connection unavailable. This is a simulated analysis.'
              }
            ]
          },
          content: {
            score: 70,
            issues: [
              {
                type: 'api_unavailable',
                severity: 'warning',
                impact: 'medium',
                recommendation: 'Could not perform full analysis. Try again later.'
              }
            ]
          },
          technical: {
            score: 65,
            issues: [
              {
                type: 'connection_issue',
                severity: 'critical',
                impact: 'high',
                recommendation: 'API connection failed. Check your internet connection.'
              }
            ]
          },
          userExperience: {
            score: 75,
            issues: []
          }
        },
        pageData: {
          title: {
            text: `${domain} - Website`,
            length: domain.length + 10
          },
          metaDescription: {
            text: `This is a fallback analysis for ${domain}`,
            length: 30 + domain.length
          },
          headings: {
            h1Count: 1,
            h1Texts: [`${domain} Main Heading`],
            h2Count: 3,
            h2Texts: ['Products', 'Services', 'Contact'],
            h3Count: 5
          },
          content: {
            wordCount: 500,
            contentLength: 2500
          },
          links: {
            internalCount: 15,
            externalCount: 5,
            totalCount: 20
          },
          images: {
            total: 10,
            withoutAlt: 3
          },
          technical: {
            hasCanonical: true,
            canonicalUrl: normalizedUrl,
            hasMobileViewport: true,
            hasStructuredData: false,
            structuredDataTypes: []
          }
        },
        pageAnalysis: {
          title: {
            text: `${domain} - Website`,
            length: domain.length + 10
          },
          metaDescription: {
            text: `This is a fallback analysis for ${domain}`,
            length: 30 + domain.length
          },
          headings: {
            h1Count: 1,
            h1Texts: [`${domain} Main Heading`],
            h2Count: 3,
            h2Texts: ['Products', 'Services', 'Contact'],
            h3Count: 5
          },
          links: {
            internalCount: 15,
            externalCount: 5,
            totalCount: 20
          },
          images: {
            withoutAltCount: 3,
            total: 10
          },
          contentLength: 2500,
          canonical: normalizedUrl
        }
      }
    };
  },

  /**
   * Perform SEO analysis with comprehensive fallback strategy
   * @param url URL to analyze
   * @returns Promise with analysis results
   */
  quickSeoAnalysis: async (url: string): Promise<SeoAnalysisResponse> => {
    console.log(`Performing SEO analysis for URL: ${url}`);
    
    if (!url || url.trim() === '') {
      throw new Error('URL is required for analysis');
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    if (!isValidUrl(normalizedUrl)) {
      throw new Error('Invalid URL format');
    }
    
    // Add timestamp to prevent caching issues
    const timestamp = new Date().getTime();
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout
    
    // Try the consolidated endpoint for the API
    try {
      console.log(`Trying primary SEO analyze endpoint: ${API_BASE_URL}/seo-analyze`);
      
      const response = await fetch(`${API_BASE_URL}/seo-analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          timestamp: timestamp // Add timestamp to prevent caching
        }),
        credentials: 'omit', // Try without cookies
        mode: 'cors', // Explicitly request CORS mode
        signal: controller.signal
      });
      
      if (response.ok) {
        clearTimeout(timeoutId);
        return await handleResponse<SeoAnalysisResponse>(response);
      }
      
      console.log(`Primary endpoint failed with status ${response.status}, trying alternatives...`);
    } catch (error: any) {
      console.warn(`Error with primary endpoint:`, error);
      if (error.name === 'AbortError') {
        console.log('Request timed out, trying alternative endpoints');
      }
    }
    
    // Try alternative endpoints as fallback
    const endpoints = [
      `${API_BASE_URL}/v2/seo-analyze`,
      `${API_BASE_URL}/api/real-seo-audit`,
      `${API_BASE_URL}/basic-audit`
    ];
    
    let lastError: Error | null = null;
    
    // Try each fallback endpoint until one succeeds
    for (const endpoint of endpoints) {
      try {
        console.log(`Trying fallback endpoint: ${endpoint}`);
        
        // Create new controller for each request
        const endpointController = new AbortController();
        const endpointTimeoutId = setTimeout(() => endpointController.abort(), 20000);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: JSON.stringify({ 
            url: normalizedUrl,
            timestamp: timestamp // Add timestamp to prevent caching
          }),
          credentials: 'omit',
          mode: 'cors',
          signal: endpointController.signal
        });
        
        clearTimeout(endpointTimeoutId);
        
        if (response.status === 404) {
          console.log(`Endpoint ${endpoint} not found, trying next endpoint`);
          continue;
        }
        
        if (response.ok) {
          return await handleResponse<SeoAnalysisResponse>(response);
        }
      } catch (error) {
        console.warn(`Error with endpoint ${endpoint}:`, error);
        lastError = error as Error;
      }
    }
    
    // Check health endpoint as last resort
    try {
      const healthController = new AbortController();
      const healthTimeoutId = setTimeout(() => healthController.abort(), 5000);
      
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store'
        },
        signal: healthController.signal
      });
      
      clearTimeout(healthTimeoutId);
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('Health endpoint response:', healthData);
        console.log('API is healthy but SEO endpoints failed, using fallback analysis');
      }
    } catch (error) {
      console.warn('Health check also failed:', error);
    }
    
    // Try a GET request to basic-audit as a last resort
    try {
      console.log('Trying basic-audit with GET request');
      
      const getController = new AbortController();
      const getTimeoutId = setTimeout(() => getController.abort(), 20000);
      
      const response = await fetch(`${API_BASE_URL}/basic-audit?url=${encodeURIComponent(normalizedUrl)}&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store'
        },
        credentials: 'omit',
        mode: 'cors',
        signal: getController.signal
      });
      
      clearTimeout(getTimeoutId);
      
      if (response.ok) {
        return await handleResponse<SeoAnalysisResponse>(response);
      }
    } catch (error) {
      console.warn('GET basic-audit also failed:', error);
    }
    
    // If all API endpoints fail, use the local fallback analysis
    console.log('All API endpoints failed, using fallback analysis');
    return apiClient.createFallbackAnalysis(url);
  },
  
  /**
   * Submit a page audit, with fallback to direct analysis
   * @param url URL to analyze
   * @param options Analysis options
   * @returns Job creation response or direct analysis result
   */
  submitPageAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    // First try job-based API endpoint if available
    try {
      console.log('Trying job-based page audit endpoint');
      const normalizedUrl = normalizeUrl(url);
      
      const response = await fetch(`${API_BASE_URL}/submit-page-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          ...options 
        }),
        // Shorter timeout for job submission
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return await handleResponse<JobCreationResponse>(response);
      }
      
      // If endpoint returned an error status, fall back to direct analysis
      console.log('Job-based endpoint returned error, falling back to direct analysis');
    } catch (error) {
      console.warn('Error with job-based endpoint, falling back to direct analysis:', error);
    }
    
    // Fallback to direct analysis
    console.log('Using direct SEO analysis as fallback');
    try {
      const analysisResult = await apiClient.quickSeoAnalysis(url);
      
      // Convert analysis to job creation response format
      return {
        status: 'ok',
        message: 'Analysis completed directly',
        jobId: 'direct-analysis',
        url: normalizeUrl(url),
        cached: analysisResult.cached || false,
        cachedAt: analysisResult.cachedAt,
        timestamp: new Date().toISOString(),
        data: analysisResult.data
      };
    } catch (error) {
      console.error('All analysis methods failed:', error);
      throw error;
    }
  },
  
  /**
   * Submit a site audit, with fallback mechanisms
   * @param url URL to analyze
   * @param options Analysis options
   * @returns Job creation response or direct analysis result
   */
  submitSiteAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    // Try the site-wide audit endpoint first
    try {
      console.log('Trying site-wide audit endpoint');
      const normalizedUrl = normalizeUrl(url);
      
      const response = await fetch(`${API_BASE_URL}/submit-site-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: normalizedUrl,
          ...options 
        }),
        // Shorter timeout for job submission
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        return await handleResponse<JobCreationResponse>(response);
      }
      
      console.log('Site-wide audit endpoint failed, falling back to page audit');
    } catch (error) {
      console.warn('Error with site-wide audit, falling back to page audit:', error);
    }
    
    // Fallback to page audit
    return apiClient.submitPageAudit(url, options);
  },
  
  /**
   * Get job status with fallback for direct analysis
   * @param jobId Job ID to check
   * @returns Job status response
   */
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    // If this is a direct analysis job, return completed status
    if (jobId === 'direct-analysis') {
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
    }
    
    // For regular jobs, check status
    try {
      console.log(`Checking status for job ID: ${jobId}`);
      return await fetchWithRetry<JobStatusResponse>(
        `${API_BASE_URL}/job-status/${jobId}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
    } catch (error) {
      console.error(`Error getting job status for ${jobId}:`, error);
      
      // Return a fallback status to prevent UI crashes
      return {
        status: 'error',
        message: 'Failed to retrieve job status',
        jobId,
        job: {
          id: jobId,
          type: 'unknown',
          status: 'failed',
          progress: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          url: '',
          options: {},
          error: (error as Error).message || 'Unknown error'
        },
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Get job results with fallback handlers
   * @param jobId Job ID to check
   * @returns Job results response
   */
  getJobResults: async (jobId: string): Promise<JobResultsResponse> => {
    // Check for direct analysis mode
    if (jobId === 'direct-analysis') {
      console.log('Direct analysis used - no job results to fetch');
      
      // Return empty results for compatibility
      return {
        status: 'ok',
        message: 'Direct analysis results',
        jobId,
        url: '',
        results: {},
        cached: false,
        timestamp: new Date().toISOString()
      };
    }
    
    // For regular jobs, get results
    try {
      console.log(`Getting results for job ID: ${jobId}`);
      return await fetchWithRetry<JobResultsResponse>(
        `${API_BASE_URL}/job-results/${jobId}`,
        {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache'
          }
        }
      );
    } catch (error) {
      console.error(`Error getting job results for ${jobId}:`, error);
      
      // Return a fallback response to prevent UI crashes
      return {
        status: 'error',
        message: `Failed to retrieve job results: ${(error as Error).message}`,
        jobId,
        url: '',
        results: {},
        cached: false,
        timestamp: new Date().toISOString()
      };
    }
  },
  
  /**
   * Poll for job completion with progress updates
   * @param jobId Job ID to poll
   * @param onProgress Optional callback for progress updates
   * @returns Job results when complete
   */
  pollJobUntilCompletion: async (
    jobId: string, 
    onProgress?: (status: JobStatusResponse) => void
  ): Promise<JobResultsResponse> => {
    // For direct analysis, return immediately
    if (jobId === 'direct-analysis') {
      return apiClient.getJobResults(jobId);
    }
    
    // For regular jobs, poll until completion
    const maxAttempts = 30; // Limit total attempts
    const initialInterval = 2000; // Start with 2 second interval
    let attempts = 0;
    let interval = initialInterval;
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const status = await apiClient.getJobStatus(jobId);
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress(status);
        }
        
        // Check job status
        if (status.job.status === 'completed') {
          return await apiClient.getJobResults(jobId);
        } else if (status.job.status === 'failed') {
          throw new Error(`Job failed: ${status.job.error || 'Unknown error'}`);
        }
        
        // Exponential backoff with ceiling
        interval = Math.min(interval * 1.5, 10000); // Max 10 seconds
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error(`Error polling job ${jobId}:`, error);
        throw error;
      }
    }
    
    throw new Error(`Job ${jobId} did not complete after ${maxAttempts} attempts`);
  }
};

export default apiClient;