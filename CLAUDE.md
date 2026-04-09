# CLAUDE.md — Launch Monitor App

Android Golf-Trainings-App. Direktverbindung FlightScope Mevo+ via TCP. Schlagerfassung, Analyse, Video.

**Stack:** Expo SDK 55 (Bare), React Native 0.84, Expo Router, TypeScript strict, expo-sqlite, Supabase, victory-native, react-native-skia, expo-video

---

## Konventionen

- TypeScript strict, kein `any` — Interfaces für Daten, Types für Unions
- Functional components, explizite Props-Interfaces (`interface ShotCardProps`)
- Keine Inline-Styles in wiederverwendbaren Komponenten
- Alle DB-Calls in `lib/db/` — nie direkt in Komponenten
- Transaktionen für zusammengehörige Writes (Shot + Video-Pfad)
- Einheiten intern: **mph**, **yards**, **Grad** — Konvertierung nur in `lib/utils/units.ts`
- Felder heißen exakt wie in `ShotData` (keine Umbenennung, UI-Anzeige deutsch)

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

## Aktuelle Phase: Phase 1

Verbindung, Schlagerfassung, Dashboard, DB, Auth, Equipment.

**Offene TODOs:**
- [ ] Protokoll-Byte-Offsets mit echtem Gerät verifizieren (besonders FIL-Felder)
- [ ] Shot-Event-Timing-Offset als Konstante definieren
- [ ] Port 8080 Camera Stream verifizieren
- [ ] FlightScope Support kontaktieren: support@flightscope.com

---

## Bewusste Entscheidungen (nicht diskutieren)

Supabase, Expo Bare, kein Expo Go, Android only, offline-first, eigene Library, kein Simulator-Support, kein Platzrundenmanagement.

---

## Swing-Kontext (für Analyse-Features)

Spielerin Bri, Draw-Spielerin. Problem: Early Extension + steiler AoA. Übungsgedanke: „Knie an Knie". 7-Wood bekannter Problemschläger. Zielwerte: TrackMan Tour-Durchschnitt mit Draw-Bias (negative Spinachse).