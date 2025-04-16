module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check if this is an audit request
  if (req.url.includes('/audit') && req.method === 'POST') {
    try {
      const { url } = req.body;
      
      // Validate URL
      if (!url) {
        return res.status(400).json({
          status: 'error',
          message: 'URL is required',
        });
      }
      
      // For demo/testing purposes we're returning a mock result immediately
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
  }
  
  // Default response for API root
  res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      { path: '/api', method: 'GET', description: 'API status' },
      { path: '/api/audit', method: 'POST', description: 'Run an SEO audit', params: { url: 'Website URL to audit' } }
    ]
  });
};