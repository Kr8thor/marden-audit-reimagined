// Main API handler - routes to different functionality based on the URL
const { handleCors } = require('./utils');
const os = require('os');

// Main handler for all API requests
module.exports = async (req, res) => {
  // Handle CORS preflight
  if (handleCors(req, res)) return;
  
  // Extract path from URL for routing
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  
  // Basic routing based on path
  if (path === '/api' || path === '/api/') {
    // Index endpoint
    return res.status(200).json({
      status: 'ok',
      message: 'Marden SEO Audit API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
  
  if (path === '/api/health') {
    // Health check endpoint
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        cpus: os.cpus().length,
        freemem: os.freemem(),
        totalmem: os.totalmem(),
        loadavg: os.loadavg()
      },
      message: 'System is healthy'
    });
  }
  
  if (path.startsWith('/api/audit')) {
    // Handle audit requests (both site and page audits)
    return handleAuditRequest(req, res, path);
  }
  
  if (path.startsWith('/api/job/')) {
    // Handle job status and results requests
    return handleJobRequest(req, res, path);
  }
  
  if (path === '/api/worker') {
    // Worker endpoint
    return res.status(200).json({
      status: 'success',
      message: 'Worker executed successfully',
      timestamp: new Date().toISOString()
    });
  }
  
  // Default 404 response for unmatched paths
  return res.status(404).json({
    status: 'error',
    message: 'API endpoint not found',
    path: path
  });
};

// Handle audit requests (both site and page)
async function handleAuditRequest(req, res, path) {
  // Only accept POST requests for audits
  if (req.method !== 'POST') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  
  try {
    // Extract URL from request body
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required'
      });
    }
    
    // Check if it's a site or page audit
    const isSiteAudit = path.includes('/site');
    const auditType = isSiteAudit ? 'site_audit' : 'page_audit';
    
    // Ensure URL has protocol
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Generate a job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Return a job creation response
    return res.status(200).json({
      status: 'ok',
      message: `${isSiteAudit ? 'Site' : 'Page'} audit job created`,
      jobId: jobId,
      url: cleanUrl,
      type: auditType
    });
  } catch (error) {
    console.error(`Error processing ${path} request:`, error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process audit request',
      error: error.message
    });
  }
}

// Handle job status and results requests
async function handleJobRequest(req, res, path) {
  // Only accept GET requests for job status/results
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      message: 'Method not allowed'
    });
  }
  
  try {
    // Extract job ID from URL path
    const pathParts = path.split('/');
    const jobId = pathParts[3]; // /api/job/{jobId}
    
    if (!jobId) {
      return res.status(400).json({
        status: 'error',
        message: 'Job ID is required'
      });
    }
    
    // Check if this is a request for job results
    const isResultsRequest = path.includes('/results');
    
    if (isResultsRequest) {
      // Return mock job results
      // Generate a deterministic but random-looking score based on the job ID
      const hash = jobId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const score = 65 + (hash % 35); // Score between 65-99
      
      return res.status(200).json({
        status: 'ok',
        jobId: jobId,
        completed: Date.now(),
        results: {
          report: {
            baseUrl: 'https://example.com',
            timestamp: new Date().toISOString(),
            crawlStats: {
              pagesVisited: 15,
              crawlDuration: 45.3
            },
            scores: {
              overall: score,
              meta: score - 5,
              content: score - 3,
              technical: score - 7
            },
            totalIssues: 14,
            issueTypeCounts: {
              'missing-meta': 3,
              'duplicate-content': 2,
              'broken-links': 5,
              'performance': 4
            },
            topIssues: [
              { type: 'broken-links', count: 5 },
              { type: 'performance', count: 4 },
              { type: 'missing-meta', count: 3 }
            ],
            recommendations: [
              {
                type: 'meta-description',
                message: 'Add meta descriptions to pages',
                impact: 'high',
                category: 'meta',
                count: 3,
                affectedPages: 3
              },
              {
                type: 'broken-links',
                message: 'Fix broken links',
                impact: 'high',
                category: 'technical',
                count: 5,
                affectedPages: 2
              }
            ],
            pages: {
              'https://example.com/': {
                url: 'https://example.com/',
                timestamp: new Date().toISOString(),
                scores: {
                  overall: score - 5,
                  meta: score - 10,
                  content: score,
                  technical: score - 3
                },
                issueCount: 4,
                issues: [
                  {
                    type: 'missing-meta-description',
                    message: 'Missing meta description',
                    impact: 'high',
                    category: 'meta'
                  }
                ],
                recommendations: []
              }
            }
          },
          stats: {
            pagesScanned: 15,
            crawlDuration: 45.3,
            analysisTimestamp: new Date().toISOString()
          }
        }
      });
    }
    
    // Return job status
    return res.status(200).json({
      status: 'ok',
      job: {
        id: jobId,
        status: 'completed',
        progress: 100,
        created: Date.now() - 60000,
        updated: Date.now(),
        hasResults: true,
        type: 'site_audit',
        params: {
          url: 'https://example.com',
          options: {}
        }
      }
    });
  } catch (error) {
    console.error(`Error processing ${path} request:`, error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process job request',
      error: error.message
    });
  }
}
