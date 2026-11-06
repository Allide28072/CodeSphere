import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

const looksLikePlaceholder =
  !rawUrl ||
  !rawKey ||
  rawUrl.includes('your-project-ref') ||
  rawKey.includes('your-anon-public-key');

export const isSupabaseConfigured = !looksLikePlaceholder;

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const STORAGE_BUCKET = 'project-media';

export function requireSupabase() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
    );
  }
  return supabase;
}

export function isMissingSchemaError(error) {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    String(error.message || '').includes('Could not find the table') ||
    String(error.message || '').includes('does not exist')
  );
}

export async function hasSupabaseSchema() {
  if (!supabase) return false;

  const { error } = await supabase.from('site_profile').select('id').limit(1);
  if (!error) return true;
  if (isMissingSchemaError(error)) return false;

  return true;
}
