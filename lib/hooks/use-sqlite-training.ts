import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ConnectionState, ShotData } from '../types/shot';

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
  session_id: string;
  carry: string;
  shape: string;
  quality: string;
  note: string;
  ball_speed: string;
  club_speed: string;
  vla: string;
  spin: string;
  accent: 'green' | 'blue' | 'gold' | 'orange';
  hla: number | null;
  spin_axis: number | null;
}

export interface DbShotDebugEvent {
  id: string;
  created_at: string;
  club_id: string;
  session_id: string;
  connection_state: ConnectionState;
  persist_status: 'logged' | 'persisted' | 'persist_failed';
  persisted_shot_id: string | null;
  error_message: string | null;
  ball_speed_mph: number;
  club_speed_mph: number | null;
  vertical_launch_angle: number;
  horizontal_launch_angle: number;
  total_spin: number;
  spin_axis: number;
  carry_distance_yards: number;
  is_estimated_spin: number;
  has_club_data: number;
  angle_of_attack: number | null;
  club_path: number | null;
  face_to_target: number | null;
  dynamic_loft: number | null;
  spin_loft: number | null;
  has_face_impact: number;
  face_impact_x: number | null;
  face_impact_y: number | null;
}

interface ShotDebugDraft {
  clubId: string;
  sessionId: string | null;
  connectionState: ConnectionState;
  shot: ShotData;
}

export interface ShotStats {
  shotCount: number;
  avgCarry: number | null;
  stdDevCarry: number | null;
  minCarry: number | null;
  maxCarry: number | null;
  avgBallSpeed: number | null;
  stdDevBallSpeed: number | null;
  avgClubSpeed: number | null;
  stdDevClubSpeed: number | null;
  smashFactor: number | null;
  avgVla: number | null;
  avgSpin: number | null;
  stdDevSpin: number | null;
  hitRatePct: number | null;
  shapeDist: Record<string, number>;
}

function parseNum(val: string): number | null {
  const n = Number.parseFloat(val.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function numAvg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function numStdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function computeStats(shots: DbShot[]): ShotStats {
  if (shots.length === 0) {
    return {
      shotCount: 0,
      avgCarry: null,
      stdDevCarry: null,
      minCarry: null,
      maxCarry: null,
      avgBallSpeed: null,
      stdDevBallSpeed: null,
      avgClubSpeed: null,
      stdDevClubSpeed: null,
      smashFactor: null,
      avgVla: null,
      avgSpin: null,
      stdDevSpin: null,
      hitRatePct: null,
      shapeDist: {},
    };
  }

  const carries = shots.map((s) => parseNum(s.carry)).filter((v): v is number => v != null);
  const ballSpeeds = shots.map((s) => parseNum(s.ball_speed)).filter((v): v is number => v != null);
  const clubSpeeds = shots.map((s) => parseNum(s.club_speed)).filter((v): v is number => v != null);
  const vlas = shots.map((s) => parseNum(s.vla)).filter((v): v is number => v != null);
  const spins = shots.map((s) => parseNum(s.spin)).filter((v): v is number => v != null);
  const hitCount = shots.filter((s) => s.accent !== 'orange').length;

  const shapeDist: Record<string, number> = {};
  for (const shot of shots) {
    shapeDist[shot.shape] = (shapeDist[shot.shape] ?? 0) + 1;
  }

  const avgBallSpeed = numAvg(ballSpeeds);
  const avgClubSpeed = clubSpeeds.length > 0 ? numAvg(clubSpeeds) : null;
  const smashFactor =
    avgBallSpeed != null && avgClubSpeed != null && avgClubSpeed > 0
      ? avgBallSpeed / avgClubSpeed
      : null;

  return {
    shotCount: shots.length,
    avgCarry: numAvg(carries),
    stdDevCarry: numStdDev(carries),
    minCarry: carries.length > 0 ? Math.min(...carries) : null,
    maxCarry: carries.length > 0 ? Math.max(...carries) : null,
    avgBallSpeed,
    stdDevBallSpeed: numStdDev(ballSpeeds),
    avgClubSpeed,
    stdDevClubSpeed: clubSpeeds.length > 0 ? numStdDev(clubSpeeds) : null,
    smashFactor,
    avgVla: numAvg(vlas),
    avgSpin: numAvg(spins),
    stdDevSpin: numStdDev(spins),
    hitRatePct: (hitCount / shots.length) * 100,
    shapeDist,
  };
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

interface TrainingDataContextValue {
  revision: number;
  bumpRevision: () => void;
}

const TrainingDataContext = createContext<TrainingDataContextValue | null>(null);

function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function formatSessionDate(date: Date): string {
  const formatter = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: 'short',
  });
  const parts = formatter.formatToParts(date);
  const day = parts.find((part) => part.type === 'day')?.value ?? '00';
  const month = parts.find((part) => part.type === 'month')?.value ?? '';
  return `${day} ${month.charAt(0).toUpperCase()}${month.slice(1)}`;
}

function formatCarryLabel(avgCarry: number | null): string {
  if (avgCarry == null || Number.isNaN(avgCarry)) {
    return 'Ø —';
  }
  return `Ø ${Math.round(avgCarry)}y`;
}

function classifyShot(shot: ShotData): Pick<DbShot, 'shape' | 'quality' | 'note' | 'accent'> {
  if (shot.spinAxis < -3) {
    return {
      shape: 'Draw',
      quality: Math.abs(shot.spinAxis) < 10 ? 'Stabil' : 'Überzogen',
      note: `Spin Axis ${shot.spinAxis.toFixed(1)}°, Carry ${shot.carryDistanceYards.toFixed(0)}y.`,
      accent: Math.abs(shot.spinAxis) < 10 ? 'blue' : 'orange',
    };
  }
  if (shot.spinAxis > 3) {
    return {
      shape: 'Fade',
      quality: Math.abs(shot.spinAxis) < 10 ? 'Stabil' : 'Offen',
      note: `Spin Axis +${shot.spinAxis.toFixed(1)}°, Carry ${shot.carryDistanceYards.toFixed(0)}y.`,
      accent: 'orange',
    };
  }
  return {
    shape: 'Straight',
    quality: 'Neutral',
    note: `Start neutral, Carry ${shot.carryDistanceYards.toFixed(0)}y.`,
    accent: 'green',
  };
}

function useTrainingDataContext() {
  const context = useContext(TrainingDataContext);
  if (context == null) {
    throw new Error('use-sqlite-training hooks must be used inside TrainingDataProvider');
  }
  return context;
}

export function TrainingDataProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [revision, setRevision] = useState(0);

  const value = useMemo(
    () => ({
      revision,
      bumpRevision: () => {
        setRevision((current) => current + 1);
      },
    }),
    [revision],
  );

  return React.createElement(TrainingDataContext.Provider, { value }, children);
}

function useAsyncRows<T>(queryKey: string, load: () => Promise<T[]>) {
  const { revision } = useTrainingDataContext();
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
  }, [queryKey, revision]);

  return { rows, loading, error };
}

function useAsyncValue<T>(queryKey: string, load: () => Promise<T | null>) {
  const { revision } = useTrainingDataContext();
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
  }, [queryKey, revision]);

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

export function useSessionShots(sessionId: string | null) {
  const db = useSQLiteContext();
  return useAsyncRows<DbShot>(`session-shots-${sessionId ?? 'none'}`, async () => {
    if (sessionId == null) return [];
    return db.getAllAsync<DbShot>(
      'SELECT * FROM shots WHERE session_id = ? ORDER BY rowid DESC',
      sessionId,
    );
  });
}

export function useSessions() {
  const db = useSQLiteContext();
  return useAsyncRows<DbSession>('sessions', () =>
    db.getAllAsync<DbSession>('SELECT * FROM sessions ORDER BY rowid DESC'),
  );
}

export interface DbSessionEnriched extends DbSession {
  club_names: string;
}

export function useSessionsEnriched() {
  const db = useSQLiteContext();
  return useAsyncRows<DbSessionEnriched>('sessions-enriched', () =>
    db.getAllAsync<DbSessionEnriched>(
      `SELECT s.*, COALESCE(GROUP_CONCAT(c.name, ', '), '') AS club_names
       FROM sessions s
       LEFT JOIN session_clubs sc ON sc.session_id = s.id
       LEFT JOIN clubs c ON c.id = sc.club_id
       GROUP BY s.id
       ORDER BY s.rowid DESC`,
    ),
  );
}

export function useSessionShotsDetail(sessionId: string | null) {
  const db = useSQLiteContext();
  return useAsyncRows<DbShotDetail>(`session-shots-detail-${sessionId ?? 'none'}`, async () => {
    if (sessionId == null) return [];
    return db.getAllAsync<DbShotDetail>(
      `SELECT shots.*,
              clubs.name AS club_name,
              clubs.type AS club_type,
              clubs.loft AS club_loft,
              clubs.target AS club_target
       FROM shots
       INNER JOIN clubs ON clubs.id = shots.club_id
       WHERE shots.session_id = ?
       ORDER BY shots.rowid ASC`,
      sessionId,
    );
  });
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

export interface DbClubSessionStat {
  session_id: string;
  date: string;
  title: string;
  shot_count: number;
  avg_carry: number | null;
  avg_ball_speed: number | null;
  hit_rate_pct: number | null;
}

export function useClubSessionStats(clubId: string | null) {
  const db = useSQLiteContext();
  return useAsyncRows<DbClubSessionStat>(`club-session-stats-${clubId ?? 'none'}`, async () => {
    if (clubId == null) return [];
    return db.getAllAsync<DbClubSessionStat>(
      `SELECT
         shots.session_id,
         COALESCE(s.date, '') AS date,
         COALESCE(s.title, shots.session_id) AS title,
         COUNT(*) AS shot_count,
         AVG(CAST(shots.carry AS REAL)) AS avg_carry,
         AVG(CAST(CASE WHEN shots.ball_speed = '—' THEN NULL ELSE shots.ball_speed END AS REAL)) AS avg_ball_speed,
         SUM(CASE WHEN shots.accent != 'orange' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS hit_rate_pct
       FROM shots
       LEFT JOIN sessions s ON s.id = shots.session_id
       WHERE shots.club_id = ?
       GROUP BY shots.session_id
       ORDER BY MAX(shots.rowid) DESC`,
      clubId,
    );
  });
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
  const { revision, bumpRevision } = useTrainingDataContext();

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

    bumpRevision();
    return clubId;
  }, [bumpRevision, db]);

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
    bumpRevision();
  }, [bumpRevision, db]);

  const setClubArchived = useCallback(async (clubId: string, archived: boolean) => {
    await db.runAsync('UPDATE clubs SET archived = ? WHERE id = ?', archived ? 1 : 0, clubId);
    bumpRevision();
  }, [bumpRevision, db]);

  const deleteClub = useCallback(async (clubId: string) => {
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM session_clubs WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM margins WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM shots WHERE club_id = ?', clubId);
      await db.runAsync('DELETE FROM clubs WHERE id = ?', clubId);
    });
    bumpRevision();
  }, [bumpRevision, db]);

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
    bumpRevision();
  }, [bumpRevision, db]);

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

export function useShotCapture() {
  const db = useSQLiteContext();
  const { bumpRevision } = useTrainingDataContext();

  const persistShot = useCallback(async (clubId: string, shot: ShotData, sessionId: string) => {
    const club = await db.getFirstAsync<DbClub>('SELECT * FROM clubs WHERE id = ?', clubId);
    if (club == null) {
      throw new Error(`Club ${clubId} nicht gefunden.`);
    }

    const shotId = createId('shot');
    const classified = classifyShot(shot);
    const sessionDate = formatSessionDate(new Date());

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO shots (id, club_id, session_id, carry, shape, quality, note, ball_speed, club_speed, vla, spin, accent, hla, spin_axis)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        shotId,
        clubId,
        sessionId,
        shot.carryDistanceYards.toFixed(0),
        classified.shape,
        classified.quality,
        classified.note,
        shot.ballSpeedMph.toFixed(1),
        shot.clubSpeedMph?.toFixed(1) ?? '—',
        shot.verticalLaunchAngle.toFixed(1),
        shot.totalSpin.toFixed(0),
        classified.accent,
        shot.horizontalLaunchAngle,
        shot.spinAxis,
      );

      const stats = await db.getFirstAsync<{ count: number; avgCarry: number | null }>(
        `SELECT COUNT(*) as count, AVG(CAST(carry AS REAL)) as avgCarry
         FROM shots
         WHERE club_id = ?`,
        clubId,
      );

      const count = stats?.count ?? 0;
      const avgCarry = stats?.avgCarry ?? null;
      const hitRate = count === 0
        ? '—'
        : `${Math.round(
            ((await db.getFirstAsync<{ success: number }>(
              `SELECT COUNT(*) as success FROM shots
               WHERE club_id = ? AND accent != 'orange'`,
              clubId,
            ))?.success ?? 0) / count * 100,
          )}%`;

      await db.runAsync(
        `UPDATE clubs
         SET shot_count = ?, avg_carry = ?, hit_rate = ?, target = ?, bias = ?
         WHERE id = ?`,
        String(count),
        avgCarry == null ? '—' : `${Math.round(avgCarry)}y`,
        hitRate,
        `${classified.shape} Bias aktiv`,
        classified.shape,
        clubId,
      );

      const sessionExisting = await db.getFirstAsync<{ id: string }>(
        'SELECT id FROM sessions WHERE id = ?',
        sessionId,
      );

      if (sessionExisting == null) {
        await db.runAsync(
          `INSERT INTO sessions (id, date, title, shots_label, carry_label, focus, summary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          sessionId,
          sessionDate,
          `${club.name} Live Block`,
          `${count} Schläge`,
          formatCarryLabel(avgCarry),
          'Automatisch aus aktiver Mevo-Session erzeugt.',
          `Letzter Schlag: ${classified.shape}, ${shot.carryDistanceYards.toFixed(0)}y Carry.`,
        );
        await db.runAsync(
          'INSERT OR IGNORE INTO session_clubs (session_id, club_id) VALUES (?, ?)',
          sessionId,
          clubId,
        );
      } else {
        await db.runAsync(
          `UPDATE sessions
           SET shots_label = ?, carry_label = ?, summary = ?
           WHERE id = ?`,
          `${count} Schläge`,
          formatCarryLabel(avgCarry),
          `Letzter Schlag: ${classified.shape}, ${shot.carryDistanceYards.toFixed(0)}y Carry.`,
          sessionId,
        );
      }

      const marginUpdates = [
        { label: 'AoA', value: shot.angleOfAttack == null ? '—' : `${shot.angleOfAttack.toFixed(1)}°` },
        { label: 'Spin Axis', value: `${shot.spinAxis.toFixed(1)}°` },
        { label: 'Face to Target', value: shot.faceToTarget == null ? '—' : `${shot.faceToTarget.toFixed(1)}°` },
      ];

      for (const margin of marginUpdates) {
        await db.runAsync(
          'UPDATE margins SET current_value = ? WHERE club_id = ? AND label = ?',
          margin.value,
          clubId,
          margin.label,
        );
      }
    });

    bumpRevision();
    return shotId;
  }, [bumpRevision, db]);

  const logShotDebugEvent = useCallback(async ({ clubId, sessionId, connectionState, shot }: ShotDebugDraft) => {
    const eventId = createId('debug-shot');

    await db.runAsync(
      `INSERT INTO debug_shot_events (
        id, created_at, club_id, session_id, connection_state, persist_status, persisted_shot_id,
        error_message, ball_speed_mph, club_speed_mph, vertical_launch_angle, horizontal_launch_angle,
        total_spin, spin_axis, carry_distance_yards, is_estimated_spin, has_club_data, angle_of_attack,
        club_path, face_to_target, dynamic_loft, spin_loft, has_face_impact, face_impact_x, face_impact_y
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      eventId,
      new Date().toISOString(),
      clubId,
      sessionId ?? '',
      connectionState,
      'logged',
      null,
      null,
      shot.ballSpeedMph,
      shot.clubSpeedMph ?? null,
      shot.verticalLaunchAngle,
      shot.horizontalLaunchAngle,
      shot.totalSpin,
      shot.spinAxis,
      shot.carryDistanceYards,
      shot.isEstimatedSpin ? 1 : 0,
      shot.hasClubData ? 1 : 0,
      shot.angleOfAttack ?? null,
      shot.clubPath ?? null,
      shot.faceToTarget ?? null,
      shot.dynamicLoft ?? null,
      shot.spinLoft ?? null,
      shot.hasFaceImpact ? 1 : 0,
      shot.faceImpactX ?? null,
      shot.faceImpactY ?? null,
    );

    bumpRevision();
    return eventId;
  }, [bumpRevision, db]);

  const markShotDebugPersisted = useCallback(async (eventId: string, persistedShotId: string) => {
    await db.runAsync(
      `UPDATE debug_shot_events
       SET persist_status = ?, persisted_shot_id = ?, error_message = NULL
       WHERE id = ?`,
      'persisted',
      persistedShotId,
      eventId,
    );
    bumpRevision();
  }, [bumpRevision, db]);

  const markShotDebugPersistFailed = useCallback(async (eventId: string, errorMessage: string) => {
    await db.runAsync(
      `UPDATE debug_shot_events
       SET persist_status = ?, error_message = ?
       WHERE id = ?`,
      'persist_failed',
      errorMessage,
      eventId,
    );
    bumpRevision();
  }, [bumpRevision, db]);

  return {
    persistShot,
    logShotDebugEvent,
    markShotDebugPersisted,
    markShotDebugPersistFailed,
  };
}

export function useRecentShotDebugEvents(limit = 8) {
  const db = useSQLiteContext();

  return useAsyncRows<DbShotDebugEvent>(`debug-shot-events-${limit}`, async () =>
    db.getAllAsync<DbShotDebugEvent>(
      `SELECT * FROM debug_shot_events
       ORDER BY datetime(created_at) DESC
       LIMIT ?`,
      limit,
    ),
  );
}
