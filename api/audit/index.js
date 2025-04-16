// Generic audit endpoint that handles both page and site audits
const { createJob } = require('../lib/redis.js');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      status: 'error', 
      message: 'Method not allowed' 
    });
  }

  try {
    const { url, options } = req.body;
    
    // Validate URL
    if (!url) {
      return res.status(400).json({
        status: 'error',
        message: 'URL is required',
      });
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid URL provided',
      });
    }
    
    // Determine if this is a site or page audit (simplified for now)
    const jobType = options?.auditType || 'page_audit';
    
    // Create job and add to queue
    const jobId = await createJob({
      type: jobType,
      params: {
        url,
        options: options || {},
      },
    });

    // For demo/testing purposes we're returning a mock result immediately
    // In production, this would return a jobId and the client would poll for results
    const mockAuditResult = {
      url: url,
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
    };
    
    // Return success response with mock data for now
    return res.status(200).json(mockAuditResult);
  } catch (error) {
    // Handle errors
    console.error('Error creating audit job:', error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create audit job',
      error: error.message,
    });
  }
};