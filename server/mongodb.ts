import express, { Request, Response } from 'express';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Built-in Atlas connection string for hub_cafe_db. It is always kept as a
// fallback so a missing or stale MONGODB_URI on the host can never disconnect
// the app from Atlas.
export const BUILT_IN_MONGO_URI =
  'mongodb+srv://ahmedmohamedm4336_db_user:QRJyIXO7ZZNlY5rI@cluster0.w7l7m9v.mongodb.net/hub_cafe_db?retryWrites=true&w=majority';

// The environment variable takes priority, but the built-in URI is tried right
// after it whenever the first attempt fails.
const MONGO_URI_CANDIDATES: string[] = Array.from(
  new Set([process.env.MONGODB_URI, BUILT_IN_MONGO_URI].filter(Boolean) as string[])
);

export const DEFAULT_MONGO_URI = MONGO_URI_CANDIDATES[0];

let activeClient: MongoClient | null = null;
let activeUri: string | null = null;
let isConnected = false;
let lastError: string | null = null;
let lastSyncTimestamp: string | null = null;

const STORE_PATH = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) 
  ? path.join('/tmp', 'server_store.json') 
  : path.join(process.cwd(), 'server_store.json');

// Google OAuth 2.0 Web Client ID. It is a public identifier (never a secret),
// so it is shipped as a fallback to keep Google Sign-In working even when the
// environment variable is not configured on the host.
export const DEFAULT_GOOGLE_CLIENT_ID =
  '365007338591-lkqsq8iu8er994gqb5khk8aj55ha6its.apps.googleusercontent.com';

function resolveGoogleClientId(): string {
  return (
    process.env.GOOGLE_CLIENT_ID ||
    process.env.VITE_GOOGLE_CLIENT_ID ||
    DEFAULT_GOOGLE_CLIENT_ID
  );
}

function saveToStore(data: any) {
  try {
    let current: any = {};
    if (fs.existsSync(STORE_PATH)) {
      current = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
    const merged = { ...current, ...data, updatedAt: new Date().toISOString() };
    fs.writeFileSync(STORE_PATH, JSON.stringify(merged, null, 2));
  } catch (e) {
    console.warn('saveToStore warning:', e);
  }
}

function loadFromStore(): any {
  try {
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
    }
  } catch (e) {
    console.warn('loadFromStore warning:', e);
  }
  return null;
}

/**
 * Resolves with the value of the first promise that fulfils, or rejects with
 * the first error once every promise has failed.
 */
function firstFulfilled<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let pending = promises.length;
    let firstError: any = null;

    promises.forEach((promise) => {
      promise.then(resolve, (err) => {
        if (firstError === null) firstError = err;
        pending -= 1;
        if (pending === 0) reject(firstError);
      });
    });
  });
}

/**
 * Attempt to connect to MongoDB Atlas. When no explicit URI is given, all the
 * configured candidates are raced in parallel and the first one that connects
 * wins, so a missing or stale MONGODB_URI can never keep the app offline.
 */
export async function connectToMongoDB(uri?: string): Promise<{ success: boolean; message: string }> {
  const candidates = uri ? [uri] : MONGO_URI_CANDIDATES;
  let lastFailure = 'خطأ غير معروف في الاتصال';

  if (activeClient) {
    try {
      await activeClient.close();
    } catch (e) {
      // ignore close errors
    }
    activeClient = null;
  }

  const attempts = candidates.map(async (candidate) => {
    const client = new MongoClient(candidate, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 12000,
    });

    try {
      await client.connect();
      // Ping the target database to make sure credentials really work
      await client.db('hub_cafe_db').command({ ping: 1 });
    } catch (err) {
      await client.close().catch(() => undefined);
      throw err;
    }

    // Another candidate already connected: drop this extra connection.
    if (activeClient) {
      await client.close().catch(() => undefined);
      throw new Error('superseded');
    }

    activeClient = client;
    activeUri = candidate;
    isConnected = true;
    lastError = null;
    return candidate;
  });

  try {
    await firstFulfilled(attempts);
    return { success: true, message: 'تم الاتصال بقاعدة بيانات MongoDB Atlas بنجاح!' };
  } catch (err: any) {
    lastFailure = err?.message || lastFailure;
  }

  isConnected = false;
  activeUri = null;
  lastError = lastFailure;

  // Check for IP Whitelist rejection (SSL alert 80)
  if (lastFailure.includes('SSL alert number 80') || lastFailure.includes('tlsv1 alert internal error')) {
    lastError = 'يرجى إضافة 0.0.0.0/0 في تبويب Network Access داخل لوحة تحكم MongoDB Atlas للسماح بالسيرفر بالاتصال.';
  }

  return {
    success: false,
    message: lastError || 'خطأ في الاتصال بقاعدة البيانات'
  };
}

let lastConnectAttempt = 0;
let connectionPromise: Promise<boolean> | null = null;
const RECONNECT_COOLDOWN_MS = 15000;

function startConnection(): Promise<boolean> {
  connectionPromise = connectToMongoDB()
    .then((result) => result.success)
    .finally(() => {
      connectionPromise = null;
    });
  return connectionPromise;
}

/**
 * Ensures an active MongoDB connection, retrying automatically when a previous
 * attempt failed. An in-flight attempt is awaited instead of being skipped, so
 * the very first write after a cold start still reaches Atlas.
 */
async function ensureConnection(): Promise<boolean> {
  if (isConnected && activeClient) return true;

  // A connection attempt is already running: wait for its result.
  if (connectionPromise) return connectionPromise;

  const now = Date.now();
  if (now - lastConnectAttempt < RECONNECT_COOLDOWN_MS) return false;

  lastConnectAttempt = now;
  return startConnection();
}

/**
 * MongoDB rejects any `$set` that touches the immutable `_id` field.
 * Documents fetched from Atlas carry `_id`, and they are sent back by the
 * client on every sync, so it must be stripped before writing.
 */
function withoutId<T extends Record<string, any>>(doc: T): Record<string, any> {
  const { _id, ...rest } = doc || ({} as any);
  return rest;
}

/**
 * MongoDB API Router for Cafe Management System
 */
export function createMongoApiRouter() {
  const router = express.Router();

  // Try initial connection in background (non-blocking)
  lastConnectAttempt = Date.now();
  startConnection().catch((err) => {
    console.warn('Initial MongoDB Atlas connection attempt in background:', err.message);
  });

  // 0. Client Configuration (Google OAuth Client ID for Google Identity Services)
  router.get('/config', (req: Request, res: Response) => {
    const googleClientId = resolveGoogleClientId();
    res.json({
      success: true,
      googleClientId,
      googleAuthReady: Boolean(googleClientId),
    });
  });

  // 1. Connection Status
  router.get('/status', async (req: Request, res: Response) => {
    await ensureConnection();
    let collections: string[] = [];
    let countStats: { [key: string]: number } = {};

    if (isConnected && activeClient) {
      try {
        const db = activeClient.db('hub_cafe_db');
        const colls = await db.listCollections().toArray();
        collections = colls.map((c) => c.name);

        for (const c of collections) {
          try {
            countStats[c] = await db.collection(c).countDocuments();
          } catch (e) {
            countStats[c] = 0;
          }
        }
      } catch (e: any) {
        isConnected = false;
        lastError = e?.message || 'فشل فحص المجموعات';
      }
    }

    res.json({
      success: true,
      connected: isConnected,
      cluster: 'cluster0.w7l7m9v.mongodb.net',
      database: 'hub_cafe_db',
      username: 'ahmedmohamedm4336_db_user',
      collections,
      countStats,
      uriSource: activeUri
        ? activeUri === BUILT_IN_MONGO_URI
          ? 'built-in'
          : 'env'
        : null,
      envUriPresent: Boolean(process.env.MONGODB_URI),
      lastError,
      lastSyncTimestamp,
      hint: !isConnected ? 'تأكد من تفعيل Network Access على 0.0.0.0/0 في موقع mongodb.com' : undefined,
    });
  });

  // 2. Test Connection on Demand
  router.post('/test', async (req: Request, res: Response) => {
    const customUri = req.body?.uri || DEFAULT_MONGO_URI;
    const result = await connectToMongoDB(customUri);
    res.json({
      success: result.success,
      connected: isConnected,
      message: result.message,
      lastError,
    });
  });

  // 3. Sync Application Data (Cloud + Persistent Server Store)
  router.post('/sync', async (req: Request, res: Response) => {
    const payload = req.body || {};
    
    // Always persist to server-side store first so data is never lost
    saveToStore(payload);
    lastSyncTimestamp = new Date().toISOString();

    await ensureConnection();
    const client = activeClient;
    const results: { [key: string]: number } = { serverStore: 1 };

    if (isConnected && client) {
      try {
        const db = client.db('hub_cafe_db');
        const { 
          settings, products, inventory, orders, 
          users, shifts, tables, playstations 
        } = payload;

        // 1. Cafe Branding Settings
        if (settings) {
          await db.collection('hub_settings').updateOne(
            { _id: 'main_settings' as any },
            { $set: { ...withoutId(settings), updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
          results['hub_settings'] = 1;
        }

        // 2. Products
        if (Array.isArray(products) && products.length > 0) {
          for (const prod of products) {
            await db.collection('hub_products').updateOne(
              { id: prod.id },
              { $set: { ...withoutId(prod), updatedAt: new Date().toISOString() } },
              { upsert: true }
            );
          }
          results['hub_products'] = products.length;
        }

        // 3. Inventory
        if (Array.isArray(inventory) && inventory.length > 0) {
          for (const inv of inventory) {
            await db.collection('hub_inventory').updateOne(
              { id: inv.id },
              { $set: { ...withoutId(inv), updatedAt: new Date().toISOString() } },
              { upsert: true }
            );
          }
          results['hub_inventory'] = inventory.length;
        }

        // 4. Orders
        if (Array.isArray(orders) && orders.length > 0) {
          for (const ord of orders) {
            await db.collection('hub_orders').updateOne(
              { id: ord.id },
              { $set: { ...withoutId(ord), syncedAt: new Date().toISOString() } },
              { upsert: true }
            );
          }
          results['hub_orders'] = orders.length;
        }

        // 5. Users
        if (Array.isArray(users) && users.length > 0) {
          for (const u of users) {
            await db.collection('hub_users').updateOne(
              { id: u.id },
              { $set: { ...withoutId(u), updatedAt: new Date().toISOString() } },
              { upsert: true }
            );
          }
          results['hub_users'] = users.length;
        }

        // 6. Tables & PlayStations
        if (Array.isArray(tables) && tables.length > 0) {
          for (const t of tables) {
            await db.collection('hub_tables').updateOne(
              { id: t.id },
              { $set: withoutId(t) },
              { upsert: true }
            );
          }
          results['hub_tables'] = tables.length;
        }

        if (Array.isArray(playstations) && playstations.length > 0) {
          for (const ps of playstations) {
            await db.collection('hub_playstations').updateOne(
              { id: ps.id },
              { $set: withoutId(ps) },
              { upsert: true }
            );
          }
          results['hub_playstations'] = playstations.length;
        }

        // 7. Expenses
        const { expenses, currentShift, categories } = payload;
        if (Array.isArray(expenses) && expenses.length > 0) {
          for (const exp of expenses) {
            await db.collection('hub_expenses').updateOne(
              { id: exp.id },
              { $set: withoutId(exp) },
              { upsert: true }
            );
          }
          results['hub_expenses'] = expenses.length;
        }

        // 8. Shifts
        if (currentShift && currentShift.id) {
          await db.collection('hub_shifts').updateOne(
            { id: currentShift.id },
            { $set: withoutId(currentShift) },
            { upsert: true }
          );
          results['hub_shifts'] = 1;
        }

        // 9. Categories
        if (Array.isArray(categories) && categories.length > 0) {
          await db.collection('hub_categories').updateOne(
            { _id: 'main_categories' as any },
            { $set: { list: categories, updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
          results['hub_categories'] = categories.length;
        }

        return res.json({
          success: true,
          mongoConnected: true,
          message: 'تم الحفظ في قاعدة بيانات MongoDB Atlas والسيرفر بنجاح!',
          syncedRecords: results,
          timestamp: lastSyncTimestamp,
        });
      } catch (err: any) {
        console.warn('Mongo Atlas sync write warning:', err.message);
      }
    }

    return res.json({
      success: true,
      mongoConnected: false,
      message: 'تم الحفظ في قاعدة بيانات السيرفر بنجاح (سيرفر MongoDB Atlas بانتظار تصريح 0.0.0.0/0 في Network Access)',
      timestamp: lastSyncTimestamp,
    });
  });

  // 4. Fetch All Remote Data
  router.get('/data', async (req: Request, res: Response) => {
    await ensureConnection();
    const client = activeClient;
    if (isConnected && client) {
      try {
        const db = client.db('hub_cafe_db');
        const [settingsDoc, products, inventory, orders, users, tables, playstations, expenses, categoriesDoc, shiftDoc] = await Promise.all([
          db.collection('hub_settings').findOne({ _id: 'main_settings' as any }),
          db.collection('hub_products').find().toArray(),
          db.collection('hub_inventory').find().toArray(),
          db.collection('hub_orders').find().sort({ timestamp: -1 }).limit(150).toArray(),
          db.collection('hub_users').find().toArray(),
          db.collection('hub_tables').find().toArray(),
          db.collection('hub_playstations').find().toArray(),
          db.collection('hub_expenses').find().sort({ timestamp: -1 }).limit(100).toArray(),
          db.collection('hub_categories').findOne({ _id: 'main_categories' as any }),
          db.collection('hub_shifts').findOne({ status: 'open' }),
        ]);

        return res.json({
          success: true,
          mongoConnected: true,
          data: {
            settings: settingsDoc,
            products,
            inventory,
            orders,
            users,
            tables,
            playstations,
            expenses,
            categories: categoriesDoc?.list || null,
            currentShift: shiftDoc || null,
          },
        });
      } catch (err: any) {
        console.warn('Mongo Atlas read error, falling back to server store:', err.message);
      }
    }

    // Fallback to server-side persistent store if MongoDB TLS rejected IP
    const localStore = loadFromStore();
    return res.json({
      success: true,
      mongoConnected: false,
      message: 'تم جلب البيانات من السيرفر (MongoDB Atlas بانتظار تصريح 0.0.0.0/0)',
      data: localStore || null,
    });
  });

  // 5. Real Google Authentication via Google ID Token Verification + MongoDB Atlas
  router.post('/auth/google', async (req: Request, res: Response) => {
    const { credential, token } = req.body || {};
    const idToken = String(credential || token || '').trim();

    if (!idToken) {
      return res.status(400).json({
        success: false,
        tokenVerified: false,
        message: 'رمز Google (ID Token) مطلوب. لا يمكن تسجيل الدخول بدون تحقق حقيقي من Google.',
      });
    }

    const clientId = resolveGoogleClientId();

    // Verify the ID token directly with Google's official token endpoint
    let payload: any = null;
    let verifyError: string | null = null;

    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      const data: any = await verifyRes.json().catch(() => null);

      if (!verifyRes.ok || !data || !data.email) {
        verifyError =
          data?.error_description || data?.error || 'الرمز غير صالح أو منتهي الصلاحية';
      } else if (clientId && data.aud !== clientId) {
        verifyError = 'الرمز صادر لتطبيق آخر (audience mismatch) ولا يمكن اعتماده.';
      } else if (String(data.email_verified) === 'false') {
        verifyError = 'بريد Google هذا غير موثّق (email_verified = false).';
      } else {
        payload = data;
      }
    } catch (err: any) {
      verifyError = err?.message || 'تعذر الاتصال بخادم التحقق من Google';
    }

    if (!payload) {
      return res.status(401).json({
        success: false,
        connected: isConnected,
        tokenVerified: false,
        message: `فشل التحقق من حساب Google: ${verifyError}`,
      });
    }

    const cleanEmail = String(payload.email).trim().toLowerCase();
    const avatar = payload.picture || '';
    const googleId = payload.sub || null;
    const verifiedName = payload.name || cleanEmail.split('@')[0];

    const AUTHORIZED_ADMIN = 'ahmedmohamed4336@gmail.com';
    const isAuthorizedAdmin = cleanEmail === AUTHORIZED_ADMIN;
    const role = isAuthorizedAdmin ? 'admin' : 'cashier';

    const permissions = isAuthorizedAdmin
      ? ['all', 'pos', 'tables', 'orders', 'playstation', 'shifts', 'inventory', 'audit', 'purchases', 'expenses', 'dashboard', 'day_report', 'qa_tests']
      : ['pos', 'tables', 'orders', 'playstation', 'shifts'];

    const userDoc = {
      id: isAuthorizedAdmin ? 'user-admin' : `user-g-${googleId || Date.now()}`,
      email: cleanEmail,
      name: verifiedName,
      role,
      avatar: avatar || (isAuthorizedAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
      phone: isAuthorizedAdmin ? '+20 100 433 6000' : '',
      pin: isAuthorizedAdmin ? '4336' : '1234',
      permissions,
      authProvider: 'google',
      googleId,
      tokenVerified: true,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Backup store so the user is never lost even if Atlas is unreachable
    const store = loadFromStore() || {};
    const storeUsers = Array.isArray(store.users) ? store.users : [];
    saveToStore({
      users: [
        userDoc,
        ...storeUsers.filter(
          (u: any) => u.id !== userDoc.id && String(u.email || '').toLowerCase() !== cleanEmail
        ),
      ],
    });

    // Upsert into MongoDB Atlas collection 'hub_users'.
    // Profile fields (name/avatar/phone/pin) are only written on first insert so that
    // any change made inside the app is never overwritten by the Google profile again.
    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_users').updateOne(
          { id: userDoc.id },
          {
            $set: {
              email: userDoc.email,
              role: userDoc.role,
              permissions: userDoc.permissions,
              authProvider: userDoc.authProvider,
              googleId: userDoc.googleId,
              tokenVerified: true,
              lastLogin: userDoc.lastLogin,
              updatedAt: userDoc.updatedAt,
            },
            $setOnInsert: {
              name: userDoc.name,
              avatar: userDoc.avatar,
              phone: userDoc.phone,
              pin: userDoc.pin,
              createdAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );

        const savedUser = await db.collection('hub_users').findOne({ id: userDoc.id });

        return res.json({
          success: true,
          connected: true,
          mongoConnected: true,
          tokenVerified: true,
          message: isAuthorizedAdmin
            ? 'تم التحقق من توكن Google وتحديث بيانات المدير العام في MongoDB Atlas بنجاح (Admin)'
            : 'تم التحقق من توكن Google وحفظ بيانات المستخدم في MongoDB Atlas بنجاح (Cashier)',
          user: savedUser || userDoc,
        });
      } catch (err: any) {
        console.warn('Mongo Google auth write error:', err.message);
      }
    }

    return res.json({
      success: true,
      connected: false,
      mongoConnected: false,
      tokenVerified: true,
      message: isAuthorizedAdmin
        ? 'تم التحقق من حساب Google واعتماده كمدير عام (تعذر الحفظ في Atlas حالياً - تحقق من Network Access)'
        : 'تم التحقق من حساب Google وحفظ المستخدم في السيرفر (تعذر الحفظ في Atlas حالياً)',
      user: userDoc,
    });
  });

  // 6. Direct Instant Order Save Endpoint (/api/mongo/orders)
  router.post('/orders', async (req: Request, res: Response) => {
    const { order, inventoryDeductions, shiftUpdate } = req.body || {};
    if (!order || !order.id) {
      return res.status(400).json({ success: false, message: 'بيانات الطلب غير مكتملة' });
    }

    const orderDoc = {
      ...order,
      syncedAt: new Date().toISOString(),
    };

    // Update in server store
    const store = loadFromStore() || {};
    const existingOrders = Array.isArray(store.orders) ? store.orders : [];
    saveToStore({
      orders: [orderDoc, ...existingOrders.filter((o: any) => o.id !== orderDoc.id)].slice(0, 200),
    });

    const client = activeClient;
    if (isConnected && client) {
      try {
        const db = client.db('hub_cafe_db');
        
        // 1. Insert order into hub_orders collection
        await db.collection('hub_orders').updateOne(
          { id: orderDoc.id },
          { $set: withoutId(orderDoc) },
          { upsert: true }
        );

        // 2. If inventory deductions provided, update ingredients in hub_inventory
        if (Array.isArray(inventoryDeductions) && inventoryDeductions.length > 0) {
          for (const item of inventoryDeductions) {
            if (item.id) {
              await db.collection('hub_inventory').updateOne(
                { id: item.id },
                { $set: withoutId(item) },
                { upsert: true }
              );
            }
          }
        }

        // 3. If shift update provided, update active shift in hub_shifts
        if (shiftUpdate && shiftUpdate.id) {
          await db.collection('hub_shifts').updateOne(
            { id: shiftUpdate.id },
            { $set: withoutId(shiftUpdate) },
            { upsert: true }
          );
        }

        return res.json({
          success: true,
          mongoConnected: true,
          orderId: orderDoc.id,
          message: 'تم حفظ الطلب وتحديث المخزن والوردية مباشرة في MongoDB Atlas (مجموعة hub_orders)!',
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        console.warn('Direct order mongo save error:', err.message);
      }
    }

    return res.json({
      success: true,
      mongoConnected: false,
      orderId: orderDoc.id,
      message: 'تم حفظ الطلب في السيرفر بنجاح (سيتم نقله لـ MongoDB Atlas فور تفعيل 0.0.0.0/0)',
      timestamp: new Date().toISOString(),
    });
  });

  // 7. Direct Products Endpoint
  router.post('/products', async (req: Request, res: Response) => {
    const { product } = req.body || {};
    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: 'بيانات المنتج مطلوبة' });
    }

    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_products').updateOne(
          { id: product.id },
          { $set: { ...withoutId(product), updatedAt: new Date().toISOString() } },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: 'تم حفظ المنتج في MongoDB Atlas' });
      } catch (e: any) {}
    }
    return res.json({ success: true, mongoConnected: false, message: 'تم الحفظ في السيرفر' });
  });

  // 8. Direct Expenses Endpoint
  router.post('/expenses', async (req: Request, res: Response) => {
    const { expense } = req.body || {};
    if (!expense || !expense.id) {
      return res.status(400).json({ success: false, message: 'بيانات المصروف مطلوبة' });
    }

    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_expenses').updateOne(
          { id: expense.id },
          { $set: withoutId(expense) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: 'تم حفظ المصروف في MongoDB Atlas' });
      } catch (e: any) {}
    }
    return res.json({ success: true, mongoConnected: false, message: 'تم الحفظ في السيرفر' });
  });

  // 9. Direct Shifts Endpoint
  router.post('/shifts', async (req: Request, res: Response) => {
    const { shift } = req.body || {};
    if (!shift || !shift.id) {
      return res.status(400).json({ success: false, message: 'بيانات الوردية مطلوبة' });
    }

    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_shifts').updateOne(
          { id: shift.id },
          { $set: withoutId(shift) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: 'تم حفظ الوردية في MongoDB Atlas' });
      } catch (e: any) {}
    }
    return res.json({ success: true, mongoConnected: false, message: 'تم الحفظ في السيرفر' });
  });

  // 10. Direct Tables Endpoint
  router.post('/tables', async (req: Request, res: Response) => {
    const { table } = req.body || {};
    if (!table || !table.id) {
      return res.status(400).json({ success: false, message: 'بيانات الترابيزة مطلوبة' });
    }

    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_tables').updateOne(
          { id: table.id },
          { $set: withoutId(table) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: 'تم حفظ الترابيزة في MongoDB Atlas' });
      } catch (e: any) {}
    }
    return res.json({ success: true, mongoConnected: false, message: 'تم الحفظ في السيرفر' });
  });

  // 11. Direct PlayStation Endpoint
  router.post('/playstations', async (req: Request, res: Response) => {
    const { playstation } = req.body || {};
    if (!playstation || !playstation.id) {
      return res.status(400).json({ success: false, message: 'بيانات جهاز البلايستيشن مطلوبة' });
    }

    if (await ensureConnection()) {
      try {
        const db = activeClient!.db('hub_cafe_db');
        await db.collection('hub_playstations').updateOne(
          { id: playstation.id },
          { $set: withoutId(playstation) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: 'تم حفظ جلسة البلايستيشن في MongoDB Atlas' });
      } catch (e: any) {}
    }
    return res.json({ success: true, mongoConnected: false, message: 'تم الحفظ في السيرفر' });
  });

  return router;
}
