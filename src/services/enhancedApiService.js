/**
 * Enhanced API Service with proper error handling
 */

import axios from 'axios';
import { processAnalysisResult, AnalysisError, ErrorTypes, getErrorDisplayInfo } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for complex analysis
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Response Error: ${error.response?.status} ${error.config?.url}`, error.message);
    return Promise.reject(error);
  }
);

export const checkHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new AnalysisError(
      'API service is not available',
      ErrorTypes.SERVER_ERROR,
      error
    );
  }
};

export const analyzeSeo = async (url, options = {}, onProgress = null) => {
  if (!url || typeof url !== 'string') {
    throw new AnalysisError(
      'Please provide a valid URL for analysis',
      ErrorTypes.INVALID_URL
    );
  }

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  // Validate URL format
  try {
    new URL(normalizedUrl);
  } catch (urlError) {
    throw new AnalysisError(
      `Invalid URL format: "${url}". Please provide a valid website URL.`,
      ErrorTypes.INVALID_URL
    );
  }

  if (onProgress) onProgress(10, 'Connecting to analysis service...');

  try {
    // Check API health first
    await checkHealth();
    
    if (onProgress) onProgress(20, 'Starting website analysis...');

    // Make the analysis request
    const response = await apiClient.post('/seo-analyze', {
      url: normalizedUrl,
      options: {
        ...options,
        enhanced: true
      }
    });

    if (onProgress) onProgress(70, 'Processing analysis results...');

    // Process and validate the result
    const processedResult = processAnalysisResult(response.data, normalizedUrl);

    if (onProgress) onProgress(100, 'Analysis complete!');

    console.log('✅ Analysis completed successfully:', processedResult);
    return processedResult;

  } catch (error) {
    console.error('❌ Analysis failed:', error);

    // Handle different types of errors
    if (error instanceof AnalysisError) {
      throw error;
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new AnalysisError(
        `The analysis timed out for "${normalizedUrl}". The website may be slow to respond.`,
        ErrorTypes.TIMEOUT_ERROR,
        error
      );
    }

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 400) {
        throw new AnalysisError(
          `Invalid request: ${message}`,
          ErrorTypes.INVALID_URL,
          error
        );
      }

      if (status >= 500) {
        throw new AnalysisError(
          'Analysis service is temporarily unavailable. Please try again.',
          ErrorTypes.SERVER_ERROR,
          error
        );
      }

      throw new AnalysisError(
        `Analysis failed: ${message}`,
        ErrorTypes.ANALYSIS_ERROR,
        error
      );
    }

    if (error.request) {
      // Network error
      throw new AnalysisError(
        'Unable to connect to the analysis service. Please check your internet connection.',
        ErrorTypes.NETWORK_ERROR,
        error
      );
    }

    // Unknown error
    throw new AnalysisError(
      `Unexpected error during analysis: ${error.message}`,
      ErrorTypes.ANALYSIS_ERROR,
      error
    );
  }
};

export default {
  checkHealth,
  analyzeSeo,
  getErrorDisplayInfo
};