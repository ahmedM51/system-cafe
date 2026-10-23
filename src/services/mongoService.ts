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
  inventory?: any[];
  orders?: any[];
  users?: any[];
  shifts?: any[];
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
};
