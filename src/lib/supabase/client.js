import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xzlqyznkppporpviewhh.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6bHF5em5rcHBwb3Jwdmlld2hoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczNjkyMTYsImV4cCI6MjA5Mjk0NTIxNn0.jqhzkpreJgiPM4wJoYqZvJ33QRJ75LrYUV6R0Kv1wxg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})