import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '../api/client';
import CircularProgress from '../components/CircularProgress';
import AuditResults from '../components/audit/AuditResults';
import AuditError from '../components/audit/AuditError';

const AuditPage: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  
  // Submit the URL for analysis or direct SEO analysis
  const submitAuditQuery = useQuery({
    queryKey: ['submitAudit', url],
    queryFn: async () => {
      if (!url) throw new Error('URL is required');
      try {
        // First try direct SEO analysis as it's faster
        console.log("Trying direct SEO analysis first");
        const analysisResult = await apiClient.quickSeoAnalysis(url);
        
        // If we have real data from direct analysis, return it immediately
        if (analysisResult && !analysisResult.error) {
          console.log("Direct SEO analysis successful:", analysisResult);
          return { 
            status: 'ok',
            jobId: 'direct-analysis',
            url: url,
            cached: analysisResult.cached || false,
            cachedAt: analysisResult.cachedAt,
            directResults: analysisResult
          };
        }
        
        // If direct analysis fails, try the job-based approach
        console.log("Direct SEO analysis failed, trying job-based audit");
        return await apiClient.submitPageAudit(url);
      } catch (err: any) {
        console.error('Error submitting audit:', err);
        throw err;
      }
    },
    enabled: !!url && !jobId && !results,
    retry: 2
  });
  
  // If we have a job ID, poll for status
  const jobStatusQuery = useQuery({
    queryKey: ['jobStatus', jobId],
    queryFn: async () => {
      if (!jobId || jobId === 'direct-analysis') throw new Error('Valid job ID is required');
      return await apiClient.getJobStatus(jobId);
    },
    enabled: !!jobId && jobId !== 'direct-analysis' && !results,
    refetchInterval: 2000, // Poll every 2 seconds
    retry: 3
  });
  
  // If job is complete, get results
  const jobResultsQuery = useQuery({
    queryKey: ['jobResults', jobId],
    queryFn: async () => {
      if (!jobId || jobId === 'direct-analysis') throw new Error('Valid job ID is required');
      return await apiClient.getJobResults(jobId);
    },
    enabled: !!jobId && 
             jobId !== 'direct-analysis' && 
             !results && 
             jobStatusQuery.data?.job?.status === 'completed',
    retry: 2
  });
  
  // Handle different states and responses
  useEffect(() => {
    // Handle direct SEO analysis or submit response
    if (submitAuditQuery.data && !results) {
      console.log("Submit query data received:", submitAuditQuery.data);
      
      // Handle direct analysis results
      if (submitAuditQuery.data.directResults) {
        console.log("Setting direct analysis results");
        setResults(submitAuditQuery.data.directResults);
        setIsLoading(false);
        toast('Analysis completed', {
          description: 'Results are ready to view',
          position: 'bottom-right',
        });
        return;
      }
      
      // Handle cached result
      if (submitAuditQuery.data.cached || submitAuditQuery.data.data) {
        console.log("Setting cached results", submitAuditQuery.data);
        const resultData = submitAuditQuery.data.data || submitAuditQuery.data.results || submitAuditQuery.data;
        setResults(resultData);
        setIsLoading(false);
        toast('Retrieved cached results', {
          description: 'Showing results from cache',
          position: 'bottom-right',
        });
        return;
      }
      
      // Handle job creation
      if (submitAuditQuery.data.jobId && submitAuditQuery.data.jobId !== 'direct-analysis') {
        console.log("Setting job ID:", submitAuditQuery.data.jobId);
        setJobId(submitAuditQuery.data.jobId);
        toast('Audit started', {
          description: 'Your page is being analyzed',
          position: 'bottom-right',
        });
        return;
      }
      
      // If we have data but no jobId or cached flag, treat it as direct results
      if (submitAuditQuery.data.pageAnalysis || submitAuditQuery.data.score) {
        console.log("Setting direct results from submit response");
        setResults(submitAuditQuery.data);
        setIsLoading(false);
        toast('Analysis completed', {
          description: 'Results are ready to view',
          position: 'bottom-right',
        });
        return;
      }
    }
    
    // Handle job status
    if (jobStatusQuery.data && jobStatusQuery.data.job) {
      console.log("Job status:", jobStatusQuery.data.job);
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
      console.log("Job results received:", jobResultsQuery.data);
      
      const resultData = jobResultsQuery.data.results || jobResultsQuery.data;
      setResults(resultData);
      setIsLoading(false);
      toast('Audit completed', {
        description: 'Results are ready to view',
        position: 'bottom-right',
      });
    }
    
    // Handle errors
    if (submitAuditQuery.error && !results && isLoading) {
      console.error("Submit error:", submitAuditQuery.error);
      setError(`Failed to submit audit: ${(submitAuditQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    } else if (jobStatusQuery.error && !results && isLoading) {
      console.error("Status error:", jobStatusQuery.error);
      setError(`Failed to check job status: ${(jobStatusQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    } else if (jobResultsQuery.error && !results && isLoading) {
      console.error("Results error:", jobResultsQuery.error);
      setError(`Failed to get results: ${(jobResultsQuery.error as Error).message || 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [
    submitAuditQuery.data, submitAuditQuery.error,
    jobStatusQuery.data, jobStatusQuery.error,
    jobResultsQuery.data, jobResultsQuery.error,
    jobId, results, isLoading
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