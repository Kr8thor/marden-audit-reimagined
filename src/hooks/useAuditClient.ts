// Advanced hook for SEO audit using API client
import { useState } from 'react';
import apiClient from '../api/client';

export interface AuditResult {
  url: string;
  score: number;
  issuesFound: number;
  opportunities: number;
  performanceMetrics?: {
    lcp: {
      value: number;
      unit: string;
      score: number;
    };
    cls: {
      value: number;
      score: number;
    };
    fid: {
      value: number;
      unit: string;
      score: number;
    };
  };
  topIssues: any[];
  pageAnalysis?: any;
  categories?: any;
  cached?: boolean;
  cachedAt?: string;
}

export function useAuditClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Advanced function to run an audit using our API client
  const runAudit = async (url: string) => {
    try {
      // Reset state
      setIsLoading(true);
      setProgress(0);
      setError(null);
      
      // Start progress simulation
      const interval = setInterval(() => {
        setProgress(prev => {
          // Progress more quickly at the beginning, then slow down
          const increment = prev < 50 ? Math.random() * 15 : Math.random() * 5;
          return Math.min(95, prev + increment);
        });
      }, 300);
      
      // Use our API client for the audit
      try {
        // Use direct SEO analysis for speed
        const response = await apiClient.quickSeoAnalysis(url);
        
        // Process the response data
        if (response && response.data) {
          // Extract data based on response format
          const resultData = response.data;
          
          // Extract categories if available
          const categories = resultData.categories || {};
          
          // Count issues for display
          const totalIssuesCount = 
            (categories.metadata?.issues?.length || 0) +
            (categories.content?.issues?.length || 0) +
            (categories.technical?.issues?.length || 0) +
            (categories.userExperience?.issues?.length || 0);
          
          // Extract top issues
          const allIssues = [
            ...(categories.metadata?.issues || []),
            ...(categories.content?.issues || []),
            ...(categories.technical?.issues || []),
            ...(categories.userExperience?.issues || [])
          ];
          
          // Sort by severity
          const sortedIssues = allIssues.sort((a, b) => {
            const severityOrder = { critical: 0, warning: 1, info: 2 };
            return (severityOrder[a.severity as keyof typeof severityOrder] || 3) - 
                  (severityOrder[b.severity as keyof typeof severityOrder] || 3);
          });
          
          // Take top 5 issues
          const topIssues = sortedIssues.slice(0, 5).map(issue => ({
            severity: issue.severity,
            description: issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }));
          
          // Build page analysis from data
          const pageAnalysis = resultData.pageAnalysis || {
            title: resultData.pageData?.title || { text: '', length: 0 },
            metaDescription: resultData.pageData?.metaDescription || { text: '', length: 0 },
            headings: resultData.pageData?.headings || { h1Count: 0, h1Texts: [], h2Count: 0, h2Texts: [] },
            links: resultData.pageData?.links || { internalCount: 0, externalCount: 0, totalCount: 0 },
            images: resultData.pageData?.images || { withoutAltCount: 0, total: 0 },
            contentLength: resultData.pageData?.content?.contentLength || 0
          };
          
          // Default performance metrics
          const performanceMetrics = {
            lcp: {
              value: 2.5,
              unit: 's',
              score: 85,
            },
            cls: {
              value: 0.15,
              score: 75,
            },
            fid: {
              value: 180,
              unit: 'ms',
              score: 70,
            },
          };
          
          // Complete progress
          clearInterval(interval);
          setProgress(100);
          
          // Create the final result
          const finalResult: AuditResult = {
            url: response.url || url,
            score: resultData.score || 0,
            issuesFound: resultData.issuesFound || totalIssuesCount || 0,
            opportunities: resultData.opportunities || Math.ceil(totalIssuesCount / 2) || 0,
            performanceMetrics,
            topIssues: topIssues.length > 0 ? topIssues : [],
            pageAnalysis,
            categories,
            cached: response.cached || false,
            cachedAt: response.cachedAt
          };
          
          // Update state with a small delay for animation
          setTimeout(() => {
            setResult(finalResult);
            setIsLoading(false);
          }, 500);
        } else {
          throw new Error('Invalid response from API');
        }
      } catch (apiError: any) {
        console.error('API error:', apiError);
        throw new Error(apiError.message || 'Failed to analyze the website');
      }
    } catch (e: any) {
      console.error('Error running audit:', e);
      clearInterval(interval);
      setError(e.message || 'Failed to connect to the audit service. Please try again.');
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    progress,
    result,
    error,
    runAudit
  };
}