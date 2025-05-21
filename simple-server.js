const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Marden SEO Audit Tool</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
          h1 { color: #333; }
        </style>
      </head>
      <body>
        <h1>Marden SEO Audit Tool</h1>
        <p>Simple test page for Railway deployment</p>
        <p>Environment: ${process.env.NODE_ENV || 'development'}</p>
        <p>API URL: ${process.env.VITE_API_URL || 'not set'}</p>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});