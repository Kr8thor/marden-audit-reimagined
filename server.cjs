const express = require('express');
const path = require('path');
const compression = require('compression');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable gzip compression
app.use(compression());

console.log('Starting Marden SEO Audit Tool server...');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`API URL: ${process.env.VITE_API_URL || 'https://marden-audit-backend-production.up.railway.app'}`);

// Check if the dist directory exists
if (fs.existsSync(path.join(__dirname, 'dist'))) {
  console.log('Dist directory found, serving React application');
  
  // Serve static files from the React app build directory
  app.use(express.static(path.join(__dirname, 'dist')));
  
  // Handle React routing, return the main index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  console.log('Dist directory not found, serving fallback page');
  
  // Fallback page if dist is not available
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Marden SEO Audit Tool</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            h1 { color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .message { background-color: #f8f9fa; border-radius: 5px; padding: 20px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Marden SEO Audit Tool</h1>
            <p>Application build files not found.</p>
            <div class="message">
              <p>Please build the application first with: <code>npm run build</code></p>
              <p>Or visit our main site at <a href="https://audit.mardenseo.com">audit.mardenseo.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `);
  });
}

// Health check endpoint (required by Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Marden SEO Audit Tool frontend is operational',
    timestamp: new Date().toISOString()
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});