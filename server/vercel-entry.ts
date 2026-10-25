import express, { Request, Response, NextFunction } from 'express';

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

// Health checks — always available, even when a sub-router fails to load,
// so a broken dependency can never turn every route into a blank 500.
app.get(['/api/health', '/health'], (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serverless: true,
    node: process.version,
    time: new Date().toISOString(),
    cafeRouterLoaded: !!cafeRouter,
    cafeRouterError: cafeLoadError,
  });
});

// Routers are loaded lazily so a failure inside one of them cannot crash
// the whole serverless function and can be reported back as JSON.
let mongoRouter: express.Router | null = null;
let mongoLoadError: string | null = null;
let mongoLoadStack: string | null = null;

async function getMongoRouter(): Promise<express.Router | null> {
  if (mongoRouter) return mongoRouter;
  if (mongoLoadError) return null;
  try {
    const mod = await import('./mongodb');
    mongoRouter = mod.createMongoApiRouter();
    return mongoRouter;
  } catch (err: any) {
    mongoLoadError = err?.message || String(err);
    mongoLoadStack = err?.stack || null;
    console.error('Failed to load MongoDB router:', mongoLoadError, mongoLoadStack);
    return null;
  }
}

let cafeRouter: express.Router | null = null;
let cafeLoadError: string | null = null;
let cafeLoadStack: string | null = null;

async function getCafeRouter(): Promise<express.Router | null> {
  if (cafeRouter) return cafeRouter;
  if (cafeLoadError) return null;
  try {
    const mod = await import('./api');
    cafeRouter = mod.createCafeApiRouter();
    return cafeRouter;
  } catch (err: any) {
    cafeLoadError = err?.message || String(err);
    cafeLoadStack = err?.stack || null;
    console.error('Failed to load cafe router:', cafeLoadError, cafeLoadStack);
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
      stack: mongoLoadStack,
      node: process.version,
    });
  }
  router(req, res, next);
});

// Cafe CMS routers
app.use('/api', async (req: Request, res: Response, next: NextFunction) => {
  const router = await getCafeRouter();
  if (!router) {
    return res.status(503).json({
      success: false,
      message: 'خدمة الكافيه غير متاحة حالياً على السيرفر.',
      error: cafeLoadError,
      stack: cafeLoadStack,
      node: process.version,
    });
  }
  router(req, res, next);
});

// Last-resort error handler so unexpected exceptions are returned as JSON
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API error:', err?.message || err, err?.stack);
  res.status(500).json({
    success: false,
    message: 'خطأ غير متوقع في السيرفر.',
    error: err?.message || String(err),
    stack: err?.stack || null,
  });
});

export default app;
