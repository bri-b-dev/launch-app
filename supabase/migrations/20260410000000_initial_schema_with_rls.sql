-- Migration: initial schema with RLS
-- Alle Tabellen bekommen user_id. session_clubs nutzt einen Subquery über sessions.
-- Lokales SQLite bleibt unverändert — user_id wird beim Sync aus der Auth-Session gesetzt.

-- ─── clubs ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clubs (
  id              TEXT        PRIMARY KEY NOT NULL,
  user_id         UUID        NOT NULL REFERENCES auth.users(id),
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL,
  loft            TEXT        NOT NULL DEFAULT '',
  length          TEXT        NOT NULL DEFAULT '',
  manufacturer    TEXT        NOT NULL DEFAULT '',
  model           TEXT        NOT NULL DEFAULT '',
  target          TEXT        NOT NULL DEFAULT '',
  session_label   TEXT        NOT NULL DEFAULT '',
  bias            TEXT        NOT NULL DEFAULT '',
  shot_count      TEXT        NOT NULL DEFAULT '',
  avg_carry       TEXT        NOT NULL DEFAULT '',
  hit_rate        TEXT        NOT NULL DEFAULT '',
  archived        INTEGER     NOT NULL DEFAULT 0
);

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clubs: eigene Zeilen lesen"   ON clubs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clubs: eigene Zeilen einfügen" ON clubs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clubs: eigene Zeilen ändern"  ON clubs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clubs: eigene Zeilen löschen" ON clubs FOR DELETE USING (auth.uid() = user_id);

-- ─── sessions ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT    PRIMARY KEY NOT NULL,
  user_id       UUID    NOT NULL REFERENCES auth.users(id),
  date          TEXT    NOT NULL,
  title         TEXT    NOT NULL,
  shots_label   TEXT    NOT NULL,
  carry_label   TEXT    NOT NULL,
  focus         TEXT    NOT NULL,
  summary       TEXT    NOT NULL
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions: eigene Zeilen lesen"    ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sessions: eigene Zeilen einfügen" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions: eigene Zeilen ändern"   ON sessions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sessions: eigene Zeilen löschen"  ON sessions FOR DELETE USING (auth.uid() = user_id);

-- ─── session_clubs ────────────────────────────────────────────────────────────
-- Keine eigene user_id — Zugriff wird über die verknüpfte session geprüft.

CREATE TABLE IF NOT EXISTS session_clubs (
  session_id  TEXT  NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  club_id     TEXT  NOT NULL REFERENCES clubs(id)    ON DELETE CASCADE,
  PRIMARY KEY (session_id, club_id)
);

ALTER TABLE session_clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_clubs: eigene Zeilen lesen" ON session_clubs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_clubs.session_id AND sessions.user_id = auth.uid())
  );

CREATE POLICY "session_clubs: eigene Zeilen einfügen" ON session_clubs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_clubs.session_id AND sessions.user_id = auth.uid())
  );

CREATE POLICY "session_clubs: eigene Zeilen löschen" ON session_clubs
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM sessions WHERE sessions.id = session_clubs.session_id AND sessions.user_id = auth.uid())
  );

-- ─── shots ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS shots (
  id          TEXT  PRIMARY KEY NOT NULL,
  user_id     UUID  NOT NULL REFERENCES auth.users(id),
  club_id     TEXT  NOT NULL REFERENCES clubs(id),
  session_id  TEXT  NOT NULL DEFAULT '' REFERENCES sessions(id),
  carry       TEXT  NOT NULL,
  shape       TEXT  NOT NULL,
  quality     TEXT  NOT NULL,
  note        TEXT  NOT NULL,
  ball_speed  TEXT  NOT NULL,
  club_speed  TEXT  NOT NULL,
  vla         TEXT  NOT NULL,
  spin        TEXT  NOT NULL,
  accent      TEXT  NOT NULL,
  video_path  TEXT,
  video_url   TEXT
);

ALTER TABLE shots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shots: eigene Zeilen lesen"    ON shots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "shots: eigene Zeilen einfügen" ON shots FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shots: eigene Zeilen ändern"   ON shots FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "shots: eigene Zeilen löschen"  ON shots FOR DELETE USING (auth.uid() = user_id);

-- ─── margins ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS margins (
  id             TEXT  PRIMARY KEY NOT NULL,
  user_id        UUID  NOT NULL REFERENCES auth.users(id),
  club_id        TEXT  NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  label          TEXT  NOT NULL,
  current_value  TEXT  NOT NULL,
  range_value    TEXT  NOT NULL,
  accent         TEXT  NOT NULL
);

ALTER TABLE margins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "margins: eigene Zeilen lesen"    ON margins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "margins: eigene Zeilen einfügen" ON margins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "margins: eigene Zeilen ändern"   ON margins FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "margins: eigene Zeilen löschen"  ON margins FOR DELETE USING (auth.uid() = user_id);

-- ─── launch_monitors ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS launch_monitors (
  id        TEXT  PRIMARY KEY NOT NULL,
  user_id   UUID  NOT NULL REFERENCES auth.users(id),
  name      TEXT  NOT NULL,
  model     TEXT  NOT NULL DEFAULT '',
  serial    TEXT  NOT NULL DEFAULT '',
  notes     TEXT  NOT NULL DEFAULT ''
);

ALTER TABLE launch_monitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_monitors: eigene Zeilen lesen"    ON launch_monitors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "launch_monitors: eigene Zeilen einfügen" ON launch_monitors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "launch_monitors: eigene Zeilen ändern"   ON launch_monitors FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "launch_monitors: eigene Zeilen löschen"  ON launch_monitors FOR DELETE USING (auth.uid() = user_id);
