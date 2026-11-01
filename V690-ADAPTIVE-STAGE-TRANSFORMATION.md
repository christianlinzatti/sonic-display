# V690 – Adaptive Stage Transformation

## Umsetzung

- `adaptiveStageTransformationV690.ts`: überprüft die vorhandenen V604-Akte, V622-Basisschutz, Playback und Genre; berechnet kontinuierliche, deterministische Bühnenöffnung für Setup, Builds, Hooks/Drops, Breaks und nur bei bestätigtem End-Act das Finale.
- Die bestehende V647-LED-Rückwand erhält einen zusätzlichen einzelnen Uniformwert `uStageMorph`, um Bühnen-Architektur am Rand ohne Shaderwechsel zu verbreitern. Es gibt keine neuen Meshes, Lichtquellen, Texturen oder Renderloops.
- `DynamicStage.tsx`: sanfte Farbänderung vorhandener Hintergrund-/Bodenmaterialien, Bewahrung der bisherigen Paletten, Lichtbudgets und manuellen Vorgaben.
- `ConcertDetailStageV555.tsx`: ausschließlich leichte Farbkomposition mit bestehendem Gobo-/LED-/Nebelmaterial; unveränderte Intensitäten.
- `ConcertAtmosphereRendererV308.tsx`: sehr kleine Aufweitung der Sichtweite des bereits vorhandenen Nebels, ohne zusätzliche Dichte.

## Grenzen

Die Regie lädt keine zusätzlichen realen Bühnenmodelle und kennt keine echten Veranstaltungsorte. Ohne bestätigte Abschnitte, korrektes Playback oder auf Low-/reduced-motion-/manuellen Szenen greift sie nicht ein. Ein Finale wird nur ausgewiesen, wenn `endingSupported` aus der bestätigten V604-Planung vorliegt. Eine visuelle Abnahme mit echten GLB-Avataren ist noch notwendig.
