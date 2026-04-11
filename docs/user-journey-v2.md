# User Journey — v1 (MVP) + v2

Stand: 2026-04-11

## Ziel

Diese User Journey beschreibt den kompletten Produktfluss fuer:

- `v1 (MVP)` = Phase 1 + Phase 2
- `v2` = Phase 3 + Phase 4

Damit deckt das Dokument den Weg von der ersten Nutzung bis zu Video-Workflows und Cloud-/Sync-Funktionen ab.

## Hauptperson

**Bri**

- ambitionierte Golferin
- trainiert auf der Range mit klarem Technikfokus
- spielt Draw-Bias
- will nicht nur Launch-Monitor-Daten sehen, sondern Training steuern
- moechte offline trainieren koennen und Daten spaeter optional syncen

## Produktversprechen ueber v1 + v2

Die App entwickelt sich fuer Bri in vier Stufen:

1. Verbindung und Schlagerfassung funktionieren verlässlich.
2. Die App bewertet Schlaege gegen persoenliche Zielbereiche.
3. Video macht Schwungveraenderungen sichtbar.
4. Sync und Export machen die Daten langfristig und geraeteuebergreifend nutzbar.

## User Journey

### 1. App installieren und anmelden

**Situation**

Bri richtet die App auf ihrem Android-Geraet fuer das Training ein.

**Ziel der Nutzerin**

Schnell in die App kommen und eine persoenliche Datenbasis aufbauen.

**Flow**

1. Bri oeffnet die App.
2. Sie registriert sich oder meldet sich mit E-Mail und Passwort an.
3. Die App stellt bestehende Sessions wieder her und schuetzt den authentifizierten Bereich.

**Nutzererwartung**

- einfacher Einstieg
- stabile Anmeldung
- persoenlicher Zugriff auf Equipment, Sessions und Sync

### 2. Equipment vorbereiten

**Situation**

Vor echtem Training muss Bri ihre Schlaeger in der App hinterlegen.

**Ziel der Nutzerin**

Alle spaeteren Schlaege eindeutig einem Club zuordnen.

**Flow**

1. Bri oeffnet den Equipment-Bereich.
2. Sie legt Schlaeger mit Name, Typ und Loft an.
3. Die App speichert diese Daten lokal und verknuepft sie spaeter mit Sessions und Schlaegen.

**Nutzererwartung**

- schneller Setup-Flow
- keine doppelte Pflege
- klare Club-Auswahl im Training

### 3. Mevo+ verbinden und Session starten

**Situation**

Auf der Range will Bri ohne Umwege trainieren.

**Ziel der Nutzerin**

Das Geraet verbinden und direkt in eine Session wechseln.

**Flow**

1. Bri oeffnet den Trainingsbereich.
2. Die App verbindet sich mit dem Mevo+ ueber TCP.
3. Das Geraet wird konfiguriert und armed.
4. Bri startet eine neue Session.
5. Sie waehlt den aktiven Schlaeger.
6. Das Live-Dashboard wird zur Hauptansicht.

**Nutzererwartung**

- klarer Verbindungsstatus
- schneller Weg vom App-Start zum ersten Schlag
- kein Zweifel, ob das Geraet bereit ist

### 4. Schlaege live erfassen

**Situation**

Das Training laeuft, Bri schlaegt Baelle.

**Ziel der Nutzerin**

Direktes Feedback pro Schlag und sichere Speicherung.

**Flow**

1. Nach jedem Schlag kommt das Shot-Event vom Mevo+.
2. Die App parst Ball-, Club- und falls vorhanden FIL-Daten.
3. Der letzte Schlag erscheint prominent im Dashboard.
4. Der Schlag wird Session und Club zugeordnet.
5. Die Daten werden lokal in SQLite gespeichert.

**Nutzererwartung**

- schnelle Rueckmeldung
- gut lesbare Kernmetriken
- Hinweis, wenn Spin geschaetzt ist
- keine verlorenen Daten bei Verbindungs- oder App-Problemen

### 5. Mit Zielbereichen trainieren

**Situation**

Nur Daten zu sehen reicht Bri nicht. Sie will wissen, ob ein Schlag trainiert richtig war.

**Ziel der Nutzerin**

Persoenliche Zielbereiche pro Schlaeger und Metrik nutzen.

**Flow**

1. Bri definiert Margins pro Club, z. B. fuer Carry, AoA, Spin oder Face-to-Path.
2. Die App speichert Min-/Max-Werte je Metrik.
3. Neue Schlaege werden live gegen diese Zielbereiche geprueft.
4. Treffer und Abweichungen werden visuell markiert.

**Nutzererwartung**

- persoenliches Feedback statt Standardnormen
- schnelle Entscheidung: gut, knapp daneben oder klar verfehlt
- Training entlang echter Ziele

### 6. Session analysieren

**Situation**

Nach einer Serie von Schlaegen will Bri wissen, ob das Training wirklich stabil war.

**Ziel der Nutzerin**

Session-Leistung kompakt verstehen.

**Flow**

1. Bri oeffnet die Session-Details.
2. Die App zeigt Durchschnittswerte, Streuung und Zieltrefferquote.
3. Werte koennen pro Session und pro Club gelesen werden.
4. Bri erkennt Stabilitaet, Ausreisser und Trainingsmuster.

**Nutzererwartung**

- keine Datenflut
- schnelle Lesbarkeit
- hilfreiche Verdichtung statt Rohdatenliste

### 7. Dispersion und Historie nutzen

**Situation**

Bri will nicht nur Zahlen sehen, sondern Ballflug-Muster und Entwicklung erkennen.

**Ziel der Nutzerin**

Trainingsdaten visuell und ueber mehrere Sessions hinweg verstehen.

**Flow**

1. Bri betrachtet die Dispersion einer Session als visuelles Treffbild.
2. Sie sieht in der Historie fruehere Sessions chronologisch geordnet.
3. Sie oeffnet einzelne Sessions erneut und vergleicht Schlaganzahl, Carry und weitere Kennzahlen.
4. Trend-Charts zeigen die Entwicklung wichtiger Metriken ueber mehrere Sessions.

**Nutzererwartung**

- schneller Blick auf Streuung und Schlagmuster
- Auffindbarkeit alter Sessions
- sichtbarer Fortschritt ueber Zeit

## Ergebnis nach v1 (MVP)

Am Ende von `v1` ist die App fuer Bri ein voll nutzbares Trainingswerkzeug:

- Mevo+ verbinden
- Session starten
- Schlaege live sehen und lokal speichern
- persoenliche Zielbereiche verwenden
- Sessions analysieren
- Dispersion, Historie und Trends fuer Technikarbeit nutzen

## Erweiterung in v2

Mit `v2` verschiebt sich der Schwerpunkt von reiner Datenauswertung zu reichhaltiger Dokumentation und langfristiger Nutzbarkeit.

### 8. Video zum Schlag aufnehmen

**Situation**

Bri will nicht nur Metriken, sondern auch den Schwung selbst sehen.

**Ziel der Nutzerin**

Zu einem Schlag einen passenden Clip erhalten.

**Flow**

1. Bri trainiert weiter im Session-Modus.
2. Die App nimmt Video im Trainingskontext auf oder puffert es fuer Schlag-Trigger.
3. Beim Shot-Event wird ein Clip zum Schlag erzeugt.
4. Der Clip wird lokal gespeichert und mit dem Schlag verknuepft.

**Nutzererwartung**

- moeglichst automatische Zuordnung
- kein manueller Dateichaos-Workflow
- technische Daten und Video gehoeren zusammen

### 9. Schlag mit Video ansehen

**Situation**

Nach einem auffaelligen oder guten Schlag will Bri verstehen, was im Schwung passiert ist.

**Ziel der Nutzerin**

Video und Launch-Daten gemeinsam lesen.

**Flow**

1. Bri oeffnet einen Schlag oder eine Session-Detailansicht.
2. Die App zeigt den Clip zusammen mit den Metriken.
3. Sie spielt den Schlag in normaler Geschwindigkeit oder in Slow Motion ab.
4. Scrubbing hilft beim genauen Blick auf relevante Bewegungsmomente.

**Nutzererwartung**

- direkter Zusammenhang zwischen Bild und Daten
- einfaches Wiederfinden guter und schlechter Schlaege
- weniger Wechsel zwischen mehreren Apps

### 10. Schwung markieren und vergleichen

**Situation**

Bri arbeitet gezielt an Technikveraenderungen wie Early Extension oder AoA.

**Ziel der Nutzerin**

Bewegungen sichtbar markieren und zwei Schlaege direkt gegenueberstellen.

**Flow**

1. Bri friert einen Frame ein.
2. Sie setzt Linien oder Punkte, z. B. fuer Kopf, Huefte oder Schwungebene.
3. Sie oeffnet zwei Schlaege im Vergleich.
4. Die App zeigt beide Clips nebeneinander.
5. Bri sieht, ob Veraenderungen ueber Zeit wirklich sichtbar sind.

**Nutzererwartung**

- greifbare Technikarbeit
- klares Vorher-Nachher
- keine externe Video-App notwendig

### 11. Daten lokal und in der Cloud verfuegbar halten

**Situation**

Bri trainiert nicht immer mit stabiler Verbindung, will aber Daten nicht auf ein einzelnes Geraet beschraenken.

**Ziel der Nutzerin**

Offline arbeiten und bei Bedarf syncen.

**Flow**

1. Die App speichert weiterhin alles lokal als primaere Quelle.
2. Wenn Bri online ist, startet sie einen Sync oder bekommt Sync-Status angezeigt.
3. Sessions, Schlaege, Clubs und Margins werden zu Supabase uebertragen.
4. Die App merkt sich den letzten erfolgreichen Sync.

**Nutzererwartung**

- Offline-First bleibt unangetastet
- Cloud ist Zusatznutzen, nicht Voraussetzung
- Sync muss transparent und kontrollierbar sein

### 12. Export und Multi-Device nutzen

**Situation**

Mit zunehmender Nutzung will Bri ihre Daten ausserhalb der App verwenden oder auf mehreren Geraeten verfuegbar haben.

**Ziel der Nutzerin**

Mehr Freiheit in der Nutzung ihrer Trainingsdaten.

**Flow**

1. Bri exportiert Sessions oder Schlaghistorien als CSV.
2. Sie nutzt die Daten in Excel, Numbers oder anderen Analyse-Tools weiter.
3. Spaeter greift sie ueber mehrere Geraete auf synchronisierte Daten zu.
4. Die App wird damit Teil eines groesseren Trainings-Setups.

**Nutzererwartung**

- keine Datensilos
- einfache Weiterverarbeitung
- Flexibilitaet zwischen Trainingsgeraeten

## Ergebnis nach v2

Am Ende von `v2` ist die App fuer Bri nicht nur ein Trainings-Dashboard, sondern eine vollwertige Trainingsplattform:

- Live-Daten und Analyse bleiben der Kern
- Video erweitert die Daten um sichtbare Bewegung
- Sync und Export machen das Training dauerhaft nutzbar
- die App funktioniert sowohl im Moment des Schlages als auch in der spaeteren Auswertung

## Zentrale UX-Anforderungen aus dieser Journey

- Der Weg zum ersten Schlag muss extrem kurz bleiben.
- Verbindung, Aufnahme und Sync muessen jederzeit eindeutig sichtbar sein.
- Live-Feedback darf nie von Sekundaerfunktionen verdraengt werden.
- Zielbereiche muessen pro Club einfach pflegbar und im Training sofort lesbar sein.
- Video muss sich natuerlich an Schlaege anhaengen, nicht wie ein separater Modus wirken.
- Offline-First darf durch Cloud-Funktionen nicht aufgeweicht werden.
- Historie, Trends, Videovergleich und Export muessen auf echte Trainingsentscheidungen einzahlen.

## Abgrenzung

Nicht Teil dieser Journey:

- AI Swing Analysis
- D-Plane-Visualisierung
- Trainingsprogramme
- Coach View
- Voice Notes
- Shot-Shaping-Auswertung als eigenes Modul
- weitere Launch Monitors
- Platzrundenmanagement
