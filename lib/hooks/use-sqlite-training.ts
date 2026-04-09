import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export interface DbClub {
  id: string;
  name: string;
  type: string;
  loft: string;
  length: string;
  manufacturer: string;
  model: string;
  target: string;
  session_label: string;
  bias: string;
  shot_count: string;
  avg_carry: string;
  hit_rate: string;
  archived: number;
}

export interface ClubDraft {
  name: string;
  type: string;
  loft: string;
  length: string;
  manufacturer: string;
  model: string;
}

export interface DbMargin {
  id: string;
  club_id: string;
  label: string;
  current_value: string;
  range_value: string;
  accent: 'green' | 'blue' | 'gold' | 'orange';
}

export interface DbSession {
  id: string;
  date: string;
  title: string;
  shots_label: string;
  carry_label: string;
  focus: string;
  summary: string;
}

export interface DbShot {
  id: string;
  club_id: string;
  carry: string;
  shape: string;
  quality: string;
  note: string;
  ball_speed: string;
  club_speed: string;
  vla: string;
  spin: string;
  accent: 'green' | 'blue' | 'gold' | 'orange';
}

export interface DbSessionClub extends DbClub {
  session_id: string;
}

export interface DbShotDetail extends DbShot {
  club_name: string;
  club_type: string;
  club_loft: string;
  club_target: string;
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function useAsyncRows<T>(queryKey: string, load: () => Promise<T[]>) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    load()
      .then((result) => {
        if (active) {
          setRows(result);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return { rows, loading, error };
}

function useAsyncValue<T>(queryKey: string, load: () => Promise<T | null>) {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    load()
      .then((result) => {
        if (active) {
          setValue(result);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [queryKey]);

  return { value, loading, error };
}

export function useClubs(includeArchived = false) {
  const db = useSQLiteContext();
  return useAsyncRows<DbClub>(`clubs-${includeArchived ? 'all' : 'active'}`, () =>
    db.getAllAsync<DbClub>(
      `SELECT * FROM clubs
       ${includeArchived ? '' : 'WHERE archived = 0'}
       ORDER BY archived ASC, name COLLATE NOCASE ASC`,
    ),
  );
}

export function useMargins(clubId: string | null) {
  const db = useSQLiteContext();
  return useAsyncRows<DbMargin>(`margins-${clubId ?? 'none'}`, async () => {
    if (clubId == null) {
      return [];
    }
    return db.getAllAsync<DbMargin>(
      'SELECT * FROM margins WHERE club_id = ? ORDER BY label ASC',
      clubId,
    );
  });
}

export function useClubShots(clubId: string | null) {
  const db = useSQLiteContext();
  return useAsyncRows<DbShot>(`shots-${clubId ?? 'none'}`, async () => {
    if (clubId == null) {
      return [];
    }
    return db.getAllAsync<DbShot>(
      'SELECT * FROM shots WHERE club_id = ? ORDER BY rowid DESC',
      clubId,
    );
  });
}

export function useSessions() {
  const db = useSQLiteContext();
  return useAsyncRows<DbSession>('sessions', () =>
    db.getAllAsync<DbSession>('SELECT * FROM sessions ORDER BY date DESC'),
  );
}

export function useSessionDetail(sessionId: string | null) {
  const db = useSQLiteContext();
  const sessionState = useAsyncValue<DbSession>(
    `session-${sessionId ?? 'none'}`,
    async () => {
      if (sessionId == null) {
        return null;
      }
      return db.getFirstAsync<DbSession>('SELECT * FROM sessions WHERE id = ?', sessionId);
    },
  );

  const clubsState = useAsyncRows<DbSessionClub>(
    `session-clubs-${sessionId ?? 'none'}`,
    async () => {
      if (sessionId == null) {
        return [];
      }
      return db.getAllAsync<DbSessionClub>(
        `SELECT clubs.*, session_clubs.session_id
         FROM session_clubs
         INNER JOIN clubs ON clubs.id = session_clubs.club_id
         WHERE session_clubs.session_id = ?
         ORDER BY clubs.name ASC`,
        sessionId,
      );
    },
  );

  return {
    session: sessionState.value,
    clubs: clubsState.rows,
    loading: sessionState.loading || clubsState.loading,
    error: sessionState.error ?? clubsState.error,
  };
}

export function useShotDetail(shotId: string | null) {
  const db = useSQLiteContext();
  const shotState = useAsyncValue<DbShotDetail>(
    `shot-${shotId ?? 'none'}`,
    async () => {
      if (shotId == null) {
        return null;
      }
      return db.getFirstAsync<DbShotDetail>(
        `SELECT
           shots.*,
           clubs.name AS club_name,
           clubs.type AS club_type,
           clubs.loft AS club_loft,
           clubs.target AS club_target
         FROM shots
         INNER JOIN clubs ON clubs.id = shots.club_id
         WHERE shots.id = ?`,
        shotId,
      );
    },
  );

  return {
    shot: shotState.value,
    loading: shotState.loading,
    error: shotState.error,
  };
}

export function useClubAdmin() {
  const db = useSQLiteContext();
  const [revision, setRevision] = useState(0);

  const refresh = useCallback(() => {
    setRevision((current) => current + 1);
  }, []);

  const clubsState = useAsyncRows<DbClub>(`club-admin-${revision}`, () =>
    db.getAllAsync<DbClub>(
      `SELECT * FROM clubs
       ORDER BY archived ASC, name COLLATE NOCASE ASC`,
    ),
  );

  const createClub = useCallback(async (draft: ClubDraft) => {
    const clubId = createId('club');
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO clubs (
          id, name, type, loft, length, manufacturer, model, target, session_label,
          bias, shot_count, avg_carry, hit_rate, archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        clubId,
        draft.name.trim(),
        draft.type.trim(),
        draft.loft.trim(),
        draft.length.trim(),
        draft.manufacturer.trim(),
        draft.model.trim(),
        '',
        draft.name.trim(),
        'Neutral',
        '0',
        '—',
        '—',
        0,
      );

      const defaultMargins = [
        { label: 'AoA', current: '—', range: 'Noch nicht definiert', accent: 'green' },
        { label: 'Spin Axis', current: '—', range: 'Noch nicht definiert', accent: 'blue' },
        { label: 'Face to Target', current: '—', range: 'Noch nicht definiert', accent: 'gold' },
      ] as const;

      for (const margin of defaultMargins) {
        await db.runAsync(
          `INSERT INTO margins (id, club_id, label, current_value, range_value, accent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          `${clubId}-${margin.label}`,
          clubId,
          margin.label,
          margin.current,
          margin.range,
          margin.accent,
        );
      }
    });

    refresh();
    return clubId;
  }, [db, refresh]);

  const updateClub = useCallback(async (clubId: string, draft: ClubDraft) => {
    await db.runAsync(
      `UPDATE clubs
       SET name = ?, type = ?, loft = ?, length = ?, manufacturer = ?, model = ?, session_label = ?
       WHERE id = ?`,
      draft.name.trim(),
      draft.type.trim(),
      draft.loft.trim(),
      draft.length.trim(),
      draft.manufacturer.trim(),
      draft.model.trim(),
      draft.name.trim(),
      clubId,
    );
    refresh();
  }, [db, refresh]);

  const setClubArchived = useCallback(async (clubId: string, archived: boolean) => {
    await db.runAsync('UPDATE clubs SET archived = ? WHERE id = ?', archived ? 1 : 0, clubId);
    refresh();
  }, [db, refresh]);

  const deleteClub = useCallback(async (clubId: string) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM session_clubs WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM margins WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM shots WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM clubs WHERE id = ?', clubId);
    });
    refresh();
  }, [db, refresh]);

  const updateMargin = useCallback(async (
    marginId: string,
    values: Pick<DbMargin, 'current_value' | 'range_value'>,
  ) => {
    await db.runAsync(
      `UPDATE margins
       SET current_value = ?, range_value = ?
       WHERE id = ?`,
      values.current_value.trim(),
      values.range_value.trim(),
      marginId,
    );
    refresh();
  }, [db, refresh]);

  return {
    rows: clubsState.rows,
    loading: clubsState.loading,
    error: clubsState.error,
    createClub,
    updateClub,
    setClubArchived,
    deleteClub,
    updateMargin,
  };
}
