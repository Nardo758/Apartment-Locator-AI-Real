// Express example endpoint that uses SUPABASE_SERVICE_ROLE_KEY from server env
const express = require('express')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(express.json())

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

app.post('/api/privileged', async (req, res) => {
  try {
    const { data, error } = await supabase.from('server_logs').insert([{ message: 'Triggered from Express' }])
    if (error) return res.status(500).json({ error: error.message })
    res.json({ data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server listening on ${port}`))
