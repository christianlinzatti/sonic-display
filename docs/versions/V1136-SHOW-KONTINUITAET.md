# V1136 – Saubere Positionswechsel und belastbare Tests

## Ausprobieren

Wie bisher `npm ci`, Konfiguration nach `.env.example`, dann `npm run dev`. Unter **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** einschalten.

Die **Show-Simulation** öffnen und den Positionsregler zunächst bei pausierter Probe verschieben. Die echte GLB-Pose wird direkt an der Zielposition ausgewertet; die Probe startet dadurch keine laufende Wiedergabe. Anschließend starten: Die Figur setzt an der gewählten Position fort. Normale Clipwechsel behalten ihre weiche Überblendung.

## Verbesserungen

### Pausierte Probe und Seeks

Die Probe unterscheidet normale Wiedergabe, Positionssprünge, Quellenwechsel und pausiertes Scrubbing. Beim Seek oder manuellen Verschieben während einer Pause wird eine laufende Überblendung beendet und die Zielpose direkt ausgewertet. Das verhindert, dass ein alter Übergang an der neuen Position weiterläuft oder die pausierte Ansicht unverändert bleibt.

Bei normalen Clipwechseln beginnt die Überblendung weiterhin an der tatsächlich dargestellten Pose. Der eingehende Clip wird direkt mit seiner geplanten Zeit ausgewählt. Die bestehende Beat-/Tempo-Integration und die gebackenen Bewegungsdaten bleiben erhalten. Pausierte Figuren erhalten keine laufenden Körperreaktionen.

### Rap-Kamera nach Trackwechsel und Seek

Die ruhige Lesekamera besitzt nun eine Quellenidentität und die zuletzt verwendete Songposition. Die Visualizer-Anbindung gibt Track-ID und bestätigte Wiedergabeproben (Position, Abfragezeit, Wiedergabestatus) aus dem vorhandenen Music-Context ausdrücklich an die Szene weiter, ohne neue Netzwerkabfrage oder zusätzliche Context-Abonnements innerhalb des Canvas. Bei einem neuen Track oder deutlichen Positionssprung wird ein alter Leseanker verworfen und aus der neu komponierten Kamerapose wieder aufgebaut. Die bestehenden Kameratreiber glätten die tatsächliche Bewegung weiterhin; eine neu eingeordnete Leseaufnahme nimmt ihr Ziel zügig ein, damit keine lange Fahrt hinter dem Text bleibt. Beim ersten Song ohne alten Leseanker wird die bereits sichtbare Pose übernommen.

Bei bestätigten Wiedergabeproben wird der erwartete Fortschritt aus deren Abfragezeiten berechnet. Mehr als 1,5 Sekunden zusätzlicher Vorlauf oder mehr als 0,5 Sekunden Rückkorrektur gelten als deutlicher Sprung. Verspätete UI-Frames, ältere Provider-Antworten und ein Wechsel des Wiedergabestatus allein richten die Aufnahme nicht neu aus. Ohne Provider-Probe verwendet die reine Planung Songposition und verstrichene Renderzeit als Fallback. Normale laufende Updates und kleine Polling-Korrekturen behalten die ruhige Aufnahme. Sehr kleine Seeks bleiben innerhalb dieser Toleranz.

Pause und Wiederaufnahme an derselben Position bewahren die sichtbare Pose. Manuelle, gespeicherte und Timeline-Kameras sowie Reduced Motion behalten ihren Vorrang. Die Regie schreibt weiterhin ausschließlich über die vorhandenen Kamera-Pfade.

Die vorhandene lokale Kamera-Statusmeldung enthält die Quellenidentität und den aktuellen Haltemodus für Diagnose und Browserprüfung. Es wird kein weiterer Timer und kein neuer Statuskanal angelegt.

### Ungültige Vorschau-Zeiten

`PreviewClipPlayer` ignoriert nicht endliche Update-/Seek-Zeiten, sodass `NaN` und Unendlich keine Skelettpositionen beschädigen. Nicht endliche Startzeiten einer neuen gültigen Auswahl beginnen bei null. Ein Clip ohne endliche positive Dauer wird vor jeder Änderung am laufenden Player mit einem Fehler abgewiesen; der Aufrufer beziehungsweise die vorhandene Vorschau-Fehlergrenze kann diesen behandeln. Es handelt sich nicht um eine neue vollständige Prüfung fremder GLB-Dateien.

## Architektur

- `lib/showContinuityV1136.ts`: reine Sprung- und Vorschau-Sampling-Entscheidung aus Quelle, Position und Wiedergabestatus.
- `lib/concertScoreV1134.ts`: Score mit Quellenkennung und Position; die bestehende Kamera-Komposition verwaltet den Leseanker entsprechend.
- `components/visualizer/useConcertStoryV1131.ts`: übernimmt die ausdrücklich weitergereichte Track-ID und Wiedergabeprobe in den gemeinsamen Score.
- `components/visualizer/SonicCrewRehearsal.tsx`: unterscheidet Pose-Auswertung und laufende Animation, wertet pausierte Seeks unmittelbar aus und räumt Übergänge auf.
- `components/visualizer/previewClipPlayer.ts`: schützt den Mixer vor ungültigen Zeiten/Dauern und behält das bestehende Snapshot-Aufräumen bei.

Die elf Avatare, 306 prozeduralen Clips, Bodenkontakt und Oberkörper-Dämpfung aus V1135 bleiben enthalten. Es werden keine neuen Mixamo-Dateien, Motion-Capture-Aufnahmen oder externen KI-Dienste hinzugefügt.

## Tests

```sh
npm run test:v1136
SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:v1136:browser
```

Der direkte Build umgeht die umfangreiche historische `prebuild`-Kette und führt den Next-Produktionsbuild mit Typprüfung aus. Alternativ einen von Playwright installierten passenden Chromium verwenden.

Die V1136-Prüfungen ergänzen die gesamte bisherige V1135-Regressionskette:

- **3.000 deterministische Positions-/Quellenwechsel:** Vor-/Rücksprünge, Polling-Toleranz, neue Rap-Anker, Pause/Wiederaufnahme und manuelle Priorität.
- **Alle elf echten GLBs:** nicht endliche Uhrwerte, ungültige Clipdauer, jeweils 180 unterbrochene Übergänge, direkte Scrubs und endliche Weltpositionen von Kopf, Hand und Füßen. Snapshot-bedingte Rundung wird mit der vorhandenen Float32-Genauigkeit geprüft; temporäre Mixer-Aktionen dürfen nicht anwachsen.
- **Browser:** eine gezielt zweisekündig blockierte Renderseite darf die Leseaufnahme nicht neu ausrichten; außerdem pausierte Probe mit tatsächlicher Zielclip-Zeit, Wiederaufnahme sowie Seek und Trackwechsel einer laufenden Rap-Show ohne Seiten-Neuladen. Die Kamera wird anhand ihrer tatsächlich veröffentlichten Pose auf endliche Werte und erneutes Halten geprüft.

Spotify und Lyrics sind dabei vollständig gemockt. Die vorhandenen Tests für Bodenhaftung, Persönlichkeiten, Refrains, Wortabstände, schnelle Texte, Tempoänderungen, fehlende Lyrics und fehlerhafte Zeitmarken bleiben enthalten.

## Dokumentation und ZIP

README und ARCHITECTURE bleiben im Projektstamm; die ausführliche Anleitung liegt hier unter `docs/versions/`. Die Projekt-ZIP enthält Testquellen und Assets, aber keine generierten Playwright-Berichte, Traces, Testergebnisordner, Abhängigkeiten, Build-Caches, Zugangsdaten oder älteren Release-ZIPs.
