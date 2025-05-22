<<<<<<< HEAD
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
=======
// Simple Express server for serving the built frontend
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read API URL from .env file
let apiUrl = 'Not found in .env file';
let apiFallbackUrl = 'Not found in .env file';
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const apiMatch = envFile.match(/VITE_API_URL=(.+)/);
  if (apiMatch && apiMatch[1]) {
    apiUrl = apiMatch[1];
  }
  
  const fallbackMatch = envFile.match(/VITE_API_FALLBACK_URL=(.+)/);
  if (fallbackMatch && fallbackMatch[1]) {
    apiFallbackUrl = fallbackMatch[1];
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

const app = express();
const port = process.env.PORT || 9090;
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93

// Serve static files from the public directory
app.use(express.static('public'));

<<<<<<< HEAD
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});
=======
// Add basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Marden SEO Audit Frontend is operational',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    api: {
      primary: apiUrl,
      fallback: apiFallbackUrl
    },
    server: {
      port: port,
      staticPath: path.join(__dirname, 'dist')
    }
  });
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93

// Handle all routes and serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
<<<<<<< HEAD
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
=======
app.listen(port, () => {
  console.log(`[${new Date().toISOString()}] Server running at http://localhost:${port}`);
  console.log(`[${new Date().toISOString()}] Serving content from: ${path.join(__dirname, 'dist')}`);
  console.log(`[${new Date().toISOString()}] Using API URL: ${apiUrl}`);
  console.log(`[${new Date().toISOString()}] Using Fallback API URL: ${apiFallbackUrl}`);
>>>>>>> 3f9ce80a49067a196ab3a53abca11710d3d0ae93
});