# V782 – Adaptive Animation Interpolation

## Funktion

- Auf Basis der V781-Funktionsmessungen: Im lokalen V777-GLB-Konzertbenchmark werden Balanced (Stride 2) und Economy (Stride 3) **optional** mit interpolierten Zwischenschritten angezeigt.
- Transformations-Samples aller geklonten GLB-Knoten inklusive animierter Morph-Targets werden nur an Stride-Grenzen von `AnimationMixer.setTime` abgerufen. Im Renderframe werden Position/Skalierung linear und Rotationen per Quaternion-SLERP (kuerzester Pfad) angewandt. Morph-Targets werden ebenfalls linear interpoliert. Das synthetische Vokalsignal aktualisiert den Mund im V782-Modus bei jedem Frame.
- Keine per-Frame-Allokation der Pose-Arrays; die Buffergroesse bleibt pro GLB konstant. CPU-Kosten der Zwischenbildinterpolation muessen trotzdem real gemessen werden.
- Cinematic nutzt weiterhin Stride 1. Der normale V779/V781-Testmodus bleibt **unveraendert** und eindeutig getrennt.
- Die produktive Konzert-Show/der Live-Avatar-Director wurde **nicht** auf das neue Sampling umgestellt. Das ist ein gezielter Prototyp zur Validierung der Methode, keine ausgerollte allgemeine Bewegungsverbesserung.

## Echten Vergleich starten

1. `npm ci && npm run typecheck && npm run build && npm run start`.
2. Eigenes GLB unter `public/benchmark/mein-avatar.glb` speichern (animiertes, skiniertes Modell mit benanntem Mund-Morph).
3. `npm run benchmark:v782:motion -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb`.
4. Der Runner startet acht reale Chromium-Laeufe in gegenlaeufiger Reihenfolge: Balanced aus/an, Economy aus/an, Economy an/aus, Balanced an/aus. Jeder Lauf prueft alle drei Buehnen mit zwei/vier GLBs und zwei Messpaessen. Ergebnis unter `artifacts/v782/interpolation-review.json`, `.md` und `runs.json`.
5. Offline neu auswerten: `npm run benchmark:v782:assess -- --input=artifacts/v782/runs.json`.

Direkte technische Kontrolle: `http://127.0.0.1:3000/diagnostics/concert-benchmark?concertBenchV777=1&motionV781=1&profileV779=balanced&interpolationV782=on`. `interpolationV782=off` ist der explizite Kontrolllauf. Ohne Parameter bleibt das alte Verhalten erhalten.

## Messwerte / Grenzen

Bericht je Szene: Pose-Holds, Pose-Jerk, Mund-Holds, Vokalsignal-Abweichung, P95-Framezeit und FPS, jeweils **aus gegen an**. Blockiert bei unvollstaendigen Browser-Daten, Software-Rendering, falschen Profilen, anderem Renderer, anderen GLB-SHA-256-Hashes, unterschiedlicher Test-Frequenz oder inkonsistenten V777-/V781-Berichten.

Die V777-Fixture verwendet echte GLBs, aber **synthetische Musik- und Lyrics-Signale**. Bildqualitaet, reale Phoneme und Fuss-IK muessen separat geprueft werden. Die kleine Referenz-GLB ist kein aussagekraeftiges Hardware-Benchmarkmodell. Keine FPS-/Hardwarezusage ohne echten Test.

## Tests

`npm run test:v782`, `npm run test:v782:types`, `npm run verify:v782:static`. Vollstaendiger TypeScript-Check und Next.js-Build erfordern die lokalen Projektabhaengigkeiten.
