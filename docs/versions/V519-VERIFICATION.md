# Sonic Display V519 – Release-Verifikation (24.10.2026)

## Bestanden

- `npm run test:v519`: **40.000** deterministische, synthetische Mess-Snapshots, Hinweise für hohe/leichte/unauffällige Last, Eingabevalidierung, 30/45/60-FPS-Ziele, Einzeländerungs- und Mehrfachänderungs-Analyse. Keine automatische Änderung von Grafik, Licht, Lyrics, Lip-Sync oder Motion-Clips.
- **69 Versionstests V451–V519 bestanden**, siehe `V519-REGRESSIONS.txt`.
- **28 isolierte TypeScript-Kernprüfungen V492–V519 bestanden**, siehe `V519-TYPECHECKS.txt`.
- `npm run test:gltf-hook-split`, `npm run test:three-avatar-split`: bestanden.
- `npm run check:syntax`: **726** TS-/TSX-Dateien; bestanden.
- `npm run check:architecture`: **207** aktuelle Pfadreferenzen und zehn Architekturabschnitte; bestanden.
- `package.json` Version `0.1.0-v519`; V519-Regressions- und Typprüfung an erster Stelle von `build:preflight`.

## Grenzen und Sicherheit

V519 nutzt V518-Captures aus mindestens sechs zusammenhängenden, gültigen Ein-Sekunden-Fenstern. Es erfindet weder FPS-Gewinne noch Pi-Telemetrie. Die A/B-Analyse unterscheidet einzelne von mehreren geänderten Einstellungen, kann jedoch Songpassage, Gerätetemperatur, GPU-Last und Hintergrundprozesse nicht automatisch kontrollieren; beobachtete Unterschiede sind kein Kausalitätsbeweis. Die Ermittlung des Engpasses ist eine transparente Heuristik, **keine** gemessene GPU-Zeit.

Es wurden keine neuen `requestAnimationFrame`-Schleifen, Browser-Timer oder Renderer eingeführt. Das neue Studio ruft keinerlei Einstellungs-Setter auf und verändert weder importierte GLB-Choreografien, automatische Rap-Gesten, Lip-Sync, manuelle Künstlerrollen, Lyrics noch die Fuß-IK. Die vorhandenen UI-Einstellungen bleiben beim Nutzer.

## Nicht ausführbar in dieser Laufzeit

Ein vollständiger Next.js-Produktionsbuild (`npm run build`, mit App-Typecheck), eine visuelle GLB-Vorschau und ein Raspberry-Pi-Hardware-Benchmark sind nicht validiert: Im Arbeitsverzeichnis sind die externen Next.js-/React-/Three-Abhängigkeiten (`node_modules`) nicht installiert. Auf dem Zielgerät `npm install && npm run build` und konkrete, zeitlich vergleichbare A/B-Messungen durchführen.

Die Integritäts- und Vollständigkeitsprüfung des Release-ZIPs umfasst alle Dateien der tatsächlich veröffentlichten V518 (1.900 Basisdateien), die neuen V519-Module und die Releaseberichte. CRC und Manifest werden beim Packen geprüft.
