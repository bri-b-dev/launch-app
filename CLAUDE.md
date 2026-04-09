# CLAUDE.md — Launch Monitor App

Kontext-Datei für Claude. Enthält Projektstruktur, Entscheidungen, Konventionen und aktuelle Prioritäten.

---

## Projekt-Überblick

Persönliche Golf-Trainings-App für iOS. Direktverbindung zum FlightScope Mevo+ Launch Monitor via TCP — kein Umweg über die FS Golf App. Fokus: Schlagerfassung, Analyse, Zielbereiche, Video.

**Plattform:** iOS only (vorerst)
**Framework:** Expo (Bare Workflow) — kein Expo Go, EAS Build
**Sprache:** TypeScript (strict)
**Ziel-Gerät:** iPhone + iPad

---

## Tech Stack

| Schicht | Technologie |
|---------|-------------|
| Framework | Expo SDK 55, React Native 0.84 |
| Navigation | Expo Router (file-based) |
| Styling | React Native StyleSheet (kein Tailwind) |
| Charts | victory-native |
| SVG / Annotationen | react-native-skia |
| Video Wiedergabe | expo-video |
| Video Aufnahme | react-native-vision-camera (Phase 3) |
| Lokale DB | expo-sqlite |
| Cloud / Auth | Supabase (bereits konfiguriert) |
| Launch Monitor | @bri-b-dev/gspro-connect-mevoplus (eigene Library) |
| TCP Socket | react-native-tcp-socket (peer dep der Library) |
| State | React Hooks + Context (kein Redux/Zustand) |

---

## Launch Monitor Library

```ts
import { useMevo, useShotStats, ShotMode } from '@bri-b-dev/gspro-connect-mevoplus';
```

**Repo:** https://github.com/bri-b-dev/gspro-connect-mevoplus  
**Protokoll:** TCP Port 5100 (binär, FlightScope-proprietär, community-reverse-engineered)  
**Kamera-Stream:** HTTP Port 8080 (MJPEG, nur Preview/Alignment)

### Verbindungsablauf
1. Mevo+ WiFi verbinden: SSID `FS M2-XXXXXX`, PW = Seriennummer ohne "FS "
2. FS Golf App muss getrennt sein (nur 1 Client gleichzeitig)
3. `connect()` → `configure()` → `arm()` → Schläge empfangen

### ShotData-Felder
```ts
// Immer vorhanden
ballSpeedMph, verticalLaunchAngle, horizontalLaunchAngle
totalSpin, spinAxis, carryDistanceYards, isEstimatedSpin

// Pro Package (hasClubData === true)
clubSpeedMph, angleOfAttack, clubPath, faceToTarget
dynamicLoft, spinLoft

// FIL Add-on (hasFaceImpact === true)
faceImpactX, faceImpactY  // mm vom Zentrum
```

### Wichtige Hinweise
- `isEstimatedSpin === true` → kein RPT-Ball / kein Sticker → Spin unzuverlässig
- Spinaxis negativ = Draw, positiv = Fade
- AoA bei Irons erwartet negativ (ca. -2° bis -5°)
- Shot-Event kommt ca. 0.3–0.8s nach echtem Impact an

---

## Datenbankschema (SQLite lokal + Supabase Cloud)

```sql
users        -- Supabase Auth, userId als FK überall
clubs        -- Schläger: type, loft, name, brand
launch_monitors -- Gerät: type (mevo_plus), serial, config
sessions     -- Trainingseinheit: userId, date, lmId, notes
shots        -- Einzelschlag: sessionId, clubId, alle ShotData-Felder
             -- + videoPath (lokal), videoUrl (Supabase Storage)
margins      -- Zielbereiche: userId, clubId, metric, min, max
```

**Strategie:** offline-first via SQLite, Sync zu Supabase wenn online.  
Schema-Migrationen via `expo-sqlite` Migrations-API.

---

## Projektstruktur

```
app/                    # Expo Router — file-based routing
  (auth)/               # Login, Register
  (app)/                # Hauptapp (authenticated)
    index.tsx           # Dashboard / letzter Schlag
    session/            # Aktive Session
    history/            # Vergangene Sessions
    equipment/          # Schläger + LM verwalten
    settings/           # Margins, Account
components/
  shot/                 # ShotCard, MetricRow, SpinAxisBadge
  charts/               # DispersionChart, TrendChart, FaceImpactView
  session/              # SessionHeader, ArmButton, ModeSelector
  video/                # VideoPlayer, AnnotationOverlay
lib/
  db/                   # SQLite-Zugriff, Migrations
  supabase/             # Supabase Client, Sync-Logik
  hooks/                # useSession, useShots, useMargins
  utils/                # Einheitenumrechnung, Formatierung
```

---

## Konventionen

### TypeScript
- Strict mode, keine `any`
- Interfaces für Datenstrukturen, Types für Unions
- Alle Datenbankoperationen geben `Promise<T>` zurück

### Komponenten
- Functional components only, keine Class components
- Props-Interface immer explizit benennen (`interface ShotCardProps`)
- Keine inline styles für wiederverwendbare Komponenten

### Datenbank
- Alle DB-Calls in `lib/db/` kapseln — nie direkt in Komponenten
- Transaktionen für zusammengehörige Writes (Shot + Video-Pfad)

### Einheiten
- Intern immer **mph** für Geschwindigkeiten, **yards** für Distanzen, **Grad** für Winkel
- Anzeige in der UI kann umgerechnet werden (m/s, Meter) — aber Konvertierung explizit in `lib/utils/units.ts`

### Metriken-Benennung
Felder heißen exakt wie in `ShotData` aus der Library — keine Umbenennung.  
In der UI werden sie lokalisiert angezeigt (deutsch).

---

## Roadmap-Status

| Phase | Beschreibung | Status |
|-------|-------------|--------|
| Phase 1 | Verbindung, Schlagerfassung, Dashboard, DB, Auth, Equipment | 🚧 in Arbeit |
| Phase 2 | Zielbereiche, Face Impact, Statistiken, Dispersion, Trends | ⬜ geplant |
| Phase 3 | Video-Aufnahme, Sync, Player, Annotationen | ⬜ geplant |
| Phase 4 | Cloud Sync, CSV-Export, Multi-Device | ⬜ geplant |
| Phase 5 | AI-Analyse, D-Plane, Trainingsprogramme | ⬜ später |

**Aktueller Fokus:** Phase 1

---

## Bewusste Entscheidungen (nicht nochmal diskutieren)

- **Supabase statt Firebase** — relationale Daten, SQL-Queries, kein Vendor-Lock-in
- **Expo Bare Workflow** — wegen react-native-tcp-socket (nativer Code nötig)
- **Kein Expo Go** — native Abhängigkeiten erfordern EAS Build / `expo run:ios`
- **iOS only** — Android später, wenn überhaupt
- **Offline-first** — SQLite als Source of Truth, Supabase nur Sync
- **Eigene Library** — @bri-b-dev/gspro-connect-mevoplus kapselt gesamte Protokolllogik
- **Kein Simulator-Support** (E6, GSPro etc.) — out of scope
- **Kein Platzrundenmanagement** — out of scope

---

## Bekannte Probleme / TODOs

- [ ] Protokoll-Byte-Offsets mit echtem Gerät verifizieren (besonders FIL-Felder)
- [ ] FlightScope Support wegen Mevo+ Shot-Detection-Problem kontaktieren (support@flightscope.com)
- [ ] Exact timing offset Shot-Event → echter Impact messen und als Konstante definieren
- [ ] Port 8080 Camera Stream verifizieren (community-bestätigt, nicht offiziell dokumentiert)

---

## Swing-Kontext (für Analyse-Features)

- Spielerin: Bri — Draw-Spielerin
- Hauptproblem: Early Extension (EE) + zu steiler AoA
- Übungsphase: aktiv an EE-Drills
- 7-Wood: bekanntes Problem-Klub wegen EE (dünne/heel-Treffer)
- Swing-Gedanke: "Knie an Knie" für EE-Korrektur
- Zielwerte orientieren sich an TrackMan Tour-Durchschnitt mit Draw-Bias

---

## Glossar

| Begriff | Bedeutung |
|---------|-----------|
| AoA | Angle of Attack — Anstellwinkel des Schlägers bei Impact |
| EE | Early Extension — vorzeitiges Aufstrecken des Körpers |
| FIL | Face Impact Location — Treffpunkt auf dem Schlägerface |
| HLA | Horizontal Launch Angle — seitlicher Abflugwinkel |
| VLA | Vertical Launch Angle — vertikaler Abflugwinkel |
| DTL | Down the Line — Kameeraperspektive von hinten |
| RPT | Radar Performance Technology — FlightScope-Bälle für Spin-Messung |
| LM | Launch Monitor |
| Draw-Bias | Zielbereiche leicht auf Draw ausgerichtet (negative Spinachse) |
