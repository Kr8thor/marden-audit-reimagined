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
try {
  const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
  const match = envFile.match(/VITE_API_URL=(.+)/);
  if (match && match[1]) {
    apiUrl = match[1];
  }
} catch (err) {
  console.error('Error reading .env file:', err);
}

const app = express();
const port = process.env.PORT || 8081;

// Enable CORS for all requests
app.use(cors());

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all routes by sending index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Serving content from: ${path.join(__dirname, 'dist')}`);
  console.log(`Using API URL from .env: ${apiUrl}`);
});