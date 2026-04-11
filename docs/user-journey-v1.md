# User Journey — Version 1

Stand: 2026-04-11

## Ziel

Diese User Journey beschreibt den Kernfluss der App fuer Phase 1 und Phase 2:

- Phase 1: Auth, Equipment, Mevo+-Verbindung, Session-Start, Shot Capture, Live-Dashboard, lokale Speicherung
- Phase 2: Zielbereiche pro Schlaeger, Session-Analyse, Dispersion, Historie, Trends

Die Journey bildet bewusst nur den aktuellen MVP- und Analyse-Scope ab. Video-Features aus spaeteren Phasen sind nicht enthalten.

## Hauptperson

**Bri**

- ambitionierte Golferin
- trainiert gezielt statt nur Baelle zu schlagen
- spielt Draw-Bias
- will eigenes Feedback auf Basis von Mevo+-Daten statt nur Standardauswertung
- moechte Training offline-first und ohne Cloud-Abhaengigkeit nutzen

## Kernversprechen der App

Die App begleitet Bri von der Geraeteverbindung bis zur Analyse einer Trainingssession:

1. Setup in wenigen Schritten
2. Schlaege live sehen und sauber speichern
3. Eigene Zielkorridore statt generischer Kennzahlen nutzen
4. Session direkt auswerten und ueber Zeit vergleichen

## User Journey

### 1. Einstieg und Konto

**Situation**

Bri installiert die App auf einem Android-Geraet und oeffnet sie vor dem Training.

**Ziel der Nutzerin**

Moeglichst schnell in die App kommen, ohne technische Huerden.

**Flow**

1. Bri landet auf Login oder Registrierung.
2. Sie erstellt ein Konto oder meldet sich mit E-Mail und Passwort an.
3. Die App stellt ihre Session wieder her und leitet in den authentifizierten Bereich.

**Erwartung der Nutzerin**

- klarer, schneller Einstieg
- kein erneutes Login bei jedem Start
- verlasslicher Zugang zu ihren Trainingsdaten

**Produktnutzen**

Auth schafft die Grundlage fuer persoenliche Daten, Clubs, Sessions und spaeteren Sync.

### 2. Equipment einrichten

**Situation**

Vor dem ersten sinnvollen Training muss Bri ihre Schlaeger pflegen.

**Ziel der Nutzerin**

Jeder Schlag soll spaeter einem Schlaeger zugeordnet werden koennen.

**Flow**

1. Bri oeffnet den Equipment-Bereich.
2. Sie legt ihre Schlaeger an, z. B. 7-Wood, Eisen, Wedges.
3. Sie hinterlegt Name, Typ und Loft.
4. Die App speichert die Schlaeger lokal und macht sie fuer Sessions verfuegbar.

**Erwartung der Nutzerin**

- schneller CRUD-Flow
- keine redundanten Eingaben vor jeder Session
- saubere Club-Auswahl waehrend des Trainings

**Produktnutzen**

Das Equipment ist die Basis fuer clubbezogene Statistiken, Zielbereiche und Verlaufsdaten.

### 3. Launch Monitor verbinden

**Situation**

Bri ist auf der Range und will mit dem Mevo+ trainieren.

**Ziel der Nutzerin**

Eine stabile Verbindung, ohne sich mit Netzwerkdetails beschaeftigen zu muessen.

**Flow**

1. Bri oeffnet die App im Trainingskontext.
2. Die App verbindet sich mit dem Mevo+ ueber TCP.
3. Das Geraet wird konfiguriert und fuer Schlaege scharf geschaltet.
4. Der Verbindungsstatus ist sichtbar.
5. Bei Problemen bekommt Bri klares Feedback und kann erneut verbinden.

**Erwartung der Nutzerin**

- sichtbarer Status: verbunden, bereit, getrennt
- keine Unsicherheit, ob Schlaege erfasst werden
- schneller Retry bei Verbindungsabbruch

**Produktnutzen**

Ohne stabile Device-Verbindung gibt es keinen verlasslichen Trainingsfluss. Phase 1 startet hier.

### 4. Session starten

**Situation**

Die Verbindung steht, jetzt beginnt das eigentliche Training.

**Ziel der Nutzerin**

Eine Session sauber starten, um zusammenhaengende Schlaege gesammelt auszuwerten.

**Flow**

1. Bri startet eine neue Session.
2. Sie waehlt den aktiven Schlaeger.
3. Die App legt lokal eine Session an.
4. Das Live-Dashboard wird zur zentralen Trainingsansicht.

**Erwartung der Nutzerin**

- klarer Startpunkt fuer eine Trainingseinheit
- sofort sichtbarer aktiver Schlaeger
- keine Datenverluste bei App-Neustart oder Offline-Nutzung

**Produktnutzen**

Sessions strukturieren das Training und machen spaetere Auswertung erst sinnvoll.

### 5. Schlag erfassen und live verstehen

**Situation**

Bri schlaegt Baelle und will direkt nach jedem Schlag wissen, was passiert ist.

**Ziel der Nutzerin**

Sofortiges, relevantes Feedback pro Schlag.

**Flow**

1. Bri schlaegt.
2. Kurz nach Impact empfaengt die App das Shot-Event vom Mevo+.
3. Die App parst Ball-, Club- und gegebenenfalls Face-Impact-Daten.
4. Der letzte Schlag wird prominent im Dashboard angezeigt.
5. Der Schlag wird der laufenden Session und dem aktiven Schlaeger zugeordnet.
6. Der Datensatz wird lokal in SQLite gespeichert.

**Erwartung der Nutzerin**

- niedrige Latenz zwischen Schlag und Feedback
- klare Darstellung der wichtigsten Kennzahlen
- sichtbarer Hinweis, wenn Spin nur geschaetzt ist
- Vertrauen, dass kein Schlag verloren geht

**Produktnutzen**

Die App ersetzt das passive Sammeln von Zahlen durch unmittelbares, trainingsrelevantes Feedback.

### 6. Zielbereiche aktiv nutzen

**Situation**

Nach der Basiserfassung will Bri nicht nur Werte sehen, sondern beurteilen, ob der Schlag in ihren Trainingszielen liegt.

**Ziel der Nutzerin**

Eigene Sollbereiche pro Schlaeger und Kennzahl definieren.

**Flow**

1. Bri hinterlegt pro Schlaeger Zielbereiche, z. B. fuer Carry, Spin, AoA oder Face-to-Path.
2. Die App speichert Minimum- und Maximum-Werte pro Metrik.
3. Bei neuen Schlaegen vergleicht die App Live-Daten mit dem Zielkorridor.
4. Werte werden visuell als getroffen oder verfehlt markiert.

**Erwartung der Nutzerin**

- persoenliches Feedback statt Standardnormen
- schnelle visuelle Einordnung waehrend des Trainings
- klare Koppelung zwischen Schlaeger und Zielwerten

**Produktnutzen**

Hier beginnt der eigentliche Mehrwert gegenueber einer reinen Launch-Monitor-Anzeige: Die App wird zum Trainingssystem.

### 7. Session direkt analysieren

**Situation**

Nach einigen Schlaegen will Bri erkennen, ob sie Fortschritt macht oder nur einzelne gute Treffer hatte.

**Ziel der Nutzerin**

Eine kompakte Session-Auswertung direkt nach oder waehrend des Trainings.

**Flow**

1. Bri oeffnet die Session-Ansicht oder Historien-Details.
2. Die App zeigt Durchschnittswerte, Streuung und Zieltrefferquote.
3. Die Daten koennen pro Session und pro Schlaeger betrachtet werden.
4. Bri erkennt, ob die Session stabil war oder stark schwankte.

**Erwartung der Nutzerin**

- wenige, aussagekraeftige Kennzahlen
- Vergleichbarkeit innerhalb der Session
- schneller Ueberblick ohne Excel-Export

**Produktnutzen**

Die Session wird von einer Liste einzelner Schlaege zu einer interpretierbaren Trainingseinheit.

### 8. Dispersion visuell verstehen

**Situation**

Zahlen allein reichen nicht, wenn Bri ihr Startbild und die Streuung auf einen Blick erfassen will.

**Ziel der Nutzerin**

Treffbild intuitiv verstehen.

**Flow**

1. Bri oeffnet die Dispersionsansicht.
2. Die App uebertraegt Carry und Horizontal Launch in eine grafische Landepunkt-Ansicht.
3. Mehrere Schlaege erscheinen als Muster statt als Einzeldaten.
4. Bri erkennt direkt Push, Pull, Draw-Muster oder breite Streuung.

**Erwartung der Nutzerin**

- schnelle visuelle Lesbarkeit
- Bezug zur realen Ballflug-Verteilung
- bessere Trainingsentscheidungen als nur mit Tabellenwerten

**Produktnutzen**

Dispersion macht Schwankungen und Schlagmuster intuitiv sichtbar und unterstuetzt zielgerichtetes Range-Training.

### 9. Trainingshistorie nutzen

**Situation**

Bri trainiert regelmaessig und will spaetere Sessions wiederfinden.

**Ziel der Nutzerin**

Vergangene Einheiten nachvollziehen und mit neuen Sessions vergleichen.

**Flow**

1. Bri oeffnet die Historie.
2. Sie sieht Sessions chronologisch mit Datum, Schlaganzahl, Schlaegerbezug und Durchschnittswerten.
3. Sie oeffnet eine Session im Detail.
4. Die App zeigt die gespeicherten Schlaege und die zugehoerige Analyse.

**Erwartung der Nutzerin**

- schneller Zugriff auf alte Trainingsdaten
- kein Datenverlust trotz Offline-First-Ansatz
- klare Trennung einzelner Trainingstage

**Produktnutzen**

Historie schafft Kontinuitaet und macht Training langfristig nutzbar statt nur im Moment.

### 10. Trends ueber mehrere Sessions erkennen

**Situation**

Bri arbeitet an ihrem Schwung und will wissen, ob sich Aenderungen ueber Wochen wirklich auszahlen.

**Ziel der Nutzerin**

Entwicklung ueber Zeit sehen, nicht nur Momentaufnahmen.

**Flow**

1. Bri waehlt einen Schlaeger oder eine relevante Kennzahl.
2. Die App aggregiert Session-Werte ueber mehrere Trainings.
3. Trend-Charts zeigen z. B. Carry, Ball Speed oder Zieltrefferquote im Verlauf.
4. Bri erkennt, ob sich Muster stabil verbessern, verschlechtern oder stagnieren.

**Erwartung der Nutzerin**

- nachvollziehbare Entwicklung statt Bauchgefuehl
- Fortschritt sichtbar machen
- Rueckschritte frueh erkennen

**Produktnutzen**

Die App unterstuetzt nicht nur Schlagdiagnose, sondern echtes Trainingsmanagement.

## Erfolgsbild nach Phase 2

Am Ende von Phase 2 ist die App fuer Bri nicht nur ein Datensammler, sondern ein komplettes Trainingswerkzeug:

- Sie verbindet sich mit dem Mevo+ und startet schnell eine Session.
- Sie sieht Schlaege live und bekommt verlassliche Kennzahlen.
- Sie bewertet Schlaege gegen eigene Zielkorridore.
- Sie analysiert Sessions direkt nach dem Training.
- Sie erkennt Streuung, Muster und Entwicklung ueber die Zeit.

## Zentrale UX-Anforderungen aus der Journey

- Verbindung und Bereitschaft muessen jederzeit eindeutig sichtbar sein.
- Der Weg von App-Start zu erstem erfassten Schlag muss kurz sein.
- Der aktive Schlaeger muss im Trainingsfluss klar erkennbar sein.
- Live-Feedback muss priorisiert werden, nicht Menues oder Nebendaten.
- Zielbereiche muessen leicht pflegbar und pro Schlaeger eindeutig sein.
- Session-Analyse muss schnell erfassbar sein, nicht ueberladen.
- Historie und Trends muessen auf echte Trainingsentscheidungen einzahlen.

## Abgrenzung

Nicht Teil dieser Journey:

- Video Recording und Video-Sync
- Video-Player und Annotationen
- komplexe Face-Impact-Visualisierung als voll ausgebaute Funktion
- Platzrundenmanagement oder Simulator-Workflows
