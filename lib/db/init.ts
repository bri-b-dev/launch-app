import type { SQLiteDatabase } from 'expo-sqlite';
import { CLUBS, SESSIONS } from '../mock/training';

export async function initializeDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS clubs (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      loft TEXT NOT NULL DEFAULT '',
      length TEXT NOT NULL DEFAULT '',
      manufacturer TEXT NOT NULL DEFAULT '',
      model TEXT NOT NULL DEFAULT '',
      target TEXT NOT NULL DEFAULT '',
      session_label TEXT NOT NULL DEFAULT '',
      bias TEXT NOT NULL DEFAULT '',
      shot_count TEXT NOT NULL DEFAULT '',
      avg_carry TEXT NOT NULL DEFAULT '',
      hit_rate TEXT NOT NULL DEFAULT '',
      archived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,
      date TEXT NOT NULL,
      title TEXT NOT NULL,
      shots_label TEXT NOT NULL,
      carry_label TEXT NOT NULL,
      focus TEXT NOT NULL,
      summary TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session_clubs (
      session_id TEXT NOT NULL,
      club_id TEXT NOT NULL,
      PRIMARY KEY (session_id, club_id)
    );

    CREATE TABLE IF NOT EXISTS margins (
      id TEXT PRIMARY KEY NOT NULL,
      club_id TEXT NOT NULL,
      label TEXT NOT NULL,
      current_value TEXT NOT NULL,
      range_value TEXT NOT NULL,
      accent TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shots (
      id TEXT PRIMARY KEY NOT NULL,
      club_id TEXT NOT NULL,
      session_id TEXT NOT NULL DEFAULT '',
      carry TEXT NOT NULL,
      shape TEXT NOT NULL,
      quality TEXT NOT NULL,
      note TEXT NOT NULL,
      ball_speed TEXT NOT NULL,
      club_speed TEXT NOT NULL,
      vla TEXT NOT NULL,
      spin TEXT NOT NULL,
      accent TEXT NOT NULL,
      hla REAL,
      spin_axis REAL
    );
  `);

  await ensureColumn(db, 'shots', 'session_id', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, 'shots', 'hla', 'REAL');
  await ensureColumn(db, 'shots', 'spin_axis', 'REAL');
  await ensureColumn(db, 'clubs', 'length', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, 'clubs', 'manufacturer', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, 'clubs', 'model', "TEXT NOT NULL DEFAULT ''");
  await ensureColumn(db, 'clubs', 'archived', 'INTEGER NOT NULL DEFAULT 0');
  await ensureColumn(db, 'shots', 'video_path', 'TEXT');
  await ensureColumn(db, 'shots', 'video_url', 'TEXT');

  const existing = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM clubs');
  if ((existing?.count ?? 0) > 0) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const club of CLUBS) {
      await db.runAsync(
        `INSERT INTO clubs (id, name, type, loft, length, manufacturer, model, target, session_label, bias, shot_count, avg_carry, hit_rate, archived)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        club.id,
        club.name,
        club.type,
        club.loft,
        '',
        '',
        '',
        club.target,
        club.sessionLabel,
        club.bias,
        club.shotCount,
        club.avgCarry,
        club.hitRate,
        0,
      );

      for (const target of club.targets) {
        await db.runAsync(
          `INSERT INTO margins (id, club_id, label, current_value, range_value, accent)
           VALUES (?, ?, ?, ?, ?, ?)`,
          `${club.id}-${target.label}`,
          club.id,
          target.label,
          target.current,
          target.range,
          target.accent,
        );
      }

      for (const shot of club.shots) {
        await db.runAsync(
          `INSERT INTO shots (id, club_id, carry, shape, quality, note, ball_speed, club_speed, vla, spin, accent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          shot.id,
          club.id,
          shot.carry,
          shot.shape,
          shot.quality,
          shot.note,
          shot.ballSpeed,
          shot.clubSpeed,
          shot.vla,
          shot.spin,
          shot.accent,
        );
      }
    }

    for (const session of SESSIONS) {
      await db.runAsync(
        `INSERT INTO sessions (id, date, title, shots_label, carry_label, focus, summary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        session.id,
        session.date,
        session.title,
        session.shotsLabel,
        session.carryLabel,
        session.focus,
        session.summary,
      );

      for (const clubId of session.clubIds) {
        await db.runAsync(
          `INSERT INTO session_clubs (session_id, club_id) VALUES (?, ?)`,
          session.id,
          clubId,
        );
      }
    }
  });
}

async function ensureColumn(
  db: SQLiteDatabase,
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  const hasColumn = columns.some((column) => column.name === columnName);
  if (!hasColumn) {
    await db.execAsync(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition};`);
  }
}
