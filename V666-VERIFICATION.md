# V666 – Verification (2026-10-28)

## Pass – tatsächlich ausgeführt

- `npm run test:v666`: PASS, 48 Testgruppen / 15.000 simulierte Frames, alle fünf Stile, Reset, manuelle Prioritäten, Grounding, Album-/Songwechsel und blockierter Browser-Speicher.
- `npm run test:v666:types`: PASS, isolierter TypeScript-Modultest.
- `npm run test:v536` und `npm run test:v536:types`: PASS, Rock-/Pop-Clippräferenz und vorhandene V536-Auswahl.
- `npm run test:genre-dance-v210`: PASS, 23 Tests.
- `npm run test:v665` / `npm run test:v665:types`: PASS, Fußkontakt-/Hocke-Regressionssuite.
- `npm run test:v664` / `npm run test:v664:types`: PASS, 17 Duettgruppen.
- `npm run test:v663` / `npm run test:v663:types`: PASS, 27 Ausdrucksgruppen.
- `npm run test:smoke:v666`: PASS, Exit Code 0. Rekursive Release-Kette bis V616 einschließlich Syntax- und Architekturkontrolle.
- `npm run check:syntax`: PASS, 918 TS-/TSX-Quellcodedateien.
- `npm run check:architecture`: PASS, 576 Quellcodeverweise.
- `npm run test:module-case`: PASS, 1546 Dateien, keine groß-/kleinschreibungsabhängigen TS/TSX-Kollisionen.
- `npm run check:test-types`: PASS, 8 Test-Umgebungsdeklarationen ausgeschlossen.
- `npm run test:env:spotify-build`: PASS, Spotify-Umgebungs- und Sessionkontrolle ohne Secrets.

## Zusätzliche Fehlerkorrekturen

- V665-Einstellungsdialog verwendete `setGroundingStatus` statt `setGroundingStatus665`. Der Schreibfehler ist korrigiert (zuvor nachweisbar TS2304 im Gesamtcheck).
- Ohne verlässlichen Fußkontakt wird der V666-Hüftschwung nicht mehr verstärkt. Hierfür ergänzte Regression.

## Offen – keine Freigabe als Produktionsbuild

- `npm run typecheck`: ausgeführt, Exit Code 2. In dieser Arbeitsumgebung fehlen `node_modules` einschließlich Next.js, React und Node-Typdefinitionen; das Ergebnis ist **kein bestandener Gesamt-Typecheck**. Das bekannte V665-TS2304-Problem ist korrigiert.
- `npm run build` / `next build`: nicht ausführbar ohne installierte Projektabhängigkeiten, daher **nicht bestätigt**.
- Registry-Test (`npm ping`): `EAI_AGAIN` (DNS / npm-Registry nicht erreichbar). `npm install` daher nicht zuverlässig ausführbar.
- Physische Browser-/GPU-Tests mit echten importierten GLB-Danceclips auf Windows, Linux und Raspberry Pi: nicht durchgeführt.

## Befehle für finale Freigabe auf einem Rechner mit Dependencies

`npm install` (Projekt enthält derzeit keine reproduzierbare Lockdatei), danach `npm run typecheck`, `npm run build`, Browser-GLB-Performance-Tests. Die Release-Gate-Prebuild-Kette läuft bei `npm run build` mit.

## Auslieferung

Vollständiges V666-Projekt und V665→V666-Patch werden als ZIPs erstellt, CRC und exakte Patch-Rekonstruktion werden beim Paketbau geprüft. Lokale TS-Build-Caches und sonstige Laufzeitartefakte sind ausgeschlossen.
