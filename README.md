# Launch Monitor App

![Platform](https://img.shields.io/badge/platform-Android-3DDC84?style=flat-square)
![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat-square)
![React%20Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=flat-square)
![Offline-first](https://img.shields.io/badge/data-offline--first-4AC18D?style=flat-square)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E?style=flat-square)
![SQLite](https://img.shields.io/badge/storage-SQLite-0F80CC?style=flat-square)
![Phase](https://img.shields.io/badge/status-Phase%202%20complete%20%2F%20Phase%203%20next-C8A84B?style=flat-square)
![Mevo%2B](https://img.shields.io/badge/device-FlightScope%20Mevo%2B-C8A84B?style=flat-square)

Android-first golf training app for FlightScope Mevo+. It connects directly to the device over TCP, captures shot data in real time, stores everything locally in SQLite, and adds training-focused analysis on top: target ranges, session stats, dispersion, history, and trend charts.

The project is currently at the end of `Phase 2` and preparing for `Phase 3`.

## Product Scope

This app is built for structured range practice, not generic launch monitor viewing.

Core user flow today:

1. Sign in with email/password.
2. Create and manage clubs in Equipment.
3. Connect to a Mevo+.
4. Start a session and assign an active club.
5. Capture shots live and save them locally.
6. Evaluate shots against per-club target ranges.
7. Review session stats, dispersion, history, and trends.
8. Optionally sync local data to Supabase when online.

The current product focus comes from `docs/user-journey-v1.md`. The expansion path for video, cloud workflows, and advanced coaching features is described in `docs/user-journey-v2.md` and `docs/user-journey-v3.md`.

## Current Status

### Implemented

- Mevo+ direct connection over TCP (`port 5100`)
- Live shot capture and structured dashboard
- SQLite offline-first storage for clubs, sessions, margins, and shots
- Supabase Auth with persisted session
- Equipment management
- Per-club target ranges
- Session statistics
- Shot dispersion view
- Session history
- Trend charts
- Cross-metric trend overview
- Manual SQLite to Supabase sync from Settings

### In Progress / Next

- Phase 3 video integration
  - video recording linked to shot events
  - shot detail video player
  - annotations
  - local clip storage and optional Supabase Storage upload
- Phase 4 follow-up work
  - CSV export
  - cloud download / multi-device sync
- Phase 5+ longer-term direction
  - AI-assisted swing analysis
  - richer coaching and training workflows

### Hardware Validation Still Open

- verify protocol byte offsets on the real device, especially FIL fields
- define the shot-event timing offset as a constant
- verify the camera stream on `http://<mevo-ip>:8080`
- confirm remaining protocol details with FlightScope support

## Tech Stack

- Expo SDK 54
- Expo Router
- TypeScript
- React Native
- `expo-sqlite`
- Supabase Auth + sync
- `victory-native` for charts
- `@shopify/react-native-skia` for graphics
- `expo-video` for upcoming video workflows
- `@bri-b-dev/gspro-connect-mevoplus` for Mevo+ communication

## Architecture

### App Structure

```text
app/(auth)/             Login and registration
app/(app)/              Authenticated app screens
app/(app)/session/      Live training/session flows
app/(app)/history/      Session history, analysis, trends
app/(app)/equipment/    Club setup and management
app/(app)/settings/     Sync and account settings
components/             Reusable UI and chart components
lib/db/                 SQLite setup and database access
lib/hooks/              App state, auth, Mevo, and data hooks
lib/supabase/           Supabase client and sync logic
lib/utils/              Unit and domain helpers
supabase/migrations/    Cloud schema and RLS history
```

### Data Model

Local-first storage is centered around:

- `users`
- `clubs`
- `launch_monitors`
- `sessions`
- `shots`
- `margins`

The `shots` table is designed to support later video workflows through `video_path` and `video_url`.

### Mevo+ Integration

- direct TCP connection on `5100`
- flow: `connect()` -> `configure()` -> `arm()` -> receive shots
- shot events arrive shortly after impact
- camera preview stream is expected on HTTP `8080` and is not fully validated yet

Important shot fields include:

- ball data: `ballSpeedMph`, `verticalLaunchAngle`, `horizontalLaunchAngle`, `totalSpin`, `spinAxis`, `carryDistanceYards`
- club data when available: `clubSpeedMph`, `angleOfAttack`, `clubPath`, `faceToTarget`, `dynamicLoft`, `spinLoft`
- face impact data when available: `faceImpactX`, `faceImpactY`

If `isEstimatedSpin === true`, spin should be treated as unreliable.

## Offline-First Behavior

- Shot capture and analysis work against local SQLite storage.
- Sessions and shots survive app restarts.
- Cloud sync is manual from Settings.
- Supabase is additive, not required for the training loop once the user is authenticated.

## Setup

### Requirements

- Node.js and npm
- Expo native development environment
- Android device or emulator for app builds
- FlightScope Mevo+ on the same network for real hardware testing
- Supabase project for auth and sync

Note: direct Mevo+ TCP communication is native-only. Browser/web builds cannot connect to the device.

### Environment Variables

Create a local `.env` file with:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_KEY=...
```

Optional:

```bash
EXPO_PUBLIC_MOCK_MEVO=true
```

`EXPO_PUBLIC_MOCK_MEVO=true` enables a local mock shot flow for UI and data testing without real hardware.

### Install

```bash
npm install
```

### Run

```bash
npm run android
```

Mock mode:

```bash
npm run android:mock
```

Other useful scripts:

```bash
npm run start
npm run start:mock
npm run lint
```

## Roadmap

### v1

Stable training foundation:

- auth
- equipment
- Mevo+ connection
- shot capture
- local persistence
- target ranges
- session analysis
- dispersion
- history
- trends

### v2

Measurement plus documentation:

- shot-linked video
- video playback and comparison
- annotations
- local/cloud video storage
- broader sync/export workflows

### v3

Interpretation and coaching:

- AI-assisted swing analysis
- guided training insights
- richer long-term progress workflows

Detailed status and planning live in:

- [docs/roadmap.html](docs/roadmap.html)
- [docs/user-journey-v1.md](docs/user-journey-v1.md)
- [docs/user-journey-v2.md](docs/user-journey-v2.md)
- [docs/user-journey-v3.md](docs/user-journey-v3.md)

## Conventions

- TypeScript strict
- no `any`
- functional React components
- explicit props interfaces
- database access in `lib/db/`
- transactional writes for related entities
- internal units stay in `mph`, `yards`, and `degrees`
- field names follow `ShotData` exactly

## Limitations

- Android-first product direction
- direct device connection requires a native build
- no simulator-based Mevo workflow
- video feature set is only partially prepared at schema/dependency level
- some hardware protocol details still need validation on a real device
