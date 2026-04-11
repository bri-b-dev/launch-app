# User Journey — v1 (MVP) + v2

Status: 2026-04-11

## Goal

This user journey describes the complete product flow for:

- `v1 (MVP)` = Phase 1 + Phase 2
- `v2` = Phase 3 + Phase 4

This document therefore covers the path from first use to video workflows and cloud/sync features.

## Main Persona

**Bri**

- ambitious golfer
- trains on the range with a clear technical focus
- plays with a draw bias
- does not just want to see launch monitor data, but steer training
- wants to be able to train offline and optionally sync data later

## Product Promise Across v1 + v2

The app evolves for Bri in four steps:

1. Connection and shot capture work reliably.
2. The app evaluates shots against personal target ranges.
3. Video makes swing changes visible.
4. Sync and export make the data usable long-term and across devices.

## User Journey

### 1. Install the App and Sign In

**Situation**

Bri sets up the app on her Android device for training.

**User Goal**

Get into the app quickly and build a personal data foundation.

**Flow**

1. Bri opens the app.
2. She registers or logs in with email and password.
3. The app restores existing sessions and protects the authenticated area.

**User Expectation**

- simple entry
- stable login
- personal access to equipment, sessions, and sync

### 2. Prepare Equipment

**Situation**

Before real training starts, Bri needs to store her clubs in the app.

**User Goal**

Assign all later shots clearly to a club.

**Flow**

1. Bri opens the Equipment area.
2. She creates clubs with name, type, and loft.
3. The app stores this data locally and later links it with sessions and shots.

**User Expectation**

- quick setup flow
- no duplicate maintenance
- clear club selection during training

### 3. Connect the Mevo+ and Start a Session

**Situation**

On the range, Bri wants to train without detours.

**User Goal**

Connect the device and move directly into a session.

**Flow**

1. Bri opens the training area.
2. The app connects to the Mevo+ via TCP.
3. The device is configured and armed.
4. Bri starts a new session.
5. She selects the active club.
6. The live dashboard becomes the main view.

**User Expectation**

- clear connection status
- quick path from app launch to the first shot
- no doubt about whether the device is ready

### 4. Capture Shots Live

**Situation**

Training is underway and Bri is hitting balls.

**User Goal**

Immediate feedback per shot and reliable storage.

**Flow**

1. After each shot, the shot event comes from the Mevo+.
2. The app parses ball, club, and, if present, FIL data.
3. The last shot appears prominently in the dashboard.
4. The shot is assigned to the session and club.
5. The data is stored locally in SQLite.

**User Expectation**

- fast feedback
- readable core metrics
- hint when spin is estimated
- no lost data during connection or app issues

### 5. Train with Target Ranges

**Situation**

Seeing data alone is not enough for Bri. She wants to know whether a shot was technically correct for training.

**User Goal**

Use personal target ranges per club and metric.

**Flow**

1. Bri defines margins per club, for example for carry, AoA, spin, or face-to-path.
2. The app stores min/max values per metric.
3. New shots are checked live against these target ranges.
4. Hits and deviations are marked visually.

**User Expectation**

- personal feedback instead of standard norms
- quick decision: good, just off, or clearly missed
- training aligned with real goals

### 6. Analyze the Session

**Situation**

After a series of shots, Bri wants to know whether the training was actually stable.

**User Goal**

Understand session performance compactly.

**Flow**

1. Bri opens the session details.
2. The app shows average values, dispersion, and target hit rate.
3. Values can be read per session and per club.
4. Bri recognizes stability, outliers, and training patterns.

**User Expectation**

- no data flood
- quick readability
- helpful condensation instead of a raw data list

### 7. Use Dispersion and History

**Situation**

Bri does not just want to see numbers, but recognize ball-flight patterns and development.

**User Goal**

Understand training data visually and across multiple sessions.

**Flow**

1. Bri views the dispersion of a session as a visual shot pattern.
2. She sees earlier sessions in history sorted chronologically.
3. She reopens individual sessions and compares shot count, carry, and other metrics.
4. Trend charts show the development of important metrics across multiple sessions.

**User Expectation**

- quick view of dispersion and shot patterns
- easy retrieval of older sessions
- visible progress over time

## Outcome After v1 (MVP)

At the end of `v1`, the app is a fully usable training tool for Bri:

- connect the Mevo+
- start a session
- see shots live and store them locally
- use personal target ranges
- analyze sessions
- use dispersion, history, and trends for technical work

## Expansion in v2

With `v2`, the focus shifts from pure data evaluation to richer documentation and long-term usability.

### 8. Record Video for a Shot

**Situation**

Bri wants to see not only metrics, but also the swing itself.

**User Goal**

Get a matching clip for a shot.

**Flow**

1. Bri continues training in session mode.
2. The app records video in the training context or buffers it for shot triggers.
3. When the shot event arrives, a clip is created for the shot.
4. The clip is stored locally and linked to the shot.

**User Expectation**

- as much automatic assignment as possible
- no manual file-chaos workflow
- technical data and video belong together

### 9. View a Shot with Video

**Situation**

After a noticeable or particularly good shot, Bri wants to understand what happened in the swing.

**User Goal**

Read video and launch data together.

**Flow**

1. Bri opens a shot or a session detail view.
2. The app shows the clip together with the metrics.
3. She plays the shot at normal speed or in slow motion.
4. Scrubbing helps inspect relevant movement moments precisely.

**User Expectation**

- direct relationship between image and data
- easy retrieval of good and bad shots
- fewer switches between multiple apps

### 10. Mark and Compare the Swing

**Situation**

Bri is working deliberately on technical changes such as early extension or AoA.

**User Goal**

Make movements visibly measurable and compare two shots directly.

**Flow**

1. Bri freezes a frame.
2. She places lines or points, for example for head, hips, or swing plane.
3. She opens two shots in comparison.
4. The app shows both clips side by side.
5. Bri sees whether changes are actually visible over time.

**User Expectation**

- tangible technical work
- clear before/after view
- no external video app required

### 11. Keep Data Available Locally and in the Cloud

**Situation**

Bri does not always train with a stable connection, but she does not want data limited to a single device.

**User Goal**

Work offline and sync when needed.

**Flow**

1. The app continues to store everything locally as the primary source.
2. When Bri is online, she starts a sync or sees sync status.
3. Sessions, shots, clubs, and margins are uploaded to Supabase.
4. The app remembers the last successful sync.

**User Expectation**

- offline-first remains untouched
- cloud is additional value, not a requirement
- sync must be transparent and controllable

### 12. Use Export and Multi-Device

**Situation**

As usage grows, Bri wants to use her data outside the app or across multiple devices.

**User Goal**

More freedom in how she uses her training data.

**Flow**

1. Bri exports sessions or shot histories as CSV.
2. She continues using the data in Excel, Numbers, or other analysis tools.
3. Later, she accesses synced data across multiple devices.
4. The app becomes part of a larger training setup.

**User Expectation**

- no data silos
- easy further processing
- flexibility between training devices

## Outcome After v2

At the end of `v2`, the app is not just a training dashboard for Bri, but a full training platform:

- live data and analysis remain the core
- video extends the data with visible movement
- sync and export make training permanently usable
- the app works both in the moment of the shot and during later analysis

## Central UX Requirements from This Journey

- The path to the first shot must remain extremely short.
- Connection, recording, and sync must always be clearly visible.
- Live feedback must never be displaced by secondary functions.
- Target ranges must be easy to maintain per club and immediately readable in training.
- Video must attach naturally to shots, not feel like a separate mode.
- Offline-first must not be diluted by cloud features.
- History, trends, video comparison, and export must support real training decisions.

## Scope Boundaries

Not part of this journey:

- AI swing analysis
- D-plane visualization
- training programs
- coach view
- voice notes
- shot-shaping evaluation as its own module
- additional launch monitors
- round management
