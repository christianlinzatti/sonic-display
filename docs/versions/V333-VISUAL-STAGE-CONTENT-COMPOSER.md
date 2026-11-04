# Sonic Display V333 – Visual Stage Content Composer

## Umfang
V333 ergänzt die V330–V332-Content-Pipeline um bis zu fünf unabhängig platzierte Leinwände in derselben React-Three-Fiber-Bühne. Das bisherige Single-Screen-Verhalten bleibt der Standard, bis das neue Layout aktiviert wird. Die vorhandenen Videos, Bilder, Text- und Konzertkarten werden über denselben sicheren Renderer ausgegeben.

## Konfiguration
Öffne **Settings → Dynamic Stage → Stage Content Plugins → V333 – Visual Stage Content Composer**. Aktiviere zuerst die normale Content-Leinwand V330 und dann **Mehrfach-Leinwand-Layout aktivieren**.

- Drei vorgefertigte Screens: Hauptleinwand (gemischte Quellen), links Künstlerfotos, rechts Konzerttermine.
- Bis zu fünf Leinwände. Hinzufügen, umbenennen, ausschalten oder löschen.
- Drag-and-Drop mit Maus/Touch in einer schematischen Bühnenübersicht verändert X-Position und Höhe.
- Tiefenposition, Drehwinkel und Skalierung sind mit Schiebereglern einstellbar.
- Jede Leinwand erhält unabhängig einen Inhaltstyp: `rotation`, `canvas`, `cover`, `text`, `photos` oder `concerts`.
- Push-Anzeigen je Leinwand: **sofort** (`immediate`), **beim nächsten geplanten Content-Intervall** (`next`) oder **nicht anzeigen** (`off`). Bei `next` ist die Gültigkeitsdauer der Push-Nachricht weiterhin maßgeblich. Es gibt keine unbegrenzte Warteschlange.
- Die Einstellungen werden im Browser unter `sonic-stage-screen-layout-v333` abgelegt. Änderungen werden über `sonic:stage-layout-v333` live an die Bühne verteilt und zwischen Tabs synchronisiert.

## Datenfluss
1. `useStageContentV330` lädt weiterhin die autorisierten lokalen `/api/...`-Quellen und empfängt den V331/V332-Live-Push.
2. `useScreenLayoutV333` lädt und validiert das Layout (fünf Einträge; Grenzen für Position, Größe und Rotation).
3. `StageContentScreensV333` ordnet jeder Fläche eine Source und Push-Regel zu. Die Regeln verwenden den aktuellen Push ausschließlich zur Darstellung – die Original-Slides werden nicht verändert.
4. `StageContentScreenV330` rendert Bild, Video, Text oder Konzerttermine an der neuen Position.

## Hinweise
- Eine Leinwand mit einem nicht verfügbaren Plugin bleibt leer. Aktiviere das entsprechende Source-Plugin und konfiguriere ggf. den lokalen JSON-API-Pfad oben in V330.
- Externe API-Schlüssel bleiben in Next.js-API-Routen. Die Leinwand selbst bezieht keine neuen Netzwerk-Zugriffsrechte.
- Für sofortige externe Textmeldungen gilt weiterhin `POST /api/stage-content/push`; auf Vercel verwendet die Zustellung bei Konfiguration Ably V332.
- Spotify Canvas basiert weiterhin auf einem inoffiziellen Endpunkt; Videoplayback und die tatsächliche 3D-Ansicht müssen auf dem Zielbrowser geprüft werden.
- Bei sehr vielen oder großen Videoflächen steigt die CPU/GPU-Last; auf kleineren Displays lieber zwei bis drei Leinwände nutzen.
- Standardmäßig deaktiviert, um die bestehende Bühnenleistung nicht zu verändern.

## Prüfungen
- `npm run test:v333`: Layout-Sanitizing, Grenzwerte, eindeutige IDs, Content-Zuweisung, Push-Regeln und UI-Wiring.
- `npm run verify:offline`: Syntaxprüfung und alle vorhandenen Offline-Regressionstests, einschließlich V333.
- Isolierter strikter `tsc`-Check für die neue Layout-Engine.
- Ein vollständiger `npm run verify` und ein Browser/WebGL-Test setzen zuerst `npm install` voraus.
