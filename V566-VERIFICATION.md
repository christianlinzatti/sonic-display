# V566 · Verifikation

## Erfolgreich ausgeführt (in dieser Arbeitsumgebung)

- `npm run verify:v566`: **PASS** – 42 neue V566-Tests, gezielte V565–V554-Regressionen, Syntax-/Architekturprüfungen und gezielte TypeScript-Typprüfungen.
- `npm run test:v383`: PASS – Advanced Facial Rig.
- `npm run test:v424`: PASS – Avatar Facial Calibration.
- `npm run test:v542`: PASS – 2.880 Licht-/Performer-/Lyrics-Konstellationen. Ein historischer Test erwartete noch die veraltete `dual?2:1`-Zeichenfolge; seine statische Prüfung wurde an die bereits vorhandene Multi-Avatar-/Formation-Regel angepasst, **ohne Änderung der Live-Logik**.
- `npm run test:v550`: PASS – 9.720 Kamerarollen-/Timing-Konstellationen.
- `npm run test:v551`: PASS – 12.150 Bühnenlicht-Konstellationen.
- `npm run test:v552`: PASS – 43.200 Raspberry-Pi-Renderbudget-Frames.
- `npm run test:v553`: PASS – 9 Benchmark-Fixtures.
- `npm run check:syntax`: PASS – 788 TS/TSX-Dateien.
- `npm run check:architecture`: PASS – Referenzen und Dokumentation.

## Grenzen

Es ist eine gezielte, teils statische Prüfung; ein vollständiger `next build` wurde mangels installierter Projektabhängigkeiten nicht erfolgreich ausgeführt. WebGL-/GLB-Sichtprüfungen und reale Raspberry-Pi-Messungen sind weiterhin erforderlich. Die Kameraausrichtung zum Avatar-Root ist kein Nachweis für ein sichtbares Gesicht, erfassten Blickkontakt oder unverdeckte Lippen.
