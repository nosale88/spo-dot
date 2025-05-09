import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL (VITE_SUPABASE_URL) and Anon Key (VITE_SUPABASE_ANON_KEY) must be defined in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
