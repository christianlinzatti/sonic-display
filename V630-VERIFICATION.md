# V630 – Verifikation (27.10.2026)

## Ausgeführt und bestanden

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v630` | PASS – 39 Regressionstestgruppen, 10.000 deterministische Keyframe-Übergangsszenarien |
| `npm run test:v630:types` | PASS – isolierte TypeScript-Kernprüfung |
| `npm run test:smoke:v630` | PASS – V630 + gesamte V629-Kette bis V616, Syntax und Architektur |
| `npm run verify:v630` | PASS – Smoke plus V614/V565/V537/V536/V494/V596/V618/V615 |
| `npm run check:syntax` | PASS – 854 TS-/TSX-Dateien |
| `npm run check:architecture` | PASS – 511 dokumentierte Source-Referenzen in zehn Architekturkapiteln |
| `npx tsc --noEmit` | Nicht ausgeführt: vollständige Projektabhängigkeiten (node_modules) fehlen in der Release-Umgebung |
| `npm run build` | Nicht ausgeführt: vollständige Next.js-Abhängigkeiten fehlen |
| Visuelle Browserabnahme mit echten GLB-Skeletons | Offen, daher keine bestätigte optische Verbesserung behauptet |

## Sicherheits- und Regressionsnachweise

- Der neue V630-Helper liest reale Positions-/Quaternionkurven der bereits geladenen GLB-Animationen, niemals erfundene Clips oder Sängerrollen.
- Unvollständige Rigs, fehlende Bewegungszeiten und ungültige Keyframe-Daten führen zum unveränderten V614-Fade zurück.
- Die neue Stufe ist exakt nach V537/V565/V614 und vor dem bestehenden Mixer-Crossfade eingebunden. V536 und V530 wählen weiter eigenständig geeignete Clips und V536 berücksichtigt kürzlich verwendete Clips.
- Bei gesetzten Füßen wird nur die Überblendung vorsichtig verlängert; Fuß-IK-Anker, Pose-Matching-Seek, Motion-Speed und manuelle Motion-Timelines werden weder gesetzt noch zurückgesetzt.
- Bei hohen BPM bzw. kurzen Clips begrenzen die existierenden musikalischen und Clip-Dauer-Schranken die Erweiterung. Ein vorbestehender längerer V614-Fade wird nie verkürzt.
- Nur automatische, aktive Wiedergabe bei Balanced-/High-Tier ohne Reduced Motion und ohne manuelle Clippriorität lässt eine Änderung zu.
- Keine weiteren Renderloops, GLB-Assets, AnimationMixer, Shader, Lichteffekte oder Netzwerkaufrufe.

## Offene reale Qualitätssicherung

Die synthetischen Tests belegen nur die **algorithmischen Übergangsgrenzen**, nicht Natürlichkeit oder Optik auf realen GLB-Skeletons. Empfohlen: jeweils mehrere Minuten Deutschrap/Hardstyle/Hardtekk mit 2–4 realen Avataren, Fuß-IK an/aus, automatischer und manuell ausgewählter Clipwahl, Seek, Pause und Low-Tier im Browser beobachten. Fußschlupf, Pose-Pops und Loop-Seams per Video und V627-Inspector vergleichen.

## Lokal

```powershell
npm install
npm run test:smoke:v630
npm run verify:v630
npx tsc --noEmit
npm run build
```
