# CLAUDE.md — Launch Monitor App

Android golf training app. Direct FlightScope Mevo+ connection via TCP. Shot capture, analysis, video.

**Stack:** Expo SDK 54 (Bare), React Native 0.84, Expo Router, TypeScript strict, expo-sqlite, Supabase, victory-native, react-native-skia, expo-video

---

## Conventions

- TypeScript strict, no `any` — interfaces for data, types for unions
- Functional components, explicit props interfaces (`interface ShotCardProps`)
- No inline styles in reusable components
- All DB calls in `lib/db/` — never directly in components
- Transactions for related writes (shot + video path)
- Internal units: **mph**, **yards**, **degrees** — conversion only in `lib/utils/units.ts`
- Field names must match `ShotData` exactly (no renaming, UI labels in German)
- When suggesting next steps, align them with the current phase in `docs/roadmap.html`

---

## Project Structure

```txt
app/(auth)/             # Login, register
app/(app)/              # Authenticated: index, session/, history/, equipment/, settings/
components/             # shot/, charts/, session/, video/
lib/                    # db/, supabase/, hooks/, utils/
```

---

## Launch Monitor Library

```ts
import { useMevo, useShotStats, ShotMode } from '@bri-b-dev/gspro-connect-mevoplus';
```

TCP port 5100 (binary). Flow: `connect()` → `configure()` → `arm()` → shots.  
Camera stream HTTP 8080 (MJPEG, preview only).

**ShotData fields:** Base: `ballSpeedMph`, `verticalLaunchAngle`, `horizontalLaunchAngle`, `totalSpin`, `spinAxis`, `carryDistanceYards`, `isEstimatedSpin`  
Pro (`hasClubData`): `clubSpeedMph`, `angleOfAttack`, `clubPath`, `faceToTarget`, `dynamicLoft`, `spinLoft`  
FIL (`hasFaceImpact`): `faceImpactX`, `faceImpactY`

**Notes:** `isEstimatedSpin === true` → spin is unreliable. Negative spin axis = draw. Iron AoA is roughly -2° to -5°. Shot event arrives 0.3–0.8s after impact.

---

## DB Schema (SQLite offline-first, Sync → Supabase)

`users` · `clubs` · `launch_monitors` · `sessions` · `shots` (+ videoPath/videoUrl) · `margins`

---

## Important Reference Files

- **Roadmap:** `docs/roadmap.html` — phases, feature status (done/partial/wip), next steps
- **User Journeys:**
  - `docs/user-journey-v1.md` — MVP (Phase 1 + 2): auth, equipment, session, analysis
  - `docs/user-journey-v2.md` — v1 + v2: video, cloud, sync, export
  - `docs/user-journey-v3.md` — v1 + v2 + v3: AI analysis, training programs, coach view
- **Supabase migrations:** `supabase/migrations/` — SQL schema history, RLS policies

---

## Current Phase: Finishing Phase 2 → Preparing Phase 3

Phase 1 is fully complete. Phase 2 is largely done.

**Phase 2 — Open items:**
- [x] Trend overview: `app/(app)/history/trends.tsx` with club selector (horizontal chips) + multi-metric selection (toggle chips), entry via History tab

**Open hardware TODOs (Phase 1 carry-over):**
- [ ] Verify protocol byte offsets with a real device (especially FIL fields)
- [ ] Define the shot-event timing offset as a constant
- [ ] Verify the port 8080 camera stream
- [ ] Contact FlightScope support: support@flightscope.com

---

## Deliberate Decisions (Do Not Discuss)

Supabase, Expo Bare, no Expo Go, Android only, offline-first, custom library, no simulator support, no round management.

---

## Swing Context (for analysis features)

Player Bri, with a draw player bias in mind, but not exclusively. Main issue: early extension + steep AoA. Practice cue: "knees to knees." 7-wood is a known problem club. Target values: TrackMan Tour averages with a draw bias (negative spin axis).
