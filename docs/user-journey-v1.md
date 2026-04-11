# User Journey — Version 1

Status: 2026-04-11

## Goal

This user journey describes the core flow of the app for Phase 1 and Phase 2:

- Phase 1: auth, equipment, Mevo+ connection, session start, shot capture, live dashboard, local storage
- Phase 2: target ranges per club, session analysis, dispersion, history, trends

The journey deliberately covers only the current MVP and analysis scope. Video features from later phases are not included.

## Main Persona

**Bri**

- ambitious golfer
- trains with purpose instead of just hitting balls
- plays with a draw bias
- wants her own feedback based on Mevo+ data instead of only standard evaluations
- wants to use training offline-first and without cloud dependency

## Core App Promise

The app guides Bri from device connection to analysis of a training session:

1. Setup in just a few steps
2. See shots live and store them cleanly
3. Use personal target corridors instead of generic metrics
4. Evaluate sessions directly and compare them over time

## User Journey

### 1. Entry and Account

**Situation**

Bri installs the app on an Android device and opens it before training.

**User Goal**

Get into the app as quickly as possible, without technical hurdles.

**Flow**

1. Bri lands on login or registration.
2. She creates an account or logs in with email and password.
3. The app restores her session and routes her into the authenticated area.

**User Expectation**

- clear, fast entry
- no repeated login on every launch
- reliable access to her training data

**Product Value**

Auth creates the foundation for personal data, clubs, sessions, and later sync.

### 2. Set Up Equipment

**Situation**

Before the first meaningful training session, Bri needs to maintain her clubs.

**User Goal**

Every shot should later be assignable to a club.

**Flow**

1. Bri opens the Equipment area.
2. She creates her clubs, for example 7-wood, irons, wedges.
3. She stores name, type, and loft.
4. The app saves the clubs locally and makes them available for sessions.

**User Expectation**

- fast CRUD flow
- no redundant input before every session
- clean club selection during training

**Product Value**

Equipment is the basis for club-based statistics, target ranges, and historical data.

### 3. Connect the Launch Monitor

**Situation**

Bri is on the range and wants to train with the Mevo+.

**User Goal**

A stable connection without having to deal with network details.

**Flow**

1. Bri opens the app in a training context.
2. The app connects to the Mevo+ via TCP.
3. The device is configured and armed for shots.
4. The connection status is visible.
5. If there are problems, Bri gets clear feedback and can reconnect.

**User Expectation**

- visible status: connected, ready, disconnected
- no uncertainty about whether shots are being captured
- quick retry after a connection drop

**Product Value**

Without a stable device connection there is no reliable training flow. Phase 1 starts here.

### 4. Start a Session

**Situation**

The connection is active, and now the actual training begins.

**User Goal**

Start a session cleanly so related shots can be evaluated together.

**Flow**

1. Bri starts a new session.
2. She selects the active club.
3. The app creates a local session.
4. The live dashboard becomes the central training view.

**User Expectation**

- clear starting point for a training unit
- immediately visible active club
- no data loss on app restart or during offline use

**Product Value**

Sessions structure training and make later analysis meaningful in the first place.

### 5. Capture and Understand a Shot Live

**Situation**

Bri hits balls and wants to know what happened immediately after each shot.

**User Goal**

Immediate, relevant feedback for every shot.

**Flow**

1. Bri hits a shot.
2. Shortly after impact, the app receives the shot event from the Mevo+.
3. The app parses ball, club, and, if available, face-impact data.
4. The last shot is shown prominently in the dashboard.
5. The shot is assigned to the current session and active club.
6. The record is stored locally in SQLite.

**User Expectation**

- low latency between shot and feedback
- clear display of the most important metrics
- visible hint when spin is only estimated
- confidence that no shot gets lost

**Product Value**

The app replaces passive number collection with immediate, training-relevant feedback.

### 6. Use Target Ranges Actively

**Situation**

After basic capture, Bri does not just want to see values, but evaluate whether the shot is within her training goals.

**User Goal**

Define personal target ranges per club and metric.

**Flow**

1. Bri stores target ranges per club, for example for carry, spin, AoA, or face-to-path.
2. The app stores minimum and maximum values per metric.
3. For new shots, the app compares live data against the target corridor.
4. Values are visually marked as hit or missed.

**User Expectation**

- personal feedback instead of standard norms
- quick visual classification during training
- clear linkage between club and target value

**Product Value**

This is where the real added value begins compared to a pure launch monitor display: the app becomes a training system.

### 7. Analyze the Session Directly

**Situation**

After a few shots, Bri wants to understand whether she is making progress or just had isolated good strikes.

**User Goal**

A compact session evaluation directly after or during training.

**Flow**

1. Bri opens the session view or history details.
2. The app shows average values, dispersion, and target hit rate.
3. The data can be viewed per session and per club.
4. Bri recognizes whether the session was stable or highly variable.

**User Expectation**

- few, meaningful metrics
- comparability within the session
- quick overview without Excel export

**Product Value**

The session becomes an interpretable training unit instead of a list of individual shots.

### 8. Understand Dispersion Visually

**Situation**

Numbers alone are not enough when Bri wants to grasp her starting direction and dispersion at a glance.

**User Goal**

Understand the shot pattern intuitively.

**Flow**

1. Bri opens the dispersion view.
2. The app maps carry and horizontal launch into a graphical landing-point view.
3. Multiple shots appear as a pattern instead of individual data points.
4. Bri immediately sees push, pull, draw patterns, or wide dispersion.

**User Expectation**

- quick visual readability
- connection to real ball-flight distribution
- better training decisions than with table values alone

**Product Value**

Dispersion makes variability and shot patterns intuitively visible and supports targeted range practice.

### 9. Use Training History

**Situation**

Bri trains regularly and wants to find later sessions again.

**User Goal**

Track past sessions and compare them with new ones.

**Flow**

1. Bri opens the history.
2. She sees sessions in chronological order with date, shot count, club reference, and average values.
3. She opens a session in detail.
4. The app shows the stored shots and the related analysis.

**User Expectation**

- quick access to older training data
- no data loss despite the offline-first approach
- clear separation of individual training days

**Product Value**

History creates continuity and makes training useful long-term instead of only in the moment.

### 10. Detect Trends Across Multiple Sessions

**Situation**

Bri is working on her swing and wants to know whether changes are really paying off over weeks.

**User Goal**

See development over time, not just snapshots.

**Flow**

1. Bri selects a club or a relevant metric.
2. The app aggregates session values across multiple training sessions.
3. Trend charts show, for example, carry, ball speed, or target hit rate over time.
4. Bri recognizes whether patterns are improving steadily, getting worse, or stagnating.

**User Expectation**

- understandable development instead of gut feeling
- make progress visible
- detect setbacks early

**Product Value**

The app supports not only shot diagnosis, but real training management.

## Success State After Phase 2

At the end of Phase 2, the app is not just a data collector for Bri, but a complete training tool:

- She connects to the Mevo+ and quickly starts a session.
- She sees shots live and gets reliable metrics.
- She evaluates shots against her own target corridors.
- She analyzes sessions directly after training.
- She recognizes dispersion, patterns, and development over time.

## Central UX Requirements from the Journey

- Connection and readiness must always be clearly visible.
- The path from app launch to the first captured shot must be short.
- The active club must be clearly recognizable in the training flow.
- Live feedback must be prioritized, not menus or secondary data.
- Target ranges must be easy to maintain and clearly scoped per club.
- Session analysis must be quick to grasp, not overloaded.
- History and trends must support real training decisions.

## Scope Boundaries

Not part of this journey:

- video recording and video sync
- video player and annotations
- complex face-impact visualization as a fully developed feature
- round management or simulator workflows
