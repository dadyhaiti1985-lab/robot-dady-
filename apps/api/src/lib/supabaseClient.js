import { createClient } from '@supabase/supabase-js';

// Hostinger can inject SUPABASE_URL and SUPABASE_KEY automatically.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase, supabaseUrl, supabaseKey };
export default supabase;
