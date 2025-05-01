import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '../api/client';
import { CircularProgress } from '../components/CircularProgress';
import AuditResults from '../components/audit/AuditResults';
import AuditError from '../components/audit/AuditError';

const AuditPage: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  
  // Submit the URL for analysis
  const submitAuditQuery = useQuery({
    queryKey: ['submitAudit', url],
    queryFn: async () => {
      if (!url) throw new Error('URL is required');
      try {
        return await apiClient.submitPageAudit(url);
      } catch (err: any) {
        console.error('Error submitting audit:', err);
        throw err;
      }
    },
    enabled: !!url && !jobId && !results,
    retry: 1
  });
  
  // If we have a job ID, poll for status
  const jobStatusQuery = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      return await apiClient.getJobStatus(jobId);
    },
    enabled: !!jobId && !results,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: 3
  });
  
  // If job is complete, get results
  const jobResultsQuery = useQuery({
    queryKey: ['jobResults', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      return await apiClient.getJobResults(jobId);
    },
    enabled: !!jobId && jobStatusQuery.data?.job?.status === 'completed',
    retry: 2
  });
  
  // Handle different states and responses
  useEffect(() => {
    // Handle submit response
    if (submitAuditQuery.data && !jobId && !results) {
      if (submitAuditQuery.data.cached) {
        // Cached result
        setResults(submitAuditQuery.data.results || submitAuditQuery.data.data);
        setIsLoading(false);
        toast('Retrieved cached results', {
          description: 'Showing results from cache',
          position: 'bottom-right',
        });
      } else if (submitAuditQuery.data.jobId) {
        // Job created, track status
        setJobId(submitAuditQuery.data.jobId);
        toast('Audit started', {
          description: 'Your page is being analyzed',
          position: 'bottom-right',
        });
      }
    }
    
    // Handle job status
    if (jobStatusQuery.data && jobStatusQuery.data.job) {
      const status = jobStatusQuery.data.job.status;
      
      if (status === 'failed') {
        setError('Audit failed: ' + (jobStatusQuery.data.job.error || 'Unknown error'));
        setIsLoading(false);
      } else if (status === 'completed' && !results) {
        // Job completed, get results if not already getting them
        if (!jobResultsQuery.isLoading && !jobResultsQuery.data) {
          jobResultsQuery.refetch();
        }
      }
    }
    
    // Handle job results
    if (jobResultsQuery.data && !results) {
      setResults(jobResultsQuery.data.results);
      setIsLoading(false);
      toast('Audit completed', {
        description: 'Results are ready to view',
        position: 'bottom-right',
      });
    }
    
    // Handle errors
    if (submitAuditQuery.error) {
      setError(`Failed to submit audit: ${(submitAuditQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    } else if (jobStatusQuery.error) {
      setError(`Failed to check job status: ${(jobStatusQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    } else if (jobResultsQuery.error) {
      setError(`Failed to get results: ${(jobResultsQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [
    submitAuditQuery.data, submitAuditQuery.error,
    jobStatusQuery.data, jobStatusQuery.error,
    jobResultsQuery.data, jobResultsQuery.error,
    jobId, results
  ]);
  
  const handleTryAgain = () => {
    setIsLoading(true);
    setError(null);
    setJobId(null);
    setResults(null);
    submitAuditQuery.refetch();
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Show loading state
  if (isLoading) {
    // Calculate progress based on job status
    let progress = 0;
    let statusText = 'Submitting URL...';
    
    if (jobStatusQuery.data?.job) {
      const jobStatus = jobStatusQuery.data.job;
      progress = jobStatus.progress || 0;
      
      if (jobStatus.status === 'queued') {
        statusText = 'Queued for processing...';
      } else if (jobStatus.status === 'processing') {
        statusText = jobStatus.message || 'Processing audit...';
      } else if (jobStatus.status === 'completed') {
        statusText = 'Retrieving results...';
        progress = 95;
      }
    } else if (submitAuditQuery.isLoading) {
      statusText = 'Submitting URL...';
      progress = 10;
    }
    
    return (
      <div className="container max-w-3xl mx-auto pt-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
          <div className="flex flex-col items-center justify-center py-6">
            <CircularProgress value={progress} size={120} strokeWidth={6} />
            <h3 className="text-xl font-semibold mt-6 mb-2">Analyzing {url}</h3>
            <p className="text-sm text-muted-foreground mb-4">{statusText}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <AuditError 
        error={error} 
        url={url || ''} 
        onTryAgain={handleTryAgain}
        onBackToHome={handleBackToHome}
      />
    );
  }
  
  // Show results
  return (
    <div className="container max-w-5xl mx-auto pt-12 px-4 pb-20">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
        <AuditResults 
          url={url || ''} 
          pageAnalysis={results?.pageAnalysis}
          siteAnalysis={results?.siteAnalysis}
          score={results?.score}
          issuesFound={results?.issuesFound}
          opportunities={results?.opportunities}
          cached={results?.cached}
          cachedAt={results?.cachedAt}
        />
        <div className="mt-8 border-t border-white/10 pt-4 flex justify-between">
          <button 
            className="text-sm text-primary hover:underline"
            onClick={handleTryAgain}
          >
            Run Analysis Again
          </button>
          <button 
            className="text-sm text-white/70 hover:text-white"
            onClick={handleBackToHome}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditPage;