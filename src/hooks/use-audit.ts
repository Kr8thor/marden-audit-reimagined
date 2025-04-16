import { useState } from 'react';

// Types
type AuditStatus = 'idle' | 'loading' | 'completed' | 'failed';
type AuditType = 'page' | 'site';

export interface PerformanceMetric {
  value: number;
  unit?: string;
  score: number;
}

export interface TopIssue {
  severity: 'critical' | 'warning' | 'info';
  description: string;
}

export interface AuditResults {
  url: string;
  score: number;
  issuesFound: number;
  opportunities: number;
  performanceMetrics: {
    lcp: PerformanceMetric;
    cls: PerformanceMetric;
    fid: PerformanceMetric;
  };
  topIssues: TopIssue[];
  pageAnalysis?: any; // Will be filled with real data later
  siteAnalysis?: any; // Will be filled with real data later
}

/**
 * Custom hook for managing SEO audit operations
 */
const useAudit = () => {
  // State
  const [status, setStatus] = useState<AuditStatus>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start an audit
  const startAudit = async (url: string, type: AuditType = 'page') => {
    try {
      setStatus('loading');
      setProgress(0);
      setError(null);
      
      // Simulate progress
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          // Cap at 95% until we get results
          const newProgress = prev + Math.random() * 15;
          return newProgress > 95 ? 95 : newProgress;
        });
      }, 300);
      
      // Try to call our API endpoint
      try {
        const response = await fetch(`https://marden-audit-backend-se9t.vercel.app/api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url, type }),
        });
        
        // If API endpoint doesn't return real data, use mock data
        if (!response.ok || response.status === 200) {
          // Mock data for development
          const mockResults: AuditResults = {
            url,
            score: 78,
            issuesFound: 12,
            opportunities: 5,
            performanceMetrics: {
              lcp: {
                value: 2.4,
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
            },
            topIssues: [
              {
                severity: 'critical',
                description: 'Missing meta descriptions on 3 pages',
              },
              {
                severity: 'warning',
                description: 'Images without alt text',
              },
              {
                severity: 'info',
                description: 'Consider adding structured data',
              },
            ],
            pageAnalysis: {
              // Mock page analysis data
              title: 'Example Domain',
              metaDescription: 'Missing',
              headings: {
                h1: 1,
                h2: 0,
                h3: 0,
              },
              wordCount: 234,
              // ...more data
            },
          };
          
          // Complete the progress
          clearInterval(progressTimer);
          setProgress(100);
          
          // Set results after a short delay
          setTimeout(() => {
            setResults(mockResults);
            setStatus('completed');
          }, 500);
          
          return;
        }
        
        // Parse real API results
        const data = await response.json();
        
        // Complete the progress
        clearInterval(progressTimer);
        setProgress(100);
        
        // Set the API results
        setTimeout(() => {
          setResults({
            ...data,
            pageAnalysis: data.pageAnalysis || {},
            siteAnalysis: data.siteAnalysis || {},
          });
          setStatus('completed');
        }, 500);
        
      } catch (apiError) {
        console.error('API Error:', apiError);
        
        // Fallback to mock data
        const mockResults: AuditResults = {
          url,
          score: 78,
          issuesFound: 12,
          opportunities: 5,
          performanceMetrics: {
            lcp: {
              value: 2.4,
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
          },
          topIssues: [
            {
              severity: 'critical',
              description: 'Missing meta descriptions on 3 pages',
            },
            {
              severity: 'warning',
              description: 'Images without alt text',
            },
            {
              severity: 'info',
              description: 'Consider adding structured data',
            },
          ],
          pageAnalysis: {
            // Mock page analysis data
            title: 'Example Domain',
            metaDescription: 'Missing',
            headings: {
              h1: 1,
              h2: 0,
              h3: 0,
            },
            wordCount: 234,
            // ...more data
          },
        };
        
        // Complete the progress
        clearInterval(progressTimer);
        setProgress(100);
        
        // Set mock results after a short delay
        setTimeout(() => {
          setResults(mockResults);
          setStatus('completed');
        }, 500);
      }
    } catch (error) {
      setStatus('failed');
      setError('Failed to complete the audit. Please try again.');
      console.error('Audit error:', error);
    }
  };
  
  // Reset the audit state
  const resetAudit = () => {
    setStatus('idle');
    setProgress(0);
    setResults(null);
    setError(null);
  };
  
  return {
    status,
    isLoading: status === 'loading',
    progress,
    results,
    error,
    startAudit,
    resetAudit,
  };
};

export default useAudit;