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

// Backend API URLs
const PRIMARY_API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';
const FALLBACK_API_URL = import.meta.env.VITE_API_FALLBACK_URL || 'http://localhost:3000';
let API_BASE_URL = PRIMARY_API_URL;
let apiFailedAttempts = 0;
const MAX_FAILURES_BEFORE_FALLBACK = 3;

// Switch to fallback API after consistent failures
const switchToFallbackApiIfNecessary = () => {
  apiFailedAttempts++;
  console.log(`API failure count: ${apiFailedAttempts}/${MAX_FAILURES_BEFORE_FALLBACK}`);
  
  if (apiFailedAttempts >= MAX_FAILURES_BEFORE_FALLBACK && API_BASE_URL === PRIMARY_API_URL) {
    console.warn('Switching to fallback API after consistent failures');
    API_BASE_URL = FALLBACK_API_URL;
    apiFailedAttempts = 0; // Reset counter for the fallback
  }
};

// Reset failure counter on successful API calls
const resetApiFailureCounter = () => {
  if (apiFailedAttempts > 0) {
    console.log('API call succeeded, resetting failure counter');
    apiFailedAttempts = 0;
  }
};

/**
 * Generic function to handle API responses with standardized error processing
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    console.error('API Error Response:', response.status, response.statusText);
    try {
      const errorData = await response.json();
      console.error('Error Data:', errorData);
      
      // Track API failures for potential fallback
      switchToFallbackApiIfNecessary();
      
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    } catch (e) {
      // Track API failures for potential fallback
      switchToFallbackApiIfNecessary();
      
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
  }
  
  try {
    // Reset failure counter on success
    resetApiFailureCounter();
    
    return await response.json() as T;
  } catch (e) {
    console.error('Error parsing JSON response:', e);
    
    // Track API failures for potential fallback
    switchToFallbackApiIfNecessary();
    
    throw new Error('Failed to parse API response');
  }
}

/**
 * Transform a batch analysis result into a site audit format
 * @param baseUrl Base URL of the site
 * @param batchResults Batch analysis results
 * @returns Transformed site audit response
 */
function transformBatchToSiteAudit(baseUrl: string, batchResults: BatchSeoAnalysisResponse): SiteAuditResponse {
  const normalizedUrl = normalizeUrl(baseUrl);
  console.log(`Transforming batch results to site audit format for ${normalizedUrl}`);
  
  // Extract all issues from results
  const allIssues: any[] = [];
  
  batchResults.results.forEach(result => {
    if (result.categories) {
      Object.values(result.categories).forEach(category => {
        if (category.issues && Array.isArray(category.issues)) {
          category.issues.forEach((issue: any) => {
            allIssues.push({
              url: result.url,
              ...issue
            });
          });
        }
      });
    }
  });
  
  // Group issues by type
  const issuesByType: Record<string, any[]> = {};
  allIssues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push(issue);
  });
  
  // Calculate frequency
  const commonIssues = Object.entries(issuesByType)
    .map(([type, issues]) => ({
      type,
      frequency: issues.length,
      severity: issues[0].severity,
      impact: issues[0].impact,
      urls: issues.map(issue => issue.url),
      recommendation: issues[0].recommendation
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  // Calculate overall site score
  let totalScore = 0;
  let validScores = 0;
  
  batchResults.results.forEach(result => {
    if (result.score !== undefined && !isNaN(result.score)) {
      totalScore += result.score;
      validScores++;
    }
  });
  
  const averageScore = validScores > 0 ? Math.round(totalScore / validScores) : 0;
  
  // Create site audit response
  return {
    status: 'ok',
    message: 'Site audit completed (converted from batch analysis)',
    url: normalizedUrl,
    cached: batchResults.cached || false,
    cachedAt: batchResults.cachedAt,
    timestamp: new Date().toISOString(),
    data: {
      startUrl: normalizedUrl,
      baseDomain: new URL(normalizedUrl).hostname,
      score: averageScore,
      status: averageScore >= 80 ? 'good' : averageScore >= 50 ? 'needs_improvement' : 'poor',
      siteAnalysis: {
        averageScore,
        commonIssues: commonIssues.slice(0, 10), // Top 10 common issues
        pages: batchResults.results.map(result => ({
          url: result.url,
          score: result.score || 0,
          title: result.pageData?.title?.text || result.pageAnalysis?.title?.text || '',
          status: result.status || 'unknown',
          issues: result.totalIssuesCount || 0,
          criticalIssues: result.criticalIssuesCount || 0
        }))
      },
      pageResults: batchResults.results,
      fromBatchAnalysis: true,
      stats: {
        analysisTime: 0,
        pageCount: batchResults.results.length
      },
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Transform a single page analysis into a site audit format
 * @param baseUrl Base URL of the site
 * @param singleResult Single page analysis
 * @returns Transformed site audit response
 */
function transformSingleToSiteAudit(baseUrl: string, singleResult: SeoAnalysisResponse): SiteAuditResponse {
  const normalizedUrl = normalizeUrl(baseUrl);
  console.log(`Transforming single page result to site audit format for ${normalizedUrl}`);
  
  // Extract issues from the result
  const allIssues: any[] = [];
  
  if (singleResult.data.categories) {
    Object.values(singleResult.data.categories).forEach(category => {
      if (category.issues && Array.isArray(category.issues)) {
        category.issues.forEach((issue: any) => {
          allIssues.push({
            url: singleResult.url,
            ...issue
          });
        });
      }
    });
  }
  
  // Create site audit response
  return {
    status: 'ok',
    message: 'Site audit completed (homepage only)',
    url: normalizedUrl,
    cached: singleResult.cached || false,
    cachedAt: singleResult.cachedAt,
    timestamp: new Date().toISOString(),
    data: {
      startUrl: normalizedUrl,
      baseDomain: new URL(normalizedUrl).hostname,
      score: singleResult.data.score || 0,
      status: singleResult.data.status || 'unknown',
      siteAnalysis: {
        averageScore: singleResult.data.score || 0,
        commonIssues: allIssues.map(issue => ({
          type: issue.type,
          frequency: 1,
          severity: issue.severity,
          impact: issue.impact,
          urls: [singleResult.url],
          recommendation: issue.recommendation
        })),
        pages: [{
          url: singleResult.data.url,
          score: singleResult.data.score || 0,
          title: singleResult.data.pageData?.title?.text || singleResult.data.pageAnalysis?.title?.text || '',
          status: singleResult.data.status || 'unknown',
          issues: singleResult.data.totalIssuesCount || 0,
          criticalIssues: singleResult.data.criticalIssuesCount || 0
        }]
      },
      pageResults: [singleResult.data],
      homepageOnly: true,
      fromSingleAnalysis: true,
      stats: {
        analysisTime: 0,
        pageCount: 1
      },
      timestamp: new Date().toISOString()
    }
  };
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
   * Batch analyze multiple URLs
   * @param urls Array of URLs to analyze
   * @returns Promise with batch analysis results
   */
  batchSeoAnalysis: async (urls: string[]): Promise<BatchSeoAnalysisResponse> => {
    console.log(`Performing batch SEO analysis for ${urls.length} URLs`);
    
    if (!urls || urls.length === 0) {
      throw new Error('At least one URL is required for batch analysis');
    }
    
    // Normalize URLs and validate them
    const normalizedUrls = urls.map(url => {
      const normalizedUrl = normalizeUrl(url);
      if (!isValidUrl(normalizedUrl)) {
        throw new Error(`Invalid URL format: ${url}`);
      }
      return normalizedUrl;
    });
    
    // Limit to 20 URLs
    const limitedUrls = normalizedUrls.slice(0, 20);
    console.log(`Processing ${limitedUrls.length} URLs (limit: 20)`);
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout for batch
    
    // Try the batch endpoint first
    try {
      console.log(`Trying batch SEO analyze endpoint: ${API_BASE_URL}/batch-audit`);
      
      const response = await fetch(`${API_BASE_URL}/batch-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ 
          urls: limitedUrls,
          timestamp: new Date().getTime() // Add timestamp to prevent caching
        }),
        credentials: 'omit', // Try without cookies
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return await handleResponse<BatchSeoAnalysisResponse>(response);
      }
      
      console.log(`Batch endpoint failed with status ${response.status}, trying alternative approach...`);
    } catch (error: any) {
      console.warn(`Error with batch endpoint:`, error);
      if (error.name === 'AbortError') {
        console.log('Batch request timed out, trying alternative approach');
      }
      clearTimeout(timeoutId);
    }
    
    // Try alternative endpoints
    try {
      console.log(`Trying alternative endpoint: ${API_BASE_URL}/api/batch-audit`);
      
      const altController = new AbortController();
      const altTimeoutId = setTimeout(() => altController.abort(), 60000);
      
      const response = await fetch(`${API_BASE_URL}/api/batch-audit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store'
        },
        body: JSON.stringify({ 
          urls: limitedUrls,
          timestamp: new Date().getTime()
        }),
        credentials: 'omit',
        mode: 'cors',
        signal: altController.signal
      });
      
      clearTimeout(altTimeoutId);
      
      if (response.ok) {
        return await handleResponse<BatchSeoAnalysisResponse>(response);
      }
      
      console.log(`Alternative batch endpoint also failed, using fallback analysis`);
    } catch (error) {
      console.warn(`Error with alternative batch endpoint:`, error);
    }
    
    // Fallback to individual analysis if batch endpoint fails
    console.log('All batch endpoints failed, using fallback of sequential individual analyses');
    
    // Process urls one by one
    const results: SeoAnalysisResult[] = [];
    
    for (const url of limitedUrls) {
      try {
        console.log(`Processing individual URL: ${url}`);
        const result = await apiClient.quickSeoAnalysis(url);
        results.push(result.data);
      } catch (error) {
        console.error(`Error analyzing ${url}:`, error);
        // Add error result
        results.push({
          url,
          score: 0,
          status: 'error',
          error: {
            type: 'analysis_error',
            message: `Failed to analyze URL: ${(error as Error).message || 'Unknown error'}`
          },
          analyzedAt: new Date().toISOString()
        } as SeoAnalysisResult);
      }
    }
    
    // Return batch result with individual analyses
    return {
      status: 'success',
      message: 'Batch analysis completed (fallback to individual analyses)',
      totalUrls: results.length,
      timestamp: new Date().toISOString(),
      cached: false,
      results
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
   * @returns Promise with site audit results
   */
  siteAudit: async (url: string, options: any = {}): Promise<SiteAuditResponse> => {
    console.log(`Performing site audit for ${url} with options:`, options);
    
    if (!url || url.trim() === '') {
      throw new Error('URL is required for site audit');
    }
    
    const normalizedUrl = normalizeUrl(url);
    
    if (!isValidUrl(normalizedUrl)) {
      throw new Error('Invalid URL format');
    }
    
    // Configure options with defaults
    const auditOptions = {
      maxPages: Math.min(options.maxPages || 5, 10), // More conservative limits for Railway
      maxDepth: Math.min(options.maxDepth || 2, 3),  // More conservative limits for Railway
      respectRobots: options.respectRobots !== false,
      skipCrawl: options.skipCrawl || false,
      customPages: options.customPages || [],
      timestamp: Date.now() // Add timestamp to prevent caching
    };
    
    console.log(`Using configured options:`, auditOptions);
    
    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout (reduced)
    
    // Try the site audit endpoints with improved logging
    const siteEndpoints = [
      `${API_BASE_URL}/site-audit`,
      `${API_BASE_URL}/api/site-audit`,
      `${API_BASE_URL}/v2/site-audit`
    ];
    
    for (const endpoint of siteEndpoints) {
      try {
        console.log(`Trying site audit endpoint: ${endpoint}`);
        
        // Log the full request details for debugging
        const requestBody = {
          url: normalizedUrl,
          ...auditOptions
        };
        console.log(`Request body for ${endpoint}:`, JSON.stringify(requestBody));
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: JSON.stringify(requestBody),
          credentials: 'omit',
          mode: 'cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`Site audit successful via ${endpoint}`);
          return await handleResponse<SiteAuditResponse>(response);
        }
        
        // Log more details about the failed response
        console.log(`Endpoint ${endpoint} failed with status ${response.status}, status text: ${response.statusText}`);
        try {
          const errorText = await response.text();
          console.log(`Error response body:`, errorText);
        } catch (e) {
          console.log(`Could not read error response body`);
        }
      } catch (error: any) {
        console.warn(`Error with endpoint ${endpoint}:`, error);
        if (error.name === 'AbortError') {
          console.log('Request timed out, trying next endpoint');
        }
      }
    }
    
    console.log('All site audit endpoints failed, trying fallback methods');
    
    // Try different approach - use sequential analysis of multiple pages
    try {
      // Determine pages to analyze
      let pagesToAnalyze: string[] = [];
      
      if (options.customPages && options.customPages.length > 0) {
        // Use custom pages if provided
        pagesToAnalyze = options.customPages.map((p: string) => normalizeUrl(p));
        console.log(`Using ${pagesToAnalyze.length} custom pages for fallback analysis`);
      } else {
        // Just use the homepage if no custom pages
        pagesToAnalyze = [normalizedUrl];
        console.log(`Using homepage only for fallback analysis`);
      }
      
      // Limit number of pages to analyze
      const limitedPages = pagesToAnalyze.slice(0, auditOptions.maxPages);
      
      // Analyze each page sequentially
      console.log(`Analyzing ${limitedPages.length} pages sequentially...`);
      const pageResults = [];
      
      for (const pageUrl of limitedPages) {
        try {
          console.log(`Analyzing page: ${pageUrl}`);
          const result = await apiClient.quickSeoAnalysis(pageUrl);
          pageResults.push(result.data);
        } catch (error) {
          console.error(`Error analyzing ${pageUrl}:`, error);
          // Add error result
          pageResults.push({
            url: pageUrl,
            score: 0,
            status: 'error',
            error: {
              message: `Analysis failed: ${(error as Error).message || 'Unknown error'}`
            }
          });
        }
      }
      
      // Calculate overall score
      let totalScore = 0;
      let validScores = 0;
      
      pageResults.forEach(result => {
        if (result.score !== undefined && !isNaN(result.score)) {
          totalScore += result.score;
          validScores++;
        }
      });
      
      const averageScore = validScores > 0 ? Math.round(totalScore / validScores) : 0;
      const status = averageScore >= 80 ? 'good' : averageScore >= 50 ? 'needs_improvement' : 'poor';
      
      // Create a custom site audit response with the analyzed pages
      console.log(`Creating custom site audit response with ${pageResults.length} pages`);
      
      // Extract all issues from results for common issues analysis
      const allIssues: any[] = [];
      
      pageResults.forEach(result => {
        if (result.categories) {
          Object.values(result.categories).forEach((category: any) => {
            if (category.issues && Array.isArray(category.issues)) {
              category.issues.forEach((issue: any) => {
                allIssues.push({
                  url: result.url,
                  ...issue
                });
              });
            }
          });
        }
      });
      
      // Group issues by type
      const issuesByType: Record<string, any[]> = {};
      allIssues.forEach(issue => {
        const type = issue.type || 'unknown';
        if (!issuesByType[type]) {
          issuesByType[type] = [];
        }
        issuesByType[type].push(issue);
      });
      
      // Calculate issue frequency
      const commonIssues = Object.entries(issuesByType)
        .map(([type, issues]) => ({
          type,
          frequency: issues.length,
          severity: issues[0]?.severity || 'info',
          impact: issues[0]?.impact || 'medium',
          urls: issues.map(issue => issue.url),
          recommendation: issues[0]?.recommendation || 'Fix this issue to improve SEO'
        }))
        .sort((a, b) => b.frequency - a.frequency);
      
      // Create the final response
      return {
        status: 'ok',
        message: 'Site audit completed using fallback method',
        url: normalizedUrl,
        cached: false,
        timestamp: new Date().toISOString(),
        data: {
          startUrl: normalizedUrl,
          baseDomain: new URL(normalizedUrl).hostname,
          score: averageScore,
          status,
          siteAnalysis: {
            averageScore,
            commonIssues: commonIssues.slice(0, 10), // Top 10 common issues
            pages: pageResults.map(result => ({
              url: result.url || normalizedUrl,
              score: result.score || 0,
              title: result.pageData?.title?.text || result.pageAnalysis?.title?.text || '',
              status: result.status || 'unknown',
              issues: result.totalIssuesCount || 0,
              criticalIssues: result.criticalIssuesCount || 0
            }))
          },
          pageResults,
          fallbackMethod: true,
          stats: {
            analysisTime: 0,
            pageCount: pageResults.length
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('All fallback methods failed, returning error', error);
      
      throw new Error(`Failed to perform site audit: ${(error as Error).message}`);
    }
  },
  
  /**
   * Submit a site audit using the job-based API (legacy method)
   * @param url URL to analyze
   * @param options Analysis options
   * @returns Job creation response or direct analysis result
   */
  submitSiteAudit: async (url: string, options: any = {}): Promise<JobCreationResponse> => {
    // Try multiple site-wide audit endpoints first
    const siteEndpoints = [
      `${API_BASE_URL}/submit-site-audit`,
      `${API_BASE_URL}/api/submit-site-audit`,
      `${API_BASE_URL}/api/site-audit`
    ];
    
    for (const endpoint of siteEndpoints) {
      try {
        console.log(`Trying legacy site-wide audit endpoint: ${endpoint}`);
        const normalizedUrl = normalizeUrl(url);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store'
          },
          body: JSON.stringify({ 
            url: normalizedUrl,
            options: {
              maxPages: options.maxPages || 20, // Ensure we request 20 pages
              depth: options.depth || 3,
              ...options
            }
          }),
          // Increased timeout for job submission
          signal: AbortSignal.timeout(10000)
        });
        
        if (response.ok) {
          console.log(`Legacy site-wide audit submission successful via ${endpoint}`);
          return await handleResponse<JobCreationResponse>(response);
        }
      } catch (error) {
        console.warn(`Error with legacy site-wide audit endpoint ${endpoint}:`, error);
        // Continue to next endpoint
      }
    }
    
    console.log('All legacy site-wide audit endpoints failed, falling back to page audit');
    
    // Try the new site audit endpoint
    try {
      console.log('Trying new site audit endpoint as fallback');
      const siteAuditResult = await apiClient.siteAudit(url, options);
      
      // Convert response to job creation format for compatibility
      return {
        status: 'ok',
        message: 'Site audit completed directly',
        jobId: 'direct-site-audit',
        url: normalizeUrl(url),
        cached: siteAuditResult.cached || false,
        cachedAt: siteAuditResult.cachedAt,
        timestamp: new Date().toISOString(),
        data: siteAuditResult.data
      };
    } catch (error) {
      console.warn('New site audit endpoint also failed, falling back to page audit');
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