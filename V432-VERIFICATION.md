# V432 – Verification / bekannte Grenzen

Stand: 21.10.2026. Basis: vollständiges V431-Projekt-ZIP.

## Bestätigt in dieser Umgebung

- `npm run test:v432` – PASS: normalisierte Kamera-Posen/Keyframes, 128-Keyframe-/Track-Limits, eindeutige Zeilen-/Song-Zuordnung, Smoothstep-Interpolation, sichere Kamerabegrenzung, Lyrics-Dämpfung, V429-Inaktivität, lokale UI-Integration und kein Spotify-Seeking.
- `npm run test:v431`, `npm run test:v430`, `npm run test:v429`, `npm run test:v426`, `npm run test:v425`, `npm run test:v424`, `npm run test:v423` – PASS, jeweils separat geprüft.
- `tsc -p tests/tsconfig.v432-core.json` – PASS (strict, noEmit, V432/V431/V430/V429-Kernlogik ohne React-/Next-Abhängigkeiten).
- `npm run check:syntax` – PASS (586 TS/TSX-Dateien).
- `npm run test:imports` – PASS (927 Projektdateien, 1999 Importe).
- `npm run test:module-case` – PASS (927 Dateien, keine Case-Konflikte).
- ZIP-Integrität und zentrale Projekt-/Release-Dateien – separat beim Verpacken geprüft.

## Nicht bestätigt

- `npm run build` begann die durch `prebuild` gestartete lange `build:preflight`-Historien-Suite; diese kam hier nicht bis zum Ende. Ein Next.js-Produktions-Build wurde dadurch nicht ausgeführt.
- `node_modules`/Next.js/React/React Three Fiber sind nicht installiert. Die vollständige React-/Next.js-Typprüfung und tatsächliche visuelle Browser-/GPU-/GLB-Interaktion wurden deshalb **nicht** getestet.
- Nicht alle historischen Offline-Testskripte wurden bis zum Ende durchlaufen. Die Aussage „alle Tests bestanden“ wäre somit unzutreffend.

## Empfohlene lokale Abnahme auf Windows

```powershell
npm install
npm run test:v432
npm run test:v431
npm run test:v430
npm run test:v429
npx tsc -p tests/tsconfig.v432-core.json
npm run check:syntax
npm run test:imports
npm run test:module-case
npx tsc --noEmit
npm run build
```

In der Browser-Vorschau zusätzlich kontrollieren: zwei reale GLB-Avatare mit V416 zugeordneten Rap-Lyrics; Keyframe an Anfang/Mitte/Ende; sanfter Übergang; Songwechsel; deaktivierte Automatik; V430-Ruhemodus; Reduzierte Bewegung; geschützte Lyrics; manuelle Kamerasteuerung; andere aktive Kameraregien. **Die 3D-Editor-Vorschau ist eine separate WebGL-Ansicht; sie manipuliert den Live-Renderer nicht.**
