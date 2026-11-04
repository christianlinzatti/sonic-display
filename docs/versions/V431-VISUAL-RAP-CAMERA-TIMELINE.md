# V431 – Visual Rap Camera Timeline

## Was neu ist

Die vorhandene **Einstellungen → Anzeige → Rap Performance Editor → V425 → V429**-Kamerasteuerung erhält eine visuelle Kamera-Zeitachse unmittelbar über dem V430 Shot Studio.

- Jede gültige synchronisierte Lyrics-Zeile erscheint auf einer zeitbezogenen Karte mit Startzeit, Zeilennummer, Text und schematischer Shot-Miniatur.
- Solo-Nahaufnahme, Antwort-Seitenwechsel, Duett-Totale und Hook-Push haben unterscheidbare Darstellungen und Farben; unzugeordnete Zeilen bleiben sichtbar.
- Die aus V416 manuell zugeordneten Rapper-Szenen erzeugen die **Auto-Vorschau**. Gespeicherte V430-Zeilen-Overrides erscheinen als individuelle Shots, mit Stärke oder mit dem Ruhemodus.
- Klicken auf eine Zeile setzt **nur die lokale Vorschauzeit** des bestehenden V425/V430-Editors. Daraufhin kann man dieselbe Zeile direkt im V430-Panel anpassen und ausdrücklich speichern oder zurücksetzen.
- „Vorherige“/„Nächste“ navigieren durch die Lyrics-Zeilen. Die gewählte Stelle wird im horizontalen Kartenstreifen sichtbar gehalten. Wenn eine lokale Vorschau gewählt ist, zeigen die Labels die Abweichung vom Live-Fortschritt.
- Bei pausierter/fehlender Musik oder deaktivierter V429-Kameraregie bleibt die Ansicht eine **redaktionelle Vorschau**. Nichts wird live verändert.

## Grenzen und Prioritäten

**Die Miniaturen sind Diagramme, keine gerenderten Standbilder aus dem 3D-Avatar oder tatsächliche Live-Kameraposen.** Das reale, opt-in Kamerasignal wird weiterhin vollständig durch V429 mit V430-Overrides, laufzeitbasierten Shot-Holds und den bisherigen Sicherheitsgates berechnet. V431 führt keine neue WebGL-Kamera und keine zusätzlichen Render-Loops ein. Es ruft weder Spotify-Seek auf noch editiert es Spotify-Lyrics, Kamerazeitachsen, manuelle Einstellungen, Mundbewegungen oder Tänze.

Die Anzeige setzt zeitgestempelte Lyrics und einen aktiven Track voraus. Für eine echte Live-Rap-Kameraszene müssen mindestens zwei Avatare und gültige, manuell gesetzte V416-Szenenzuordnungen vorliegen. Die gesamte V429-Regie bleibt per V429-Checkbox abschaltbar; gespeicherte Keyframes, reduzierte Bewegung, Lyrics-Schutz und manuelle Kamera haben Vorrang. V431 unterstellt keine automatische Sänger-/Emotions- oder Phonemerkennung.

Zum Schutz der UI werden höchstens die ersten **5.000** synchronisierten Zeilen als Datenmodell aufbereitet, aber nur **maximal 15 Karten** gleichzeitig als interaktive Timeline dargestellt. Ungültige Zeittakte werden ignoriert, fehlende Endzeiten maximal 14 Sekunden nach Start begrenzt. Dieses Limit betrifft nicht den ursprünglichen Lyrics-/Live-Betrieb.

## Implementierung

- `components/visualizer/rapCameraTimelineV431.ts`: reine, testbare, lesende Timeline-Projektion mit V416- und V430-Normalisierung, Auswahl und begrenztem Sichtfenster.
- `components/visualizer/RapCameraTimelinePanelV431.tsx`: scrollbare Zeilenkarten, SVG-Perspektivminiaturen, Navigationsbuttons und detaillierte Vorschau.
- `components/visualizer/ExpressiveRapDirectorPanelV425.tsx`: Verwendung der bereits vorhandenen, lokalen Vorschauzeit und des V430-Editors.
- `tests/v431-visual-rap-camera-timeline-regression.cjs`: Szenen-, Override-, Timebase-, Defensive-Input-, Navigations- und Integrationsregressionen.
- `tests/tsconfig.v431-core.json`: strenge TypeScript-Kernprüfung unabhängig von React/Next.js-Dependencies.

## Installation/Prüfung

```powershell
npm install
npm run test:v431
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v431-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

`npm install` ist insbesondere nach Download der Projekt-ZIP nötig: `node_modules` und `package-lock.json` sind nicht im Archiv. Ohne installierte Next.js-/React-/R3F-Abhängigkeiten sind der produktive Next.js-Build, Browser-Rendering, GLB/GPU-Sichttests und die vollständige React-/Next.js-Typprüfung **nicht bestätigt**.
