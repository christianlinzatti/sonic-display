# V648 – Verification report (27.10.2026)

## Änderungen

- Quellstand aus dem vollständig geprüften V647-Release entpackt; `package.json` trägt `0.1.0-v648`.
- Drei optionale Lesbarkeitsstufen im bestehenden Touchmodus, lokale Speicherung und sichtbar erreichbare 52×52-CSS-Pixel-Wecktaste.
- Kompaktes Querformat bei typischen 10-Zoll-Größen, Hochformat-Unterstützung, CSS-Safe-Area für Touch-Bedienung und größere Lyrics im DOM bzw. optional in der WebGL-Lyrics-Ausgabe.
- Standardanzeige ohne Touchmodus, manuelle Lyrics-Parameter, Sängerrollen, Kameras, Musik- und Spotify-Zeitstempel unverändert; Nutzer-Präferenzen werden nur für die neue Lesbarkeitsauswahl erweitert.
- V646-Panel liegt im Touchmodus rechts, sodass es den unten links eingeblendeten Albumtitel der Bühne nicht unmittelbar überlagert.

## Tatsächlich ausgeführte Prüfungen

| Test | Resultat |
|---|---|
| `npm run test:v648` | PASS: 93 fokussierte Gruppen, 12.000 synthetische Viewportzustände |
| `npm run test:v648:types` | PASS: isolierter TypeScript-Kern |
| `npm run test:smoke:v648` | PASS: vollständige gezielte Smoke-Kette V648/V647/V646/V635/V622/V616 + Syntax/Architektur |
| `npm run verify:v648` | PASS: neue + historische V647/V646/V641/V640/V635/V388/V389/V403-Tests |
| `npm run test:v558` | PASS |
| `npm run test:v568` | PASS |
| `npm run test:v571` | PASS |
| `npm run test:v580` | PASS |
| `npm run check:syntax` | PASS: 877 TS-/TSX-Dateien |
| `npm run check:architecture` | PASS |
| `npm run build` | Nicht abgeschlossen – fehlende `node_modules`, `next: not found` (Exit 127) |

Der Selenium-/Chromium-basierte Screenshot der statischen Layout-Mockup-Seite lief in der Umgebung in ein Zeitlimit und ist **kein** realer Nachweis der 10-Zoll-Darstellung. Ein tatsächlicher Next.js-Browserlauf ist hier mangels Projektabhängigkeiten nicht möglich. Es wurde weder eine Pixel-/Screenshot-Freigabe noch eine WebGL-, Raspberry-Pi-, FPS- oder Touchhardware-Messung behauptet. `npx tsc --noEmit` und der Produktionsbuild müssen in der installierten Windows-Umgebung geprüft werden.

## Windows-Prüfschritte

```powershell
npm install
npm run test:v648
npm run test:smoke:v648
npm run verify:v648
npx tsc --noEmit
npm run build
npm run dev
```

Danach mit F12 Responsive Preview die Auflösungen **1024×600**, **1280×800**, **1366×768** sowie **800×1280** prüfen: Lyrics-Länge, sichtbare Avatar-Bühne, Touchmodus-Aktivierung, `Aa`-Lesbarkeit, ausblendbare Leiste, Wecktaste, Regie-Zeitplan, Einstellungen und Fullscreen. Anschließend V641 mit echten GLB-Avataren und 1/2/4 Performern messen.
