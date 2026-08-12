// Hostinger can inject SUPABASE_URL and SUPABASE_KEY automatically.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
let supabaseInitError = null;

export async function getSupabaseClient() {
  if (supabase) return supabase;
  if (!supabaseUrl || !supabaseKey) return null;

  try {
    const module = await import('@supabase/supabase-js');
    const createClient = module?.createClient;
    if (typeof createClient !== 'function') {
      throw new Error('createClient export not found');
    }
    supabase = createClient(supabaseUrl, supabaseKey);
    supabaseInitError = null;
    return supabase;
  } catch (error) {
    supabaseInitError = error;
    return null;
  }
}

export function getSupabaseInitError() {
  return supabaseInitError;
}

export { supabase, supabaseUrl, supabaseKey };
export default supabase;
