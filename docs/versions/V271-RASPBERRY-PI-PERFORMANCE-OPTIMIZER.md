# Sonic Display V271 – Raspberry Pi Performance Optimizer

V271 ergänzt V270 um einen **messwertbasierten Raspberry-Pi-Optimierungsvorschlag**.

1. Auf dem Pi unter Diagnose mindestens einen Benchmark für High/Balanced/Low durchführen, nach Möglichkeit alle drei mit derselben Szene, demselben Track und derselben Avatar-Anzahl.
2. Die Raspberry-Pi-Auswertung aktivieren, falls die Browserkennung das Gerät nicht eindeutig ausweist.
3. Ergebnis vergleichen und Renderqualitäts-Vorschau öffnen. Die Änderung wird **nur nach Bestätigung** angewendet.
4. Optional über »Rückgängig« zur vorherigen Qualität zurückkehren.

## Algorithmus

Es werden nur vollständige Messreihen (6 gültige Nach-Aufwärm-Samples, gültige FPS und P95) und identische Avatar-Anzahlen verglichen. Besteht eine Qualitätsstufe ≥45 FPS, ≤30 ms P95 sowie ≤12 % langsame Frames (falls vorhanden), wird die höchste solche Qualität bevorzugt. Sonst wird die schnellste gültige Messung empfohlen. Die Schwellen sind Heuristiken, kein Hardware-Benchmarkstandard.

## Grenzen

Kein direkter CPU-/GPU-Auslastungsmesser, keine automatische LOD-/Animierungsänderung, keine persistente Benchmark-Historie und keine garantierte Pi-Erkennung im Browser. Choreografie, Avatare und Multi-Avatar-Director bleiben unangetastet. Der vollständige Next.js-Build ist separat mit `npm install && npm run typecheck && npm run build` zu verifizieren.
