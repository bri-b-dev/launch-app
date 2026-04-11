# CLAUDE.md — Launch Monitor App

Android Golf-Trainings-App. Direktverbindung FlightScope Mevo+ via TCP. Schlagerfassung, Analyse, Video.

**Stack:** Expo SDK 54 (Bare), React Native 0.84, Expo Router, TypeScript strict, expo-sqlite, Supabase, victory-native, react-native-skia, expo-video

---

## Konventionen

- TypeScript strict, kein `any` — Interfaces für Daten, Types für Unions
- Functional components, explizite Props-Interfaces (`interface ShotCardProps`)
- Keine Inline-Styles in wiederverwendbaren Komponenten
- Alle DB-Calls in `lib/db/` — nie direkt in Komponenten
- Transaktionen für zusammengehörige Writes (Shot + Video-Pfad)
- Einheiten intern: **mph**, **yards**, **Grad** — Konvertierung nur in `lib/utils/units.ts`
- Felder heißen exakt wie in `ShotData` (keine Umbenennung, UI-Anzeige deutsch)
- Bei Vorschlägen, was die nächsten Schritte angeht, orientiere dich an der aktuellen Phase in docs/roadmap.html

---

## Projektstruktur

```
app/(auth)/             # Login, Register
app/(app)/              # Authenticated: index, session/, history/, equipment/, settings/
components/             # shot/, charts/, session/, video/
lib/                    # db/, supabase/, hooks/, utils/
```

---

## Launch Monitor Library

```ts
import { useMevo, useShotStats, ShotMode } from '@bri-b-dev/gspro-connect-mevoplus';
```
TCP Port 5100 (binär). Ablauf: `connect()` → `configure()` → `arm()` → Schläge.  
Kamera-Stream HTTP 8080 (MJPEG, nur Preview).

**ShotData-Felder:** Basis: `ballSpeedMph`, `verticalLaunchAngle`, `horizontalLaunchAngle`, `totalSpin`, `spinAxis`, `carryDistanceYards`, `isEstimatedSpin`  
Pro (`hasClubData`): `clubSpeedMph`, `angleOfAttack`, `clubPath`, `faceToTarget`, `dynamicLoft`, `spinLoft`  
FIL (`hasFaceImpact`): `faceImpactX`, `faceImpactY`

**Hinweise:** `isEstimatedSpin === true` → Spin unzuverlässig. Spinaxis negativ = Draw. AoA Irons ca. -2° bis -5°. Shot-Event kommt 0.3–0.8s nach Impact.

---

## DB-Schema (SQLite offline-first, Sync → Supabase)

`users` · `clubs` · `launch_monitors` · `sessions` · `shots` (+ videoPath/videoUrl) · `margins`

---

## Wichtige Referenz-Dateien

- **Roadmap:** `docs/roadmap.html` — Phasen, Feature-Status (done/partial/wip), nächste Schritte
- **User Journeys:**
  - `docs/user-journey-v1.md` — MVP (Phase 1 + 2): Auth, Equipment, Session, Analyse
  - `docs/user-journey-v2.md` — v1 + v2: Video, Cloud, Sync, Export
  - `docs/user-journey-v3.md` — v1 + v2 + v3: KI-Analyse, Trainingsprogramme, Coach View
- **Supabase-Migrationen:** `supabase/migrations/` — SQL-Schema-History, RLS-Policies

---

## Aktuelle Phase: Phase 2 (Abschluss) → Phase 3 vorbereiten

Phase 1 vollständig abgeschlossen. Phase 2 weitgehend done.

**Phase 2 — Offene Punkte:**
- [x] Trend-Übersicht: `app/(app)/history/trends.tsx` mit Schläger-Selektor (horizontale Chips) + Metrik-Mehrfachauswahl (Toggle-Chips), Einstieg via History-Tab

**Offene Hardware-TODOs (Phase 1 carry-over):**
- [ ] Protokoll-Byte-Offsets mit echtem Gerät verifizieren (besonders FIL-Felder)
- [ ] Shot-Event-Timing-Offset als Konstante definieren
- [ ] Port 8080 Camera Stream verifizieren
- [ ] FlightScope Support kontaktieren: support@flightscope.com

---

## Bewusste Entscheidungen (nicht diskutieren)

Supabase, Expo Bare, kein Expo Go, Android only, offline-first, eigene Library, kein Simulator-Support, kein Platzrundenmanagement.

---

## Swing-Kontext (für Analyse-Features)

Spielerin Bri, Draw-Spielerin im Hinterkopf, aber nicht ausschließlich. Problem: Early Extension + steiler AoA. Übungsgedanke: „Knie an Knie". 7-Wood bekannter Problemschläger. Zielwerte: TrackMan Tour-Durchschnitt mit Draw-Bias (negative Spinachse).