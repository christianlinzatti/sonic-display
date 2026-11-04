# Sonic Display V202 – Visual Choreography Timeline Editor 2.0

- Drag-and-drop und Tastatur-/Button-Alternative zum Sortieren, beliebige Längen 1–16 Takte, 12 Schritte pro Phase.
- 3D-Avatar-Motion-Vorschau mit Scrubber und einem lokalen BPM-Simulationstakt; kein Spotify-Audiosync.
- Änderung erfolgt im Entwurf; nur per **Timeline speichern** wird die Live-Sequenz für Verse, Build, Drop oder Break in V198-Storage aktualisiert.
- Crossfade-Werte werden als separate lokale Browser-Metadaten gespeichert, aber **noch nicht von der Live-Bühne angewendet**. Dafür müsste das EvolutionStep-Live-Schema kompatibel erweitert werden. Für tatsächliche zwei-Clip-Crossfades steht weiterhin V192 bereit.
- Build: `npm install`, `npm run typecheck`, `npm run build`; gezielte Prüfung `npm run test:timeline-editor`.
