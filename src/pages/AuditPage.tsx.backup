import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '../api/client';
import CircularProgress from '../components/CircularProgress';
import AuditResults from '../components/audit/AuditResults';
import AuditError from '../components/audit/AuditError';

const AuditPage: React.FC = () => {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get audit type from URL query parameters (default to 'quick')
  const queryParams = new URLSearchParams(location.search);
  const auditType = queryParams.get('type') === 'site' ? 'site' : 'quick';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [results, setResults] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  // Submit the URL for analysis or direct SEO analysis
  const submitAuditQuery = useQuery({
    queryKey: ['submitAudit', url],
    queryFn: async () => {
      if (!url) throw new Error('URL is required');
      try {
        // First try site-wide audit to crawl multiple pages
        console.log("Trying site-wide audit first");
        try {
          const siteAuditResult = await apiClient.submitSiteAudit(url, {
            maxPages: 20, // Set to crawl 20 pages as required
            depth: 3      // Reasonable depth for most sites
          });
          
          console.log("Site-wide audit submitted:", siteAuditResult);
          return siteAuditResult;
        } catch (siteError) {
          console.warn("Site-wide audit failed, falling back to direct analysis:", siteError);
          
          // If site audit fails, fall back to direct SEO analysis as it's faster
          const analysisResult = await apiClient.quickSeoAnalysis(url);
          
          // If we have data from direct analysis, return it immediately
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
          
          // If direct analysis fails too, try the single page job-based approach
          console.log("Direct SEO analysis failed, trying job-based page audit");
          return await apiClient.submitPageAudit(url);
        }
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
  
  // Handle different states and responses with improved data normalization
  useEffect(() => {
    // Handle direct SEO analysis or submit response
    if (submitAuditQuery.data && !results) {
      console.log("Submit query data received:", submitAuditQuery.data);
      
      // Process and normalize result data
      const processResult = (sourceData: any) => {
        // Try to locate the actual result data through multiple paths
        let resultData = sourceData;
        
        // If response contains directResults, use that
        if (sourceData.directResults) {
          resultData = sourceData.directResults;
        } 
        // If response contains data property, use that
        else if (sourceData.data) {
          resultData = sourceData.data;
        }
        // If response contains results property, use that
        else if (sourceData.results) {
          resultData = sourceData.results;
        }
        
        // Extract categories and issues if available (V2 API format)
        const categories = resultData.categories || {};
        
        // Get the data.data property if it exists (nested structure)
        const innerData = resultData.data || {};
        
        // Count issues for display - try different paths
        const issuesCount = 
          resultData.totalIssuesCount != null ? resultData.totalIssuesCount :
          innerData.totalIssuesCount != null ? innerData.totalIssuesCount :
          resultData.criticalIssuesCount != null ? resultData.criticalIssuesCount :
          (categories.metadata?.issues?.length || 0) +
          (categories.content?.issues?.length || 0) +
          (categories.technical?.issues?.length || 0) +
          (categories.userExperience?.issues?.length || 0);
        
        // Convert v2 data format to pageAnalysis format for display compatibility
        const pageData = resultData.pageData || innerData.pageData || {};
        const pageAnalysis = resultData.pageAnalysis || innerData.pageAnalysis || {
          title: pageData.title || { text: '', length: 0 },
          metaDescription: pageData.metaDescription || { text: '', length: 0 },
          headings: pageData.headings || { h1Count: 0, h1Texts: [], h2Count: 0, h2Texts: [] },
          links: pageData.links || { internalCount: 0, externalCount: 0, totalCount: 0 },
          images: pageData.images || { withoutAltCount: 0, total: 0 },
          contentLength: pageData.content?.contentLength || 0
        };
        
        // For V2 API, use metadata from technical section if available
        if (pageData.technical) {
          pageAnalysis.canonical = pageData.technical.canonicalUrl || '';
        }
        
        // Properly normalize the score - check multiple paths for the score
        const score = resultData.score != null ? resultData.score : 
          innerData.score != null ? innerData.score :
          categories.content?.score != null ? categories.content.score :
          categories.metadata?.score !== undefined ? 
            (categories.metadata.score + (categories.content?.score || 0) + 
             (categories.technical?.score || 0) + (categories.userExperience?.score || 0)) / 4 : 
            0;
        
        // Create a complete result with all possible data paths
        return {
          ...resultData,
          score: Math.round(score),
          issuesFound: resultData.issuesFound != null ? resultData.issuesFound : issuesCount,
          opportunities: resultData.opportunities != null ? resultData.opportunities : Math.ceil(issuesCount / 2),
          pageAnalysis,
          siteAnalysis: resultData.siteAnalysis || null,
          cached: sourceData.cached || resultData.cached || false,
          cachedAt: sourceData.cachedAt || resultData.cachedAt || new Date().toISOString(),
          categories, // Include categories if available (V2 API)
          data: resultData // Include the raw data for direct access
        };
      };
      
      // Handle direct analysis results
      if (submitAuditQuery.data.directResults) {
        console.log("Setting direct analysis results");
        const processedResults = processResult(submitAuditQuery.data);
        
        // Debug the processed results
        console.log("Processed results:", JSON.stringify(processedResults, null, 2));
        
        setResults(processedResults);
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
        const processedResults = processResult(submitAuditQuery.data);
        
        setResults(processedResults);
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
      if (submitAuditQuery.data.pageAnalysis || 
          submitAuditQuery.data.pageData || 
          submitAuditQuery.data.score != null ||
          submitAuditQuery.data.categories) {
        console.log("Setting direct results from submit response");
        const processedResults = processResult(submitAuditQuery.data);
        
        setResults(processedResults);
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
        setError(`Audit failed: ${jobStatusQuery.data.job.error || 'Unknown error'}`);
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
      
      // Process result data to handle differences in API response format
      const processResult = (sourceData: any) => {
        // Try to locate the actual result data through multiple paths
        let resultData = sourceData;
        
        // If response contains results property, use that
        if (sourceData.results) {
          resultData = sourceData.results;
        }
        
        // Extract categories and issues if available (V2 API format)
        const categories = resultData.categories || {};
        
        // Get the data.data property if it exists (nested structure)
        const innerData = resultData.data || {};
        
        // Count issues for display - check all possible paths
        const issuesCount = 
          resultData.totalIssuesCount != null ? resultData.totalIssuesCount :
          innerData.totalIssuesCount != null ? innerData.totalIssuesCount :
          resultData.criticalIssuesCount != null ? resultData.criticalIssuesCount :
          (categories.metadata?.issues?.length || 0) +
          (categories.content?.issues?.length || 0) +
          (categories.technical?.issues?.length || 0) +
          (categories.userExperience?.issues?.length || 0);
        
        // Convert v2 data format to pageAnalysis format for display compatibility
        const pageData = resultData.pageData || innerData.pageData || {};
        const pageAnalysis = resultData.pageAnalysis || innerData.pageAnalysis || {
          title: pageData.title || { text: '', length: 0 },
          metaDescription: pageData.metaDescription || { text: '', length: 0 },
          headings: pageData.headings || { h1Count: 0, h1Texts: [], h2Count: 0, h2Texts: [] },
          links: pageData.links || { internalCount: 0, externalCount: 0, totalCount: 0 },
          images: pageData.images || { withoutAltCount: 0, total: 0 },
          contentLength: pageData.content?.contentLength || 0
        };
        
        // Properly normalize the score - check multiple paths for the score
        const score = resultData.score != null ? resultData.score : 
          innerData.score != null ? innerData.score :
          categories.content?.score != null ? categories.content.score :
          categories.metadata?.score !== undefined ? 
            (categories.metadata.score + (categories.content?.score || 0) + 
             (categories.technical?.score || 0) + (categories.userExperience?.score || 0)) / 4 : 
            0;
        
        // Debug the normalized data
        console.log("Normalized job results:", {
          score: Math.round(score),
          issuesFound: resultData.issuesFound != null ? resultData.issuesFound : issuesCount
        });
        
        // Create a complete result with all possible data paths
        return {
          ...resultData,
          score: Math.round(score),
          issuesFound: resultData.issuesFound != null ? resultData.issuesFound : issuesCount,
          opportunities: resultData.opportunities != null ? resultData.opportunities : Math.ceil(issuesCount / 2),
          pageAnalysis,
          siteAnalysis: resultData.siteAnalysis || null,
          cached: sourceData.cached || resultData.cached || false,
          cachedAt: sourceData.cachedAt || resultData.cachedAt || new Date().toISOString(),
          categories, // Include categories if available (V2 API)
          data: resultData // Include the raw data for direct access
        };
      };
      
      const processedResults = processResult(jobResultsQuery.data);
      
      setResults(processedResults);
      setIsLoading(false);
      toast('Audit completed', {
        description: 'Results are ready to view',
        position: 'bottom-right',
      });
    }
    
    // Handle errors with improved error reporting
    if (submitAuditQuery.error && !results && isLoading) {
      console.error("Submit error:", submitAuditQuery.error);
      
      // Extract useful error message from the error object
      const errorMessage = getErrorMessage(submitAuditQuery.error);
      
      setError(`Failed to submit audit: ${errorMessage}`);
      setIsLoading(false);
    } else if (jobStatusQuery.error && !results && isLoading) {
      console.error("Status error:", jobStatusQuery.error);
      
      // Extract useful error message from the error object
      const errorMessage = getErrorMessage(jobStatusQuery.error);
      
      setError(`Failed to check job status: ${errorMessage}`);
      setIsLoading(false);
    } else if (jobResultsQuery.error && !results && isLoading) {
      console.error("Results error:", jobResultsQuery.error);
      
      // Extract useful error message from the error object
      const errorMessage = getErrorMessage(jobResultsQuery.error);
      
      setError(`Failed to get results: ${errorMessage}`);
      setIsLoading(false);
    }
  }, [
    submitAuditQuery.data, submitAuditQuery.error,
    jobStatusQuery.data, jobStatusQuery.error,
    jobResultsQuery.data, jobResultsQuery.error,
    jobId, results, isLoading
  ]);
  
  // Helper function to extract meaningful error messages
  const getErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error instanceof Error) {
      return error.message || 'Unknown error';
    }
    
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    
    if (error.message) {
      return error.message;
    }
    
    return 'Unknown error occurred';
  };
  
  // Handle try again button click with improved error handling
  const handleTryAgain = () => {
    setIsLoading(true);
    setProgress(0);
    setError(null);
    setJobId(null);
    setResults(null);
    
    // Add a small delay to ensure UI updates before making the request
    setTimeout(() => {
      console.log('Retrying analysis...');
      submitAuditQuery.refetch();
    }, 300);
  };
  
  // Handle back to home button click
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Update progress based on job status
  useEffect(() => {
    if (isLoading) {
      let statusText = 'Submitting URL...';
      
      if (jobStatusQuery.data?.job) {
        const jobStatus = jobStatusQuery.data.job;
        setProgress(jobStatus.progress || 10);
        
        if (jobStatus.status === 'queued') {
          statusText = 'Queued for processing...';
        } else if (jobStatus.status === 'processing') {
          statusText = jobStatus.message || 'Processing audit...';
        } else if (jobStatus.status === 'completed') {
          statusText = 'Retrieving results...';
          setProgress(95);
        }
      } else if (submitAuditQuery.isLoading) {
        statusText = 'Analyzing URL...';
        
        // Animate progress during analysis
        const timer = setInterval(() => {
          setProgress(prev => {
            if (prev < 75) return prev + 5;
            return prev;
          });
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [isLoading, jobStatusQuery.data, submitAuditQuery.isLoading]);

  // Show loading state
  if (isLoading) {
    let statusText = 'Submitting URL...';
    
    if (jobStatusQuery.data?.job) {
      const jobStatus = jobStatusQuery.data.job;
      
      if (jobStatus.status === 'queued') {
        statusText = 'Queued for processing...';
      } else if (jobStatus.status === 'processing') {
        statusText = jobStatus.message || 'Processing audit...';
      } else if (jobStatus.status === 'completed') {
        statusText = 'Retrieving results...';
      }
    } else if (submitAuditQuery.isLoading) {
      statusText = 'Analyzing URL...';
    }
    
    return (
      <div className="container max-w-3xl mx-auto pt-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
          <div className="flex flex-col items-center justify-center py-6">
            <CircularProgress value={progress} size={120} strokeWidth={6} />
            <h3 className="text-xl font-semibold mt-6 mb-2">Analyzing {url}</h3>
            <div className="bg-primary/20 text-primary-foreground text-xs px-3 py-1 rounded-full mb-3">
              {auditType === 'site' ? 'Site-wide Audit (up to 20 pages)' : 'Quick Single-page Audit'}
            </div>
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
          categories={results?.categories}
          data={results?.data} // Pass the raw data as well
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