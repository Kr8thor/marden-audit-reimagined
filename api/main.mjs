import express from 'express';  
const app = express();
import cors from 'cors';
import routes from './src/api/routes.mjs';
import dotenv from 'dotenv';

dotenv.config();

app.use(cors({
  origin: 'http://localhost:3000'
}));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Marden SEO Audit API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.use('/api', routes);

app.use(express.json());

export default app;