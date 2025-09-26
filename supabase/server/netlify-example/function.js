// Netlify Function example (server-side)
// Put SUPABASE_SERVICE_ROLE_KEY into Netlify UI -> Site settings -> Build & deploy -> Environment

const { createClient } = require('@supabase/supabase-js')

exports.handler = async function (event, context) {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  try {
    const { data, error } = await supabase.from('server_logs').insert([{ message: 'Triggered from Netlify' }])
    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
    return { statusCode: 200, body: JSON.stringify({ data }) }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Server error' }) }
  }
}
