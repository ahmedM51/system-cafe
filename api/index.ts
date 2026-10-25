import express, { Request, Response, NextFunction } from 'express';
import { createCafeApiRouter } from '../server/api';

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
  res.json({ status: 'ok', serverless: true, node: process.version, time: new Date().toISOString() });
});

// MongoDB router is loaded lazily so a failure inside the database driver
// cannot crash every API route of the deployment.
let mongoRouter: express.Router | null = null;
let mongoLoadError: string | null = null;

async function getMongoRouter(): Promise<express.Router | null> {
  if (mongoRouter) return mongoRouter;
  if (mongoLoadError) return null;
  try {
    const mod = await import('../server/mongodb');
    mongoRouter = mod.createMongoApiRouter();
    return mongoRouter;
  } catch (err: any) {
    mongoLoadError = err?.message || String(err);
    console.error('Failed to load MongoDB router:', mongoLoadError);
    return null;
  }
}

// Mount routers to support both /api/mongo and /mongo (due to Vercel URL rewrites)
app.use(['/api/mongo', '/mongo'], async (req: Request, res: Response, next: NextFunction) => {
  const router = await getMongoRouter();
  if (!router) {
    return res.status(503).json({
      success: false,
      message: 'خدمة قاعدة البيانات غير متاحة حالياً على السيرفر.',
      error: mongoLoadError,
      node: process.version,
    });
  }
  router(req, res, next);
});

// Cafe CMS routers
app.use('/api', createCafeApiRouter());

export default app;
