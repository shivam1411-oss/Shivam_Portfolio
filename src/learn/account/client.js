// The Supabase client, loaded on demand (it is not needed to show free lessons).
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '../supabase.config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    flowType: 'pkce',
    persistSession: true, // stay signed in on this device
    autoRefreshToken: true,
    detectSessionInUrl: true, // links that carry ?code=…
    storageKey: 'lab-auth',
  },
});
