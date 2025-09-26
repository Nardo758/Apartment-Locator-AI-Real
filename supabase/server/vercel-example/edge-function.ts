// Vercel Edge Function example (Edge runtime compatible)
// Place SUPABASE_SERVICE_ROLE_KEY in Vercel's Environment Variables (Project Settings -> Environment Variables)
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use the service role key only on the server (Edge function runs on the server)
const supabase = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '')

export default async function handler(req: Request) {
  try {
    // Example: run a privileged query to insert a record
    const { data, error } = await supabase.from('server_logs').insert([{ message: 'Triggered from Vercel Edge' }])
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }
    return new Response(JSON.stringify({ data }), { status: 200 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 })
  }
}
