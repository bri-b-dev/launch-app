-- Migration: shots — hla, spin_axis ergänzen
-- Diese Felder existieren in SQLite seit Einführung des Dispersion-Charts,
-- fehlten aber in der initialen Supabase-Migration.

ALTER TABLE shots ADD COLUMN IF NOT EXISTS hla       REAL;
ALTER TABLE shots ADD COLUMN IF NOT EXISTS spin_axis  REAL;
