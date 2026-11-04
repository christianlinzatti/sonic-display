# V615 – Intelligent Choreography Variety

**Basis:** V614 – Natural Motion Flow. Fokus: weniger auffällig wiederholte GLB-Tanzclips und maskierte Oberkörpergesten im Verlauf eines vollständigen Songs.

## Änderungen

- Pure V615-Motion-Policy mit song- und modellgebundener Historie der sechs zuletzt automatisch verwendeten GLB-Clips und Nutzungszählern je verfügbarer Animation.
- Die vorhandene V536-Genrekompatibilität und V588-Songfenster bleiben Grundlage. Nur innerhalb der Bewertungsspanne von 1,75 Punkten (gegenüber der besten sicheren Animation) ist zusätzliche Variation möglich. Locomotion wird nicht erzwungen, wenn geeignete stationäre Aktionen vorhanden sind.
- Mindestens 9 Sekunden Abstand zwischen automatischen V615-Auswahlwechseln; bereits blockierte Entscheidungen werden bis zur Freigabe ohne erneutes Ranking aller Clips gespeichert. Bei einem Track-/Modellwechsel oder Seek wird die Historie zurückgesetzt.
- V493: vier zuletzt eingesetzte maskierte Oberkörper-Gesten werden nach Möglichkeit nicht unmittelbar wiederholt. Basisclip, V492-Mixer, Crossfade-Einstellungen und Playback werden nicht neu übernommen.
- Die vorhandenen V614-Gleitübergänge, Foot-IK und Rap-Lipsync bleiben zuständig. Explizite Animationen, Loop-/Timeline-/Choreografie-Vorgaben, Reduced Motion und Pause haben Vorrang.
- Keine zusätzlichen Bibliotheks-Downloads oder feste 20-/64-Clip-Grenze, keine neuen Renderloops, keine Singer/Phonem-Schätzung.

## Befehle

```powershell
npm run test:v615
npm run test:v615:types
npm run test:smoke:v615
npx tsc --noEmit
npm run build
```

**Grenze:** Die hier simulierte Clip-Vielfalt bedeutet noch keine visuelle Prüfung mit echten GLB-Dateien, Avataren und Spotify-Songstrukturen im Browser.
