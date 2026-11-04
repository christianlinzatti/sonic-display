# V247 – Performance & Bundle Optimization

- Next.js `dynamic()` lädt `VisualizerStage`, `AudioVisualizer` und `SettingsPanel` in getrennten Client-Chunks.
- Aufwendige Avatar-Editoren, Vorschauen, Retargeting-Studios und Diagnosewerkzeuge werden erst bei Verwendung geladen.
- Komponenten-Props und bestehende State-/Audio-/Avatar-Logik bleiben unverändert.
- Die bisherigen Build-Fixes aus V246 bleiben erhalten.
- Messwerte aus V246: Home First Load JS 625 kB; die neue Größe muss mit einem echten `npm run build` ermittelt werden.
- Empfehlung: `npm install`, `npm run typecheck`, `npm run build`.
