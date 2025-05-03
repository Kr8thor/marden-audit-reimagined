<CODE_BLOCK>
import axios from 'axios';
import { PageAuditRequest, SiteAuditRequest } from '../api/types';
import apiClientModified from '../api/client_modified';
const apiClient = apiClientModified;
export const getHealth = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('Error fetching health:', error);
    throw error;
  }
};

export const submitPageAudit = async (url: string) => {
  try {
    const response = await apiClient.post('/audit/page', { url });
    return response.data;
  } catch (error) {
    console.error('Error posting page audit:', error);
    throw error;
  };
};

export const submitSiteAudit = async (url: string, depth: number) => {
    try {
        const response = await apiClient.post('/audit/site', { url, depth });
        return response.data;
    } catch (error) {
        console.error('Error posting site audit:', error);
        throw error;
    };
};
</CODE_BLOCK>