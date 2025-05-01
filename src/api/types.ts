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
 * SEO analysis results data structure
 */
export interface SeoAnalysisResult {
  url: string;
  score: number;
  issuesFound: number;
  opportunities: number;
  pageAnalysis: {
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
    };
    contentLength?: number;
    canonical?: string;
    hreflang?: Array<{
      hreflang: string;
      href: string;
    }>;
  };
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
      issuesFound: number;
    }>;
  };
  cached?: boolean;
  cachedAt?: string;
}