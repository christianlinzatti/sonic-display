# Sonic Display V528 – Cinematic Concert Camera & Lyrics Coordination

## Änderungen

- Ein gemeinsam genutzter, verifizierter V528-Szenenplan verbindet V527-Fokusabsichten und vorhandene V385/V416/V496-Zuweisungen mit Kamera/immersiven Lyrics – **keine Sängerkennung aus Track-Credits, Audio- oder Lyrics-Text**.
- `lead`/`feature`: vorsichtiges Portrait auf die nachgewiesene Bühnenposition. `handoff`: weiches gemeinsames Framing von übergebendem und neuem Sänger. `ensemble`: breitere Hook-Perspektive bei vollständig zugewiesenem Ensemble. Fehlt ein nötiger Avatar-Anker, greift V528 nicht ein.
- Live-Kamera-Editor, Studio-Modi, Presets, Kamera-Keyframes, manuelle V400- und V354-Timelines, Konzert-/Festival-Kamera-Cues, bestehende Vocal-Kamera-Deaktivierungsschalter und V351 Lyrics-Schutz bleiben vorrangig. Kein zweiter Kamera-Renderer; V528 nutzt das vorhandene Kameraglätten (1,65/s bei aktivem Akzent).
- V528-Lyrics-Modulation greift nur auf **zusätzliche visuelle Bewegung**, Textlesbarkeit und die Kontrastplatte zu. Keine Änderung der V477-Wortfüllstände, Timingdaten, Lyrics-Provider, manuellen Font- und Spatial-Einstellungen, GLB-Clips, Lip-Morphs, Tanz- oder Fuß-IK.
- Reduced Motion, Pause, Low-Tier, Trackwechsel, fremde oder außerhalb liegende Cues und manuelle Choreografie liefern einen neutralen Plan. Damit kein neues Tanz-/Audio-Artefakt durch Kamera/Caption-Regie.

## Geänderte Komponenten

- `components/visualizer/cinematicSceneIntentV527.ts` – gemeinsame, winzige V527-Szenenklassifikation; ebenfalls im V527-Plan verwendet.
- `components/visualizer/cinematicConcertCoordinationV528.ts` – reiner Plan, begrenzte Kamerakomposition, gemeinsame Lyrics-Stärke.
- `components/visualizer/cinematicConcertSceneSourceV528.ts` – nur bereits vorhandene, zeit- und trackgebundene Singer-Cues; Editorpriorität wie V517.
- `components/visualizer/VisualizerStage.tsx` – einmaliges Erzeugen und Durchreichen derselben Szenenabsicht.
- `components/visualizer/StageCameraDirectorV289.tsx` und `ThreeAvatar.tsx` – ausschließlich bestehender Kamera-Regiepfad.
- `components/visualizer/Lyrics3DScene.tsx` und `components/KineticLyrics.tsx` – dezente, geteilte Caption-Akzente.
- `tests/v528-cinematic-concert-coordination-regression.cjs` und `tests/tsconfig.v528-core.json`.

## Teststatus und echte Qualitätsgrenzen

`npm run test:v528` prüft 3.600 simulierte Pläne mit echten Sicherheitsgrenzen, 2–4 Avataren, Leads, Features, Hooks, fehlenden Ankern und manuell priorisierten Posen. V527 und V526 bleiben im Preflight. Der isolierte V528-Kerntypentest benötigt keine zusätzliche Abhängigkeit; für den vollständigen Next.js-Build müssen lokal die Projekt-Abhängigkeiten installiert sein. Simulierte Kamera-Posen beweisen weder reale Kadrierung auf allen GLB-Modellen noch die FPS eines Raspberry Pi.

**Manuelle Abnahme:** Deutschrap-Track mit bestätigten V496- oder V416-Rollen und 2/3/4 sichtbaren Avataren; 0,5–2 s vor/nach Featurewechsel und Hook vergleichen. Anschließend Kamera-Keyframes und Live-Editor aktivieren, Position im Track rückwärts und vorwärts suchen, Song wechseln, pausieren, Reduced Motion und Low-Tier verwenden; prüfen, dass keine alte Sängerrolle weiterwirkt. In 3D/DOM-Perspektiven Karaoke-Wortfüllung bei gleichem Fortschritt vergleichen und auf 10-Zoll-Pi mit V522 die tatsächlichen Frametimes erfassen.
