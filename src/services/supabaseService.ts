import { supabase, supabaseAdmin, SUPABASE_URL } from '../lib/supabase';
import { User, Product, CafeSettings, PlayStationDevice, Table, Shift, Expense, DaySummary } from '../types';

const BUCKET_NAME = 'cafe-data';

// Helper to convert any image file to a compressed Base64 Data URL (guaranteed fallback)
export const compressImageToDataUrl = (file: File | Blob, maxWidth = 400, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

// Helper to ensure bucket exists
let bucketChecked = false;
export const ensureBucketExists = async () => {
  if (bucketChecked) return;
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets();
    const exists = buckets?.some((b) => b.name === BUCKET_NAME);
    if (!exists) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
    }
    bucketChecked = true;
  } catch (err) {
    console.warn('Bucket check/creation error:', err);
  }
};

// Helper to get public URL of an uploaded file in Supabase Storage
export const getSupabaseFileUrl = (path: string): string => {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
};

// Upload an image file (File or Blob) to Supabase Storage with automatic fallback
export const uploadImageToSupabase = async (
  file: File | Blob,
  folder: 'avatars' | 'products' | 'branding' = 'products'
): Promise<{ url: string | null; error: string | null }> => {
  try {
    // Generate safe local data URL first as guaranteed fallback
    const localDataUrl = await compressImageToDataUrl(file, 400);

    // Try ensuring bucket exists
    await ensureBucketExists().catch(() => {});

    const ext = file.type.split('/')[1] || 'png';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type || 'image/jpeg',
      });

    if (error) {
      console.warn('Supabase storage upload error, using compressed data URL:', error.message);
      return { url: localDataUrl, error: null };
    }

    const publicUrl = getSupabaseFileUrl(data.path);
    return { url: publicUrl, error: null };
  } catch (err: any) {
    console.warn('Upload exception, falling back to local compressed data URL:', err);
    try {
      const fallbackUrl = await compressImageToDataUrl(file, 400);
      return { url: fallbackUrl, error: null };
    } catch (e: any) {
      return { url: null, error: err.message || 'فشل في معالجة الصورة' };
    }
  }
};

// Sync app data bundle to Supabase Storage
export const syncDataToSupabase = async (key: string, data: any): Promise<boolean> => {
  try {
    const content = JSON.stringify(data);
    const { error } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(`${key}.json`, content, {
        upsert: true,
        contentType: 'application/json',
      });

    if (error) {
      console.warn(`Failed to sync ${key} to Supabase:`, error);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`Exception syncing ${key} to Supabase:`, err);
    return false;
  }
};

// Fetch app data bundle from Supabase Storage
export const fetchDataFromSupabase = async <T>(key: string): Promise<T | null> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(`${key}.json`);

    if (error || !data) {
      return null;
    }

    const text = await data.text();
    return JSON.parse(text) as T;
  } catch (err) {
    return null;
  }
};

// Supabase Auth: Register new user
export const registerUserInSupabase = async (
  email: string,
  password: string,
  metadata: { name: string; role: 'admin' | 'cashier'; phone?: string; avatar?: string; pin?: string }
) => {
  try {
    // We use supabaseAdmin so we can confirm the email directly without waiting for email verification
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: metadata,
    });

    if (error) {
      // Fallback to standard signUp
      const fallback = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      return { user: fallback.data.user, error: fallback.error };
    }

    return { user: data.user, error: null };
  } catch (err: any) {
    return { user: null, error: err };
  }
};

// Supabase Auth: Sign In
export const signInWithSupabase = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
};

// Supabase Auth: Update user in Supabase
export const updateUserInSupabase = async (
  userIdOrEmail: string,
  updates: { name?: string; role?: 'admin' | 'cashier'; avatar?: string; phone?: string; pin?: string; email?: string }
) => {
  try {
    // List users to find by id or email
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersData?.users?.find(
      (u) => u.id === userIdOrEmail || u.email === userIdOrEmail
    );

    if (existing) {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        email: updates.email || existing.email,
        user_metadata: {
          ...existing.user_metadata,
          ...updates,
        },
      });
      return { data, error };
    }
    return { data: null, error: null };
  } catch (err: any) {
    console.warn('Update user in Supabase failed:', err);
    return { data: null, error: err };
  }
};

// Supabase Auth: Delete user from Supabase
export const deleteUserFromSupabase = async (userIdOrEmail: string) => {
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersData?.users?.find(
      (u) => u.id === userIdOrEmail || u.email === userIdOrEmail
    );
    if (existing) {
      await supabaseAdmin.auth.admin.deleteUser(existing.id);
    }
  } catch (err) {
    console.warn('Delete user from Supabase failed:', err);
  }
};
