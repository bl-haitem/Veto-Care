console.log('SUPABASE ENV', import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
import { createClient } from '@supabase/supabase-js'

// Log all env variables for debug
console.log('SUPABASE ENV', {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  SERVICE: import.meta.env.VITE_SUPABASE_SERVICE_KEY
})

// Use ANON or PUBLISHABLE key for public client
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)
