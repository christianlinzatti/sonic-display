# Sonic Display V582 – Natural Dance & Facial Coordination 2.0

Stand: 26.10.2026. **Direkt auf V581 aufgebaut.** Keine separate Demo-Anwendung.

## In der realen GLB-Live-Pipeline implementiert

- `components/visualizer/naturalDanceFacialCoordinationV582.ts` übernimmt **ausschließlich** den bereits von V581 bestätigten Deutschrap-Wort-Cue (Wort-Timestamps, Sängerrechte, manuelle Vorschau-/Audio-Prioritäten). Es gibt keine zweite Sänger-, Silben-, Emotion- oder Beat-Erkennung.
- `components/visualizer/VocalRigV368.tsx` überträgt daraus eine kurze, sehr kleine **Brustkorbneigung** und gegenläufige **Schulterbewegung** auf erkannte *echte* Chest-/Clavicle-`Bone`s: Brust-Pitch ≤ 0,009 rad, Brust-Roll ≤ 0,005 rad, Schultern ≤ 0,007 rad. Bestehende Kopf-/Mund-/Augenanimationen bleiben V581/V574 zugeordnet; die Oberkörperimpulse folgen derselben Wort-Hüllkurve.
- Für echte `Bone`s mit geläufiger Mixamo-/Blender-/Biped-Benennung (Chest/Spine2, Left/RightShoulder oder Clavicle) werden die Bewegungen additiv im vorhandenen `useFrame` angewendet. Es werden keine Bones, Clips, Meshes, GPU-Effekte oder neuen Render-Schleifen angelegt.
- Eigene Achsen-Offsets werden im nächsten Frame nur dann abgezogen, wenn der Animationsmixer sie nicht bereits durch neue Keyframes ersetzt hat; auf Deaktivierung und beim Unmount werden eigene verbliebene Offsets entfernt. Andere Clip-/Partnerbewegungen werden nicht überschrieben.
- **Schutz:** `bodyEnabledV371=false`, gespeicherte Choreografien/erzwungene Clips (`authoredPriorityV499`), Gesichtsvorschau/-Edit, Audio-Lip-Sync, nicht bestätigter Gesang, `reducedMotion`, Low-Tier, Pause, ungültige Zeitmarken und fehlende Bones deaktivieren V582; Hüfte, Beine, Foot-IK und Bodenkontakt bleiben vollständig unangetastet.
- Bestehende Einstellungen unter Tanz-/Vocal-Settings reichen aus. Kein verstecktes Override manueller Choreografien und keine neuen Settings-Keys.

## Entwicklungstests

```bash
npm run test:v582
npm run test:v582:types
npm run test:smoke:v582
npm run verify:v582
```

`prebuild` nutzt die schnelle V582-Smoke-Suite. Der bisherige lange `build:preflight` bleibt als separat ausführbare historische Gesamtkette erhalten. Auf dem lokalen Entwicklungsrechner nach `npm install` zusätzlich `npm run typecheck` und `npm run build` ausführen.

## Visuelle Abnahme (noch offen)

Einen GLB-Avatar mit Chest-/Shoulder-Bones, aktive wortgenaue Deutschrap-Lyrics und gültige V385-Mehravatarrollen benutzen; denselben Abschnitt mit V581 vergleichen. Prüfung: **kein** Oberkörperruck bei Wortwechseln; kein Fußrutschen; bewusst gespeicherte Choreografien bleiben unverändert. Danach Pause, Seek, Trackwechsel, unbestätigte Rollen, reduzierten Motion-/Low-Tier-Modus und zweites Avatar prüfen. Echte Browser-/GLB-Videos und ein physischer Raspberry-Pi-Benchmark müssen auf Zielhardware folgen. Mathematische Tests sind keine audiovisuelle Qualitätsfreigabe.
