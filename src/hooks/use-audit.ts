import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';
import { PageAnalysisResult, SiteAnalysisResult } from '../api/types';

interface AuditState {
  isLoading: boolean;
  error: string | null;
  jobId: string | null;
  status: 'idle' | 'scanning' | 'completed' | 'failed';
  progress: number;
  results: {
    pageAnalysis?: PageAnalysisResult;
    siteAnalysis?: SiteAnalysisResult;
  } | null;
}

const useAudit = () => {
  const [state, setState] = useState<AuditState>({
    isLoading: false,
    error: null,
    jobId: null,
    status: 'idle',
    progress: 0,
    results: null,
  });

  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Clear polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string) => {
    try {
      const response = await apiClient.getJobStatus(jobId);
      
      if (response.job) {
        const job = response.job;
        
        // Update progress
        setState(prev => ({
          ...prev,
          progress: job.progress || prev.progress,
        }));
        
        // Check if job is completed
        if (job.status === 'completed') {
          try {
            // Fetch results
            const resultsResponse = await apiClient.getJobResults(jobId);
            
            // Process results based on job type
            let formattedResults;
            if (job.type === 'site_audit') {
              formattedResults = {
                siteAnalysis: resultsResponse.results.report,
              };
            } else {
              formattedResults = {
                pageAnalysis: resultsResponse.results.analysis,
              };
            }
            
            setState(prev => ({
              ...prev,
              status: 'completed',
              progress: 100,
              results: formattedResults,
              isLoading: false,
            }));
          } catch (resultsError) {
            console.error('Error fetching results:', resultsError);
            setState(prev => ({
              ...prev,
              status: 'failed',
              error: 'Failed to load results. Please try again.',
              isLoading: false,
            }));
          }
          
          // Stop polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        } else if (job.status === 'failed') {
          setState(prev => ({
            ...prev,
            status: 'failed',
            error: job.error?.message || 'Audit failed',
            isLoading: false,
          }));
          
          // Stop polling
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
        }
      }
    } catch (error: any) {
      console.error('Error polling job status:', error);
      
      // For persistent errors, we should stop polling and show an error
      if (pollingInterval && error.message?.includes('not found')) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
        
        setState(prev => ({
          ...prev,
          status: 'failed',
          error: 'Job not found or was deleted',
          isLoading: false,
        }));
      }
      // Other errors - continue polling
    }
  }, [pollingInterval]);

  // Start a new audit
  const startAudit = useCallback(async (url: string, auditType: 'site' | 'page' = 'site') => {
    // Reset state
    setState({
      isLoading: true,
      error: null,
      jobId: null,
      status: 'scanning',
      progress: 0,
      results: null,
    });
    
    // Clear existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    try {
      // Submit audit job
      const response = auditType === 'site'
        ? await apiClient.submitSiteAudit(url)
        : await apiClient.submitPageAudit(url);
      
      const jobId = response.jobId;
      
      setState(prev => ({
        ...prev,
        jobId,
      }));
      
      // Start polling for status
      const interval = setInterval(() => pollJobStatus(jobId), 2000);
      setPollingInterval(interval);
      
      return jobId;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        status: 'failed',
        error: error.message || 'Failed to start audit',
      }));
      
      return null;
    }
  }, [pollJobStatus, pollingInterval]);

  // Reset the audit state
  const resetAudit = useCallback(() => {
    // Clear polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    // Reset state
    setState({
      isLoading: false,
      error: null,
      jobId: null,
      status: 'idle',
      progress: 0,
      results: null,
    });
  }, [pollingInterval]);

  return {
    ...state,
    startAudit,
    resetAudit,
  };
};

export default useAudit;