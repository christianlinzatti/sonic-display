# V592 – Live Concert Stage Quality Validation 4.0

## Was neu ist

V591 prüfte eine unabhängige Multi-GLB-Demobühne. V592 instrumentiert erstmals die **tatsächliche Sonic-Display-Startseite und den unveränderten `VisualizerStage`-Produktionspfad**: GLB-Performer, deren sichtbare Skelett-Hüllkörper, aktuelle automatische Kamera, vorhandenes Lyrics-Signal, reale Bühnenbeleuchtung und echtes browserseitiges Rendering werden gemeinsam aufgenommen.

- `LiveStageCanvasProbeV592.tsx` misst im echten Three.js-/R3F-Bühnen-Canvas maximal etwa 2,5-mal pro Sekunde, **nur** bei lokal explizit gesetztem `?benchmarkV592=1`. Echte GLB-Gruppen sind über `userData.sonicV592GlbActor` eindeutig; ein prozeduraler Tänzer zählt nicht als GLB.
- `LiveStageDomProbeV592.tsx` veröffentlicht ausschließlich im lokalen Testmodus den read-only Zustand `window.__sonicV592.state()`. Er prüft Track-ID, laufende Wiedergabe, WebGL, sichtbare GLB-Performer und vorhandene Lyrics. Er verändert keine Einstellungen, Songpositionen oder Choreografien.
- Der CDP-Runner erstellt mehrere **tatsächliche** Browser-Screenshots bei fortschreitender Songposition, vergleicht Bilder und misst echte rAF-Frameintervalle sowie Draw Calls, Dreieckszahl und mögliche GLB-/Lyrics-Framingprobleme.
- Ein erfolgreicher Lauf liefert `report.json`, `report.html` und `live-*.png` im Ordner `artifacts/v592/live/`. `measured-needs-human-review` bedeutet **gemessen, nicht visuell freigegeben**.

## Lokaler Test mit einer angemeldeten Chromium-Sitzung

1. Starte Sonic Display wie gewohnt: `npm install` und `npm run dev -- --hostname 127.0.0.1`.
2. Starte eine **separate Chromium-Testinstanz** mit lokalem Remote-Debugging-Port und einem eigenen Profil. Windows-PowerShell, ggf. den Pfad zu Chrome anpassen:
   ```powershell
   & "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --remote-debugging-address=127.0.0.1 --user-data-dir="$env:TEMP\sonic-v592-chrome" http://127.0.0.1:3000
   ```
3. Verbinde Spotify in diesem Browser, spiele ein Lied **mit Lyrics** und wähle die **Avatar-Ansicht mit mindestens einem echten GLB-Modell**. Lasse das Browserfenster sichtbar.
4. Starte im Projektverzeichnis (zweite Shell):
   ```powershell
   npm run benchmark:v592:live -- --debug-port=9222 --seconds=15 --min-glb=1 --width=1280 --height=800
   ```
   Für zwei GLB-Tänzer `--min-glb=2` setzen. Die Authentifizierung wird weder exportiert noch vom Benchmark verändert.
5. Öffne anschließend `artifacts/v592/live/report.html` und prüfe Lippenbewegungen, Footwork, Kameraführung, Lyrics-Kontrast/-Lesbarkeit, Gobo/LED, Duette und Bildkomposition **selbst**. Die Metriken erlauben keine automatische ästhetische Freigabe.

Optional kann ein neues, isoliertes Chromium ohne Debug-Port gestartet werden, z. B. `npm run benchmark:v592:live -- --headed`; ohne Spotify-Sitzung ist das Ergebnis absichtlich `blocked`.

## Sicherheits- und Qualitätsregeln

- Nur lokale Loopback-HTTP(S)-Seiten sind zulässig. Eine explizite Opt-in-URL aktiviert die Messung; auf fremden Hosts wird kein globaler Mess-Endpunkt freigegeben.
- Der Browser-Runner verwendet eine isolierte temporäre Profildatei, sofern kein explizites lokales Debug-Port-Fenster verbunden wird. Er liest oder speichert keine OAuth-Tokens und ruft keine Spotify-Aktionen auf.
- Ein fehlender Track, Pausenzustand, WebGL-Verlust, fehlende echte GLB-Meshes, fehlende Lyrics oder ausbleibender Songfortschritt blockieren die Erfolgsdarstellung. Kein Screenshot/HTML bei `blocked`.
- Die GLB-Bounds sind Konservativ-Heuristiken: überragende Knochen, verdeckte Körper, Shader und DOM-Lyrics außerhalb der Bühne erfordern weiterhin menschliches Urteil. rAF ist weder GPU-Zeit noch ein Pi-Thermik-Messwert.
- Das Livebild ist zeitabhängig. Anders als V590/V591 werden keine festen Pose-Seek-Cues erzwungen, da der Spotify-Player und manuelle Showregie unberührt bleiben müssen.
- Ein echter Browserlauf und der vollständige Next.js-Build benötigen lokal installierte Dependencies und eine angemeldete Spotify-Sitzung. Offline-Regressionen ersetzen diese nicht.

## Testbefehle

```bash
npm run test:v592
npm run test:v592:types
npm run test:smoke:v592
npm run verify:v592
npm run check:syntax
```
