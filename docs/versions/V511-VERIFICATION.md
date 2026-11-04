# Sonic Display V511 – Verifikation (24.10.2026)

## Bestätigte Tests

- `npm run test:v511`: **PASS** – 32.000 deterministische mehrteilige Bühnenmessungen; echte Abdeckungszustände, Veraltung, Pause, fehlende Knochen und Pi-Profil-Abtastraten.
- `npm run test:v511:types`: **PASS** – isolierter TypeScript-Kern.
- Versionsregressionen **V451–V511 (61 einzelne Tests): PASS**. Jeweils `npm run test:vNNN --silent`, im V511-Projekt ausgeführt.
- Isolierte TypeScript-Kernprüfungen **V492–V511 (20 einzelne Tests): PASS**.
- `npm run test:gltf-hook-split`: **PASS** (8 GLB-Hook-Module, 1 Mixer).
- `npm run test:three-avatar-split`: **PASS** (V492-Bühnen-Modulaufteilung).
- `npm run check:syntax`: **PASS**, 710 TypeScript/TSX-Quelltexte inklusive Import-Bindings.
- `npm run check:architecture`: **PASS**, 181 Quellverweise / 10 Architektursektionen.
- Release-ZIP: Vollständigkeit und CRC werden beim Verpacken geprüft.

## Grenzen

Die 3D-Qualitätsanzeige basiert auf V508-Knochenkapseln. Sie ist **keine** exakte Meshauswertung; weder einzelne Finger-/Stoffkollisionen noch GPU-Temperatur oder native Pi-Leistungsdaten sind im Browser verfügbar. Fehlende oder veraltete GLB-Knochen erzeugen explizite *nicht geprüft*-Zustände. V511 drosselt auf aktiven Pi-Profilen nur die optionale Knochenanalyse für mindestens drei Avatare; GLB-Mixer, Fuß-IK, Lip-Sync und manuell gesteuerte Bühnenbereiche bleiben unverändert.

**Kein vollständiger Next.js-Produktionsbuild**: `scripts/build-preflight.cjs` meldet nur 1/17 vorhandene direkte Pakete und kein `package-lock.json` in dieser Laufzeit. Ohne React-/Next-/Three.js-Abhängigkeiten kann `npm run build` hier nicht sinnvoll abgeschlossen werden. Daher wurden keine vollständigen TypeScript-App-, Webpack- oder interaktiven WebGL-Integrationstests behauptet. Lokal `npm install` und anschließend `npm run build`; ergänzend reale Duo-/Vierer-GLB-Tests auf dem Ziel-Raspberry-Pi durchführen.
