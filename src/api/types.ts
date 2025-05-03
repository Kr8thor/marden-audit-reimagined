/**
 * Response when creating a new audit job
 */
export interface JobCreationResponse {
  status: 'ok' | 'error';
  message: string;
  jobId: string;
  url: string;
  cached?: boolean;
  cachedAt?: string;
  timestamp?: string;
  data?: any;
}

/**
 * Response when getting job status
 */
export interface JobStatusResponse {
  status: 'ok' | 'error';
  message: string;
  jobId: string;
  job: {
    id: string;
    type: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress: number;
    createdAt: number;
    updatedAt: number;
    url: string;
    options?: Record<string, any>;
    message?: string;
    error?: string;
  };
  timestamp?: string;
}

/**
 * Response when getting job results
 */
export interface JobResultsResponse {
  status: 'ok' | 'error';
  message: string;
  jobId: string;
  url: string;
  results: any;
  cached: boolean;
  cachedAt?: string;
  timestamp?: string;
}

/**
 * Response from health check endpoint
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  version: string;
  message: string;
  components: {
    redis: {
      status: 'ok' | 'error';
      error: string | null;
    };
    api: {
      status: 'ok' | 'error';
    };
  };
  timestamp?: string;
}

/**
 * Response from SEO analysis endpoint
 */
export interface SeoAnalysisResponse {
  status: 'ok' | 'error';
  message: string;
  url: string;
  cached?: boolean;
  cachedAt?: string;
  timestamp?: string;
  data: SeoAnalysisResult;
}

/**
 * Response from batch SEO analysis endpoint
 */
export interface BatchSeoAnalysisResponse {
  status: 'ok' | 'error' | 'success';
  message: string;
  totalUrls: number;
  cached?: boolean;
  cachedAt?: string;
  timestamp?: string;
  results: SeoAnalysisResult[];
}

/**
 * Updated SEO analysis results data structure
 */
export interface SeoAnalysisResult {
  url: string;
  score: number;
  status?: 'good' | 'needs_improvement' | 'poor';
  criticalIssuesCount?: number;
  totalIssuesCount?: number;
  
  // For V2 API
  categories?: {
    metadata: {
      score: number;
      issues: Array<{
        type: string;
        severity: string;
        impact: string;
        current?: string | number;
        recommendation: string;
      }>;
    };
    content: {
      score: number;
      issues: Array<{
        type: string;
        severity: string;
        impact: string;
        current?: string | number;
        count?: number;
        recommendation: string;
      }>;
    };
    technical: {
      score: number;
      issues: Array<{
        type: string;
        severity: string;
        impact: string;
        current?: string | number;
        recommendation: string;
      }>;
    };
    userExperience: {
      score: number;
      issues: Array<{
        type: string;
        severity: string;
        impact: string;
        current?: string | number;
        recommendation: string;
      }>;
    };
  };
  
  // For V1 API compatibility
  issuesFound?: number;
  opportunities?: number;
  pageAnalysis?: {
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
      h1Texts: string[];
      h2Count: number;
      h2Texts: string[];
      h3Count?: number;
    };
    links?: {
      internalCount: number;
      externalCount: number;
      totalCount: number;
    };
    images?: {
      withoutAltCount: number;
      total?: number;
    };
    contentLength?: number;
    canonical?: string;
    hreflang?: Array<{
      hreflang: string;
      href: string;
    }>;
  };
  
  // For V2 API
  pageData?: {
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
      h1Texts: string[];
      h2Count: number;
      h2Texts: string[];
      h3Count: number;
    };
    content?: {
      wordCount: number;
      contentLength: number;
    };
    links: {
      internalCount: number;
      externalCount: number;
      totalCount: number;
    };
    images: {
      total: number;
      withoutAlt: number;
    };
    technical: {
      hasCanonical: boolean;
      canonicalUrl: string;
      hasMobileViewport: boolean;
      hasStructuredData: boolean;
      structuredDataTypes: string[];
    };
  };
  
  // Site analysis data
  siteAnalysis?: {
    averageScore: number;
    commonIssues: Array<{
      type: string;
      frequency: number;
      severity: string;
    }>;
    pages: Array<{
      url: string;
      score: number;
      title: string;
      issuesFound?: number;
      criticalIssuesCount?: number;
    }>;
  };
  
  // Recommendations for V2 API
  recommendations?: Array<{
    priority: string;
    type: string;
    description: string;
  }>;
  
  // Metadata
  cached?: boolean;
  cachedAt?: string;
  analyzedAt?: string;
}