# Sonic Display V498 – Natural Vocal Handoffs

## Bühnenregie beim Sängerwechsel

V498 ergänzt die V497-Konzertregie um **weiche, zeitgesteuerte Übergänge** für explizit in V496 gespeicherte Sänger-Zeitmarken. Die Original-Sängerregie aus V496 (Mund-/Körperrollen) bleibt unverändert und autoritativ. Die reine Funktion `refineVocalConcertHandoffsV498` nutzt den bestehenden V497-Cue, seinen gültigen Track und dessen Positionsuhr; sie erzeugt weder Stimmen-IDs noch zusätzliche Zeitmarken.

- **Kamera:** kleinere automatische FOV-/Z-Akzente von V497 werden in den ersten 570 ms eingeblendet und in den letzten 520 ms ausgeblendet. Die bestehende Kamera-Interpolation und Lyrics-Schutzgrenze greifen danach weiterhin.
- **Licht:** nur automatische V497-Key-/Beam-Multiplikatoren werden an den Anfangs-/Endkanten innerhalb von 460 ms sanft auf 1 zurückgeführt. Nach wie vor maximal +11 % Key/+13 % Beam vor bestehenden Schutzprüfungen.
- **Spotlight:** beim Übergang Solo → Duett oder Duett → Solo wird über maximal 850 ms die tatsächliche Weltposition des vorigen und des aktuellen Avatars gemischt. Benutzt wird ausschließlich der bestehende Beam und die schon vorhandene `Vector3`-Referenz. Kurzpausen bis 650 ms sind erlaubt, längere Pausen setzen den Übergang zurück. Gemeinsame Hooks erhalten keinen künstlich herausgehobenen Sänger.
- **Sehr kurze Segmente:** die symmetrischen Hüllkurven vermeiden große Sprünge bei knappen Zeitmarken; keine zusätzlichen asynchronen Timer, AnimationMixer, WebGL-Objekte, Render- oder `useFrame`-Hooks.

## Vorrang und Fallback

Automatische Übergänge laufen nur, wenn V496/V497 bereits einen gültigen Cue für den **aktiven Track** freigegeben haben. Pausieren, Seek außerhalb des Segments, `reducedMotion`, manuell zugewiesene Sänger, manuelle Kamera und Licht, Blackout, Strobe sowie bewusst deaktivierte Stage-Reaktivität haben wie zuvor Vorrang. Enthält die Zeitleiste keinen gültigen vorigen Sänger, wird ohne Fokusüberblendung gearbeitet. Bei einem verschwundenen GLB-/Avatar-Objekt bleibt die Position des aktuellen Sängers erhalten. Der Bühnenbeam wird pro Frame wie zuvor am vorhandenen Standort neu bestimmt.

## Dateien und Prüfbefehle

- `components/visualizer/vocalHandoffDirectorV498.ts`: zustandslose Hüllkurven und handoff-fähige Cue-Verfeinerung
- `components/visualizer/ThreeAvatar.tsx`: V498 nach dem V497-Planer berechnen, bevor Kamera/Licht ihre Cues erhalten
- `components/visualizer/DynamicStage.tsx`: bestehendes Spotlight zwischen den realen Avatarpositionen lenken
- `tests/v498-vocal-concert-handoff-regression.cjs`: Solo, Duett, Hook, längere Pausen, überlappende Cues, manuelle Prioritäten, reduzierte Bewegung, 30-minütige deterministische Simulation

Prüfen: `npm run test:v498 && npm run test:v498:types && npm run test:v497 && npm run check:architecture && npm run typecheck && npm run build`.

Die Simulation belegt weder die tatsächliche Wiedergabesynchronität noch die Sichtwirkung mit echten GLB-/Procedural-Avataren. Für finale Konzertqualität sind visuelle Tests auf PC und Raspberry Pi erforderlich.
