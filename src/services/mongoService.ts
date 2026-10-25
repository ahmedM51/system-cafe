/**
 * MongoDB Atlas Cloud Sync Service
 */

export interface MongoStatusResponse {
  success: boolean;
  connected: boolean;
  cluster: string;
  database: string;
  username: string;
  collections: string[];
  countStats: { [key: string]: number };
  lastError: string | null;
  lastSyncTimestamp: string | null;
  hint?: string;
}

export interface MongoSyncPayload {
  settings?: any;
  products?: any[];
  categories?: string[];
  inventory?: any[];
  orders?: any[];
  expenses?: any[];
  currentShift?: any;
  shifts?: any[];
  users?: any[];
  tables?: any[];
  playstations?: any[];
}

export const mongoService = {
  /**
   * Fetch live status of MongoDB Atlas connection
   */
  async getStatus(): Promise<MongoStatusResponse> {
    try {
      const res = await fetch('/api/mongo/status');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        connected: false,
        cluster: 'cluster0.w7l7m9v.mongodb.net',
        database: 'hub_cafe_db',
        username: 'ahmedmohamedm4336_db_user',
        collections: [],
        countStats: {},
        lastError: err?.message || 'تعذر الاتصال بخادم الـ Backend',
        lastSyncTimestamp: null,
      };
    }
  },

  /**
   * Test connection on demand with optional custom URI
   */
  async testConnection(uri?: string): Promise<{ success: boolean; connected: boolean; message: string; lastError?: string }> {
    try {
      const res = await fetch('/api/mongo/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        connected: false,
        message: 'فشل في إرسال طلب الفحص: ' + err?.message,
      };
    }
  },

  /**
   * Sync complete cafe dataset to MongoDB Atlas
   */
  async syncAllData(payload: MongoSyncPayload): Promise<{ success: boolean; message: string; syncedRecords?: any }> {
    try {
      const res = await fetch('/api/mongo/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'فشل في المزامنة');
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'خطأ أثناء المزامنة مع MongoDB Atlas',
      };
    }
  },

  /**
   * Download all cafe records from MongoDB Atlas
   */
  async fetchAllData(): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const res = await fetch('/api/mongo/data');
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'فشل في جلب البيانات من MongoDB',
      };
    }
  },

  /**
   * Real Google Authentication persisted in MongoDB Atlas with Token Verification
   */
  async authWithGoogle(payload: { 
    email?: string; 
    name?: string; 
    avatar?: string; 
    googleId?: string;
    token?: string;
    credential?: string;
  }): Promise<{ success: boolean; user?: any; tokenVerified?: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'فشل في إرسال بيانات Google إلى MongoDB',
      };
    }
  },

  /**
   * Save Order directly to MongoDB Atlas collection hub_orders on Payment
   */
  async saveOrderDirectly(
    order: any, 
    inventoryDeductions?: any[], 
    shiftUpdate?: any
  ): Promise<{ success: boolean; mongoConnected?: boolean; orderId?: string; message: string }> {
    try {
      const res = await fetch('/api/mongo/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, inventoryDeductions, shiftUpdate }),
      });
      return await res.json();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'خطأ في حفظ الطلب مباشرة في MongoDB',
      };
    }
  },

  /**
   * Save Product directly to MongoDB Atlas collection hub_products
   */
  async saveProductDirectly(product: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  },

  /**
   * Save Expense directly to MongoDB Atlas collection hub_expenses
   */
  async saveExpenseDirectly(expense: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  },

  /**
   * Save Shift directly to MongoDB Atlas collection hub_shifts
   */
  async saveShiftDirectly(shift: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  },

  /**
   * Save Table directly to MongoDB Atlas collection hub_tables
   */
  async saveTableDirectly(table: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  },

  /**
   * Save PlayStation directly to MongoDB Atlas collection hub_playstations
   */
  async savePlaystationDirectly(playstation: any): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/mongo/playstations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playstation }),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: e?.message };
    }
  },
};
