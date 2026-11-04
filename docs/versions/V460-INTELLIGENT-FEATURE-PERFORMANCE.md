# Sonic Display V460 – Intelligent Feature Performance

**Aufbau:** Vollständige V459-Projektbasis, gleiche Next.js-/Spotify-/React-Three-Fiber-Architektur. Keine zusätzlichen Installationen, neuen Settings, API-Keys oder Netzwerkanfragen.

## Verbesserungen

- `components/visualizer/intelligentFeaturePerformanceV460.ts` ist ein **reiner, deterministischer** Visual-Feature-Regieplaner. Er verwendet die vorhandenen V446-Songphrasen und bereits synchrone Lyrics. Die Künstler-Credits werden niemals als identifizierte Sänger interpretiert.
- Während vorgeschlagener Hooks bilden 2–4 Performer weiterhin eine Gruppe. Außerhalb davon bleibt die zuvor zugewiesene, stabile Bühnen-Fokusrolle erhalten.
- In **genügend langen und mit Lyrics synchronisierten Verse-Phrasen** erhält die zweite Bühne eine **kurze, rein visuelle Antwort** vor dem Szenenwechsel: das zuvor ruhige Ensemblemitglied erhält eine kleine Gestenbetonung. Diese Antwort bedeutet ausdrücklich **nicht**, dass die entsprechende Person den Song tatsächlich singt.
- Ein einziger V460-Szenenplan koordiniert automatische Bewegungsrollen (`verse`/`reply`/`break`), Künstlernamensblasen, automatische V443-Spotlights, V444-Gruppengesten und die V454-Kameraführung. Portraits wechseln in kurzen Antworten zu mehr Raum für die zwei Performer; Hooks zeigen das Ensemble.
- Die Wiedergabezeit ist die einzige Zeituhr, der Szenenplan ist seek-/track-stabil und erzeugt keine eigenen interval timers. Ohne verlässliche synchronisierte Lyrics bleibt es bei der konservativen bisherigen Rollenverteilung; es werden keine Antwort-Zeitstempel erfunden.
- High/Balanced/Low greifen weiterhin: im Low-Modus sind die zusätzlichen automatischen Antwort-Akzente reduziert. GLB-Dateien, Morph-/Mundanimationen, Tanzclips und gespeicherte Kamerafahrten werden nicht geändert.
- Gespeicherte V416-Szenen, manuelle V385-Stimmen-/Vocal-Rollen und manuelle Kamerakeyframes blockieren den V460-Plan. Die bestehenden zentralen Kamera-/Lyrics-Sicherheitsregeln bleiben zusätzlich aktiv.

## Technische Integration

- `VisualizerStage.tsx`: einmalige V460-Planung je Render, Übergabe an gemeinsame Bewe­gungs­energie, Artist-Name-Bubbles, automatische Spotlight-Cues und V454 Kamera.
- `ThreeAvatar.tsx`: nur in der automatisch erzeugten V442-Gruppenbühne zusätzliche dezente V444-Gestenantwort und Spotlight-Einbeziehung des Partners; kein direkter Eingriff in GLB-Animationsclips.
- `registry.tsx`: optionaler, typsicherer V460-Prop; alle anderen Visualizer ignorieren ihn.
- `tests/v460-intelligent-feature-performance-regression.cjs` und `tests/tsconfig.v460-core.json`: deterministische Tests, Pause, Track-/Manual-Guards, 2–4 Plätze, Zeitgrenzen, visuelle Rollen, Kern-Typprüfung und simulierte 30-Minuten-Abtastung.

## Wichtige Grenze

Die Genius-/Spotify-Künstlerangaben enthalten **keine verlässliche Zuordnung von Gesangsstimme zu Wort-Zeitstempel**. Ein `reply` ist ausschließlich inszenierte Bühneninteraktion und wird niemals als erkannter Vocal-Handoff ausgegeben. Die tatsächliche Animation hängt außerdem von den importierten GLB-Modellen und Animationen ab.

## Testen

```powershell
npm install
npm run verify:v460
npm run typecheck
npm run build
```

`verify:v460` testet den V460-Plan, relevante V459-/V458- und ältere Regressionen sowie Syntax, Importpfade und Modulnamen. Ein echter Browser-/WebGL-Test mit den eigenen Avataren bleibt erforderlich.
