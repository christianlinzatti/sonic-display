# V747 – Prüfprotokoll / Freigabegrenzen

**Basis:** `sonic-display-v746-vocal-performance-2.zip`. **Ziel:** `0.1.0-v747`.

## Lokal hier erfolgreich ausgeführt

- `npm run test:v747`: **PASS, 66.478 Prüfungen**. Enthält Szenen-/Trackvalidierung, 1–4 Avatar-Anker, Seeks, Sängerwechsel, minimale Shot-Haltezeiten, musikalische Abschnitte, Gating manueller Steuerung, 20.000 deterministische Entscheidungssamples sowie Projektionsgrenzen V540/V550 für mehrere Auflösungen und Lyrics-Positionen.
- `npm run test:v747:types`: **PASS** – isolierter, strikter TypeScript-Check für das neue V747-Modul.
- `npm run test:v735` bis `npm run test:v746`: **PASS** – alle genannten bisherigen Motion-Regressionen, einschließlich V665/V666-Grounding.
- `node tests/v633-cinematic-camera-2-regression.cjs`: **PASS**, inklusive bestehender Qualitätsprüfungen über 10.000 Kamera-Samples.
- `node tests/v655-natural-concert-camera-regression.cjs`: **PASS** – bestehende Vocal-Camera-Prioritäten und -Schutzprüfungen.
- `node tests/v682-cinematic-camera-variety-regression.cjs`: **PASS** – Shot-Variation und sichtbares Ensemble.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`: **PASS** – Syntax-/Import-, Architektur- und Windows-/Linux-Dateinamenkollisions-Prüfung.
- Zwei ältere kamerabezogene Strukturtests und ein V633-Kamera-Strukturtest wurden nur an die neue Kompositionsreihenfolge angepasst. Die V351-Prüfung sowie ihre Reihenfolgen-Assertions bestehen weiterhin.

## Nicht erfolgreich verifiziert

- `npm ci --offline --ignore-scripts`: **ENOTCACHED**, `zustand@5.0.16` wurde nicht zwischengespeichert.
- `npm run typecheck`: **nicht bestanden**, da grundlegende Abhängigkeiten (`react`, `next`, `@types/node`, `three` etc.) in dieser Umgebung fehlen. Daraus darf kein erfolgreicher gesamter TS-Check abgeleitet werden.
- `npm run check:fast` / `npm run build`: Dependency-Preflight meldet **0/18** erforderliche Pakete. `next build` konnte hier nicht ausgeführt werden. Dieses Archiv ist ein **Quellcode-Buildkandidat**, keine vollständig produktionsfreigegebene Version.
- Kein Browser-Test mit echten GLB-Avataren/Audio/Lyrics und keine GPU-Frame-Messung.

## Für Windows / lokale vollständige Freigabe

```powershell
npm ci
npm run verify:v747
npm run typecheck
npm run build
```

Für eine tatsächliche visuelle Abnahme im Browser prüfen: 1/2/4 Avatare, Deutschrap mit zugeordnetem Sänger, ein Duett mit Sängerwechsel, Hook und Drop, Lyrics links/rechts, manuelle Kamera, Reduced Motion, Seek und Trackwechsel. Dabei auf sichtbare Köpfe und Füße, fehlende Crop-Sprünge und Lippen-/Lyrics-Lesbarkeit achten.
