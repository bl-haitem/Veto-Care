import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data, error } = await supabase.from('pets').select('*').limit(1)
    console.log("pets Error:", error)
    console.log("pets Data:", data)

    const { data: v, error: ve } = await supabase.from('veterinaires').select('*').limit(1)
    console.log("Vets:", ve, v)

    const { data: r, error: re } = await supabase.from('rendez_vous').select('*').limit(1)
    console.log("RDV:", re, r)
}

test()
