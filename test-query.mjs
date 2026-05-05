import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
    const { data, error } = await supabase.from('rendez_vous').select(`
            *,
            pet:pets!rendez_vous_pet_id_fkey(id, name, species, photo_url),
            profiles!rendez_vous_maitre_id_fkey ( full_name, phone, wilaya )
          `).limit(1)
    console.log("RDV error:", error)
}
test()
