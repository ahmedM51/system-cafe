import express, { Request, Response, NextFunction } from 'express';
import { createCafeApiRouter } from '../server/api';
import { createMongoApiRouter } from '../server/mongodb';

const app = express();

// CORS Middleware to allow requests from https://system-cafe.vercel.app and preview domains
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health checks
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({ status: 'ok', serverless: true, time: new Date().toISOString() });
});

// Mount routers to support both /api/mongo and /mongo (due to Vercel URL rewrites)
app.use('/api/mongo', createMongoApiRouter());
app.use('/mongo', createMongoApiRouter());

// Cafe CMS routers
app.use('/api', createCafeApiRouter());

export default app;
