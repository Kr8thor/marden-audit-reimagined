import axios from 'axios';
import { crawlSite } from './directCrawlingService';

const API_URL = import.meta.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const analyzeEnhanced = async (url, options = {}) => {
  if (!url) throw new Error('URL is required');
  
  console.log(`Enhanced analysis for ${url} with options:`, options);
  
  // If crawling is requested, use direct crawling service
  if (options.crawlSite) {
    return crawlSite(url, options);
  }
  
  // Otherwise use standard API
  try {
    const response = await api.post('/enhanced-seo-analyze', { url, options });
    return response.data;
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    throw error;
  }
};
export const analyzeSchema = async (url) => {
  try {
    const response = await api.post('/schema-analyze', { url });
    return response.data;
  } catch (error) {
    console.error('Schema analysis error:', error);
    throw error;
  }
};

export const analyzeMobileFriendliness = async (url) => {
  try {
    const response = await api.post('/mobile-analyze', { url });
    return response.data;
  } catch (error) {
    console.error('Mobile analysis error:', error);
    throw error;
  }
};