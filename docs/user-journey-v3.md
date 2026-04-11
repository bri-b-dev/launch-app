# User Journey — v1 + v2 + v3

Status: 2026-04-11

## Goal

This user journey describes product development across three expansion stages:

- `v1` = stable training foundation with live data and analysis
- `v2` = video, cloud, sync, and export
- `v3` = intelligent training guidance, deeper analysis, and expanded ecosystem features

The journey follows Bri from first setup to a long-term, data- and video-based training system.

## Main Persona

**Bri**

- ambitious golfer
- trains deliberately on swing changes
- plays with a draw bias
- wants to understand ball flight, club movement, and training outcome together
- prefers to work with focus, measurability, and without unnecessary app switching

## Product Promise Across v1 + v2 + v3

The app evolves in three layers:

1. `v1`: capture, evaluate, and analyze shots
2. `v2`: enrich shots with video and cloud features
3. `v3`: turn data into real training intelligence

## User Journey

### 1. Entry, Login, and Personal Setup

**Situation**

Bri installs the app and wants to get into her training without friction.

**User Goal**

Fast access to a personal, reusable training environment.

**Flow**

1. Bri registers or logs in.
2. The app protects her area and restores her session.
3. She stores her clubs with name, type, and loft.
4. The setup creates the foundation for later training and analysis features.

**User Expectation**

- fast onboarding
- stable login
- personal data persists across sessions

### 2. Connect the Mevo+ and Start Training

**Situation**

On the range, Bri wants to train without technical detours.

**User Goal**

Go from app launch to a shot-ready session immediately.

**Flow**

1. Bri opens the training area.
2. The app connects to the Mevo+.
3. The device is configured and armed.
4. Bri starts a new session and selects the active club.
5. The dashboard becomes the central training view.

**User Expectation**

- clearly visible status
- fast readiness
- reliable start into the session

### 3. Capture Live Shots and Store Them Locally

**Situation**

Actual training begins.

**User Goal**

Immediate feedback and secure data capture.

**Flow**

1. Bri hits.
2. The shot event is received and parsed.
3. Ball, club, and, if available, face-impact data appear in the dashboard.
4. Each shot is assigned to the session and club.
5. The data is stored locally.

**User Expectation**

- low latency
- clear readability of the most important values
- no data loss
- warning for uncertain values such as estimated spin

### 4. Train with Target Ranges

**Situation**

Bri does not just want to see values, but work against her training goals.

**User Goal**

Evaluate every shot against individual target values.

**Flow**

1. Bri defines target ranges per club and metric.
2. The app compares live data against these margins.
3. Hits and misses become visible immediately.
4. Bri adjusts her training during the session.

**User Expectation**

- personal feedback
- immediate classification
- training against real target patterns instead of abstract raw data

### 5. Use Session Analysis, Dispersion, and Trends

**Situation**

After multiple shots, Bri wants to know whether the training was stable and effective.

**User Goal**

Turn individual shots into useful training conclusions.

**Flow**

1. Bri opens session details.
2. The app shows averages, dispersion, and hit rate against target ranges.
3. A dispersion view makes ball-flight patterns visible.
4. In history, Bri compares earlier sessions.
5. Trend charts show development over time.

**User Expectation**

- compact analysis
- easily recognizable patterns
- understandable progress

## Outcome After v1

After `v1`, the app is a fully usable training product:

- stable Mevo+ connection
- live dashboard
- local storage
- target ranges per club
- session analysis, history, and trends

## Expansion in v2

With `v2`, training becomes not only measurable, but also visually documentable and usable across devices.

### 6. Automatically Create Shot Video

**Situation**

Bri wants to see the swing that matches a shot.

**User Goal**

Automatically receive a relevant clip for a measurement event.

**Flow**

1. The app records or buffers video in the training context.
2. A shot event triggers clip creation.
3. The clip is stored locally.
4. The clip is linked to the shot record.

**User Expectation**

- as much automatic assignment as possible
- no file chaos
- video and data form a shared context

### 7. Understand and Compare a Shot with Video

**Situation**

Bri wants to truly see technical changes.

**User Goal**

Use video, data, and comparison in one workflow.

**Flow**

1. Bri opens a shot with video.
2. She views the clip and launch data side by side.
3. Slow motion and scrubbing help with detailed analysis.
4. She freezes frames and places annotations.
5. Two shots can be compared directly side by side.

**User Expectation**

- clear relationship between numbers and movement
- easy before/after comparison
- no external video app required

### 8. Extend Offline-First with Sync and Export

**Situation**

The app should remain useful beyond a single session and a single device.

**User Goal**

Store, sync, and reuse data safely.

**Flow**

1. All data remains available locally first.
2. When online, Bri starts a sync or sees sync status.
3. Data is uploaded to Supabase.
4. Later, multi-device scenarios become possible.
5. Sessions or shot histories can be exported as CSV.

**User Expectation**

- offline-first remains intact
- cloud is helpful, but not mandatory
- data is portable and usable long-term

## Outcome After v2

After `v2`, the app is a comprehensive training platform:

- measurement data
- video
- annotation and comparison
- sync and export

This means the app covers both the moment of the shot and later analysis and documentation.

## Expansion in v3

With `v3`, the focus shifts from data collection and documentation toward interpretation, coaching, and intelligent training management.

### 9. Receive AI-Supported Swing Analysis

**Situation**

Bri can already see data and video, but wants to reach a sound interpretation faster.

**User Goal**

Recognize automatic relationships between metrics and swing visuals.

**Flow**

1. Bri opens a session or a shot with data and video.
2. The app analyzes metrics and, if applicable, video context together.
3. It provides an understandable diagnosis, for example about AoA, spin, or start line.
4. Bri gets concrete hints about what is likely going wrong and what she should pay attention to.

**User Expectation**

- no black-box output
- understandable, training-relevant language
- traceable connection between cause and result

### 10. Understand Ball Flight More Deeply Through Physics

**Situation**

For more complex shot patterns, simple individual metrics are not always enough.

**User Goal**

Understand ball start, curvature, and face-to-path in a deeper visualization.

**Flow**

1. Bri opens an advanced analysis.
2. The app visualizes D-plane relationships.
3. She recognizes how face, path, and spin axis work together.
4. This helps especially with draw, fade, or push-pull patterns.

**User Expectation**

- advanced analysis without unnecessary overload
- physically meaningful representation
- better understanding of cause and ball flight

### 11. Follow Structured Training Programs

**Situation**

Bri does not want to improvise every session from scratch.

**User Goal**

Guided training with progress over weeks.

**Flow**

1. Bri selects a training program, for example for early extension or AoA.
2. The app defines goals, session focus areas, and progress criteria.
3. During training, Bri sees whether she is getting closer to the program goal.
4. Over multiple weeks, the app documents progress and stagnation.

**User Expectation**

- clear structure
- measurable progress
- less mental load in training planning

### 12. Collaborate with a Coach or Team

**Situation**

Training becomes even more valuable when Bri is not working only for herself.

**User Goal**

Share data and analysis with a coach and receive feedback.

**Flow**

1. A coach can view Bri's sessions.
2. The coach leaves comments or sets target ranges.
3. Bri continues training with these guidelines.
4. Both see the same data foundation and can compare changes.

**User Expectation**

- clear collaboration
- no media break between training and coaching
- shared view of the same shots

### 13. Capture Additional Context per Shot

**Situation**

Not every training thought is contained in metrics or video.

**User Goal**

Capture personal observations directly on the shot.

**Flow**

1. Bri records a voice note for a shot.
2. The note is stored with the shot record.
3. In later analysis, she can compare subjective thoughts with objective data.

**User Expectation**

- fast capture without typing
- personal context is preserved
- better reflection on training and feel

### 14. Evaluate Shot Shaping and Consistency Over Time

**Situation**

Bri does not just want isolated good shots, but a reproducible shot shape.

**User Goal**

Make draw, fade, or straight measurable as a stable pattern.

**Flow**

1. The app classifies shots by shape.
2. It shows distributions per session and per club.
3. Bri recognizes whether her draw bias is stable or drifting.
4. Trends make shape consistency visible over time.

**User Expectation**

- direct connection to the playing goal
- less focus on individual values, more on shot patterns
- long-term assessment of consistency

### 15. Integrate Additional Launch Monitors

**Situation**

As the product matures, the app should no longer be tied to only one device.

**User Goal**

Use the same training system with other compatible launch monitors.

**Flow**

1. Bri selects a supported device.
2. The app connects through the appropriate adapter.
3. The rest of the journey remains as unchanged as possible.
4. Training data, analysis, and history stay within the same product logic.

**User Expectation**

- consistent user experience
- as few device-specific edge cases as possible
- protection of her investment in training data

## Outcome After v3

After `v3`, the app is no longer just a training and analysis tool, but an intelligent training system:

- It captures shots, video, and history.
- It helps explain causes.
- It guides training programs.
- It supports coaching.
- It makes shot shape, progress, and context visible over time.

## Central UX Requirements from the Full Journey

- Entry into live training must stay fast despite growing feature scope.
- New v2 and v3 functions must not overload the core flow.
- Data, video, and interpretation must feel like one shared system.
- Offline-first must not be diluted even in later expansion stages.
- AI outputs must be concrete, understandable, and training-related.
- Advanced analyses should show depth only when Bri actually needs it.
- Coaching and program features must build on the same data and terminology as live training.

## Scope Boundaries

Not part of this journey:

- round management
- GPS or hole view
- simulator focus
- generic social features without a clear training connection
