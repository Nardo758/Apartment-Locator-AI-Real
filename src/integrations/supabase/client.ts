// This file is generated but safe to edit: it initializes the Supabase client
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // In local dev, it's fine to log; in production you should ensure env vars are set
   
  console.warn('Supabase URL or ANON key is not set. Check your environment variables.')
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
     
    console.error('Error getting user:', error)
    return null
  }
  // data has shape { user?: User }
  return (data as any).user || null
}

// Helper to return current user id (or null)
export const getCurrentUserId = async () => {
  const user = await getCurrentUser()
  return user?.id || null
}