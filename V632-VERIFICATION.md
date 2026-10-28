# V632 – Verifikation (27.10.2026)

| Test | Ergebnis |
|---|---|
| `npm run test:v632` | PASS – 41 Regressionstest-Gruppen, 8.000 simulierte Cast-Frames |
| `npm run test:v632:types` | PASS – reine TypeScript-V632-Policy und V631-Basis |
| `npm run test:smoke:v632` | PASS – V632 bis V616 sowie Syntax und Architektur |
| `npm run verify:v632` | PASS – zusätzliche V599, V607, V496, V547, V416, V385, V612, V597, V631 und V563 |
| `npm run check:syntax` | PASS – 856 TS-/TSX-Dateien |
| `npm run check:architecture` | PASS – 514 Source-Referenzen / 10 Abschnitte |
| Vollständiger `npx tsc --noEmit` | Nicht ausgeführt: benötigte Paketabhängigkeiten/node_modules fehlen hier |
| `npm run build` | Nicht ausgeführt: Next.js/node_modules fehlen hier |
| Echtes 2–4-GLB-Browser-/Audio-Sichtbild | Noch offen |

## Garantiegrenzen

- V632 übernimmt ausschließlich editorisch/timelinebasierte V385/V416/V496-Rollen; ohne passendes Song-ID/Zeitfenster bleiben die automatischen Mundziele unverändert. Ein nicht singender Slot erhält ein neutrales zusätzliches Jaw-/Wide-/Round-Ziel; der bereits vorhandene V374-Sängermaskenpfad bleibt aktiv.
- Kein automatisches Sprecher-Diarisieren und keine echten Phonem-/Silbenzeiten; Backing/Adlib nur mit expliziter V496-Zeitmarkierung.
- Kein neues 3D-Modell, Morphkanal, Canvas, Renderloop oder GPU-Shader. Importierte GLB-Mixeranimationen, B/P/M-Lippenverschluss, V420-Editor, V423-Audio, V562-Gesichtskalibrierung, Vorschau und manuelle Choreografie bleiben geschützt.
- Ein V631-Source-Assertion wurde um den V632-Zielwert erweitert. Seine tatsächliche V631-Rate-Policy bleibt unverändert und läuft weiterhin in derselben exponentiellen Glättung.

Windows-Probe: `npm install`, `npm run verify:v632`, `npx tsc --noEmit`, `npm run build`. Danach pro Song authentische Sängerzeiten und tatsächliche 2-, 3- und 4-Avatar-Mund- und Kameraqualität überprüfen.
