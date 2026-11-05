# V972 – Volumetric Stage Atmosphere

## Änderungen

- Virtueller **Tiefeneindruck** durch transparente, weich verblendete Shader-Flächen im bereits vorhandenen React-Three-Fiber-Canvas. Kein teures echtes volumetrisches Raymarching; keine echte Nebelmaschine oder Raum-Hardware wird gesteuert.
- Seitliche, kegelförmige Lichtvolumen, mehrlagiger Hintergrunddunst und dezenter Bodennebel. Lichtfarben folgen dem verifizierten Songabschnitt und den V969-Presets.
- Stufenlos einstellbare Intensität (0–100 %, Standard 55 %) und Qualitätsstufen **Eco (4 Ebenen)**, **Balanced (7)**, **Cinematic (10)**. Für Raspberry Pi OS 64-bit im Kiosk wird **Eco** empfohlen. Die tatsächliche Leistung kann erst auf dem Gerät gemessen werden.
- Sanfter Verlauf mit maximal kleinen Alphawerten, sehr langsamer Bewegung; reduzierte Bewegung setzt die Shader-Animation auf statisch.
- Rücksicht auf sichtbare Lyrics, Kameranahaufnahme und vorhandene V966-Vorsichtsmaßnahmen.
- **Keine** zusätzlichen `useFrame`-Callbacks, Timer, dynamische Texturen, WebSockets, Govee-Kommandos oder Audio-/Spotify-Abfragen.

## Aktivierung

Unter **Ultimate Concert Experience Studio** zunächst **Konzertregie** und **virtuelle 3D-Bühneneffekte**, anschließend **V966 Immersion** und separat **V972 Volumetric Stage Atmosphere** aktivieren. Profil und Stärke wählen.

Ohne echten, zur Wiedergabe passenden V318-Trackabschnitt mit ausreichender Konfidenz wird die Atmosphäre nicht angezeigt. Manuelle Timeline-Cues, eigene Bühne und das Low-Performance-Gate behalten Vorrang. Eine Demo ist kein verifizierter Live-Test.

## Prüfungen

- `npm run test:v972` – 19 Testgruppen, 10.000 simulierte Bühnenzustände und visuelle Sicherheits-Verträge.
- `npm run test:v972:types` – isolierte TypeScript-Kernlogik.
- `npm run check:syntax && npm run check:architecture`
- **Vor Freigabe:** `npm run typecheck` und `npm run build` in einer installierten Node-24-Umgebung sowie GitHub-Linux/Windows-Prüfungen.
- Raspberry Pi, Alexa, Govee und reale WebGL-FPS müssen bei vorhandener Hardware noch ausdrücklich getestet werden.

Hinweis: Das bereits existierende V965-Produktionsskript führt nun auch V972-Regressionen aus, bevor der geerbte vollständige Build beginnt. Das bestehende, versionsunabhängige ZIP-Importverfahren schützt weiterhin `.github`-Dateien.
