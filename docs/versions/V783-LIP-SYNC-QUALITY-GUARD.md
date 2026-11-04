# V783 – Lip-Sync Quality Guard

## Funktion

- Rein opt-in in der **lokalen V777-Konzert-Benchmark-Fixture**. Nicht im Live-Avatar-Director aktiviert. Der V782-Körper-Interpolationsmodus muss für V783 explizit `on` sein.
- `services/monitoring/lipSyncQualityGuardV783.ts` filtert synthetische Vocal-Cues für benannte GLB-Mundmorphs in **jedem gerenderten Frame**, unabhängig von der Mixer-Kadenz (Balanced: zwei Frames, Economy: drei Frames). Gegenüber dem bisherigen Glättungsfaktor 0,32 erhält das Guard-Modell schnelleren Attack (0,72), sanftere Release (0,46) und maximale Mundschritte von 0,28 pro Frame (bei ausgelassenen Frames höchstens proportional 3×). Keine zusätzlichen Animation-Mixer-Samples.
- Einmal pro GLB-Klon angelegte Guard-State-Maschine ohne per-Frame-Allokationen; Reset beim Szenenwechsel und Beginn der Messpassagen. Gleiche logische Frame-Nummer bleibt idempotent; ungültige Daten werden verworfen. Bei stillem Signal keine erfundene Mundaktivität.
- Bisherige V777–V782-Testmodi unverändert. `lipGuardV783=on` bzw. `off` setzt **immer** `interpolationV782=on` voraus. Die Gegenprobe lässt die ursprüngliche V782-Mundlogik aktiv. Unterschiedliche Testversionen/-profile werden nicht versehentlich verglichen.

## Echte Tests mit GLB-Avataren

1. `npm ci && npm run typecheck && npm run build && npm run start`.
2. Eigene animierte GLB-Datei mit benanntem Mund-/Viseme-/Jaw-Morph unter `public/benchmark/mein-avatar.glb` speichern.
3. `npm run benchmark:v783:lip -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb`.
4. Die acht wechselnden Real-Browser-Läufe vergleichen Guard off/on für Balanced und Economy bei drei Bühnen, zwei/vier Avataren und jeweils zwei Messpässen. Enthalten sind FPS-/P95-Framezeiten, Mouth-Holds, Vocal-Cue-Abweichung und Body-Pose-Jitter.
5. Ausgabe: `artifacts/v783/runs.json`, `lip-guard-review.json` und `lip-guard-review.md`. Offline: `npm run benchmark:v783:assess -- --input=artifacts/v783/runs.json`.
6. Direkt lokal: `/diagnostics/concert-benchmark?concertBenchV777=1&profileV779=balanced&motionV781=1&interpolationV782=on&lipGuardV783=on`.

## Gültigkeit und Grenzen

- Nur identische reale Chromium-/WebGL-Messungen mit derselben GPU, denselben Renderer-Informationen, vollständigen Testfällen und identischen **GLB-SHA-256-Hashes** werden gegenübergestellt. Veränderte Testparameter, Referenz-GLB ohne repräsentative Komplexität, fehlende Morphtargets oder unvollständige Berichte führen zu Warnung oder `blocked`.
- Der Test benutzt **synthetische Vokal-Signale** – keine echten Deutschrap-Phoneme oder exakte Sprach-Timestamps. Die verbesserte Glättung garantiert weder automatisch bessere Silbensynchronität noch eine Bildratenverbesserung. Ein visueller Vergleich sowie Tests mit echten Lyrics-/Vokaldaten sind vor einer Übernahme in den Live-Director erforderlich.
- Die bestehende V782-Benchmark-Interpolation ist ein Prototyp. Für die Produktivshow wird weder V782 noch V783 ohne reale Regressionsergebnisse aktiviert.

## Statische Prüfung

`npm run test:v783`, `npm run test:v783:types`, `npm run verify:v783:static`. Ein vollständiger Next.js-Produktionsbuild setzt installierte npm-Abhängigkeiten voraus.
