import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with fallbacks for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://xtaqdaamzqzqvhqeijjh.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0YXFkYWFtenF6cXZocWVpampoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwOTc5MzIsImV4cCI6MjA3MDY3MzkzMn0.AwW3LQyaeEzlCDmlRU3zrxzX6DasjOFZGeiPAEiub54";

// Log environment variable status for debugging
console.log('🔧 Supabase Client Configuration:', {
  url: SUPABASE_URL ? 'Configured' : 'Missing',
  key: SUPABASE_ANON_KEY ? 'Configured' : 'Missing',
  environment: import.meta.env.MODE,
  timestamp: new Date().toISOString()
});

// Validate required environment variables but don't throw in production
// Instead, we'll create a client that can handle missing vars gracefully
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Missing Supabase environment variables. Some features may not work correctly.');
  if (import.meta.env.DEV) {
    console.error('Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
  }
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Client-Info': 'apartment-locator-ai@1.0.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});