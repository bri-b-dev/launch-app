import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim() ?? '';

const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const hasSupabaseConfig = supabaseUrl.length > 0 && supabaseAnonKey.length > 0;

export function getSupabaseConfigError(): string {
  return 'Supabase-Konfiguration fehlt. EXPO_PUBLIC_SUPABASE_URL und EXPO_PUBLIC_SUPABASE_KEY im Build setzen.';
}

export const supabase: SupabaseClient | null = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: SecureStoreAdapter,
        autoRefreshToken: false,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
