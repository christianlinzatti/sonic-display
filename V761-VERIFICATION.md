# V761 – Prüfbericht (30. Oktober 2026)

## Umsetzung

- Basierend auf Sonic Display V760; Version und Lockfile auf `0.1.0-v761` gesetzt.
- Pure `cinematicConcertDirectorV761.ts`-Planung, Live-Wiring V604→V761→V654 und dekorative 2D-Lyrics-Intensität.
- Typed UI preferences, opt-out settings in Dynamic Stage, data-v761 diagnostics, build preflight und Windows/Linux CI.
- Nur verifizierte Songsegmente; bei fehlenden/importierten unpassenden Daten keine V761-Aktivierung.

## Erfolgreiche Prüfungen

| Prüfung | Status |
| --- | --- |
| `npm run test:v761` | PASS: **77.264 Checks** inkl. 30.000 Playback-Cases mit manuellen Prioritäten |
| `npm run test:v761:types` | PASS: strenger isolierter TypeScript-Check |
| Versionstests `npm run test:v735` bis `npm run test:v760` | PASS: **26/26** separat |
| Ältere Regie-/Sicherheitsregressionen V494, V495, V502, V528, V571, V600, V604, V654, V655, V669–V671, V679, V681–V683, V685, V688–V689, V747–V751, V752 | PASS separat |
| `npm run check:syntax` | PASS: 1.073 TS/TSX-Dateien |
| `npm run check:architecture` | PASS: 765 referenzierte Komponenten |
| `npm run test:module-case` | PASS: 1.813 Dateien, keine Case-Kollisionen |
| `npm run check:lockfile:v752` | PASS: Versions-, Lockfile- und CI-Konsistenz |
| ZIP-Integrität | PASS: Archivtest mit `zipfile.testzip()` und Versions-/Dateikontrolle |

Ältere Tests V600/V604/V502 wurden **nur in ihren Quellcode-Verkabelungserwartungen** an V761 angepasst; ihre musikalischen und numerischen Invarianten bleiben unverändert. V760 prüft eine Mindestversion statt einer fest verdrahteten alten Versionskennung. Der zusätzliche isoliert getestete **V551-Test** hat schon eine überholte Annahme über die globale `build:preflight`-Kette; diese ältere Einzelprüfung ist kein grüner Nachweis.

## Nicht erfolgreich oder noch ausstehend

- `npm ci --offline --ignore-scripts`: **ENOTCACHED** für `zustand-5.0.16.tgz`. Die Installation wurde nur in einem **getrennten temporären Ordner** versucht. Im Projektarchiv liegt kein teilinstalliertes `node_modules`.
- `npm run check:dependencies`: **0/18 erforderliche npm-Pakete** installiert; FAIL wie vorgesehen.
- `npm run typecheck`: FAIL wegen fehlender React-, Next.js- und Node-Typen. Dies ist **kein bestandener produktiver TS-Check**.
- `npm run build`: V761-Vorprüfung inklusive V753 erfolgreich, danach bei `check:dependencies` blockiert. **Die tatsächliche Next.js-Kompilierung hat nicht begonnen**.
- Kein visueller Browser-/GLB-/GPU-Test. Änderungen an der wahrgenommenen Showqualität und an realen FPS sind noch nicht nachgewiesen.
- Die große rekursive `verify:v761:static`-Kette wurde **nicht** vollständig als ein einziger Lauf bestätigt; relevante Checks wurden getrennt geprüft.

## Lokale Freigabe auf Windows/Linux

```powershell
npm ci
npm run verify:v761:static
npm run typecheck
npm run build
```

Anschließend eine vollständige Deutschrap- und Hardtekk-Show prüfen: mehrfach wiederkehrende Hooks, Übergänge, echte GLB-Avatare, Lyrics-Kollisionen, Sängerwechsel, manuelle Kamera-/Licht-Timelines, reduzierte Bewegung und mehrere Performance-Profile. Erst nach bestandenen Vollchecks und Browser-Abnahme als produktionsverifiziert einstufen.
