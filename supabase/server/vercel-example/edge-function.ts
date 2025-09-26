import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// This example demonstrates how to use the service role key server-side in a Vercel function.
// Place SUPABASE_SERVICE_ROLE_KEY in Vercel's Environment Variables (Project Settings -> Environment Variables)

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Example: run a privileged query to insert a record
    const { data, error } = await supabase.from('server_logs').insert([{ message: 'Triggered from Vercel' }])
    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json({ data })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err)
    return res.status(500).json({ error: 'Server error' })
  }
}
