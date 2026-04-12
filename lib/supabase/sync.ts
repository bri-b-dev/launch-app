import type { SQLiteDatabase } from 'expo-sqlite';
import { getSupabaseConfigError, supabase } from './client';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncResult {
  status: 'success' | 'error';
  error?: string;
  syncedAt: string;
}

export async function syncToSupabase(
  db: SQLiteDatabase,
  userId: string,
): Promise<SyncResult> {
  const syncedAt = new Date().toISOString();

  if (supabase == null) {
    return { status: 'error', error: getSupabaseConfigError(), syncedAt };
  }

  // Refresh token manually (autoRefreshToken is disabled for offline-first operation)
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError != null) {
    return { status: 'error', error: `Token-Refresh fehlgeschlagen: ${refreshError.message}`, syncedAt };
  }

  try {
    const [clubs, sessions, sessionClubs, margins, shots] = await Promise.all([
      db.getAllAsync<Record<string, unknown>>('SELECT * FROM clubs'),
      db.getAllAsync<Record<string, unknown>>('SELECT * FROM sessions'),
      db.getAllAsync<Record<string, unknown>>('SELECT * FROM session_clubs'),
      db.getAllAsync<Record<string, unknown>>('SELECT * FROM margins'),
      db.getAllAsync<Record<string, unknown>>('SELECT * FROM shots'),
    ]);

    const tag = (rows: Record<string, unknown>[]) =>
      rows.map((row) => ({ ...row, user_id: userId }));

    const results = await Promise.all([
      supabase.from('clubs').upsert(tag(clubs), { onConflict: 'id' }),
      supabase.from('sessions').upsert(tag(sessions), { onConflict: 'id' }),
      supabase.from('session_clubs').upsert(tag(sessionClubs), { onConflict: 'session_id,club_id' }),
      supabase.from('margins').upsert(tag(margins), { onConflict: 'id' }),
      supabase.from('shots').upsert(tag(shots), { onConflict: 'id' }),
    ]);

    const failed = results.find((r) => r.error != null);
    if (failed?.error != null) {
      return { status: 'error', error: failed.error.message, syncedAt };
    }

    return { status: 'success', syncedAt };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unbekannter Fehler';
    return { status: 'error', error: message, syncedAt };
  }
}
