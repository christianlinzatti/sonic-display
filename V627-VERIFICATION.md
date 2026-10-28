# V627 – Verifikation (27.10.2026)

## Automatische Prüfungen in dieser Umgebung

| Test | Ergebnis |
| --- | --- |
| `npm run test:v627` | PASS: 25 Testgruppen plus 3.000 synthetische Qualitätsprüfszenarien |
| `npm run test:v627:types` | PASS: TypeScript-Kernprüfung |
| `npm run test:smoke:v627` | PASS: V627/V626–V616, V610, V600, Syntax und Architektur |
| `npm run verify:v627` | PASS: obige Smoke-Tests plus V593, V592, V595, V522, V543, V553 und V518 |
| Source-Syntax | PASS: 851 TS/TSX-Dateien |
| Architektur | PASS: 506 aufgelöste Code-/Dokumentationsreferenzen |
| Vollständiges `npx tsc --noEmit` | Nicht ausgeführt: Projekt-`node_modules` fehlen |
| Next.js-Produktionsbuild | Nicht ausgeführt: Projekt-`node_modules` fehlen |
| Reale WebGL-/GLB-/Spotify-Sichtabnahme | Nicht durchführbar ohne authentifizierten lokalen Browser und Original-Showaufnahmen |

## Geprüfte Schutzregeln

- Nur V518-/V522-Originalmessdaten sind Basis für Browserleistung; V543-Checkboxen bleiben explizit manuell.
- Drei passende Runs je V522-Szene, keine Mischung unterschiedlicher Renderauflösungen, Ziel-FPS oder Profile.
- Instabile/mangelhafte und **neuere ungültige** Runs werden nicht durch ältere erfolgreiche Ergebnisse versteckt.
- P99-Lücken und einzelne wiederholt schlechte Framezeiten werden sichtbar.
- Optionaler V593-Import lehnt beschädigte, synthetisch gekennzeichnete, unvollständige und zu große oder widersprüchliche Hinweislisten ab; importierte Befunde erhalten ein eigenes Evidenzlabel.
- Ohne Bildbericht kein automatischer Kamera-/Lyrics-Befund, ohne Sichtprüfung kein automatisch bestandener Lip-Sync- oder Tanztest.
- Export bleibt begrenzt, rein lesend und ohne automatische Spotify-, Kamera-, GLB-, Licht- oder LOD-Änderung.
- Ergebnisse beziehen sich auf **definierte Benchmark-Szenen**, nicht eine nachgewiesene, durchgängig geprüfte Aufnahme jedes gesamten Songs.

## Auf Windows nach ZIP-Entpacken

```powershell
npm install
npm run test:smoke:v627
npm run verify:v627
npx tsc --noEmit
npm run build
```

Danach mit echten GLB-Avataren die drei Benchmark-Szenen und die manuelle Audio-/Bildsichtung ausführen. Optional eine lokale V592-Live-Aufnahme durchführen und die V593-Hinweise im V627-Inspector importieren.
