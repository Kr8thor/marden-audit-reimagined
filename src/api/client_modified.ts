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
const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-se9t-1vdbh17ym-leo-corbetts-projects.vercel.app/api';

// --- Add these flags and functions ---
let shouldSubmitPageAuditFail = false;
let shouldSubmitSiteAuditFail = false;
let shouldGetJobStatusFail = false;
let shouldGetJobResultsFail = false;
let shouldReturnInvalidJson = false;

const apiClientModified = {
  /**
   * Submit a URL for site audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitSiteAudit: async (url: string, options:any = {}): Promise<any> => {
    if (shouldSubmitSiteAuditFail) {
        throw new Error("Simulated submitSiteAudit failure");
      }
    const urlToFetch = `${API_URL}/audit/site`;
    const requestData = { url, options };
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    };
    console.log("submitSiteAudit - URL:", urlToFetch);
    console.log("submitSiteAudit - Data:", requestData);
    console.log("submitSiteAudit - Headers:", fetchOptions.headers);
    const response = await fetch(urlToFetch, fetchOptions);
    console.log("submitSiteAudit - Response:", response);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }    return response;
  },
  
  /**
   * Submit a URL for page audit
   * @param url URL to audit
   * @param options Additional audit options
   * @returns Promise with job details
   */
  submitPageAudit: async (url: string, options:any = {}): Promise<any> => {
    if (shouldSubmitPageAuditFail) {
        throw new Error("Simulated submitPageAudit failure");
      }
    const urlToFetch = `${API_URL}/audit/page`;
    const requestData = { url, options };
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    };
    console.log("submitPageAudit - URL:", urlToFetch);
    console.log("submitPageAudit - Data:", requestData);
    console.log("submitPageAudit - Headers:", fetchOptions.headers);
    const response = await fetch(urlToFetch, fetchOptions);
    console.log("submitPageAudit - Response:", response);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }    return response;
  },
  
  /**
   * Get status of a job
   * @param jobId Job ID
   * @returns Promise with job status
   */
  getJobStatus: async (jobId: string): Promise<any> => {
    if (shouldGetJobStatusFail) {
        throw new Error("Simulated getJobStatus failure");
      }
    if (shouldReturnInvalidJson) {
      return { text: () => "not a json" } as Response;
    }
    const urlToFetch = `${API_URL}/job/${jobId}`;
    console.log("getJobStatus - URL:", urlToFetch);
    const response = await fetch(urlToFetch);
    console.log("getJobStatus - Response:", response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    } return response;
  },
  
  /**
   * Get results of a completed job
   * @param jobId Job ID
   * @returns Promise with job results
   */  
  getJobResults: async (jobId: string): Promise<any> => {
    if (shouldGetJobResultsFail) {
        throw new Error("Simulated getJobResults failure");
      }
    if (shouldReturnInvalidJson) {
      return { text: () => "not a json" } as Response;
    }
    const urlToFetch = `${API_URL}/job/${jobId}/results`;
    console.log("getJobResults - URL:", urlToFetch);
    const response = await fetch(urlToFetch);
    console.log("getJobResults - Response:", response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    }
    return response;
  },
  
   /**
    * Check Backend Status
    * @returns Promise with health status
    */
   checkBackendStatus: async (): Promise<any> => {
    const urlToFetch = `${API_URL}/health`;
    console.log("checkBackendStatus - URL:", urlToFetch);
    const response = await fetch(urlToFetch);
    console.log("checkBackendStatus - Response:", response);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    } return response;
  },
  // --- Add these functions ---
  setShouldSubmitPageAuditFail: (value: boolean) => {
    shouldSubmitPageAuditFail = value;
  },
  setShouldSubmitSiteAuditFail: (value: boolean) => {
    shouldSubmitSiteAuditFail = value;
  },
  setShouldGetJobStatusFail: (value: boolean) => {
    shouldGetJobStatusFail = value;
  },
  setShouldGetJobResultsFail: (value: boolean) => {
    shouldGetJobResultsFail = value;
  },
  setShouldReturnInvalidJson: (value: boolean) => {
    shouldReturnInvalidJson = value;
  },
};

export default apiClientModified;