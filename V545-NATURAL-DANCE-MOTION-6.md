# V545 – Natural Dance Motion 6.0

**Basis:** V544. **Ziel:** weniger additive Fuß- und Hüftunruhe bei GLB-Tänzern – insbesondere bei Deutschrap und schnellen Hard-Dance-Passagen.

## Umsetzung

- `components/visualizer/naturalDanceMotionV545.ts`: reiner, deterministischer Finishing-Pass für fünf vorhandene Rig-Overlay-Kanäle. Separate genreabhängige Zeitkonstanten (Deutschrap behutsamer, Hardtekk schneller). Prozentuale Reduktion durch vom bestehenden IK gemeldete Fußkontakte, mit unmittelbarer Kontakt-Sicherheitsbegrenzung.
- `components/visualizer/GltfDancerAvatarV492.tsx`: Integration nach V323-Körperbalance, vor `applyAvatarRigMotion` und der nachfolgenden V492-Fuß-IK; nutzt ausschließlich Kontaktstatus des vorausgehenden Frames. **Kein zusätzlicher Render-Loop.**
- `components/visualizer/NaturalDanceControlsV320.tsx`: ein-/ausschaltbare Stärke (0–100 %, Standard 65 %) in den existierenden Einstellungen. `localStorage` ist optional.
- Zeit-/Modellwechsel oder Seeks löschen den Verlauf; bei Pause, Reduced Motion, Low-Tier, unbekanntem Kontakt, deaktivierter Fuß-IK oder manueller Choreografie bleibt die vorhandene Motion unverändert. Keine Änderungen an originalen GLB-Keyframes, Render-Geometry, Song-Timestamps, Avatar-Casting oder Kameraposition.

## Prüfungen

`npm run test:v545`, `npm run test:v545:types`, `npm run verify:v545` und `npm run check:syntax`/`check:architecture`. V545 prüft synthetische Kontaktkonstellationen sowie (falls lokal vorhanden) die Rig-/Animationsstruktur der fünf originalen Test-GLBs. Diese GLBs sind nicht Bestandteil des ZIP-Pakets.

**Grenzen:** Kontaktabhängige Dämpfung ist keine biomechanische Motion-Capture-Korrektur; die tatsächliche Wahrnehmung von Gewichtsverlagerungen und Fußrutschen muss in WebGL/auf dem Raspberry Pi geprüft werden. Eine vollständige `next build`-Bestätigung ohne `node_modules` ist nicht möglich.
