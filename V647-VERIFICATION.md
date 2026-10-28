# V647 – Verifikation am 27.10.2026

## Bestätigte Tests

| Test | Ergebnis |
|---|---|
| `npm run test:v647` | PASS – 59 Gruppen, 12.000 synthetische V600-gebundene Songpositionen |
| `npm run test:v647:types` | PASS – Kern-TypeScript-Prüfung |
| `npm run test:smoke:v647` | PASS – fokussierte Smoke-Testkette inkl. V646/V635/V622/V616, Syntax und Architektur |
| `npm run verify:v647` | PASS – erweiterte Tests bis V646 plus alte Bühnen-, Beleuchtungs- und Performance-Tests |
| `npm run test:v558`, `test:v568`, `test:v571`, `test:v580` | PASS – ältere Build-Vertragsprüfungen |
| `npm run test:v591`, `test:v593` | PASS – Qualitätsregressionen |
| `npm run check:syntax` | PASS – 876 TypeScript-/TSX-Dateien |
| `npm run check:architecture` | PASS – 526 aktuelle Referenzen, 10 Abschnitte |

Die zwischenzeitlich unterbrochene **alte rekursive** `test:smoke:v646`-Kette war durch einen V616-Test über die vorherige `prebuild`-Kette gestoppt. Das neue V647-Paket verwendet wieder den nach V571 vorgesehenen fokussierten `prebuild` (`test:smoke:v647`). Der vollständige neue V647-Smoke-Lauf sowie `test:v616` bestehen anschließend; die alte historische Kette wurde **nicht** insgesamt erneut ausgeführt. Umfangreiche historische Tests bleiben über `verify:v647` und `build:preflight` getrennt abrufbar.

## Einschränkungen

- Keine `node_modules` im bereitgestellten Projekt. `next` kann hier nicht aufgelöst werden; daher **kein erfolgreicher kompletter Next.js-Produktionsbuild**, kein projektweiter `tsc --noEmit` und kein gestarteter Browserlauf.
- **Keine echten GLB-/WebGL-GPU- oder Raspberry-Pi-Messungen.** Der neue Shader erzeugt keine zusätzlichen Draw Calls/Assets, kann aber mehr Fragment-GPU-Arbeit verursachen als V635.
- Die sechs Kulissen sind abstrahierte Shader-Architekturen auf der bisherigen LED-Wand, keine neuen 3D-Stage-Modelle oder auswählbaren Stage-Presets. Bestehende manuelle Stage-Theme-Auswahl bleibt bestehen.
- Optische Qualität und Nutzbarkeit auf einem 10-Zoll-Display, echte Lyrics-Überlagerung, Shader-Kompilierung im Zielbrowser und FPS bei 1/2/4 GLB-Avataren bleiben gesondert zu verifizieren.

## Windows-Befehle

```powershell
npm install
npm run test:smoke:v647
npm run verify:v647
npx tsc --noEmit
npm run build
```

Danach die vorhandene V641-QA-Vollsong-Aufzeichnung nutzen und reale GLB-Bühnen sowie Lyrics prüfen.
