# User Journey — v1 + v2 + v3

Stand: 2026-04-11

## Ziel

Diese User Journey beschreibt die Produktentwicklung über drei Ausbaustufen:

- `v1` = stabiles Trainingsfundament mit Live-Daten und Analyse
- `v2` = Video, Cloud, Sync und Export
- `v3` = intelligente Trainingsbegleitung, tiefere Analyse und erweiterte Ökosystem-Funktionen

Die Journey folgt Bri vom ersten Setup bis zu einem langfristigen, daten- und videobasierten Trainingssystem.

## Hauptperson

**Bri**

- ambitionierte Golferin
- trainiert gezielt an Schwungveränderungen
- spielt Draw-Bias
- will Ballflug, Schlägerbewegung und Trainingserfolg gemeinsam verstehen
- arbeitet am liebsten fokussiert, messbar und ohne unnötige App-Wechsel

## Produktversprechen über v1 + v2 + v3

Die App entwickelt sich in drei Ebenen:

1. `v1`: Schläge erfassen, bewerten und analysieren
2. `v2`: Schläge mit Video und Cloud-Funktionen anreichern
3. `v3`: aus Daten echte Trainingsintelligenz machen

## User Journey

### 1. Einstieg, Login und persönliches Setup

**Situation**

Bri installiert die App und will ohne Reibung in ihr Training kommen.

**Ziel der Nutzerin**

Schneller Zugang zu einer persönlichen, wiederverwendbaren Trainingsumgebung.

**Flow**

1. Bri registriert sich oder meldet sich an.
2. Die App schützt ihren Bereich und stellt ihre Session wieder her.
3. Sie hinterlegt ihre Schläger mit Name, Typ und Loft.
4. Das Setup bildet die Grundlage für spätere Trainings- und Analysefunktionen.

**Nutzererwartung**

- schneller Einstieg
- stabile Anmeldung
- persönliche Daten bleiben über Sitzungen hinweg erhalten

### 2. Mevo+ verbinden und Training starten

**Situation**

Auf der Range will Bri ohne technische Umwege trainieren.

**Ziel der Nutzerin**

Sofort vom App-Start zur schlagbereiten Session.

**Flow**

1. Bri öffnet den Trainingsbereich.
2. Die App verbindet sich mit dem Mevo+.
3. Das Gerät wird konfiguriert und armed.
4. Bri startet eine neue Session und wählt den aktiven Club.
5. Das Dashboard wird zur zentralen Trainingsansicht.

**Nutzererwartung**

- klar sichtbarer Status
- schnelle Bereitschaft
- verlasslicher Start in die Session

### 3. Live-Schläge erfassen und lokal sichern

**Situation**

Das eigentliche Training beginnt.

**Ziel der Nutzerin**

Direktes Feedback und sichere Datenerfassung.

**Flow**

1. Bri schlägt.
2. Das Shot-Event wird empfangen und geparst.
3. Ball-, Club- und gegebenenfalls Face-Impact-Daten erscheinen im Dashboard.
4. Jeder Schlag wird Session und Club zugeordnet.
5. Die Daten werden lokal gespeichert.

**Nutzererwartung**

- niedrige Latenz
- klare Lesbarkeit der wichtigsten Werte
- kein Datenverlust
- Hinweis auf unsichere Werte wie geschätzten Spin

### 4. Mit Zielbereichen trainieren

**Situation**

Bri will nicht nur Werte sehen, sondern anhand ihrer Trainingsziele arbeiten.

**Ziel der Nutzerin**

Jeden Schlag gegen individuelle Sollwerte bewerten.

**Flow**

1. Bri definiert Zielbereiche pro Club und Metrik.
2. Die App vergleicht Live-Daten gegen diese Margins.
3. Treffer und Verfehlungen werden sofort sichtbar.
4. Bri passt ihr Training während der Session an.

**Nutzererwartung**

- persönliches Feedback
- sofortige Einordnung
- Training gegen echte Zielbilder statt abstrakte Rohdaten

### 5. Session-Analyse, Dispersion und Trends nutzen

**Situation**

Nach mehreren Schlägen will Bri erkennen, ob das Training stabil und wirksam war.

**Ziel der Nutzerin**

Aus Einzelschlägen verwertbare Trainingsaussagen machen.

**Flow**

1. Bri öffnet Session-Details.
2. Die App zeigt Mittelwerte, Streuung und Hit Rate gegen Zielbereiche.
3. Eine Dispersionsansicht macht Ballflug-Muster sichtbar.
4. In der Historie vergleicht Bri frühere Sessions.
5. Trend-Charts zeigen Entwicklungen über Zeit.

**Nutzererwartung**

- kompakte Analyse
- leicht erkennbare Muster
- nachvollziehbarer Fortschritt

## Ergebnis nach v1

Nach `v1` ist die App ein voll nutzbares Trainingsprodukt:

- stabile Mevo+-Verbindung
- Live-Dashboard
- lokale Speicherung
- Zielbereiche pro Club
- Session-Analyse, Historie und Trends

## Erweiterung in v2

Mit `v2` wird das Training nicht nur messbar, sondern auch visuell dokumentierbar und geräteübergreifend nutzbar.

### 6. Schlag-Video automatisch erzeugen

**Situation**

Bri will den Schwung passend zu einem Schlag sehen.

**Ziel der Nutzerin**

Zu einem Messwert-Event automatisch einen relevanten Clip erhalten.

**Flow**

1. Die App nimmt im Trainingskontext Video auf oder puffert es.
2. Ein Shot-Event löst die Clip-Erstellung aus.
3. Der Clip wird lokal gespeichert.
4. Der Clip wird mit dem Schlagdatensatz verknüpft.

**Nutzererwartung**

- möglichst automatische Zuordnung
- kein Dateichaos
- Video und Daten bilden einen gemeinsamen Kontext

### 7. Schlag mit Video verstehen und vergleichen

**Situation**

Bri will Technikveränderungen wirklich sehen.

**Ziel der Nutzerin**

Video, Daten und Vergleich in einem Workflow nutzen.

**Flow**

1. Bri öffnet einen Schlag mit Video.
2. Sie betrachtet Clip und Launch-Daten nebeneinander.
3. Slow Motion und Scrubbing helfen bei der Detailanalyse.
4. Sie friert Frames ein und setzt Annotationen.
5. Zwei Schläge können direkt nebeneinander verglichen werden.

**Nutzererwartung**

- klarer Zusammenhang zwischen Zahlen und Bewegung
- einfaches Vorher-Nachher
- keine externe Video-App nötig

### 8. Offline-first mit Sync und Export erweitern

**Situation**

Die App soll auch ausserhalb einer einzelnen Session und eines einzelnen Geräts nutzbar bleiben.

**Ziel der Nutzerin**

Daten sicher speichern, syncen und weiterverwenden.

**Flow**

1. Alle Daten bleiben lokal zuerst verfügbar.
2. Wenn online, startet Bri einen Sync oder sieht Sync-Status.
3. Daten werden zu Supabase übertragen.
4. Später sind Multi-Device-Szenarien möglich.
5. Sessions oder Schlaghistorien können als CSV exportiert werden.

**Nutzererwartung**

- Offline-First bleibt erhalten
- Cloud ist hilfreich, aber nicht zwingend
- Daten sind portabel und langfristig nutzbar

## Ergebnis nach v2

Nach `v2` ist die App eine umfassende Trainingsplattform:

- Messdaten
- Video
- Annotation und Vergleich
- Sync und Export

Die App deckt damit sowohl den Moment des Schlages als auch spätere Analyse und Dokumentation ab.

## Erweiterung in v3

Mit `v3` verschiebt sich der Schwerpunkt von Datensammlung und Dokumentation hin zu Interpretation, Coaching und intelligentem Trainingsmanagement.

### 9. KI-gestützte Schwunganalyse erhalten

**Situation**

Bri sieht zwar Daten und Video, will aber schneller zu einer belastbaren Interpretation kommen.

**Ziel der Nutzerin**

Automatische Zusammenhänge zwischen Messwerten und Schwungbild erkennen.

**Flow**

1. Bri öffnet eine Session oder einen Schlag mit Daten und Video.
2. Die App analysiert Metriken und gegebenenfalls Videokontext gemeinsam.
3. Sie liefert eine verständliche Diagnose, z. B. zu AoA, Spin oder Startlinie.
4. Bri bekommt konkrete Hinweise, was wahrscheinlich schiefläuft und worauf sie achten sollte.

**Nutzererwartung**

- keine Blackbox-Ausgabe
- verständliche, trainingsrelevante Sprache
- nachvollziehbare Verbindung zwischen Ursache und Ergebnis

### 10. Ballflug physikalisch tiefer verstehen

**Situation**

Bei komplexeren Schlagmustern reichen einfache Einzelmetriken nicht immer aus.

**Ziel der Nutzerin**

Ballstart, Kurve und Face-to-Path in einer tieferen Visualisierung verstehen.

**Flow**

1. Bri öffnet eine erweiterte Analyse.
2. Die App visualisiert D-Plane-Zusammenhänge.
3. Sie erkennt, wie Face, Path und Spin Axis zusammenwirken.
4. Das hilft besonders bei Draw-, Fade- oder Push-Pull-Mustern.

**Nutzererwartung**

- anspruchsvolle Analyse ohne unnötige Überforderung
- physikalisch sinnvolle Darstellung
- besseres Verständnis von Ursache und Ballflug

### 11. Strukturierte Trainingsprogramme durchlaufen

**Situation**

Bri will nicht jede Session neu improvisieren.

**Ziel der Nutzerin**

Geführtes Training mit Fortschritt über Wochen.

**Flow**

1. Bri wählt ein Trainingsprogramm, z. B. für Early Extension oder AoA.
2. Die App definiert Ziele, Session-Schwerpunkte und Fortschrittskriterien.
3. Wärend des Trainings sieht Bri, ob sie dem Programmziel näher kommt.
4. Über mehrere Wochen dokumentiert die App Fortschritt und Stagnation.

**Nutzererwartung**

- klare Struktur
- messbarer Fortschritt
- weniger mentale Last bei der Trainingsplanung

### 12. Mit Coach oder Team zusammenarbeiten

**Situation**

Training wird noch wertvoller, wenn Bri nicht nur für sich selbst arbeitet.

**Ziel der Nutzerin**

Daten und Analysen mit einem Coach teilen und Rückmeldung bekommen.

**Flow**

1. Ein Coach kann Bri-Sessions einsehen.
2. Er hinterlässt Anmerkungen oder setzt Zielbereiche.
3. Bri trainiert mit diesen Vorgaben weiter.
4. Beide sehen dieselbe Datengrundlage und können Veränderungen vergleichen.

**Nutzererwartung**

- klare Zusammenarbeit
- kein Medienbruch zwischen Training und Coaching
- gemeinsamer Blick auf dieselben Schläge

### 13. Zusätzliche Kontextdaten pro Schlag erfassen

**Situation**

Nicht jeder Trainingsgedanke steckt in Messwerten oder Video.

**Ziel der Nutzerin**

Persönliche Beobachtungen direkt am Schlag festhalten.

**Flow**

1. Bri spricht eine Voice Note zu einem Schlag ein.
2. Die Notiz wird mit dem Schlagdatensatz gespeichert.
3. Bei späteren Analysen kann sie subjektive Gedanken mit objektiven Daten abgleichen.

**Nutzererwartung**

- schnelle Erfassung ohne Tipparbeit
- persönlicher Kontext bleibt erhalten
- bessere Reflexion über Training und Gefühl

### 14. Shot-Shaping und Konsistenz über Zeit auswerten

**Situation**

Bri will nicht nur gute Einzelschläge, sondern eine reproduzierbare Schlagform.

**Ziel der Nutzerin**

Draw, Fade oder Straight als stabiles Muster messbar machen.

**Flow**

1. Die App klassifiziert Schläge nach Shape.
2. Sie zeigt Verteilungen pro Session und pro Club.
3. Bri erkennt, ob ihr Draw-Bias stabil ist oder kippt.
4. Trends machen Formkonsistenz über Zeit sichtbar.

**Nutzererwartung**

- unmittelbarer Bezug zum Spielziel
- weniger Fokus auf Einzelwerte, mehr auf Schlagmuster
- langfristige Beurteilung von Konstanz

### 15. Weitere Launch Monitors integrieren

**Situation**

Mit wachsendem Produktreifegrad soll die App nicht mehr nur an ein Gerät gebunden sein.

**Ziel der Nutzerin**

Dasselbe Trainingssystem mit anderen kompatiblen Launch Monitoren nutzen.

**Flow**

1. Bri wählt ein unterstütztes Gerät.
2. Die App verbindet sich über den passenden Adapter.
3. Die restliche Journey bleibt möglichst gleich.
4. Trainingsdaten, Analyse und Historie bleiben in derselben Produktlogik erhalten.

**Nutzererwartung**

- konsistentes Nutzungserlebnis
- möglichst wenig gerätespezifische Sonderfälle
- Investitionsschutz in ihre Trainingsdaten

## Ergebnis nach v3

Nach `v3` ist die App nicht mehr nur ein Trainings- und Analysewerkzeug, sondern ein intelligentes Trainingssystem:

- Sie erfasst Schläge, Video und Verlauf.
- Sie hilft beim Verstehen von Ursachen.
- Sie führt durch Trainingsprogramme.
- Sie unterstützt Coaching.
- Sie macht Schlagform, Fortschritt und Kontext über Zeit sichtbar.

## Zentrale UX-Anforderungen aus der Gesamt-Journey

- Der Einstieg ins Live-Training muss trotz wachsendem Funktionsumfang schnell bleiben.
- Neue v2- und v3-Funktionen dürfen den Kernfluss nicht überladen.
- Daten, Video und Interpretation müssen als ein gemeinsames System wirken.
- Offline-First darf auch in späteren Ausbaustufen nicht verwsert werden.
- KI-Ausgaben müssen konkret, nachvollziehbar und trainingsbezogen sein.
- Fortgeschrittene Analysen dürfen nur dann Tiefe zeigen, wenn Bri sie wirklich braucht.
- Coaching- und Programmfunktionen müssen auf denselben Daten und Begriffen aufbauen wie das Live-Training.

## Abgrenzung

Nicht Teil dieser Journey:

- Platzrundenmanagement
- GPS- oder Lochansicht
- Simulator-Fokus
- generische Social Features ohne klaren Trainingsbezug
