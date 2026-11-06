# V1025 – Cinematic Camera Intelligence 4.0

Release: 2026-11-06 · Complete project release · Node 24 production target.

## Filmische Regie auf EINER bestehenden Kamera

- `components/visualizer/cinematicCameraIntelligenceV1025.ts`: vollständig deterministische und rückkopplungsfreie Kamera-Verfeinerung aus **V604/V895 bestätigten Song-Akten**. Ohne bestätigte Daten: unveränderte Kamera.
- V528-gebundener, aktueller Sänger-Cue + tatsächlich sichtbare V377-Root-Anker: dezente Porträtfahrt während Verse, sanfter Fokusübergang zwischen Sänger:innen, verifiziertes Ensemble-Framing. Ohne Sängerbeleg **niemals** einen porträtierten Lead erfinden.
- Hooks und Finale erhalten eine zurückhaltend weitere Arena-Perspektive. Passagen ohne bestätigte Sängerzuweisung nutzen nur eine minimal ruhige, an echte Root-Anker gebundene Kamerafahrt.
- Kamera-Tempo und Offset hängen kontinuierlich vom tatsächlichen Songfortschritt innerhalb des bestätigten Aktes ab. Ein- und Ausblendung rund um Abschnittsgrenzen; kein neuer Timer, kein harter Kameraschnitt.
- Vor Annahme einer Kamera-Bewegung prüft V1025 die bereits vorhandenen V540/V550-Projektionen: **gesamtes Ensemble und jeder einzelne sichtbare Avatar**, einschließlich Kopf/Fuß und möglicher seitlicher Lyricsfläche. Bei Verschlechterung bleibt die Originalpose erhalten.
- **Manuelle Vorrangschaltung:** Live-Edit, Presets, Keyframes, authored V400/V354, reduzierte Bewegung, niedrige Qualität, Blackout/Seek, Pause, manuelle Effekte und sichtbare/geschützte Lyrics verhindern den automatischen Kamera-Finish.
- Integration nach V898 und vor der abschließenden V351-Kamera-Schutzprüfung in `StageCameraDirectorV289.tsx`, ausschließlich im existierenden `useFrame`-Loop. Keine neue Three.js-Kamera, kein weiterer Renderloop, keine künstliche Songanalyse oder Govee-Steuerung.

## Qualitäts-Gates

- `npm run test:v1025`: Akt-/Track-Validierung, Sänger-Handoff, Ensemble-/Arena-Framing, individuelle Crop-Wächter, Lyrics-/Manual-/Seek-Sperren, Pipeline-Reihenfolge und historische Kompatibilität.
- `npm run test:v1025:types`: strikter isolierter TypeScript-Check des produktiven Moduls.
- `node scripts/v959-source-preflight.cjs`: Versions-/Lockfile-/Action-Titel-/Workflow-Parität.
- V931-Produktions-Gate und Vercel-Gate führen V1025 verpflichtend aus; vorhandene Tests bleiben erhalten.
- `npm run typecheck`, `npm run build:next` und Playwright bleiben Node-24-GitHub-CI-Pflicht; sie sind ohne vollständiges `npm ci` nicht als bestanden zu werten.
