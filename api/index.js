// Combined index and audit endpoints for Vercel serverless function
const { generateAudit } = require('./generate-audit');


module.exports = async (req, res) => {
  // Enable CORS
  const allowedOrigins = ['https://audit.mardenseo.com', 'http://localhost:3000'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Cache-Control');


  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // For debugging - log the request details
  console.log('Request URL:', req.url);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', req.headers);
  
  // POST requests are for audit
  if (req.method === 'POST') {
    try {
      // Extract URL from request body with extra safety checks
      let requestBody = req.body;
      let url = null;
      
      // Handle different body formats
      if (requestBody) {
        if (typeof requestBody === 'object') {
          url = requestBody.url;
        } else if (typeof requestBody === 'string') {
          try {
            const parsed = JSON.parse(requestBody);
            url = parsed.url;
          } catch (e) {
            console.error('Failed to parse string body:', e);
          }
        }
      }
      
      console.log('Extracted URL:', url);
      
      // Validate URL
      if (!url) {
        return res.status(400).json({
          status: 'error',
          message: 'URL is required',
        });
      }

      const auditResult = await generateAudit(url);
      
      // Set explicit content type
      res.setHeader('Content-Type', 'application/json');
      
      // Return success response with actual audit data
      return res.status(200).json(auditResult);
    } catch (error) {
      // Handle errors
      console.error('Error handling audit request:', error);
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process audit request',
        error: error.message,
      });
    }
  }
  
  // GET requests return API status
  return res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    note: 'POST to this same endpoint to run an audit with {"url":"your-website.com"}'
  });
};