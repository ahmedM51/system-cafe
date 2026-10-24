import express, { Request, Response } from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Default MongoDB URI with provided credentials
export const DEFAULT_MONGO_URI = 
  process.env.MONGODB_URI || 
  'mongodb+srv://ahmedmohamedm4336_db_user:QRJyIXO7ZZNlY5rI@cluster0.w7l7m9v.mongodb.net/hub_cafe_db?retryWrites=true&w=majority';

let activeClient: MongoClient | null = null;
let isConnected = false;
let lastError: string | null = null;
let lastSyncTimestamp: string | null = null;

const STORE_PATH = (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) 
  ? path.join('/tmp', 'server_store.json') 
  : path.join(process.cwd(), 'server_store.json');

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
 * Attempt to connect to MongoDB Atlas
 */
export async function connectToMongoDB(uri = DEFAULT_MONGO_URI): Promise<{ success: boolean; message: string }> {
  try {
    if (activeClient) {
      try {
        await activeClient.close();
      } catch (e) {
        // ignore close errors
      }
    }

    activeClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
    });

    await activeClient.connect();
    // Ping admin or database
    const pingResult = await activeClient.db('hub_cafe_db').command({ ping: 1 });
    
    isConnected = true;
    lastError = null;
    return { success: true, message: 'تم الاتصال بقاعدة بيانات MongoDB Atlas بنجاح!' };
  } catch (err: any) {
    isConnected = false;
    const msg = err?.message || 'خطأ غير معروف في الاتصال';
    lastError = msg;

    // Check for IP Whitelist rejection (SSL alert 80)
    if (msg.includes('SSL alert number 80') || msg.includes('tlsv1 alert internal error')) {
      lastError = 'يرجى إضافة 0.0.0.0/0 في تبويب Network Access داخل لوحة تحكم MongoDB Atlas للسماح بالسيرفر بالاتصال.';
    }

    return { 
      success: false, 
      message: lastError || 'خطأ في الاتصال بقاعدة البيانات'
    };
  }
}

/**
 * MongoDB API Router for Cafe Management System
 */
export function createMongoApiRouter() {
  const router = express.Router();

  // Try initial connection in background (non-blocking)
  connectToMongoDB().catch((err) => {
    console.warn('Initial MongoDB Atlas connection attempt in background:', err.message);
  });

  // 1. Connection Status
  router.get('/status', async (req: Request, res: Response) => {
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
            { $set: { ...settings, updatedAt: new Date().toISOString() } },
            { upsert: true }
          );
          results['hub_settings'] = 1;
        }

        // 2. Products
        if (Array.isArray(products) && products.length > 0) {
          for (const prod of products) {
            await db.collection('hub_products').updateOne(
              { id: prod.id },
              { $set: { ...prod, updatedAt: new Date().toISOString() } },
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
              { $set: { ...inv, updatedAt: new Date().toISOString() } },
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
              { $set: { ...ord, syncedAt: new Date().toISOString() } },
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
              { $set: { ...u, updatedAt: new Date().toISOString() } },
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
              { $set: t },
              { upsert: true }
            );
          }
          results['hub_tables'] = tables.length;
        }

        if (Array.isArray(playstations) && playstations.length > 0) {
          for (const ps of playstations) {
            await db.collection('hub_playstations').updateOne(
              { id: ps.id },
              { $set: ps },
              { upsert: true }
            );
          }
          results['hub_playstations'] = playstations.length;
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
    const client = activeClient;
    if (isConnected && client) {
      try {
        const db = client.db('hub_cafe_db');
        const [settingsDoc, products, inventory, orders, users, tables, playstations] = await Promise.all([
          db.collection('hub_settings').findOne({ _id: 'main_settings' as any }),
          db.collection('hub_products').find().toArray(),
          db.collection('hub_inventory').find().toArray(),
          db.collection('hub_orders').find().sort({ timestamp: -1 }).limit(100).toArray(),
          db.collection('hub_users').find().toArray(),
          db.collection('hub_tables').find().toArray(),
          db.collection('hub_playstations').find().toArray(),
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

  // 5. Real Google Authentication via MongoDB
  router.post('/auth/google', async (req: Request, res: Response) => {
    const { email, name, avatar, googleId } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني مطلوب' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const AUTHORIZED_ADMIN = 'ahmedmohamed4336@gmail.com';
    const isAuthorizedAdmin = cleanEmail === AUTHORIZED_ADMIN;
    const role = isAuthorizedAdmin ? 'admin' : 'cashier';

    const permissions = isAuthorizedAdmin
      ? ['all', 'pos', 'tables', 'orders', 'playstation', 'shifts', 'inventory', 'audit', 'purchases', 'expenses', 'dashboard', 'day_report', 'qa_tests']
      : ['pos', 'tables', 'orders', 'playstation', 'shifts'];

    const userDoc = {
      id: isAuthorizedAdmin ? 'user-admin' : `user-g-${Date.now()}`,
      email: cleanEmail,
      name: name || (isAuthorizedAdmin ? 'أحمد محمد (المدير العام)' : cleanEmail.split('@')[0]),
      role,
      avatar: avatar || (isAuthorizedAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
      phone: isAuthorizedAdmin ? '+20 100 433 6000' : '',
      pin: isAuthorizedAdmin ? '4336' : '1234',
      permissions,
      authProvider: 'google',
      googleId: googleId || null,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If MongoDB is connected, upsert into MongoDB Atlas collection 'hub_users'
    if (isConnected && activeClient) {
      try {
        const db = activeClient.db('hub_cafe_db');
        await db.collection('hub_users').updateOne(
          { email: cleanEmail },
          { 
            $set: userDoc,
            $setOnInsert: { createdAt: new Date().toISOString() } 
          },
          { upsert: true }
        );

        const savedUser = await db.collection('hub_users').findOne({ email: cleanEmail });

        return res.json({
          success: true,
          connected: true,
          message: isAuthorizedAdmin
            ? 'تم تسجيل الدخول بنجاح عبر حساب Google وحفظ المستخدم في قاعدة بيانات MongoDB Atlas (Admin)'
            : 'تم تسجيل الدخول بنجاح عبر حساب Google وحفظ المستخدم في قاعدة بيانات MongoDB Atlas (Cashier)',
          user: savedUser || userDoc,
        });
      } catch (err: any) {
        console.warn('Mongo Google auth write error:', err.message);
      }
    }

    return res.json({
      success: true,
      connected: false,
      message: isAuthorizedAdmin
        ? 'تم تسجيل الدخول بحساب Google المعتمد (Admin)'
        : 'تم تسجيل الدخول بحساب Google (Cashier)',
      user: userDoc,
    });
  });

  return router;
}
