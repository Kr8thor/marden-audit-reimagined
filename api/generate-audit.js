// Dedicated audit generation endpoint that only returns audit results
module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Origin, Cache-Control');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract URL and validate
  let url = "example.com";
  if (req.query && req.query.url) {
    url = req.query.url;
  } else if (req.body && req.body.url) {
    url = req.body.url;
  }
  
  console.log(`Generating audit for: ${url}`);
  
  // Generate a score that changes slightly for each domain
  let score = 78;
  try {
    // Clean URL for consistency
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    const domain = new URL(url).hostname;
    // Generate a score based on domain name
    const sum = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    score = 65 + (sum % 25); // Score between 65-90
  } catch (e) {
    console.error('URL parsing error:', e);
  }
  
  // Generate metrics based on score
  const lcpValue = (3.5 - (score / 50)).toFixed(1);
  const lcpScore = 100 - (Number(lcpValue) * 20);
  
  const clsValue = (0.3 - (score / 1000)).toFixed(2);
  const clsScore = 100 - (Number(clsValue) * 250);
  
  const fidValue = Math.floor(300 - (score * 2));
  const fidScore = 100 - (fidValue / 4);
  
  const issuesFound = Math.floor(25 - (score / 5));
  const opportunities = Math.floor(10 - (score / 10));
  
  // Return mock audit result
  return res.status(200).json({
    url: url,
    score: score,
    issuesFound: issuesFound,
    opportunities: opportunities,
    performanceMetrics: {
      lcp: {
        value: Number(lcpValue),
        unit: 's',
        score: Math.floor(lcpScore),
      },
      cls: {
        value: Number(clsValue),
        score: Math.floor(clsScore),
      },
      fid: {
        value: fidValue,
        unit: 'ms',
        score: Math.floor(fidScore),
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
    ]
  });
};