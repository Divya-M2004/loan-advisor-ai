import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL!
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY!

if (!url?.includes('.supabase.co')) {
  throw new Error('This app is configured for Supabase Cloud only. Check VITE_SUPABASE_URL.')
}

export const supabase = createClient(url, anon, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
