# Sonic Display V517 – Release-Verifikation (24.10.2026)

## Erfolgreich ausgeführt

- `npm run test:v517`: **38.000** deterministische 2–4er-Deutschrap-/Duett-/Hook-/Feature-Simulationen, inklusive manuell verifizierter Sängerrollen, zugewiesener Feature-Handoffs, kollisionsabhängiger Gestendämpfung, Tier-Sperren, Pause und Reduced Motion.
- **67 historische Versionsregressionen V451–V517** bestanden. Einzellogs: `V517-REGRESSIONS-451-471.txt`, `V517-REGRESSIONS-472-492.txt`, `V517-REGRESSIONS-493-517.txt`.
- **26 isolierte TypeScript-Kernprüfungen V492–V517** bestanden; siehe `V517-TYPECHECKS.txt`.
- `npm run test:gltf-hook-split` und `npm run test:three-avatar-split`: bestanden.
- `npm run check:syntax`: 721 TS/TSX-Quelldateien, bestanden.
- `npm run check:architecture`: 201 dokumentierte Pfadreferenzen / zehn Abschnitte, bestanden.
- `package.json`: Version `0.1.0-v517`, `test:v517` und `test:v517:types` am Beginn des bisherigen Preflight-Tests.
- Release-ZIP: ursprüngliche **1.881 Dateien des tatsächlich veröffentlichten V516-ZIPs** vollständig erhalten (Unveränderte Dateien byte-identisch; beabsichtigt geänderte Dateien siehe V517-Code/Dokumentation), ZIP-CRC geprüft.

## Schutzmaßnahmen / Grenzen

Die V517-Regie schreibt **keine** GLB-Clip-Keyframes oder Bones, keine Bühnenpositions-/Fuß-/Hand-IK-/Lip-Sync-Daten; automatische Bühnenrotation nur für einen bereits gültigen rein visuellen V495-Lead. Kein zusätzlicher Render-Loop, keine neuen npm-Abhängigkeiten, keine Sprechererkennung oder behaupteten Reim-/Beat-Timestamps. Rollen einer anderen Song-ID sowie unvollständige oder abgelaufene Time-Cues aktivieren die V517-Erweiterung nicht. Ergebnisse sind reine Simulationen; sie beweisen keine reale WebGL-Showqualität.

## Ausdrücklich nicht ausgeführt

Ein vollständiges `npm run build` / `next build` und visuelle GLB-/Raspberry-Pi-Tests sind in dieser Umgebung ohne installierte `next`/`react`/`three`-Projektabhängigkeiten nicht möglich. Für den lokalen Build auf Windows `npm install && npm run build` ausführen.
