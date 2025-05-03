const express = require('express');
const axios = require('axios');
const {  isValidURL, normalizeURL } = require('./lib/utils');
const redis = require('./lib/redis');
const { getLinks } = require('./lib/scraper');

const app = express();

app.use(express.json());

// Health Check Endpoint
app.get('/health', async (req, res) => {
    try {
    const redisStatus = await redis.ping();
    res.json({
      status: 'ok',
      message: 'API is running. Axios is installed.',
      redis: redisStatus ? 'ok' : 'down',
      endpoints: {
        health: '/api/health',
        basic: '/api/basic-audit?url=example.com',
        seo: '/api/seo-analyze?url=example.com',
        real: '/api/real-seo-audit?url=example.com',
      },
      timestamp: new Date().toISOString(),
    });
    } catch (error) {
    console.error('Error during health check:', error);
    res.status(500).json({ message: 'Internal Server Error during health check' });  }
});

// Audit Page Endpoint
app.post('/audit/page', async (req, res) => {
    const { url } = req.body;

    // Input Validation
    if (!url) {
        return res.status(400).json({ message: 'URL is required.' });
    }

    if (!isValidURL(url)) {
        return res.status(400).json({ message: 'Invalid URL format.' });
    }

    const sanitizedUrl = normalizeURL(url);

    try {
        // Check Redis Cache
        const cachedResult = await redis.get(`seo-audit:${sanitizedUrl}`);
        if (cachedResult) {
            return res.json(JSON.parse(cachedResult));
        }

        // Call /api/real-seo-audit
        const auditResponse = await axios.post('https://marden-audit-backend-se9t-aaydcb4x1-leo-corbetts-projects.vercel.app/api/real-seo-audit', {
            url: sanitizedUrl,
        });

        const auditResult = auditResponse.data;

        // Store in Redis
        await redis.set(`seo-audit:${sanitizedUrl}`, JSON.stringify(auditResult), { ex: 86400 }); // 24 hours

        // Return Result
        res.json(auditResult);
    } catch (error) {
        console.error('Error during audit:', error);
         if (error.response) {
          return res.status(error.response.status).json({ message: error.response.data.message || 'Error from real-seo-audit service.' });
        } else if (error.request) {
          return res.status(500).json({ message: 'No response received from real-seo-audit service.' });
        } else {
          return res.status(500).json({ message: 'Error setting up request to real-seo-audit service.' });
        }
    }
});

module.exports = app;