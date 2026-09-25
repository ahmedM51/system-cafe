import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://diaxrnpbxlmmcjdiemoh.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYXhybnBieGxtbWNqZGllbW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyODU1NTMsImV4cCI6MjEwNTg2MTU1M30.LgGySKQ_btWIJi-9r7IrH2h38jhNnKAfwd1693hVYso';

export const SUPABASE_SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpYXhybnBieGxtbWNqZGllbW9oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDI4NTU1MywiZXhwIjoyMTA1ODYxNTUzfQ.6-jmmPkaZcmodUYBXJD2kAavnD7AsDYZzwtciWrnGUk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Admin supabase client for server-side or privileged operations
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
