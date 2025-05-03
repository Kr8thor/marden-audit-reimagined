import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SeoAnalysisResult } from '../../api/types';

// Chart components if available
let LineChart: any;
let BarChart: any;
let PieChart: any;
let ResponsiveContainer: any;
let XAxis: any;
let YAxis: any;
let CartesianGrid: any;
let Tooltip: any;
let Legend: any;
let Bar: any;
let Line: any;
let Pie: any;
let Cell: any;

// Try to import recharts components
try {
  const recharts = require('recharts');
  LineChart = recharts.LineChart;
  BarChart = recharts.BarChart;
  PieChart = recharts.PieChart;
  ResponsiveContainer = recharts.ResponsiveContainer;
  XAxis = recharts.XAxis;
  YAxis = recharts.YAxis;
  CartesianGrid = recharts.CartesianGrid;
  Tooltip = recharts.Tooltip;
  Legend = recharts.Legend;
  Bar = recharts.Bar;
  Line = recharts.Line;
  Pie = recharts.Pie;
  Cell = recharts.Cell;
} catch (e) {
  console.warn('Recharts not available, charts will not be displayed');
}

interface BatchAuditResultsProps {
  results: SeoAnalysisResult[];
  totalUrls: number;
  timestamp: string;
  cached?: boolean;
  cachedAt?: string;
}

const BatchAuditResults: React.FC<BatchAuditResultsProps> = ({ 
  results, 
  totalUrls, 
  timestamp, 
  cached = false, 
  cachedAt 
}) => {
  // State for selected view and filtering/sorting
  const [activeView, setActiveView] = useState<'table' | 'charts' | 'issues'>('table');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  
  // Processed results with filtering and sorting
  const processedResults = useMemo(() => {
    // Filter by search term
    let filtered = [...results];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(result => 
        result.url.toLowerCase().includes(term)
      );
    }
    
    // Sort results
    return filtered.sort((a, b) => {
      // Handle different sort fields
      if (sortBy === 'score') {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      }
      
      if (sortBy === 'url') {
        return sortDirection === 'asc' 
          ? a.url.localeCompare(b.url) 
          : b.url.localeCompare(a.url);
      }
      
      if (sortBy === 'issues') {
        const issuesA = a.totalIssuesCount || 0;
        const issuesB = b.totalIssuesCount || 0;
        return sortDirection === 'asc' ? issuesA - issuesB : issuesB - issuesA;
      }
      
      if (sortBy === 'title') {
        const titleLengthA = a.pageData?.title?.length || a.pageAnalysis?.title?.length || 0;
        const titleLengthB = b.pageData?.title?.length || b.pageAnalysis?.title?.length || 0;
        return sortDirection === 'asc' ? titleLengthA - titleLengthB : titleLengthB - titleLengthA;
      }
      
      if (sortBy === 'description') {
        const descLengthA = a.pageData?.metaDescription?.length || a.pageAnalysis?.metaDescription?.length || 0;
        const descLengthB = b.pageData?.metaDescription?.length || b.pageAnalysis?.metaDescription?.length || 0;
        return sortDirection === 'asc' ? descLengthA - descLengthB : descLengthB - descLengthA;
      }
      
      return 0;
    });
  }, [results, searchTerm, sortBy, sortDirection]);
  
  // Get the selected result
  const selectedResult = useMemo(() => {
    if (!selectedUrl) return null;
    return results.find(r => r.url === selectedUrl) || null;
  }, [selectedUrl, results]);
  
  // Prepare data for charts
  const chartData = useMemo(() => {
    return processedResults.map(result => {
      // Extract domain for display
      let domain = '';
      try {
        domain = new URL(result.url).hostname.replace('www.', '');
      } catch (e) {
        domain = result.url;
      }
      
      // Format domain for display (truncate if too long)
      const formattedDomain = domain.length > 15 
        ? domain.substring(0, 12) + '...' 
        : domain;
      
      // Extract values with fallbacks
      const titleLength = result.pageData?.title?.length || 
                          result.pageAnalysis?.title?.length || 0;
                         
      const descLength = result.pageData?.metaDescription?.length || 
                         result.pageAnalysis?.metaDescription?.length || 0;
                        
      const h1Count = result.pageData?.headings?.h1Count || 
                      result.pageAnalysis?.headings?.h1Count || 0;
                     
      const imagesWithAlt = 
        (result.pageData?.images?.total || result.pageAnalysis?.images?.total || 0) - 
        (result.pageData?.images?.withoutAlt || result.pageAnalysis?.images?.withoutAltCount || 0);
      
      const imagesWithoutAlt = result.pageData?.images?.withoutAlt || 
                              result.pageAnalysis?.images?.withoutAltCount || 0;
      
      return {
        url: result.url,
        domain: formattedDomain,
        score: result.score || 0,
        titleLength,
        descLength,
        h1Count,
        imagesWithAlt,
        imagesWithoutAlt,
        issues: result.totalIssuesCount || 0
      };
    });
  }, [processedResults]);
  
  // Get overall statistics
  const stats = useMemo(() => {
    const totalUrls = results.length;
    const avgScore = Math.round(
      results.reduce((sum, result) => sum + (result.score || 0), 0) / (totalUrls || 1)
    );
    
    const titleIssues = results.filter(result => {
      const titleLength = result.pageData?.title?.length || 
                          result.pageAnalysis?.title?.length || 0;
      return titleLength < 30 || titleLength > 60 || titleLength === 0;
    }).length;
    
    const descIssues = results.filter(result => {
      const descLength = result.pageData?.metaDescription?.length || 
                         result.pageAnalysis?.metaDescription?.length || 0;
      return descLength < 50 || descLength > 160 || descLength === 0;
    }).length;
    
    const h1Issues = results.filter(result => {
      const h1Count = result.pageData?.headings?.h1Count || 
                     result.pageAnalysis?.headings?.h1Count || 0;
      return h1Count !== 1;
    }).length;
    
    return {
      totalUrls,
      avgScore,
      titleIssues,
      descIssues,
      h1Issues
    };
  }, [results]);
  
  // Calculate score distribution
  const scoreDistribution = useMemo(() => {
    const distribution = {
      excellent: 0, // 90-100
      good: 0,      // 70-89
      average: 0,   // 50-69
      poor: 0,      // 30-49
      critical: 0   // 0-29
    };
    
    results.forEach(result => {
      const score = result.score || 0;
      if (score >= 90) distribution.excellent++;
      else if (score >= 70) distribution.good++;
      else if (score >= 50) distribution.average++;
      else if (score >= 30) distribution.poor++;
      else distribution.critical++;
    });
    
    return [
      { name: 'Excellent', value: distribution.excellent, color: '#22c55e' },
      { name: 'Good', value: distribution.good, color: '#84cc16' },
      { name: 'Average', value: distribution.average, color: '#eab308' },
      { name: 'Poor', value: distribution.poor, color: '#ef4444' },
      { name: 'Critical', value: distribution.critical, color: '#b91c1c' }
    ];
  }, [results]);
  
  // Collect all issue types across results for the issues tab
  const issueTypes = useMemo(() => {
    const issueMap = new Map();
    
    // Process all issues from all results
    results.forEach(result => {
      // Process categories if available (V2 API)
      if (result.categories) {
        Object.values(result.categories).forEach(category => {
          category.issues.forEach(issue => {
            const issueType = issue.type;
            if (!issueMap.has(issueType)) {
              issueMap.set(issueType, {
                type: issueType,
                count: 0,
                urls: [],
                severity: issue.severity || 'info',
                recommendation: issue.recommendation || '',
                impact: issue.impact || 'low'
              });
            }
            
            const issueData = issueMap.get(issueType);
            issueData.count++;
            
            if (!issueData.urls.includes(result.url)) {
              issueData.urls.push(result.url);
            }
          });
        });
      }
      
      // Fallback to extracting issues from other properties if no categories
      if (!result.categories && result.pageAnalysis) {
        // Title issues
        if (!result.pageAnalysis.title?.text) {
          addIssue('missing_title', result.url, 'critical', 'Add a title tag to your page', 'high');
        } else if (result.pageAnalysis.title.length < 30) {
          addIssue('title_too_short', result.url, 'warning', 'Make your title tag longer (30-60 characters recommended)', 'medium');
        } else if (result.pageAnalysis.title.length > 60) {
          addIssue('title_too_long', result.url, 'info', 'Consider shortening your title tag (30-60 characters recommended)', 'low');
        }
        
        // Meta description issues
        if (!result.pageAnalysis.metaDescription?.text) {
          addIssue('missing_meta_description', result.url, 'critical', 'Add a meta description to your page', 'high');
        } else if (result.pageAnalysis.metaDescription.length < 50) {
          addIssue('meta_description_too_short', result.url, 'warning', 'Make your meta description longer (50-160 characters recommended)', 'medium');
        } else if (result.pageAnalysis.metaDescription.length > 160) {
          addIssue('meta_description_too_long', result.url, 'info', 'Consider shortening your meta description (50-160 characters recommended)', 'low');
        }
        
        // H1 issues
        if (result.pageAnalysis.headings?.h1Count === 0) {
          addIssue('missing_h1', result.url, 'critical', 'Add an H1 heading to your page', 'high');
        } else if (result.pageAnalysis.headings?.h1Count > 1) {
          addIssue('multiple_h1', result.url, 'warning', 'Use only one H1 heading per page', 'medium');
        }
        
        // Image alt text issues
        if (result.pageAnalysis.images?.withoutAltCount > 0) {
          addIssue('images_missing_alt', result.url, 'warning', 'Add alt text to all images for better accessibility and SEO', 'medium');
        }
      }
    });
    
    // Helper function to add an issue to the map
    function addIssue(type, url, severity, recommendation, impact) {
      if (!issueMap.has(type)) {
        issueMap.set(type, {
          type,
          count: 0,
          urls: [],
          severity,
          recommendation,
          impact
        });
      }
      
      const issueData = issueMap.get(type);
      issueData.count++;
      
      if (!issueData.urls.includes(url)) {
        issueData.urls.push(url);
      }
    }
    
    // Convert map to array and sort by count (descending)
    return Array.from(issueMap.values())
      .sort((a, b) => b.count - a.count);
  }, [results]);
  
  // Handle sorting change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Handle CSV export
  const handleExportCsv = () => {
    // Define CSV headers
    const headers = [
      'URL',
      'Score',
      'Title Length',
      'Meta Description Length',
      'H1 Count',
      'Issues',
      'Internal Links',
      'External Links',
      'Images With Alt',
      'Images Without Alt'
    ];
    
    // Map results to CSV rows
    const rows = processedResults.map(result => {
      const titleLength = result.pageData?.title?.length || 
                         result.pageAnalysis?.title?.length || 0;
                        
      const descLength = result.pageData?.metaDescription?.length || 
                        result.pageAnalysis?.metaDescription?.length || 0;
                         
      const h1Count = result.pageData?.headings?.h1Count || 
                     result.pageAnalysis?.headings?.h1Count || 0;
                      
      const issues = result.totalIssuesCount || 0;
      
      const internalLinks = result.pageData?.links?.internalCount || 
                           result.pageAnalysis?.links?.internalCount || 0;
                            
      const externalLinks = result.pageData?.links?.externalCount || 
                           result.pageAnalysis?.links?.externalCount || 0;
                            
      const imagesWithAlt = 
        (result.pageData?.images?.total || result.pageAnalysis?.images?.total || 0) - 
        (result.pageData?.images?.withoutAlt || result.pageAnalysis?.images?.withoutAltCount || 0);
      
      const imagesWithoutAlt = result.pageData?.images?.withoutAlt || 
                              result.pageAnalysis?.images?.withoutAltCount || 0;
      
      return [
        result.url,
        result.score || 0,
        titleLength,
        descLength,
        h1Count,
        issues,
        internalLinks,
        externalLinks,
        imagesWithAlt,
        imagesWithoutAlt
      ];
    });
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `seo-batch-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format a URL for display
  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      let formatted = urlObj.hostname;
      
      // Add path if not just the root
      if (urlObj.pathname !== '/') {
        // Truncate path if too long
        const path = urlObj.pathname.length > 20 
          ? urlObj.pathname.substring(0, 17) + '...' 
          : urlObj.pathname;
        formatted += path;
      }
      
      return formatted;
    } catch (e) {
      return url;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Batch SEO Audit Results</h1>
          <p className="text-muted-foreground">
            {totalUrls} URLs analyzed on {new Date(timestamp).toLocaleString()}
            {cached && cachedAt && (
              <span className="text-xs ml-2 bg-white/10 px-2 py-1 rounded-full">
                Cached from {new Date(cachedAt).toLocaleString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md"
          >
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-muted-foreground mb-1">URLs Analyzed</div>
          <div className="text-2xl font-bold">{stats.totalUrls}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-muted-foreground mb-1">Average Score</div>
          <div className={`text-2xl font-bold ${
            stats.avgScore >= 80 ? 'text-green-400' : 
            stats.avgScore >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {stats.avgScore}
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-muted-foreground mb-1">Title Issues</div>
          <div className="text-2xl font-bold text-red-400">{stats.titleIssues}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-muted-foreground mb-1">Meta Desc Issues</div>
          <div className="text-2xl font-bold text-red-400">{stats.descIssues}</div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="text-xs text-muted-foreground mb-1">H1 Issues</div>
          <div className="text-2xl font-bold text-red-400">{stats.h1Issues}</div>
        </div>
      </div>
      
      {/* View Selector Tabs */}
      <div className="border-b border-white/10">
        <div className="flex">
          <button
            className={`px-4 py-2 ${
              activeView === 'table' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveView('table')}
          >
            Table View
          </button>
          
          <button
            className={`px-4 py-2 ${
              activeView === 'charts' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveView('charts')}
          >
            Charts
          </button>
          
          <button
            className={`px-4 py-2 ${
              activeView === 'issues' 
                ? 'border-b-2 border-primary text-primary' 
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveView('issues')}
          >
            Common Issues
          </button>
        </div>
      </div>
      
      {/* Table View */}
      {activeView === 'table' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search URLs..."
                className="w-full p-2 bg-white/5 border border-white/10 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Results Table */}
          <div className="overflow-x-auto bg-white/5 rounded-lg border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs">
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('url')}
                  >
                    URL
                    {sortBy === 'url' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('score')}
                  >
                    Score
                    {sortBy === 'score' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('title')}
                  >
                    Title
                    {sortBy === 'title' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('description')}
                  >
                    Meta Desc
                    {sortBy === 'description' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 cursor-pointer hover:bg-white/5"
                    onClick={() => handleSort('issues')}
                  >
                    Issues
                    {sortBy === 'issues' && (
                      <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedResults.map((result, index) => {
                  // Extract values with fallbacks
                  const titleLength = result.pageData?.title?.length || 
                                    result.pageAnalysis?.title?.length || 0;
                                   
                  const descLength = result.pageData?.metaDescription?.length || 
                                   result.pageAnalysis?.metaDescription?.length || 0;
                                  
                  const issues = result.totalIssuesCount || 0;
                  
                  // Determine status indicators
                  const titleStatus = titleLength < 30 || titleLength > 60 || titleLength === 0 
                    ? 'bg-red-500' : 'bg-green-500';
                    
                  const descStatus = descLength < 50 || descLength > 160 || descLength === 0 
                    ? 'bg-red-500' : 'bg-green-500';
                  
                  return (
                    <tr 
                      key={result.url} 
                      className={`border-b border-white/5 hover:bg-white/5 text-sm ${
                        index % 2 === 0 ? 'bg-white/[0.01]' : ''
                      }`}
                    >
                      <td className="px-4 py-3 max-w-[200px] truncate">
                        <a 
                          href={result.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                          title={result.url}
                        >
                          {formatUrl(result.url)}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.score >= 80 ? 'bg-green-500/20 text-green-400' : 
                          result.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {result.score || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${titleStatus}`}></span>
                          <span>{titleLength}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${descStatus}`}></span>
                          <span>{descLength}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          issues > 5 ? 'bg-red-500/20 text-red-400' : 
                          issues > 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {issues}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="text-xs text-primary hover:underline"
                            onClick={() => setSelectedUrl(result.url)}
                          >
                            Details
                          </button>
                          
                          <Link 
                            to={`/audit/${encodeURIComponent(result.url)}`}
                            className="text-xs text-white/60 hover:text-white"
                          >
                            View
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {processedResults.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-white/60">
                      No results match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Selected URL Details */}
          {selectedUrl && selectedResult && (
            <div className="bg-white/5 rounded-lg border border-white/10 p-4 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">
                  <a 
                    href={selectedUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedUrl}
                  </a>
                </h3>
                <button
                  className="text-xs text-white/60"
                  onClick={() => setSelectedUrl(null)}
                >
                  Close
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Summary */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs text-white/60">Page Title</div>
                    <div className="text-sm bg-white/10 p-2 rounded">
                      {selectedResult.pageData?.title?.text || 
                       selectedResult.pageAnalysis?.title?.text || 
                       'No title found'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-white/60">Meta Description</div>
                    <div className="text-sm bg-white/10 p-2 rounded">
                      {selectedResult.pageData?.metaDescription?.text || 
                       selectedResult.pageAnalysis?.metaDescription?.text || 
                       'No meta description found'}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-xs text-white/60">H1 Heading</div>
                    <div className="text-sm bg-white/10 p-2 rounded">
                      {selectedResult.pageData?.headings?.h1Texts?.[0] || 
                       selectedResult.pageAnalysis?.headings?.h1Texts?.[0] || 
                       'No H1 heading found'}
                    </div>
                  </div>
                </div>
                
                {/* Issues */}
                <div className="space-y-3">
                  <div className="text-xs text-white/60">Issues</div>
                  
                  {selectedResult.categories ? (
                    // V2 API with categories
                    <div className="space-y-2">
                      {Object.entries(selectedResult.categories).map(([category, data]) => (
                        data.issues.length > 0 && (
                          <div key={category} className="space-y-1">
                            <div className="text-xs font-medium capitalize">
                              {category} Issues ({data.issues.length})
                            </div>
                            
                            {data.issues.map((issue, index) => (
                              <div 
                                key={`${category}-${index}`}
                                className="text-xs bg-white/10 p-2 rounded flex items-start gap-2"
                              >
                                <span className={`w-2 h-2 mt-1 rounded-full flex-shrink-0 ${
                                  issue.severity === 'critical' ? 'bg-red-500' : 
                                  issue.severity === 'warning' ? 'bg-yellow-500' : 
                                  'bg-blue-500'
                                }`}></span>
                                <span>{issue.recommendation}</span>
                              </div>
                            ))}
                          </div>
                        )
                      ))}
                      
                      {Object.values(selectedResult.categories).every(category => category.issues.length === 0) && (
                        <div className="text-sm text-white/60 italic">
                          No issues found!
                        </div>
                      )}
                    </div>
                  ) : (
                    // Fallback for other API formats
                    <div className="text-sm text-white/60 italic">
                      Detailed issue information not available in this result format.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Charts View */}
      {activeView === 'charts' && (
        <div className="space-y-6">
          {/* Check if recharts is available */}
          {!BarChart && (
            <div className="bg-yellow-900/30 text-yellow-300 p-4 rounded-md">
              Charts library not available. Please install recharts to view charts.
            </div>
          )}
          
          {BarChart && (
            <>
              {/* Score Distribution */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <h3 className="text-sm font-medium mb-4">Score Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis 
                          dataKey="domain" 
                          tick={{ fontSize: 12 }} 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          stroke="#cccccc66"
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 12 }}
                          stroke="#cccccc66"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111', 
                            borderColor: '#333',
                            color: '#fff'
                          }}
                        />
                        <Bar 
                          dataKey="score" 
                          name="SEO Score"
                          fill="#4f46e5"
                        >
                          {chartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={
                                entry.score >= 80 ? '#22c55e' : 
                                entry.score >= 50 ? '#eab308' : 
                                '#ef4444'
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => 
                            percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {scoreDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#111', 
                            borderColor: '#333',
                            color: '#fff'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* SEO Metrics Comparison */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <h3 className="text-sm font-medium mb-4">SEO Metrics Comparison</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="domain" 
                        tick={{ fontSize: 12 }} 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        stroke="#cccccc66"
                      />
                      <YAxis stroke="#cccccc66" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }}
                      />
                      <Legend verticalAlign="top" />
                      <Bar 
                        dataKey="titleLength" 
                        name="Title Length"
                        fill="#3b82f6"
                      />
                      <Bar 
                        dataKey="descLength" 
                        name="Meta Desc Length"
                        fill="#10b981"
                      />
                      <Bar 
                        dataKey="issues" 
                        name="Issues"
                        fill="#ef4444"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Image and Link Metrics */}
              <div className="bg-white/5 rounded-lg border border-white/10 p-4">
                <h3 className="text-sm font-medium mb-4">Images Alt Text Status</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{ top: 5, right: 30, left: 0, bottom: 60 }}
                      stackOffset="sign"
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="domain" 
                        tick={{ fontSize: 12 }} 
                        angle={-45} 
                        textAnchor="end"
                        height={70}
                        stroke="#cccccc66"
                      />
                      <YAxis stroke="#cccccc66" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          borderColor: '#333',
                          color: '#fff'
                        }}
                      />
                      <Legend verticalAlign="top" />
                      <Bar 
                        dataKey="imagesWithAlt" 
                        name="With Alt Text"
                        stackId="images"
                        fill="#22c55e"
                      />
                      <Bar 
                        dataKey="imagesWithoutAlt" 
                        name="Without Alt Text"
                        stackId="images"
                        fill="#ef4444"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Issues View */}
      {activeView === 'issues' && (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg border border-white/10 p-4">
            <h3 className="text-sm font-medium mb-4">Common Issues</h3>
            
            {issueTypes.length > 0 ? (
              <div className="space-y-4">
                {issueTypes.map((issue, index) => (
                  <div 
                    key={index}
                    className="bg-white/5 p-3 rounded-md border border-white/5"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          issue.severity === 'critical' ? 'bg-red-500' : 
                          issue.severity === 'warning' ? 'bg-yellow-500' : 
                          'bg-blue-500'
                        }`}></span>
                        <span className="font-medium">
                          {issue.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 
                        issue.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.count} {issue.count === 1 ? 'page' : 'pages'} affected
                      </span>
                    </div>
                    
                    <p className="text-sm text-white/80 mb-2">
                      {issue.recommendation}
                    </p>
                    
                    <div className="text-xs text-white/60">
                      <span className="font-medium">Impact:</span> {issue.impact.charAt(0).toUpperCase() + issue.impact.slice(1)}
                    </div>
                    
                    {issue.urls.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium mb-1">Affected Pages:</div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {issue.urls.slice(0, 5).map((url, idx) => (
                            <a 
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-white/10 px-2 py-1 rounded text-primary hover:bg-white/20"
                            >
                              {formatUrl(url)}
                            </a>
                          ))}
                          
                          {issue.urls.length > 5 && (
                            <span className="bg-white/10 px-2 py-1 rounded">
                              +{issue.urls.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/60">
                No issues found across the analyzed URLs.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchAuditResults;