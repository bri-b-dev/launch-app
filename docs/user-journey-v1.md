# User Journey — Version 1

Stand: 2026-04-11

## Ziel

Diese User Journey beschreibt den Kernfluss der App für Phase 1 und Phase 2:

- Phase 1: Auth, Equipment, Mevo+-Verbindung, Session-Start, Shot Capture, Live-Dashboard, lokale Speicherung
- Phase 2: Zielbereiche pro Schläger, Session-Analyse, Dispersion, Historie, Trends

Die Journey bildet bewusst nur den aktuellen MVP- und Analyse-Scope ab. Video-Features aus späteren Phasen sind nicht enthalten.

## Hauptperson

**Bri**

- ambitionierte Golferin
- trainiert gezielt statt nur Bälle zu schlagen
- spielt Draw-Bias
- will eigenes Feedback auf Basis von Mevo+-Daten statt nur Standardauswertung
- möchte Training offline-first und ohne Cloud-Abhängigkeit nutzen

## Kernversprechen der App

Die App begleitet Bri von der Geräteverbindung bis zur Analyse einer Trainingssession:

1. Setup in wenigen Schritten
2. Schläge live sehen und sauber speichern
3. Eigene Zielkorridore statt generischer Kennzahlen nutzen
4. Session direkt auswerten und über Zeit vergleichen

## User Journey

### 1. Einstieg und Konto

**Situation**

Bri installiert die App auf einem Android-Gerät und öffnet sie vor dem Training.

**Ziel der Nutzerin**

Möglichst schnell in die App kommen, ohne technische Hürden.

**Flow**

1. Bri landet auf Login oder Registrierung.
2. Sie erstellt ein Konto oder meldet sich mit E-Mail und Passwort an.
3. Die App stellt ihre Session wieder her und leitet in den authentifizierten Bereich.

**Erwartung der Nutzerin**

- klarer, schneller Einstieg
- kein erneutes Login bei jedem Start
- verlasslicher Zugang zu ihren Trainingsdaten

**Produktnutzen**

Auth schafft die Grundlage für persönliche Daten, Clubs, Sessions und späteren Sync.

### 2. Equipment einrichten

**Situation**

Vor dem ersten sinnvollen Training muss Bri ihre Schläger pflegen.

**Ziel der Nutzerin**

Jeder Schlag soll später einem Schläger zugeordnet werden können.

**Flow**

1. Bri öffnet den Equipment-Bereich.
2. Sie legt ihre Schläger an, z. B. 7-Wood, Eisen, Wedges.
3. Sie hinterlegt Name, Typ und Loft.
4. Die App speichert die Schläger lokal und macht sie für Sessions verfügbar.

**Erwartung der Nutzerin**

- schneller CRUD-Flow
- keine redundanten Eingaben vor jeder Session
- saubere Club-Auswahl während des Trainings

**Produktnutzen**

Das Equipment ist die Basis für clubbezogene Statistiken, Zielbereiche und Verlaufsdaten.

### 3. Launch Monitor verbinden

**Situation**

Bri ist auf der Range und will mit dem Mevo+ trainieren.

**Ziel der Nutzerin**

Eine stabile Verbindung, ohne sich mit Netzwerkdetails beschäftigen zu müssen.

**Flow**

1. Bri öffnet die App im Trainingskontext.
2. Die App verbindet sich mit dem Mevo+ über TCP.
3. Das Gerät wird konfiguriert und für Schläge scharf geschaltet.
4. Der Verbindungsstatus ist sichtbar.
5. Bei Problemen bekommt Bri klares Feedback und kann erneut verbinden.

**Erwartung der Nutzerin**

- sichtbarer Status: verbunden, bereit, getrennt
- keine Unsicherheit, ob Schläge erfasst werden
- schneller Retry bei Verbindungsabbruch

**Produktnutzen**

Ohne stabile Device-Verbindung gibt es keinen verlasslichen Trainingsfluss. Phase 1 startet hier.

### 4. Session starten

**Situation**

Die Verbindung steht, jetzt beginnt das eigentliche Training.

**Ziel der Nutzerin**

Eine Session sauber starten, um zusammenhängende Schläge gesammelt auszuwerten.

**Flow**

1. Bri startet eine neue Session.
2. Sie wählt den aktiven Schläger.
3. Die App legt lokal eine Session an.
4. Das Live-Dashboard wird zur zentralen Trainingsansicht.

**Erwartung der Nutzerin**

- klarer Startpunkt für eine Trainingseinheit
- sofort sichtbarer aktiver Schläger
- keine Datenverluste bei App-Neustart oder Offline-Nutzung

**Produktnutzen**

Sessions strukturieren das Training und machen spätere Auswertung erst sinnvoll.

### 5. Schlag erfassen und live verstehen

**Situation**

Bri schlägt Bälle und will direkt nach jedem Schlag wissen, was passiert ist.

**Ziel der Nutzerin**

Sofortiges, relevantes Feedback pro Schlag.

**Flow**

1. Bri schlägt.
2. Kurz nach Impact empfängt die App das Shot-Event vom Mevo+.
3. Die App parst Ball-, Club- und gegebenenfalls Face-Impact-Daten.
4. Der letzte Schlag wird prominent im Dashboard angezeigt.
5. Der Schlag wird der laufenden Session und dem aktiven Schläger zugeordnet.
6. Der Datensatz wird lokal in SQLite gespeichert.

**Erwartung der Nutzerin**

- niedrige Latenz zwischen Schlag und Feedback
- klare Darstellung der wichtigsten Kennzahlen
- sichtbarer Hinweis, wenn Spin nur geschätzt ist
- Vertrauen, dass kein Schlag verloren geht

**Produktnutzen**

Die App ersetzt das passive Sammeln von Zahlen durch unmittelbares, trainingsrelevantes Feedback.

### 6. Zielbereiche aktiv nutzen

**Situation**

Nach der Basiserfassung will Bri nicht nur Werte sehen, sondern beurteilen, ob der Schlag in ihren Trainingszielen liegt.

**Ziel der Nutzerin**

Eigene Sollbereiche pro Schläger und Kennzahl definieren.

**Flow**

1. Bri hinterlegt pro Schläger Zielbereiche, z. B. für Carry, Spin, AoA oder Face-to-Path.
2. Die App speichert Minimum- und Maximum-Werte pro Metrik.
3. Bei neuen Schlägen vergleicht die App Live-Daten mit dem Zielkorridor.
4. Werte werden visuell als getroffen oder verfehlt markiert.

**Erwartung der Nutzerin**

- persönliches Feedback statt Standardnormen
- schnelle visuelle Einordnung während des Trainings
- klare Koppelung zwischen Schläger und Zielwerten

**Produktnutzen**

Hier beginnt der eigentliche Mehrwert gegenüber einer reinen Launch-Monitor-Anzeige: Die App wird zum Trainingssystem.

### 7. Session direkt analysieren

**Situation**

Nach einigen Schlägen will Bri erkennen, ob sie Fortschritt macht oder nur einzelne gute Treffer hatte.

**Ziel der Nutzerin**

Eine kompakte Session-Auswertung direkt nach oder während des Trainings.

**Flow**

1. Bri öffnet die Session-Ansicht oder Historien-Details.
2. Die App zeigt Durchschnittswerte, Streuung und Zieltrefferquote.
3. Die Daten können pro Session und pro Schläger betrachtet werden.
4. Bri erkennt, ob die Session stabil war oder stark schwankte.

**Erwartung der Nutzerin**

- wenige, aussagekräftige Kennzahlen
- Vergleichbarkeit innerhalb der Session
- schneller Überblick ohne Excel-Export

**Produktnutzen**

Die Session wird von einer Liste einzelner Schläge zu einer interpretierbaren Trainingseinheit.

### 8. Dispersion visuell verstehen

**Situation**

Zahlen allein reichen nicht, wenn Bri ihr Startbild und die Streuung auf einen Blick erfassen will.

**Ziel der Nutzerin**

Treffbild intuitiv verstehen.

**Flow**

1. Bri öffnet die Dispersionsansicht.
2. Die App überträgt Carry und Horizontal Launch in eine grafische Landepunkt-Ansicht.
3. Mehrere Schläge erscheinen als Muster statt als Einzeldaten.
4. Bri erkennt direkt Push, Pull, Draw-Muster oder breite Streuung.

**Erwartung der Nutzerin**

- schnelle visuelle Lesbarkeit
- Bezug zur realen Ballflug-Verteilung
- bessere Trainingsentscheidungen als nur mit Tabellenwerten

**Produktnutzen**

Dispersion macht Schwankungen und Schlagmuster intuitiv sichtbar und unterstützt zielgerichtetes Range-Training.

### 9. Trainingshistorie nutzen

**Situation**

Bri trainiert regelmässig und will spätere Sessions wiederfinden.

**Ziel der Nutzerin**

Vergangene Einheiten nachvollziehen und mit neuen Sessions vergleichen.

**Flow**

1. Bri öffnet die Historie.
2. Sie sieht Sessions chronologisch mit Datum, Schlaganzahl, Schlägerbezug und Durchschnittswerten.
3. Sie öffnet eine Session im Detail.
4. Die App zeigt die gespeicherten Schläge und die zugehörige Analyse.

**Erwartung der Nutzerin**

- schneller Zugriff auf alte Trainingsdaten
- kein Datenverlust trotz Offline-First-Ansatz
- klare Trennung einzelner Trainingstage

**Produktnutzen**

Historie schafft Kontinuität und macht Training langfristig nutzbar statt nur im Moment.

### 10. Trends über mehrere Sessions erkennen

**Situation**

Bri arbeitet an ihrem Schwung und will wissen, ob sich Änderungen über Wochen wirklich auszahlen.

**Ziel der Nutzerin**

Entwicklung über Zeit sehen, nicht nur Momentaufnahmen.

**Flow**

1. Bri wählt einen Schläger oder eine relevante Kennzahl.
2. Die App aggregiert Session-Werte über mehrere Trainings.
3. Trend-Charts zeigen z. B. Carry, Ball Speed oder Zieltrefferquote im Verlauf.
4. Bri erkennt, ob sich Muster stabil verbessern, verschlechtern oder stagnieren.

**Erwartung der Nutzerin**

- nachvollziehbare Entwicklung statt Bauchgefühl
- Fortschritt sichtbar machen
- Rückschritte früh erkennen

**Produktnutzen**

Die App unterstützt nicht nur Schlagdiagnose, sondern echtes Trainingsmanagement.

## Erfolgsbild nach Phase 2

Am Ende von Phase 2 ist die App für Bri nicht nur ein Datensammler, sondern ein komplettes Trainingswerkzeug:

- Sie verbindet sich mit dem Mevo+ und startet schnell eine Session.
- Sie sieht Schläge live und bekommt verlassliche Kennzahlen.
- Sie bewertet Schläge gegen eigene Zielkorridore.
- Sie analysiert Sessions direkt nach dem Training.
- Sie erkennt Streuung, Muster und Entwicklung über die Zeit.

## Zentrale UX-Anforderungen aus der Journey

- Verbindung und Bereitschaft müssen jederzeit eindeutig sichtbar sein.
- Der Weg von App-Start zu erstem erfassten Schlag muss kurz sein.
- Der aktive Schläger muss im Trainingsfluss klar erkennbar sein.
- Live-Feedback muss priorisiert werden, nicht Menüs oder Nebendaten.
- Zielbereiche müssen leicht pflegbar und pro Schläger eindeutig sein.
- Session-Analyse muss schnell erfassbar sein, nicht überladen.
- Historie und Trends müssen auf echte Trainingsentscheidungen einzahlen.

## Abgrenzung

Nicht Teil dieser Journey:

- Video Recording und Video-Sync
- Video-Player und Annotationen
- komplexe Face-Impact-Visualisierung als voll ausgebaute Funktion
- Platzrundenmanagement oder Simulator-Workflows
