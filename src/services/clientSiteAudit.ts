/**
 * Client-Side Site Audit Implementation
 * This module provides a client-side implementation of site auditing
 * by using the individual page analysis API endpoint.
 */
import apiClient from '../api/client';

// Types
interface SiteAuditOptions {
  maxPages?: number;
  maxDepth?: number;
  respectRobots?: boolean;
  customPages?: string[];
  onProgress?: (progress: number, message: string) => void;
}

interface PageLink {
  url: string;
  text: string;
  depth: number;
}

// Helper function to normalize URLs
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Trim whitespace
  let normalizedUrl = url.trim();
  
  // Remove trailing slashes for consistency
  while (normalizedUrl.endsWith('/')) {
    normalizedUrl = normalizedUrl.slice(0, -1);
  }
  
  // Ensure proper protocol
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = `https://${normalizedUrl}`;
  }
  
  return normalizedUrl;
}

// Helper to extract domain from URL
function extractDomain(url: string): string {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    return '';
  }
}

// Helper to check if URLs are on the same domain
function isSameDomain(url1: string, url2: string): boolean {
  try {
    const domain1 = extractDomain(url1);
    const domain2 = extractDomain(url2);
    return domain1 === domain2;
  } catch (error) {
    return false;
  }
}

// Extract links from HTML content
function extractLinks(html: string, baseUrl: string): string[] {
  try {
    // Create a temporary DOM element to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get all links
    const links = Array.from(doc.querySelectorAll('a[href]'))
      .map(a => {
        try {
          // Get href attribute
          const href = a.getAttribute('href');
          if (!href) return null;
          
          // Skip anchor links and javascript links
          if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
            return null;
          }
          
          // Resolve relative URLs
          const fullUrl = new URL(href, baseUrl).href;
          
          // Only include links from the same domain
          if (!isSameDomain(fullUrl, baseUrl)) {
            return null;
          }
          
          return fullUrl;
        } catch (error) {
          return null;
        }
      })
      .filter(url => url !== null) as string[];
    
    // Remove duplicates
    return Array.from(new Set(links));
  } catch (error) {
    console.error('Error extracting links:', error);
    return [];
  }
}

// Fetch a URL and extract links
async function fetchAndExtractLinks(url: string): Promise<string[]> {
  try {
    // Fetch the page content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MardenSEOAuditBot/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }
    
    // Get the HTML content
    const html = await response.text();
    
    // Extract links
    return extractLinks(html, url);
  } catch (error) {
    console.error(`Error fetching and extracting links from ${url}:`, error);
    return [];
  }
}

/**
 * Client-side implementation of site audit
 * Uses the individual page analysis API endpoint to analyze multiple pages
 */
export async function performClientSideAudit(
  url: string, 
  options: SiteAuditOptions = {}
): Promise<any> {
  // Start time
  const startTime = Date.now();
  
  // Normalize URL
  const normalizedUrl = normalizeUrl(url);
  const baseDomain = extractDomain(normalizedUrl);
  
  // Set defaults and limits
  const maxPages = Math.min(options.maxPages || 5, 10);
  const maxDepth = Math.min(options.maxDepth || 2, 3);
  const onProgress = options.onProgress || ((progress, message) => {
    console.log(`Progress: ${progress}% - ${message}`);
  });
  
  // Set up data structures
  const discoveredUrls = new Set<string>([normalizedUrl]);
  const crawledUrls = new Set<string>();
  const pageResults: any[] = [];
  let urlsToVisit: PageLink[] = [{ url: normalizedUrl, text: 'Homepage', depth: 0 }];
  
  // Report initial progress
  onProgress(0, 'Starting site audit...');
  
  // Process custom pages if provided
  if (options.customPages && options.customPages.length > 0) {
    // Clear default URLs and use custom pages
    urlsToVisit = [];
    discoveredUrls.clear();
    
    // Add all custom pages
    options.customPages.forEach(pageUrl => {
      const normalized = normalizeUrl(pageUrl);
      discoveredUrls.add(normalized);
      urlsToVisit.push({
        url: normalized,
        text: 'Custom page',
        depth: 0
      });
    });
    
    onProgress(10, `Using ${urlsToVisit.length} custom pages`);
  } else {
    // If not using custom pages, try to discover links from the homepage
    try {
      onProgress(10, 'Discovering links from homepage...');
      
      // Fetch homepage and extract links
      const links = await fetchAndExtractLinks(normalizedUrl);
      
      // Add links to discovery queue
      links.forEach(link => {
        if (!discoveredUrls.has(link)) {
          discoveredUrls.add(link);
          urlsToVisit.push({
            url: link,
            text: 'Discovered link',
            depth: 1
          });
        }
      });
      
      onProgress(20, `Discovered ${links.length} links from homepage`);
    } catch (error) {
      console.error('Error discovering links:', error);
      onProgress(20, 'Error discovering links, proceeding with homepage only');
    }
  }
  
  // Limit the number of pages to process
  if (urlsToVisit.length > maxPages) {
    console.log(`Limiting URLs to visit from ${urlsToVisit.length} to ${maxPages}`);
    urlsToVisit = urlsToVisit.slice(0, maxPages);
  }
  
  // Set up the total pages to process
  const totalPages = urlsToVisit.length;
  
  // Process each URL to analyze
  for (let i = 0; i < urlsToVisit.length && crawledUrls.size < maxPages; i++) {
    const { url, depth } = urlsToVisit[i];
    
    // Skip if already crawled
    if (crawledUrls.has(url)) {
      continue;
    }
    
    // Report progress
    const progressPercent = Math.round(((i + 1) / totalPages) * 70) + 20;
    onProgress(progressPercent, `Analyzing page ${i + 1} of ${totalPages}: ${url}`);
    
    try {
      // Analyze the page using the API
      const analysis = await apiClient.quickSeoAnalysis(url);
      pageResults.push(analysis.data);
      crawledUrls.add(url);
      
      // Discover more links if needed (only for lower depths)
      if (depth < maxDepth - 1 && crawledUrls.size < maxPages && urlsToVisit.length < maxPages) {
        try {
          // Fetch links from the page
          const links = await fetchAndExtractLinks(url);
          
          // Add new links to visit
          for (const link of links) {
            if (!discoveredUrls.has(link) && urlsToVisit.length < maxPages) {
              discoveredUrls.add(link);
              urlsToVisit.push({
                url: link,
                text: 'Discovered link',
                depth: depth + 1
              });
            }
          }
        } catch (error) {
          console.error(`Error discovering links from ${url}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error analyzing ${url}:`, error);
      
      // Add error result
      pageResults.push({
        url,
        score: 0,
        status: 'error',
        error: {
          message: `Analysis failed: ${(error as Error).message}`
        }
      });
      
      // Still mark as crawled
      crawledUrls.add(url);
    }
  }
  
  // Report final analysis progress
  onProgress(90, 'Generating site audit report...');
  
  // Calculate overall score
  let totalScore = 0;
  let validScores = 0;
  
  pageResults.forEach(result => {
    if (typeof result.score === 'number' && !isNaN(result.score)) {
      totalScore += result.score;
      validScores++;
    }
  });
  
  const averageScore = validScores > 0 ? Math.round(totalScore / validScores) : 0;
  
  // Extract all issues from results
  const allIssues: any[] = [];
  
  pageResults.forEach(result => {
    if (result.categories) {
      Object.values(result.categories).forEach((category: any) => {
        if (category.issues && Array.isArray(category.issues)) {
          category.issues.forEach((issue: any) => {
            allIssues.push({
              url: result.url,
              ...issue
            });
          });
        }
      });
    }
  });
  
  // Group issues by type
  const issuesByType: Record<string, any[]> = {};
  allIssues.forEach(issue => {
    const type = issue.type || 'unknown_issue';
    if (!issuesByType[type]) {
      issuesByType[type] = [];
    }
    issuesByType[type].push(issue);
  });
  
  // Calculate issue frequency
  const commonIssues = Object.entries(issuesByType)
    .map(([type, issues]) => ({
      type,
      frequency: issues.length,
      severity: issues[0]?.severity || 'info',
      impact: issues[0]?.impact || 'medium',
      urls: issues.map(issue => issue.url),
      recommendation: issues[0]?.recommendation || 'Fix this issue to improve SEO'
    }))
    .sort((a, b) => b.frequency - a.frequency);
  
  // End time and duration
  const endTime = Date.now();
  const auditDuration = endTime - startTime;
  
  // Report completion
  onProgress(100, 'Site audit completed!');
  
  // Prepare final result
  return {
    startUrl: normalizedUrl,
    baseDomain,
    score: averageScore,
    status: averageScore >= 80 ? 'good' : averageScore >= 50 ? 'needs_improvement' : 'poor',
    siteAnalysis: {
      averageScore,
      commonIssues: commonIssues.slice(0, 10), // Top 10 common issues
      pages: pageResults.map(result => ({
        url: result.url,
        score: result.score || 0,
        title: result.pageData?.title?.text || '',
        status: result.status || 'unknown',
        issues: result.totalIssuesCount || 0,
        criticalIssues: result.criticalIssuesCount || 0
      }))
    },
    pageResults,
    crawlStats: {
      pagesDiscovered: discoveredUrls.size,
      pagesCrawled: crawledUrls.size,
      pagesFailed: pageResults.filter(r => r.status === 'error').length,
      maxDepthReached: maxDepth,
      crawlDuration: auditDuration
    },
    stats: {
      analysisTime: auditDuration,
      pageCount: pageResults.length
    },
    clientSideCrawling: true,
    timestamp: new Date().toISOString()
  };
}

export default {
  performClientSideAudit
};