var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server/mongodb.ts
var mongodb_exports = {};
__export(mongodb_exports, {
  DEFAULT_MONGO_URI: () => DEFAULT_MONGO_URI,
  connectToMongoDB: () => connectToMongoDB,
  createMongoApiRouter: () => createMongoApiRouter
});
function saveToStore(data) {
  try {
    let current = {};
    if (import_fs.default.existsSync(STORE_PATH)) {
      current = JSON.parse(import_fs.default.readFileSync(STORE_PATH, "utf-8"));
    }
    const merged = { ...current, ...data, updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
    import_fs.default.writeFileSync(STORE_PATH, JSON.stringify(merged, null, 2));
  } catch (e) {
    console.warn("saveToStore warning:", e);
  }
}
function loadFromStore() {
  try {
    if (import_fs.default.existsSync(STORE_PATH)) {
      return JSON.parse(import_fs.default.readFileSync(STORE_PATH, "utf-8"));
    }
  } catch (e) {
    console.warn("loadFromStore warning:", e);
  }
  return null;
}
async function connectToMongoDB(uri = DEFAULT_MONGO_URI) {
  try {
    if (activeClient) {
      try {
        await activeClient.close();
      } catch (e) {
      }
    }
    activeClient = new import_mongodb.MongoClient(uri, {
      serverSelectionTimeoutMS: 5e3,
      connectTimeoutMS: 8e3
    });
    await activeClient.connect();
    const pingResult = await activeClient.db("hub_cafe_db").command({ ping: 1 });
    isConnected = true;
    lastError = null;
    return { success: true, message: "\u062A\u0645 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A MongoDB Atlas \u0628\u0646\u062C\u0627\u062D!" };
  } catch (err) {
    isConnected = false;
    const msg = err?.message || "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644";
    lastError = msg;
    if (msg.includes("SSL alert number 80") || msg.includes("tlsv1 alert internal error")) {
      lastError = "\u064A\u0631\u062C\u0649 \u0625\u0636\u0627\u0641\u0629 0.0.0.0/0 \u0641\u064A \u062A\u0628\u0648\u064A\u0628 Network Access \u062F\u0627\u062E\u0644 \u0644\u0648\u062D\u0629 \u062A\u062D\u0643\u0645 MongoDB Atlas \u0644\u0644\u0633\u0645\u0627\u062D \u0628\u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0627\u0644\u0627\u062A\u0635\u0627\u0644.";
    }
    return {
      success: false,
      message: lastError || "\u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A"
    };
  }
}
async function ensureConnection() {
  if (isConnected && activeClient) return true;
  const now = Date.now();
  if (now - lastConnectAttempt < RECONNECT_COOLDOWN_MS) return false;
  lastConnectAttempt = now;
  const result = await connectToMongoDB();
  return result.success;
}
function withoutId(doc) {
  const { _id, ...rest } = doc || {};
  return rest;
}
function createMongoApiRouter() {
  const router = import_express.default.Router();
  lastConnectAttempt = Date.now();
  connectToMongoDB().catch((err) => {
    console.warn("Initial MongoDB Atlas connection attempt in background:", err.message);
  });
  router.get("/config", (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
    res.json({
      success: true,
      googleClientId,
      googleAuthReady: Boolean(googleClientId)
    });
  });
  router.get("/status", async (req, res) => {
    await ensureConnection();
    let collections = [];
    let countStats = {};
    if (isConnected && activeClient) {
      try {
        const db = activeClient.db("hub_cafe_db");
        const colls = await db.listCollections().toArray();
        collections = colls.map((c) => c.name);
        for (const c of collections) {
          try {
            countStats[c] = await db.collection(c).countDocuments();
          } catch (e) {
            countStats[c] = 0;
          }
        }
      } catch (e) {
        isConnected = false;
        lastError = e?.message || "\u0641\u0634\u0644 \u0641\u062D\u0635 \u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0627\u062A";
      }
    }
    res.json({
      success: true,
      connected: isConnected,
      cluster: "cluster0.w7l7m9v.mongodb.net",
      database: "hub_cafe_db",
      username: "ahmedmohamedm4336_db_user",
      collections,
      countStats,
      lastError,
      lastSyncTimestamp,
      hint: !isConnected ? "\u062A\u0623\u0643\u062F \u0645\u0646 \u062A\u0641\u0639\u064A\u0644 Network Access \u0639\u0644\u0649 0.0.0.0/0 \u0641\u064A \u0645\u0648\u0642\u0639 mongodb.com" : void 0
    });
  });
  router.post("/test", async (req, res) => {
    const customUri = req.body?.uri || DEFAULT_MONGO_URI;
    const result = await connectToMongoDB(customUri);
    res.json({
      success: result.success,
      connected: isConnected,
      message: result.message,
      lastError
    });
  });
  router.post("/sync", async (req, res) => {
    const payload = req.body || {};
    saveToStore(payload);
    lastSyncTimestamp = (/* @__PURE__ */ new Date()).toISOString();
    await ensureConnection();
    const client = activeClient;
    const results = { serverStore: 1 };
    if (isConnected && client) {
      try {
        const db = client.db("hub_cafe_db");
        const {
          settings,
          products,
          inventory,
          orders,
          users,
          shifts,
          tables,
          playstations
        } = payload;
        if (settings) {
          await db.collection("hub_settings").updateOne(
            { _id: "main_settings" },
            { $set: { ...withoutId(settings), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
            { upsert: true }
          );
          results["hub_settings"] = 1;
        }
        if (Array.isArray(products) && products.length > 0) {
          for (const prod of products) {
            await db.collection("hub_products").updateOne(
              { id: prod.id },
              { $set: { ...withoutId(prod), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
              { upsert: true }
            );
          }
          results["hub_products"] = products.length;
        }
        if (Array.isArray(inventory) && inventory.length > 0) {
          for (const inv of inventory) {
            await db.collection("hub_inventory").updateOne(
              { id: inv.id },
              { $set: { ...withoutId(inv), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
              { upsert: true }
            );
          }
          results["hub_inventory"] = inventory.length;
        }
        if (Array.isArray(orders) && orders.length > 0) {
          for (const ord of orders) {
            await db.collection("hub_orders").updateOne(
              { id: ord.id },
              { $set: { ...withoutId(ord), syncedAt: (/* @__PURE__ */ new Date()).toISOString() } },
              { upsert: true }
            );
          }
          results["hub_orders"] = orders.length;
        }
        if (Array.isArray(users) && users.length > 0) {
          for (const u of users) {
            await db.collection("hub_users").updateOne(
              { id: u.id },
              { $set: { ...withoutId(u), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
              { upsert: true }
            );
          }
          results["hub_users"] = users.length;
        }
        if (Array.isArray(tables) && tables.length > 0) {
          for (const t of tables) {
            await db.collection("hub_tables").updateOne(
              { id: t.id },
              { $set: withoutId(t) },
              { upsert: true }
            );
          }
          results["hub_tables"] = tables.length;
        }
        if (Array.isArray(playstations) && playstations.length > 0) {
          for (const ps of playstations) {
            await db.collection("hub_playstations").updateOne(
              { id: ps.id },
              { $set: withoutId(ps) },
              { upsert: true }
            );
          }
          results["hub_playstations"] = playstations.length;
        }
        const { expenses, currentShift, categories } = payload;
        if (Array.isArray(expenses) && expenses.length > 0) {
          for (const exp of expenses) {
            await db.collection("hub_expenses").updateOne(
              { id: exp.id },
              { $set: withoutId(exp) },
              { upsert: true }
            );
          }
          results["hub_expenses"] = expenses.length;
        }
        if (currentShift && currentShift.id) {
          await db.collection("hub_shifts").updateOne(
            { id: currentShift.id },
            { $set: withoutId(currentShift) },
            { upsert: true }
          );
          results["hub_shifts"] = 1;
        }
        if (Array.isArray(categories) && categories.length > 0) {
          await db.collection("hub_categories").updateOne(
            { _id: "main_categories" },
            { $set: { list: categories, updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
            { upsert: true }
          );
          results["hub_categories"] = categories.length;
        }
        return res.json({
          success: true,
          mongoConnected: true,
          message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A MongoDB Atlas \u0648\u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D!",
          syncedRecords: results,
          timestamp: lastSyncTimestamp
        });
      } catch (err) {
        console.warn("Mongo Atlas sync write warning:", err.message);
      }
    }
    return res.json({
      success: true,
      mongoConnected: false,
      message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D (\u0633\u064A\u0631\u0641\u0631 MongoDB Atlas \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0635\u0631\u064A\u062D 0.0.0.0/0 \u0641\u064A Network Access)",
      timestamp: lastSyncTimestamp
    });
  });
  router.get("/data", async (req, res) => {
    await ensureConnection();
    const client = activeClient;
    if (isConnected && client) {
      try {
        const db = client.db("hub_cafe_db");
        const [settingsDoc, products, inventory, orders, users, tables, playstations, expenses, categoriesDoc, shiftDoc] = await Promise.all([
          db.collection("hub_settings").findOne({ _id: "main_settings" }),
          db.collection("hub_products").find().toArray(),
          db.collection("hub_inventory").find().toArray(),
          db.collection("hub_orders").find().sort({ timestamp: -1 }).limit(150).toArray(),
          db.collection("hub_users").find().toArray(),
          db.collection("hub_tables").find().toArray(),
          db.collection("hub_playstations").find().toArray(),
          db.collection("hub_expenses").find().sort({ timestamp: -1 }).limit(100).toArray(),
          db.collection("hub_categories").findOne({ _id: "main_categories" }),
          db.collection("hub_shifts").findOne({ status: "open" })
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
            currentShift: shiftDoc || null
          }
        });
      } catch (err) {
        console.warn("Mongo Atlas read error, falling back to server store:", err.message);
      }
    }
    const localStore = loadFromStore();
    return res.json({
      success: true,
      mongoConnected: false,
      message: "\u062A\u0645 \u062C\u0644\u0628 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (MongoDB Atlas \u0628\u0627\u0646\u062A\u0638\u0627\u0631 \u062A\u0635\u0631\u064A\u062D 0.0.0.0/0)",
      data: localStore || null
    });
  });
  router.post("/auth/google", async (req, res) => {
    const { credential, token } = req.body || {};
    const idToken = String(credential || token || "").trim();
    if (!idToken) {
      return res.status(400).json({
        success: false,
        tokenVerified: false,
        message: "\u0631\u0645\u0632 Google (ID Token) \u0645\u0637\u0644\u0648\u0628. \u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0628\u062F\u0648\u0646 \u062A\u062D\u0642\u0642 \u062D\u0642\u064A\u0642\u064A \u0645\u0646 Google."
      });
    }
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "";
    let payload = null;
    let verifyError = null;
    try {
      const verifyRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );
      const data = await verifyRes.json().catch(() => null);
      if (!verifyRes.ok || !data || !data.email) {
        verifyError = data?.error_description || data?.error || "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629";
      } else if (clientId && data.aud !== clientId) {
        verifyError = "\u0627\u0644\u0631\u0645\u0632 \u0635\u0627\u062F\u0631 \u0644\u062A\u0637\u0628\u064A\u0642 \u0622\u062E\u0631 (audience mismatch) \u0648\u0644\u0627 \u064A\u0645\u0643\u0646 \u0627\u0639\u062A\u0645\u0627\u062F\u0647.";
      } else if (String(data.email_verified) === "false") {
        verifyError = "\u0628\u0631\u064A\u062F Google \u0647\u0630\u0627 \u063A\u064A\u0631 \u0645\u0648\u062B\u0651\u0642 (email_verified = false).";
      } else {
        payload = data;
      }
    } catch (err) {
      verifyError = err?.message || "\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u0627\u062F\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 Google";
    }
    if (!payload) {
      return res.status(401).json({
        success: false,
        connected: isConnected,
        tokenVerified: false,
        message: `\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0633\u0627\u0628 Google: ${verifyError}`
      });
    }
    const cleanEmail = String(payload.email).trim().toLowerCase();
    const avatar = payload.picture || "";
    const googleId = payload.sub || null;
    const verifiedName = payload.name || cleanEmail.split("@")[0];
    const AUTHORIZED_ADMIN = "ahmedmohamed4336@gmail.com";
    const isAuthorizedAdmin = cleanEmail === AUTHORIZED_ADMIN;
    const role = isAuthorizedAdmin ? "admin" : "cashier";
    const permissions = isAuthorizedAdmin ? ["all", "pos", "tables", "orders", "playstation", "shifts", "inventory", "audit", "purchases", "expenses", "dashboard", "day_report", "qa_tests"] : ["pos", "tables", "orders", "playstation", "shifts"];
    const userDoc = {
      id: isAuthorizedAdmin ? "user-admin" : `user-g-${googleId || Date.now()}`,
      email: cleanEmail,
      name: verifiedName,
      role,
      avatar: avatar || (isAuthorizedAdmin ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"),
      phone: isAuthorizedAdmin ? "+20 100 433 6000" : "",
      pin: isAuthorizedAdmin ? "4336" : "1234",
      permissions,
      authProvider: "google",
      googleId,
      tokenVerified: true,
      lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const store = loadFromStore() || {};
    const storeUsers = Array.isArray(store.users) ? store.users : [];
    saveToStore({
      users: [
        userDoc,
        ...storeUsers.filter(
          (u) => u.id !== userDoc.id && String(u.email || "").toLowerCase() !== cleanEmail
        )
      ]
    });
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_users").updateOne(
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
              updatedAt: userDoc.updatedAt
            },
            $setOnInsert: {
              name: userDoc.name,
              avatar: userDoc.avatar,
              phone: userDoc.phone,
              pin: userDoc.pin,
              createdAt: (/* @__PURE__ */ new Date()).toISOString()
            }
          },
          { upsert: true }
        );
        const savedUser = await db.collection("hub_users").findOne({ id: userDoc.id });
        return res.json({
          success: true,
          connected: true,
          mongoConnected: true,
          tokenVerified: true,
          message: isAuthorizedAdmin ? "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0643\u0646 Google \u0648\u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062F\u064A\u0631 \u0627\u0644\u0639\u0627\u0645 \u0641\u064A MongoDB Atlas \u0628\u0646\u062C\u0627\u062D (Admin)" : "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0648\u0643\u0646 Google \u0648\u062D\u0641\u0638 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0641\u064A MongoDB Atlas \u0628\u0646\u062C\u0627\u062D (Cashier)",
          user: savedUser || userDoc
        });
      } catch (err) {
        console.warn("Mongo Google auth write error:", err.message);
      }
    }
    return res.json({
      success: true,
      connected: false,
      mongoConnected: false,
      tokenVerified: true,
      message: isAuthorizedAdmin ? "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0633\u0627\u0628 Google \u0648\u0627\u0639\u062A\u0645\u0627\u062F\u0647 \u0643\u0645\u062F\u064A\u0631 \u0639\u0627\u0645 (\u062A\u0639\u0630\u0631 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A Atlas \u062D\u0627\u0644\u064A\u0627\u064B - \u062A\u062D\u0642\u0642 \u0645\u0646 Network Access)" : "\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0633\u0627\u0628 Google \u0648\u062D\u0641\u0638 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 (\u062A\u0639\u0630\u0631 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A Atlas \u062D\u0627\u0644\u064A\u0627\u064B)",
      user: userDoc
    });
  });
  router.post("/orders", async (req, res) => {
    const { order, inventoryDeductions, shiftUpdate } = req.body || {};
    if (!order || !order.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629" });
    }
    const orderDoc = {
      ...order,
      syncedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    const store = loadFromStore() || {};
    const existingOrders = Array.isArray(store.orders) ? store.orders : [];
    saveToStore({
      orders: [orderDoc, ...existingOrders.filter((o) => o.id !== orderDoc.id)].slice(0, 200)
    });
    const client = activeClient;
    if (isConnected && client) {
      try {
        const db = client.db("hub_cafe_db");
        await db.collection("hub_orders").updateOne(
          { id: orderDoc.id },
          { $set: withoutId(orderDoc) },
          { upsert: true }
        );
        if (Array.isArray(inventoryDeductions) && inventoryDeductions.length > 0) {
          for (const item of inventoryDeductions) {
            if (item.id) {
              await db.collection("hub_inventory").updateOne(
                { id: item.id },
                { $set: withoutId(item) },
                { upsert: true }
              );
            }
          }
        }
        if (shiftUpdate && shiftUpdate.id) {
          await db.collection("hub_shifts").updateOne(
            { id: shiftUpdate.id },
            { $set: withoutId(shiftUpdate) },
            { upsert: true }
          );
        }
        return res.json({
          success: true,
          mongoConnected: true,
          orderId: orderDoc.id,
          message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0637\u0644\u0628 \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u062E\u0632\u0646 \u0648\u0627\u0644\u0648\u0631\u062F\u064A\u0629 \u0645\u0628\u0627\u0634\u0631\u0629 \u0641\u064A MongoDB Atlas (\u0645\u062C\u0645\u0648\u0639\u0629 hub_orders)!",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (err) {
        console.warn("Direct order mongo save error:", err.message);
      }
    }
    return res.json({
      success: true,
      mongoConnected: false,
      orderId: orderDoc.id,
      message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0637\u0644\u0628 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0628\u0646\u062C\u0627\u062D (\u0633\u064A\u062A\u0645 \u0646\u0642\u0644\u0647 \u0644\u0640 MongoDB Atlas \u0641\u0648\u0631 \u062A\u0641\u0639\u064A\u0644 0.0.0.0/0)",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  router.post("/products", async (req, res) => {
    const { product } = req.body || {};
    if (!product || !product.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0646\u062A\u062C \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_products").updateOne(
          { id: product.id },
          { $set: { ...withoutId(product), updatedAt: (/* @__PURE__ */ new Date()).toISOString() } },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0646\u062A\u062C \u0641\u064A MongoDB Atlas" });
      } catch (e) {
      }
    }
    return res.json({ success: true, mongoConnected: false, message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631" });
  });
  router.post("/expenses", async (req, res) => {
    const { expense } = req.body || {};
    if (!expense || !expense.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_expenses").updateOne(
          { id: expense.id },
          { $set: withoutId(expense) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0641\u064A MongoDB Atlas" });
      } catch (e) {
      }
    }
    return res.json({ success: true, mongoConnected: false, message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631" });
  });
  router.post("/shifts", async (req, res) => {
    const { shift } = req.body || {};
    if (!shift || !shift.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0648\u0631\u062F\u064A\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_shifts").updateOne(
          { id: shift.id },
          { $set: withoutId(shift) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0648\u0631\u062F\u064A\u0629 \u0641\u064A MongoDB Atlas" });
      } catch (e) {
      }
    }
    return res.json({ success: true, mongoConnected: false, message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631" });
  });
  router.post("/tables", async (req, res) => {
    const { table } = req.body || {};
    if (!table || !table.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062A\u0631\u0627\u0628\u064A\u0632\u0629 \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_tables").updateOne(
          { id: table.id },
          { $set: withoutId(table) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u0631\u0627\u0628\u064A\u0632\u0629 \u0641\u064A MongoDB Atlas" });
      } catch (e) {
      }
    }
    return res.json({ success: true, mongoConnected: false, message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631" });
  });
  router.post("/playstations", async (req, res) => {
    const { playstation } = req.body || {};
    if (!playstation || !playstation.id) {
      return res.status(400).json({ success: false, message: "\u0628\u064A\u0627\u0646\u0627\u062A \u062C\u0647\u0627\u0632 \u0627\u0644\u0628\u0644\u0627\u064A\u0633\u062A\u064A\u0634\u0646 \u0645\u0637\u0644\u0648\u0628\u0629" });
    }
    if (await ensureConnection()) {
      try {
        const db = activeClient.db("hub_cafe_db");
        await db.collection("hub_playstations").updateOne(
          { id: playstation.id },
          { $set: withoutId(playstation) },
          { upsert: true }
        );
        return res.json({ success: true, mongoConnected: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u062C\u0644\u0633\u0629 \u0627\u0644\u0628\u0644\u0627\u064A\u0633\u062A\u064A\u0634\u0646 \u0641\u064A MongoDB Atlas" });
      } catch (e) {
      }
    }
    return res.json({ success: true, mongoConnected: false, message: "\u062A\u0645 \u0627\u0644\u062D\u0641\u0638 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631" });
  });
  return router;
}
var import_express, import_mongodb, import_fs, import_path, DEFAULT_MONGO_URI, activeClient, isConnected, lastError, lastSyncTimestamp, STORE_PATH, lastConnectAttempt, RECONNECT_COOLDOWN_MS;
var init_mongodb = __esm({
  "server/mongodb.ts"() {
    import_express = __toESM(require("express"));
    import_mongodb = require("mongodb");
    import_fs = __toESM(require("fs"));
    import_path = __toESM(require("path"));
    DEFAULT_MONGO_URI = process.env.MONGODB_URI || "mongodb+srv://ahmedmohamedm4336_db_user:QRJyIXO7ZZNlY5rI@cluster0.w7l7m9v.mongodb.net/hub_cafe_db?retryWrites=true&w=majority";
    activeClient = null;
    isConnected = false;
    lastError = null;
    lastSyncTimestamp = null;
    STORE_PATH = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME ? import_path.default.join("/tmp", "server_store.json") : import_path.default.join(process.cwd(), "server_store.json");
    lastConnectAttempt = 0;
    RECONNECT_COOLDOWN_MS = 15e3;
  }
});

// src/data/initialData.ts
var INITIAL_INVENTORY, INITIAL_PRODUCTS, INITIAL_PLAYSTATION_DEVICES, INITIAL_TABLES, INITIAL_EXPENSES, INITIAL_SHIFT, INITIAL_DAY_SUMMARY;
var init_initialData = __esm({
  "src/data/initialData.ts"() {
    INITIAL_INVENTORY = [
      {
        id: "inv-espresso",
        nameAr: "\u0628\u0646 \u0627\u0633\u0628\u0631\u064A\u0633\u0648 \u0628\u0631\u0627\u0632\u064A\u0644\u064A",
        nameEn: "Espresso Coffee Beans",
        unit: "kg",
        currentStock: 1.8,
        minAlert: 3,
        costPerUnit: 480,
        status: "low",
        lastUpdated: "2026-09-24T14:15:00.000Z"
      },
      {
        id: "inv-milk",
        nameAr: "\u0644\u0628\u0646 \u0643\u0627\u0645\u0644 \u0627\u0644\u062F\u0633\u0645",
        nameEn: "Full Cream Milk",
        unit: "L",
        currentStock: 5,
        minAlert: 10,
        costPerUnit: 38,
        status: "alert",
        lastUpdated: "2026-09-24T13:40:00.000Z"
      },
      {
        id: "inv-cups",
        nameAr: "\u0623\u0643\u0648\u0627\u0628 16oz \u0645\u0639 \u0623\u063A\u0637\u064A\u0629",
        nameEn: "Paper Cups 16oz",
        unit: "\u0642\u0637\u0639\u0629",
        currentStock: 0,
        minAlert: 100,
        costPerUnit: 2.5,
        status: "depleted",
        lastUpdated: "2026-09-24T12:00:00.000Z"
      },
      {
        id: "inv-caramel",
        nameAr: "\u0635\u0648\u0635 \u0643\u0631\u0627\u0645\u064A\u0644 \u0628\u0644\u062C\u064A\u0643\u064A",
        nameEn: "Caramel Sauce",
        unit: "L",
        currentStock: 2.4,
        minAlert: 1,
        costPerUnit: 140,
        status: "available",
        lastUpdated: "2026-09-24T10:00:00.000Z"
      },
      {
        id: "inv-nutella",
        nameAr: "\u0635\u0648\u0635 \u0634\u0648\u0643\u0648\u0644\u0627\u062A\u0629 \u0646\u0648\u062A\u064A\u0644\u0627",
        nameEn: "Nutella Chocolate Sauce",
        unit: "kg",
        currentStock: 3.5,
        minAlert: 1.5,
        costPerUnit: 220,
        status: "available",
        lastUpdated: "2026-09-24T11:20:00.000Z"
      },
      {
        id: "inv-matcha",
        nameAr: "\u0628\u0648\u062F\u0631\u0629 \u0645\u0627\u062A\u0634\u0627 \u064A\u0627\u0628\u0627\u0646\u064A\u0629 \u0641\u0627\u062E\u0631\u0629",
        nameEn: "Japanese Matcha Powder",
        unit: "kg",
        currentStock: 0.85,
        minAlert: 0.3,
        costPerUnit: 950,
        status: "available",
        lastUpdated: "2026-09-24T09:30:00.000Z"
      },
      {
        id: "inv-redbull",
        nameAr: "\u0639\u0644\u0628 \u0645\u0634\u0631\u0648\u0628 \u0637\u0627\u0642\u0629 \u0631\u064A\u062F\u0628\u0648\u0644",
        nameEn: "RedBull Cans",
        unit: "\u0639\u0644\u0628\u0629",
        currentStock: 24,
        minAlert: 12,
        costPerUnit: 42,
        status: "available",
        lastUpdated: "2026-09-24T10:45:00.000Z"
      },
      {
        id: "inv-waffle-mix",
        nameAr: "\u062E\u0644\u064A\u0637 \u0639\u062C\u064A\u0646\u0629 \u0627\u0644\u0648\u0627\u0641\u0644",
        nameEn: "Waffle Mix Flour",
        unit: "kg",
        currentStock: 8,
        minAlert: 2.5,
        costPerUnit: 65,
        status: "available",
        lastUpdated: "2026-09-24T08:00:00.000Z"
      }
    ];
    INITIAL_PRODUCTS = [
      {
        id: "prod-latte",
        nameAr: "\u0644\u0627\u062A\u064A\u0647",
        nameEn: "Caffe Latte",
        category: "\u0642\u0647\u0648\u0629 \u0633\u0627\u062E\u0646\u0629",
        price: 70,
        cost: 22,
        image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&auto=format&fit=crop&q=80",
        description: "\u0627\u0633\u0628\u0631\u064A\u0633\u0648 \u063A\u0646\u064A \u0645\u0639 \u062D\u0644\u064A\u0628 \u0645\u0628\u062E\u0631 \u0633\u0627\u062E\u0646 \u0648\u0637\u0628\u0642\u0629 \u0643\u0631\u064A\u0645\u064A\u0629 \u0646\u0627\u0639\u0645\u0629",
        recipe: [
          { inventoryItemId: "inv-espresso", quantity: 0.018, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.22, unit: "L" }
        ],
        availableSizes: [
          { name: "\u0639\u0627\u062F\u064A (Regular)", priceDelta: 0 },
          { name: "\u0643\u0628\u064A\u0631 (Large)", priceDelta: 15 }
        ],
        availableAddons: [
          { name: "\u0634\u0648\u062A \u0627\u0633\u0628\u0631\u064A\u0633\u0648 \u0625\u0636\u0627\u0641\u064A", price: 15 },
          { name: "\u0635\u0648\u0635 \u0641\u0627\u0646\u064A\u0644\u064A\u0627", price: 10 },
          { name: "\u062D\u0644\u064A\u0628 \u0634\u0648\u0641\u0627\u0646", price: 20 }
        ]
      },
      {
        id: "prod-cappuccino",
        nameAr: "\u0643\u0627\u0628\u062A\u0634\u064A\u0646\u0648",
        nameEn: "Cappuccino",
        category: "\u0642\u0647\u0648\u0629 \u0633\u0627\u062E\u0646\u0629",
        price: 75,
        cost: 24,
        image: "https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80",
        description: "\u062A\u0648\u0627\u0632\u0646 \u0645\u062B\u0627\u0644\u064A \u0628\u064A\u0646 \u0627\u0644\u0625\u0633\u0628\u0631\u064A\u0633\u0648 \u0648\u0627\u0644\u062D\u0644\u064A\u0628 \u0648\u0631\u063A\u0648\u0629 \u0643\u062B\u064A\u0641\u0629 \u0645\u0639 \u0631\u0634\u0629 \u0643\u0627\u0643\u0627\u0648",
        recipe: [
          { inventoryItemId: "inv-espresso", quantity: 0.018, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.18, unit: "L" }
        ],
        availableSizes: [
          { name: "\u0639\u0627\u062F\u064A", priceDelta: 0 },
          { name: "\u062F\u0628\u0644", priceDelta: 18 }
        ],
        availableAddons: [
          { name: "\u0634\u0648\u062A \u0627\u0633\u0628\u0631\u064A\u0633\u0648 \u0625\u0636\u0627\u0641\u064A", price: 15 },
          { name: "\u0642\u0631\u0641\u0629 \u0645\u0637\u062D\u0648\u0646\u0629", price: 5 }
        ]
      },
      {
        id: "prod-spanish-latte",
        nameAr: "\u0627\u064A\u0633 \u0627\u0633\u0628\u0627\u0646\u0634 \u0644\u0627\u062A\u064A\u0647",
        nameEn: "Iced Spanish Latte",
        category: "\u0642\u0647\u0648\u0629 \u0645\u062B\u0644\u062C\u0629",
        price: 80,
        cost: 28,
        image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80",
        description: "\u0645\u0632\u064A\u062C \u0642\u0647\u0648\u0629 \u0645\u062B\u0644\u062C\u0629 \u0645\u0646\u0639\u0634\u0629 \u0645\u0639 \u062D\u0644\u064A\u0628 \u0645\u0643\u062B\u0641 \u0648\u0645\u0630\u0627\u0642 \u062D\u0644\u0648 \u063A\u0646\u064A",
        recipe: [
          { inventoryItemId: "inv-espresso", quantity: 0.02, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.2, unit: "L" }
        ],
        availableSizes: [
          { name: "\u0645\u064A\u062F\u064A\u0645 (16oz)", priceDelta: 0 },
          { name: "\u0644\u0627\u0631\u062C (20oz)", priceDelta: 15 }
        ],
        availableAddons: [
          { name: "\u0628\u0648\u0628\u0627 \u062A\u0627\u0628\u064A\u0648\u0643\u0627 (Boba)", price: 20 },
          { name: "\u0635\u0648\u0635 \u0643\u0631\u0627\u0645\u064A\u0644 \u0625\u0636\u0627\u0641\u064A", price: 10 },
          { name: "\u0634\u0648\u062A \u0642\u0647\u0648\u0629 \u0625\u0636\u0627\u0641\u064A", price: 15 }
        ]
      },
      {
        id: "prod-iced-matcha",
        nameAr: "\u0627\u064A\u0633 \u0645\u0627\u062A\u0634\u0627 \u0643\u0644\u0627\u0633\u064A\u0643",
        nameEn: "Iced Matcha Classic",
        category: "\u0645\u0627\u062A\u0634\u0627",
        price: 80,
        cost: 26,
        image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80",
        description: "\u0628\u0648\u062F\u0631\u0629 \u0645\u0627\u062A\u0634\u0627 \u0627\u062D\u062A\u0641\u0627\u0644\u064A\u0629 \u0646\u0642\u064A\u0629 \u062E\u0636\u0631\u0627\u0621 \u0645\u062B\u0644\u062C\u0629 \u0645\u0639 \u062D\u0644\u064A\u0628 \u0637\u0627\u0632\u062C \u0648\u0633\u064A\u0631\u0628 \u0627\u0644\u0641\u0627\u0646\u064A\u0644\u064A\u0627",
        recipe: [
          { inventoryItemId: "inv-matcha", quantity: 8e-3, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.22, unit: "L" }
        ],
        availableSizes: [
          { name: "\u0648\u0633\u0637", priceDelta: 0 },
          { name: "\u0643\u0628\u064A\u0631", priceDelta: 15 }
        ],
        availableAddons: [
          { name: "\u062D\u0644\u064A\u0628 \u062C\u0648\u0632 \u0627\u0644\u0647\u0646\u062F", price: 15 },
          { name: "\u0633\u064A\u0631\u0628 \u0641\u0631\u0627\u0648\u0644\u0629", price: 12 }
        ]
      },
      {
        id: "prod-nutella-waffle",
        nameAr: "\u0648\u0627\u0641\u0644 \u0646\u0648\u062A\u064A\u0644\u0627",
        nameEn: "Nutella Waffle",
        category: "\u0648\u0627\u0641\u0644",
        price: 60,
        cost: 22,
        image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=400&auto=format&fit=crop&q=80",
        description: "\u0648\u0627\u0641\u0644 \u0628\u0644\u062C\u064A\u0643\u064A \u0645\u0642\u0631\u0645\u0634 \u0648\u0633\u0627\u062E\u0646 \u0645\u063A\u0637\u0649 \u0628\u063A\u0632\u0627\u0631\u0629 \u0628\u0635\u0648\u0635 \u0627\u0644\u0646\u0648\u062A\u064A\u0644\u0627 \u0627\u0644\u0623\u0635\u0644\u064A",
        recipe: [
          { inventoryItemId: "inv-waffle-mix", quantity: 0.15, unit: "kg" },
          { inventoryItemId: "inv-nutella", quantity: 0.06, unit: "kg" }
        ],
        availableSizes: [
          { name: "\u0645\u064A\u062F\u064A\u0645 (\u0642\u0637\u0639\u0629)", priceDelta: 0 },
          { name: "\u0644\u0627\u0631\u062C (\u0642\u0637\u0639\u062A\u064A\u0646)", priceDelta: 35 }
        ],
        availableAddons: [
          { name: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0648\u0632 \u0648\u0641\u0631\u0627\u0648\u0644\u0629", price: 15 },
          { name: "\u0628\u0648\u0644\u0629 \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0641\u0627\u0646\u064A\u0644\u064A\u0627", price: 20 },
          { name: "\u0628\u0633\u0643\u0648\u062A \u0644\u0648\u062A\u0633 \u0645\u0637\u062D\u0648\u0646", price: 15 }
        ]
      },
      {
        id: "prod-mojito-redbull",
        nameAr: "\u0645\u0648\u0647\u064A\u062A\u0648 \u0631\u064A\u062F\u0628\u0648\u0644",
        nameEn: "RedBull Mojito",
        category: "\u0645\u0634\u0631\u0648\u0628\u0627\u062A \u0645\u0646\u0639\u0634\u0629",
        price: 85,
        cost: 46,
        image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&auto=format&fit=crop&q=80",
        description: "\u0631\u064A\u062F\u0628\u0648\u0644 \u0645\u062B\u0644\u062C \u0645\u0639 \u0646\u0639\u0646\u0627\u0639 \u0637\u0627\u0632\u062C\u060C \u0634\u0631\u0627\u0626\u062D \u0644\u064A\u0645\u0648\u0646 \u0648\u0646\u0643\u0647\u0627\u062A \u062A\u0648\u062A \u0623\u0648 \u0641\u0631\u0627\u0648\u0644\u0629",
        recipe: [
          { inventoryItemId: "inv-redbull", quantity: 1, unit: "\u0639\u0644\u0628\u0629" }
        ],
        availableSizes: [
          { name: "\u0639\u0627\u062F\u064A", priceDelta: 0 }
        ],
        availableAddons: [
          { name: "\u0646\u0643\u0647\u0629 \u0641\u0631\u0627\u0648\u0644\u0629", price: 0 },
          { name: "\u0646\u0643\u0647\u0629 \u0628\u0644\u0648 \u0643\u0648\u0631\u0627\u0633\u0627\u0648", price: 0 },
          { name: "\u0646\u0643\u0647\u0629 \u062A\u0648\u062A \u0628\u0631\u064A", price: 5 }
        ]
      },
      {
        id: "prod-flat-white",
        nameAr: "\u0641\u0644\u0627\u062A \u0648\u0627\u064A\u062A",
        nameEn: "Flat White",
        category: "\u0642\u0647\u0648\u0629 \u0633\u0627\u062E\u0646\u0629",
        price: 65,
        cost: 20,
        image: "https://images.unsplash.com/photo-1577968897966-3d4325b36b61?w=400&auto=format&fit=crop&q=80",
        description: "\u062F\u0628\u0644 \u0631\u064A\u0633\u062A\u0631\u064A\u062A\u0648 \u0646\u0627\u0639\u0645 \u0645\u0639 \u0645\u064A\u0643\u0631\u0648\u0641\u0648\u0645 \u062D\u0644\u064A\u0628\u064A \u062D\u0631\u064A\u0631\u064A",
        recipe: [
          { inventoryItemId: "inv-espresso", quantity: 0.02, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.15, unit: "L" }
        ]
      },
      {
        id: "prod-caramel-frappe",
        nameAr: "\u0627\u064A\u0633 \u0643\u0631\u0627\u0645\u064A\u0644 \u0641\u0631\u0627\u0628\u064A\u0647",
        nameEn: "Iced Caramel Frappe",
        category: "\u0642\u0647\u0648\u0629 \u0645\u062B\u0644\u062C\u0629",
        price: 85,
        cost: 30,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80",
        description: "\u0641\u0631\u0627\u0628\u064A\u0647 \u0645\u062B\u0644\u062C \u0645\u062E\u0641\u0648\u0642 \u0645\u0639 \u0635\u0648\u0635 \u0627\u0644\u0643\u0631\u0627\u0645\u064A\u0644 \u0648\u0627\u0644\u0643\u0631\u064A\u0645\u0629 \u0627\u0644\u0645\u062E\u0641\u0648\u0642\u0629",
        recipe: [
          { inventoryItemId: "inv-espresso", quantity: 0.018, unit: "kg" },
          { inventoryItemId: "inv-milk", quantity: 0.2, unit: "L" },
          { inventoryItemId: "inv-caramel", quantity: 0.04, unit: "L" }
        ]
      }
    ];
    INITIAL_PLAYSTATION_DEVICES = [
      {
        id: "ps4-1",
        deviceNumber: 1,
        model: "PS4",
        status: "active",
        mode: "single",
        elapsedSeconds: 5052,
        // 01:24:12
        singleHourlyRate: 30,
        multiHourlyRate: 40,
        timeCost: 42,
        linkedOrders: [],
        customerName: "\u0643\u0627\u0628\u062A\u0646 \u0639\u0645\u0631"
      },
      {
        id: "ps4-2",
        deviceNumber: 2,
        model: "PS4",
        status: "idle",
        mode: "single",
        elapsedSeconds: 0,
        singleHourlyRate: 30,
        multiHourlyRate: 40,
        timeCost: 0,
        linkedOrders: []
      },
      {
        id: "ps4-3",
        deviceNumber: 3,
        model: "PS4",
        status: "active",
        mode: "multi",
        elapsedSeconds: 2268,
        // 00:37:48
        singleHourlyRate: 30,
        multiHourlyRate: 40,
        timeCost: 25,
        linkedOrders: [],
        customerName: "\u0623\u062D\u0645\u062F \u0648\u064A\u0648\u0633\u0641"
      },
      {
        id: "ps4-4",
        deviceNumber: 4,
        model: "PS4",
        status: "idle",
        mode: "single",
        elapsedSeconds: 0,
        singleHourlyRate: 30,
        multiHourlyRate: 40,
        timeCost: 0,
        linkedOrders: []
      },
      {
        id: "ps5-1",
        deviceNumber: 1,
        model: "PS5",
        status: "active",
        mode: "multi",
        elapsedSeconds: 7519,
        // 02:05:19
        singleHourlyRate: 40,
        multiHourlyRate: 50,
        timeCost: 84,
        linkedOrders: [
          {
            cartId: "ps-ord-1",
            product: INITIAL_PRODUCTS[5],
            // موهيتو ريدبول
            quantity: 2,
            selectedAddons: ["\u0646\u0643\u0647\u0629 \u0641\u0631\u0627\u0648\u0644\u0629"],
            unitPrice: 85,
            totalPrice: 170
          }
        ],
        customerName: "\u0637\u0627\u0648\u0644\u0629 \u0627\u0644\u0623\u0628\u0637\u0627\u0644 (FIFA)"
      },
      {
        id: "ps5-2",
        deviceNumber: 2,
        model: "PS5",
        status: "idle",
        mode: "single",
        elapsedSeconds: 0,
        singleHourlyRate: 40,
        multiHourlyRate: 50,
        timeCost: 0,
        linkedOrders: []
      },
      {
        id: "ps5-3",
        deviceNumber: 3,
        model: "PS5",
        status: "idle",
        mode: "single",
        elapsedSeconds: 0,
        singleHourlyRate: 40,
        multiHourlyRate: 50,
        timeCost: 0,
        linkedOrders: []
      },
      {
        id: "ps5-4",
        deviceNumber: 4,
        model: "PS5",
        status: "idle",
        mode: "single",
        elapsedSeconds: 0,
        singleHourlyRate: 40,
        multiHourlyRate: 50,
        timeCost: 0,
        linkedOrders: []
      }
    ];
    INITIAL_TABLES = [
      // القاعة الداخلية (1-6)
      { id: "tbl-1", number: 1, zone: "internal", capacity: 4, status: "busy", guestCount: 3, activeOrders: [] },
      { id: "tbl-2", number: 2, zone: "internal", capacity: 2, status: "empty", guestCount: 0, activeOrders: [] },
      { id: "tbl-3", number: 3, zone: "internal", capacity: 6, status: "busy", guestCount: 5, activeOrders: [] },
      { id: "tbl-4", number: 4, zone: "internal", capacity: 4, status: "empty", guestCount: 0, activeOrders: [] },
      { id: "tbl-5", number: 5, zone: "internal", capacity: 4, status: "reserved", guestCount: 0, activeOrders: [] },
      { id: "tbl-6", number: 6, zone: "internal", capacity: 8, status: "empty", guestCount: 0, activeOrders: [] },
      // القاعة الخارجية / الروف (7-12)
      { id: "tbl-7", number: 7, zone: "outdoor", capacity: 4, status: "busy", guestCount: 4, activeOrders: [] },
      { id: "tbl-8", number: 8, zone: "outdoor", capacity: 4, status: "empty", guestCount: 0, activeOrders: [] },
      { id: "tbl-9", number: 9, zone: "outdoor", capacity: 2, status: "busy", guestCount: 2, activeOrders: [] },
      { id: "tbl-10", number: 10, zone: "outdoor", capacity: 6, status: "empty", guestCount: 0, activeOrders: [] },
      { id: "tbl-11", number: 11, zone: "outdoor", capacity: 4, status: "empty", guestCount: 0, activeOrders: [] },
      { id: "tbl-12", number: 12, zone: "outdoor", capacity: 4, status: "reserved", guestCount: 0, activeOrders: [] }
    ];
    INITIAL_EXPENSES = [
      {
        id: "exp-1",
        title: "\u0634\u0631\u0627\u0621 \u0646\u0639\u0646\u0627\u0639 \u0648\u0644\u064A\u0645\u0648\u0646 \u0637\u0627\u0632\u062C \u0644\u0644\u0645\u0648\u0647\u064A\u062A\u0648",
        category: "supplies",
        amount: 250,
        cashier: "Mohamed",
        notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0633\u0648\u0642 \u0627\u0644\u062E\u0636\u0627\u0631",
        timestamp: "2026-09-24T11:15:00.000Z"
      },
      {
        id: "exp-2",
        title: "\u0635\u064A\u0627\u0646\u0629 \u0645\u0627\u0643\u064A\u0646\u0629 \u0627\u0644\u0625\u0633\u0628\u0631\u064A\u0633\u0648 \u0648\u062A\u063A\u064A\u064A\u0631 \u062C\u0648\u0627\u0646",
        category: "maintenance",
        amount: 700,
        cashier: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F",
        notes: "\u0641\u0646\u064A \u0627\u0644\u0635\u064A\u0627\u0646\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F",
        timestamp: "2026-09-24T12:30:00.000Z"
      },
      {
        id: "exp-3",
        title: "\u0645\u0646\u0627\u062F\u064A\u0644 \u0648\u0631\u0642\u064A\u0629 \u0648\u0645\u0646\u0638\u0641\u0627\u062A \u0643\u0627\u0641\u064A\u0647",
        category: "supplies",
        amount: 300,
        cashier: "Mohamed",
        notes: "\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0646\u0638\u0627\u0641\u0629 \u064A\u0648\u0645\u064A\u0629",
        timestamp: "2026-09-24T14:00:00.000Z"
      }
    ];
    INITIAL_SHIFT = {
      id: "shift-current",
      cashierName: "Mohamed",
      startTime: "2026-09-24T09:00:00.000Z",
      startingCash: 3e3,
      cashSales: 13400,
      cardSales: 5340,
      expensesTotal: 1250,
      expectedDrawerCash: 13400,
      // Matching image 2 & 4 exactly
      status: "open"
    };
    INITIAL_DAY_SUMMARY = {
      date: "21 \u0633\u0628\u062A\u0645\u0628\u0631 2026",
      totalSales: 18740,
      orderCount: 126,
      averageOrder: 149,
      cashSales: 13400,
      cardSales: 5340,
      totalCost: 6120,
      expenses: 1250,
      estimatedProfit: 11370,
      salesByChannel: {
        dineIn: 9850,
        takeaway: 5620,
        delivery: 3270
      },
      hourlyTraffic: [
        { hour: "10:00", count: 4, sales: 580 },
        { hour: "11:00", count: 8, sales: 1150 },
        { hour: "12:00", count: 12, sales: 1780 },
        { hour: "13:00", count: 15, sales: 2240 },
        { hour: "14:00", count: 9, sales: 1340 },
        { hour: "15:00", count: 7, sales: 980 },
        { hour: "16:00", count: 11, sales: 1650 },
        { hour: "17:00", count: 14, sales: 2120 },
        { hour: "18:00", count: 18, sales: 2790 },
        { hour: "19:00", count: 16, sales: 2380 },
        { hour: "20:00", count: 12, sales: 1730 }
      ]
    };
  }
});

// server/api.ts
var api_exports = {};
__export(api_exports, {
  createCafeApiRouter: () => createCafeApiRouter
});
var import_express2, createCafeApiRouter;
var init_api = __esm({
  "server/api.ts"() {
    import_express2 = __toESM(require("express"));
    init_initialData();
    createCafeApiRouter = () => {
      const router = import_express2.default.Router();
      let products = [...INITIAL_PRODUCTS];
      let inventory = [...INITIAL_INVENTORY];
      let playstations = [...INITIAL_PLAYSTATION_DEVICES];
      let tables = [...INITIAL_TABLES];
      let expenses = [...INITIAL_EXPENSES];
      let currentShift = { ...INITIAL_SHIFT };
      let daySummary = { ...INITIAL_DAY_SUMMARY };
      let orders = [];
      router.get("/products", (req, res) => {
        res.json({ success: true, count: products.length, data: products });
      });
      router.get("/inventory", (req, res) => {
        res.json({ success: true, data: inventory });
      });
      router.post("/inventory/adjust", (req, res) => {
        const { itemId, amount, reason } = req.body;
        const item = inventory.find((i) => i.id === itemId);
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        item.currentStock = Math.max(0, item.currentStock + amount);
        if (item.currentStock <= 0) item.status = "depleted";
        else if (item.currentStock <= item.minAlert * 0.5) item.status = "alert";
        else if (item.currentStock <= item.minAlert) item.status = "low";
        else item.status = "available";
        res.json({ success: true, message: "Stock updated", data: item });
      });
      router.post("/orders", (req, res) => {
        const { items, type, paymentMethod, customerName, cashierName, discount } = req.body;
        if (!items || items.length === 0) {
          return res.status(400).json({ success: false, message: "Order items required" });
        }
        const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
        const finalTotal = Math.max(0, subtotal - (discount || 0));
        const orderNumber = orders.length + 127;
        const orderId = `ORD-API-${Date.now().toString().slice(-6)}`;
        items.forEach((orderItem) => {
          const prod = products.find((p) => p.id === orderItem.product.id);
          if (prod && prod.recipe) {
            prod.recipe.forEach((rec) => {
              const invItem = inventory.find((i) => i.id === rec.inventoryItemId);
              if (invItem) {
                invItem.currentStock = Math.max(0, Number((invItem.currentStock - rec.quantity * orderItem.quantity).toFixed(3)));
                if (invItem.currentStock <= 0) invItem.status = "depleted";
                else if (invItem.currentStock <= invItem.minAlert * 0.5) invItem.status = "alert";
                else if (invItem.currentStock <= invItem.minAlert) invItem.status = "low";
              }
            });
          }
        });
        const newOrder = {
          id: orderId,
          orderNumber,
          items,
          type,
          subtotal,
          discount: discount || 0,
          total: finalTotal,
          paymentMethod,
          cashierName: cashierName || "Mohamed",
          status: "completed",
          customerName,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        orders.unshift(newOrder);
        if (paymentMethod === "cash") {
          currentShift.cashSales += finalTotal;
          currentShift.expectedDrawerCash += finalTotal;
          daySummary.cashSales += finalTotal;
        } else {
          currentShift.cardSales += finalTotal;
          daySummary.cardSales += finalTotal;
        }
        daySummary.totalSales += finalTotal;
        daySummary.orderCount += 1;
        daySummary.averageOrder = Math.round(daySummary.totalSales / daySummary.orderCount);
        res.status(201).json({ success: true, message: "Order completed", data: newOrder });
      });
      router.get("/orders", (req, res) => {
        res.json({ success: true, count: orders.length, data: orders });
      });
      router.get("/playstation", (req, res) => {
        res.json({ success: true, data: playstations });
      });
      router.post("/playstation/:id/start", (req, res) => {
        const { id } = req.params;
        const { mode, customerName } = req.body;
        const ps = playstations.find((p) => p.id === id);
        if (!ps) return res.status(404).json({ success: false, message: "Device not found" });
        ps.status = "active";
        ps.mode = mode || "single";
        ps.startTime = (/* @__PURE__ */ new Date()).toISOString();
        ps.elapsedSeconds = 0;
        ps.timeCost = 10;
        ps.customerName = customerName || `\u0639\u0645\u064A\u0644 \u062C\u0647\u0627\u0632 ${ps.deviceNumber}`;
        res.json({ success: true, message: "PlayStation session started", data: ps });
      });
      router.post("/playstation/:id/add-drinks", (req, res) => {
        const { id } = req.params;
        const { items } = req.body;
        const ps = playstations.find((p) => p.id === id);
        if (!ps) return res.status(404).json({ success: false, message: "Device not found" });
        ps.linkedOrders = [...ps.linkedOrders, ...items];
        res.json({ success: true, message: "Drinks added to session", data: ps });
      });
      router.get("/shifts/current", (req, res) => {
        res.json({ success: true, data: currentShift });
      });
      router.post("/shifts/close", (req, res) => {
        const { actualDrawerCash, closingNotes } = req.body;
        currentShift.actualDrawerCash = actualDrawerCash;
        currentShift.difference = actualDrawerCash - currentShift.expectedDrawerCash;
        currentShift.status = "closed";
        currentShift.closingNotes = closingNotes;
        currentShift.endTime = (/* @__PURE__ */ new Date()).toISOString();
        res.json({
          success: true,
          message: "Shift closed and reconciled",
          variance: currentShift.difference,
          data: currentShift
        });
      });
      router.get("/expenses", (req, res) => {
        res.json({ success: true, data: expenses });
      });
      router.post("/expenses", (req, res) => {
        const { title, amount, category, notes, cashier } = req.body;
        const newExpense = {
          id: `exp-${Date.now()}`,
          title,
          amount,
          category,
          notes,
          cashier: cashier || "Mohamed",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        };
        expenses.unshift(newExpense);
        currentShift.expensesTotal += amount;
        currentShift.expectedDrawerCash -= amount;
        daySummary.expenses += amount;
        daySummary.estimatedProfit = daySummary.totalSales - daySummary.totalCost - daySummary.expenses;
        res.status(201).json({ success: true, message: "Expense recorded", data: newExpense });
      });
      router.get("/day-report", (req, res) => {
        res.json({ success: true, data: daySummary });
      });
      return router;
    };
  }
});

// server/vercel-entry.ts
var vercel_entry_exports = {};
__export(vercel_entry_exports, {
  default: () => vercel_entry_default
});
module.exports = __toCommonJS(vercel_entry_exports);
var import_express3 = __toESM(require("express"));
var app = (0, import_express3.default)();
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});
app.use(import_express3.default.json({ limit: "20mb" }));
app.use(import_express3.default.urlencoded({ extended: true, limit: "20mb" }));
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    serverless: true,
    node: process.version,
    time: (/* @__PURE__ */ new Date()).toISOString(),
    cafeRouterLoaded: !!cafeRouter,
    cafeRouterError: cafeLoadError
  });
});
var mongoRouter = null;
var mongoLoadError = null;
var mongoLoadStack = null;
async function getMongoRouter() {
  if (mongoRouter) return mongoRouter;
  if (mongoLoadError) return null;
  try {
    const mod = await Promise.resolve().then(() => (init_mongodb(), mongodb_exports));
    mongoRouter = mod.createMongoApiRouter();
    return mongoRouter;
  } catch (err) {
    mongoLoadError = err?.message || String(err);
    mongoLoadStack = err?.stack || null;
    console.error("Failed to load MongoDB router:", mongoLoadError, mongoLoadStack);
    return null;
  }
}
var cafeRouter = null;
var cafeLoadError = null;
var cafeLoadStack = null;
async function getCafeRouter() {
  if (cafeRouter) return cafeRouter;
  if (cafeLoadError) return null;
  try {
    const mod = await Promise.resolve().then(() => (init_api(), api_exports));
    cafeRouter = mod.createCafeApiRouter();
    return cafeRouter;
  } catch (err) {
    cafeLoadError = err?.message || String(err);
    cafeLoadStack = err?.stack || null;
    console.error("Failed to load cafe router:", cafeLoadError, cafeLoadStack);
    return null;
  }
}
app.use(["/api/mongo", "/mongo"], async (req, res, next) => {
  const router = await getMongoRouter();
  if (!router) {
    return res.status(503).json({
      success: false,
      message: "\u062E\u062F\u0645\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
      error: mongoLoadError,
      stack: mongoLoadStack,
      node: process.version
    });
  }
  router(req, res, next);
});
app.use("/api", async (req, res, next) => {
  const router = await getCafeRouter();
  if (!router) {
    return res.status(503).json({
      success: false,
      message: "\u062E\u062F\u0645\u0629 \u0627\u0644\u0643\u0627\u0641\u064A\u0647 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D\u0629 \u062D\u0627\u0644\u064A\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
      error: cafeLoadError,
      stack: cafeLoadStack,
      node: process.version
    });
  }
  router(req, res, next);
});
app.use((err, req, res, next) => {
  console.error("Unhandled API error:", err?.message || err, err?.stack);
  res.status(500).json({
    success: false,
    message: "\u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631.",
    error: err?.message || String(err),
    stack: err?.stack || null
  });
});
var vercel_entry_default = app;
