// Enhanced SEO Audit API service
import axios from 'axios';

// Set up base API URL
const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';
const FALLBACK_API_URL = import.meta.env.VITE_API_FALLBACK_URL || 'https://marden-seo-audit-api.vercel.app';

// Create axios instance with configuration
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // Longer timeout for enhanced analysis
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback API client
const fallbackApiClient = axios.create({
  baseURL: FALLBACK_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get API health status
 * @returns {Promise<Object>} Health status
 */
export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * Perform basic SEO analysis
 * @param {string} url - The URL to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Analysis results
 */
export const analyzeSeo = async (url, options = {}) => {
  try {
    const response = await apiClient.post('/seo-analyze', { url, options });
    return response.data;
  } catch (error) {
    // Try fallback API if main one fails
    if (error.isAxiosError) {
      try {
        console.warn('Primary API failed, trying fallback...');
        const fallbackResponse = await fallbackApiClient.post('/seo-analyze', { url, options });
        return fallbackResponse.data;
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    throw error;
  }
};

/**
 * Analyze schema markup
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Schema analysis results
 */
export const analyzeSchema = async (url) => {
  try {
    const response = await apiClient.get(`/schema-analyze?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error('Schema analysis failed:', error);
    throw error;
  }
};

/**
 * Analyze mobile-friendliness
 * @param {string} url - The URL to analyze
 * @returns {Promise<Object>} Mobile-friendliness analysis results
 */
export const analyzeMobile = async (url) => {
  try {
    const response = await apiClient.get(`/mobile-analyze?url=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error('Mobile analysis failed:', error);
    throw error;
  }
};

/**
 * Perform enhanced SEO analysis
 * @param {string} url - The URL to analyze
 * @param {Object} options - Analysis options
 * @returns {Promise<Object>} Enhanced analysis results
 */
export const analyzeEnhanced = async (url, options = {}) => {
  try {
    const response = await apiClient.post('/enhanced-seo-analyze', { 
      url, 
      options
    });
    return response.data;
  } catch (error) {
    console.error('Enhanced analysis failed:', error);
    throw error;
  }
};

export default {
  checkApiHealth,
  analyzeSeo,
  analyzeSchema,
  analyzeMobile,
  analyzeEnhanced
};