import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseBrowser() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowser can only be used in browser');
  }

  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabaseInstance;
}

export const supabase = typeof window !== 'undefined' ? getSupabaseBrowser() : null as any;
