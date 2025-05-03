import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import apiClient from '../api/client';
import BatchAuditResults from '../components/audit/BatchAuditResults';
import AuditError from '../components/audit/AuditError';
import CircularProgress from '../components/CircularProgress';

const BatchAuditPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [urlsInput, setUrlsInput] = useState<string>('');
  const [urlFile, setUrlFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<any | null>(null);
  
  // Mutation for batch URL analysis
  const batchAnalysisMutation = useMutation({
    mutationFn: (urls: string[]) => {
      return apiClient.batchSeoAnalysis(urls);
    },
    onSuccess: (data) => {
      console.log('Batch analysis complete:', data);
      setResults(data);
      setProgress(100);
      
      toast('Batch analysis complete', {
        description: `Analyzed ${data.totalUrls} URLs successfully`,
        position: 'bottom-right',
      });
    },
    onError: (error) => {
      console.error('Batch analysis failed:', error);
      
      toast('Analysis failed', {
        description: `Error: ${(error as Error).message}`,
        position: 'bottom-right',
        variant: 'destructive'
      });
    }
  });
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let urlsToProcess: string[] = [];
    
    // Process URLs from text input
    if (urlsInput.trim()) {
      urlsToProcess = urlsInput
        .trim()
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
    }
    // Process URLs from file
    else if (urlFile) {
      try {
        const fileContent = await readFileContent(urlFile);
        urlsToProcess = fileContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      } catch (error) {
        console.error('Error reading file:', error);
        toast('File error', {
          description: `Could not read the file: ${(error as Error).message}`,
          position: 'bottom-right',
          variant: 'destructive'
        });
        return;
      }
    }
    
    // Validate we have URLs to process
    if (urlsToProcess.length === 0) {
      toast('No URLs provided', {
        description: 'Please enter at least one URL to analyze',
        position: 'bottom-right',
        variant: 'destructive'
      });
      return;
    }
    
    // Limit to 20 URLs
    const limitedUrls = urlsToProcess.slice(0, 20);
    if (urlsToProcess.length > 20) {
      toast('URL limit', {
        description: `Limited to analyzing the first 20 URLs out of ${urlsToProcess.length} provided`,
        position: 'bottom-right',
      });
    }
    
    // Start progress animation
    setProgress(10);
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 90) return prev + 5;
        return prev;
      });
    }, 1000);
    
    // Start the batch analysis
    batchAnalysisMutation.mutate(limitedUrls);
    
    // Clean up progress interval when mutation completes
    return () => clearInterval(progressInterval);
  };
  
  // File reader helper
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  };
  
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUrlFile(e.target.files[0]);
      // Clear text input when file is selected
      setUrlsInput('');
    }
  };
  
  // Handle clear file button
  const handleClearFile = () => {
    setUrlFile(null);
  };
  
  // Handle try again button
  const handleTryAgain = () => {
    setResults(null);
    setProgress(0);
  };
  
  // Handle back to home button
  const handleBackToHome = () => {
    navigate('/');
  };
  
  // Determine if the form is currently being submitted
  const isSubmitting = batchAnalysisMutation.isPending;
  
  // Show loading state
  if (isSubmitting || (progress > 0 && progress < 100 && !results)) {
    return (
      <div className="container max-w-3xl mx-auto pt-12 px-4">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
          <div className="flex flex-col items-center justify-center py-6">
            <CircularProgress value={progress} size={120} strokeWidth={6} />
            <h3 className="text-xl font-semibold mt-6 mb-2">
              Analyzing URLs
            </h3>
            <div className="bg-primary/20 text-primary-foreground text-xs px-3 py-1 rounded-full mb-3">
              Batch SEO Audit
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {progress < 50 ? 'Submitting URLs for analysis...' : 
               progress < 80 ? 'Processing URLs...' : 
               'Finalizing results...'}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show results
  if (results) {
    return (
      <div className="container max-w-6xl mx-auto pt-12 px-4 pb-20">
        <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
          <BatchAuditResults
            results={results.results}
            totalUrls={results.totalUrls}
            timestamp={results.timestamp}
            cached={results.cached}
            cachedAt={results.cachedAt}
          />
          
          <div className="mt-8 border-t border-white/10 pt-4 flex justify-between">
            <button 
              className="text-sm text-primary hover:underline"
              onClick={handleTryAgain}
            >
              Run Another Batch Analysis
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
  }
  
  // Show error state
  if (batchAnalysisMutation.isError) {
    return (
      <AuditError
        error={(batchAnalysisMutation.error as Error).message}
        url="Batch Analysis"
        onTryAgain={handleTryAgain}
        onBackToHome={handleBackToHome}
      />
    );
  }
  
  // Show input form
  return (
    <div className="container max-w-3xl mx-auto pt-12 px-4 pb-20">
      <div className="bg-card p-8 rounded-lg shadow-lg border border-white/5">
        <h2 className="text-2xl font-bold mb-2">Batch SEO Audit</h2>
        <p className="text-muted-foreground mb-6">
          Analyze multiple URLs at once (up to 20 URLs)
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Enter URLs to analyze (one per line)
            </label>
            <textarea
              className="w-full h-40 p-3 bg-black/20 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://example.com
https://another-example.com
https://third-site.com"
              value={urlsInput}
              onChange={(e) => {
                setUrlsInput(e.target.value);
                setUrlFile(null); // Clear file input when text is entered
              }}
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          {/* File Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Or upload a text file with URLs (one per line)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.csv"
                onChange={handleFileChange}
                className="hidden"
                id="url-file-input"
                disabled={isSubmitting}
              />
              <label
                htmlFor="url-file-input"
                className="flex-1 cursor-pointer p-3 bg-black/20 border border-white/10 border-dashed rounded-md text-center hover:bg-black/30 transition-colors"
              >
                {urlFile ? urlFile.name : 'Click to select a file'}
              </label>
              
              {urlFile && (
                <button
                  type="button"
                  className="p-2 bg-red-900/30 hover:bg-red-900/50 rounded-md"
                  onClick={handleClearFile}
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            className="w-full p-3 bg-primary hover:bg-primary/90 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting || (!urlsInput && !urlFile)}
          >
            {isSubmitting ? 'Analyzing...' : 'Analyze URLs'}
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium mb-2">Tips</h3>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            <li>Enter each URL on a new line or upload a text file</li>
            <li>Maximum of 20 URLs can be processed in a single batch</li>
            <li>Results can be exported to CSV for further analysis</li>
            <li>Missing protocols (http/https) will default to https</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BatchAuditPage;
