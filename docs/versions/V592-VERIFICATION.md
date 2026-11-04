# V592 – Prüfprotokoll (26.10.2026)

## Implementiert

- Opt-in `LiveStageDomProbeV592` in der echten Spotify-`VisualizerStage`, einschließlich `window.__sonicV592.state()` nur auf Loopback mit `?benchmarkV592=1`.
- `LiveStageCanvasProbeV592` innerhalb des **vorhandenen** `ThreeAvatar`-R3F-Canvas: echte GLB-Gruppen, Mesh-Zahl, projizierte Bounds, Kamera-Position, WebGL-Rendering-Metriken und Kontextverlust. GLB-Wurzeln über reines `userData`-Kennzeichen identifiziert.
- Loopback-Chromium-CDP-Runner: mehrere echte Browser-PNGs während echter Wiedergabe, rAF-Frameintervalle, Track-ID-/Fortschrittsprüfungen, Screenshot-Pixeldifferenz, Warnhinweise und HTML-Review.
- Fehlender Spotify-Track, fehlende Lyrics, Pause, fehlendes GLB/WebGL oder ungenügender Songfortschritt => `blocked`, niemals synthetische Messdaten.
- V590 und V591 unverändert weiterhin separat ausführbar.

## Erfolgreich ausgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v592` | **PASS** – 10 Gruppen zu Sicherheit, Live-Integration, GLB-Gating, Bericht und CLI-Blockierung |
| `npm run test:v592:types` | **PASS** – isolierter TypeScript-Kern (keine vollständige TSX-/Next-Typprüfung) |
| `npm run test:v591` | **PASS** – 10 Gruppen, 15.000 Szenarien |
| `npm run test:v590` | **PASS** – 14 Gruppen, 15.000 Framing-Proben |
| `npm run test:v589` | **PASS** – 25 Gruppen, 10.000 Proben |
| `npm run test:v588` | **PASS** – 16 Gruppen, 20.000 Proben |
| `npm run test:v580` | **PASS** – 79 Integrationsprüfungen, 12.000 Proben |
| `npm run test:v572` | **PASS** – 69 Regressionen, 16.000 Wortproben |
| `npm run test:smoke:v592` | **PASS** |
| `npm run check:syntax` | **PASS** – 820 TS/TSX-Dateien, Syntax und auflösbare Importbindungen |
| `npm run check:architecture` | **PASS** – 405 Code-Referenzen, Architektur-Dokumentationsstand V592 |

`npm run verify:v592` wurde als kombinierter Lauf gestartet, aber vom Ausführungslimit abgebrochen. Die verbleibenden für die V592-Funktion relevanten Regressionen wurden einzeln erfolgreich ausgeführt. Die vollständige historische Testkette ist hier **nicht** als abgeschlossen zu betrachten.

## Offen / keine falschen Behauptungen

- **Kein echter CDP-/Spotify-/GLB-Browserdurchlauf**: authentifizierte Spotify-Sitzung und echte GLB-Daten mit laufender Show fehlen in dieser Ausführungsumgebung.
- **Kein vollständiger Next.js-Produktionsbuild**: lokale `node_modules`/Next.js-Abhängigkeiten fehlen.
- **Kein tatsächlicher Raspberry-Pi-30-FPS-/Thermik-Test** und keine manuelle künstlerische Abnahme.
- `test:v592:types` prüft nur die neue isolierte reine TypeScript-Logik und mitreferenzierte Typen, nicht die vollständige React-/Three.js-Anwendung.
- Die neue Messung ist bewusst beobachtend: kein erzwungener Track-Seek und keine Änderungen an gespeicherten manuellen Kameras, GLB-Clips, Sängerrollen, Spotify-Wiedergabe oder Fuß-IK.

**Nächster lokaler Schritt:** `npm install`, `npm run dev -- --hostname 127.0.0.1`, separat angemeldeten lokalen Chromium-Debugbrowser starten und `npm run benchmark:v592:live -- --debug-port=9222 --seconds=15` ausführen. Nur dann können tatsächliche PNGs, FPS-Messungen und ein Sichtprüfbericht produziert werden.
