# V687 – Prüfprotokoll: Feature & Duet Performance

## Erfolgreich

- `npm run test:v687`: **68 Prüfungen bestanden**, einschließlich **10.000 simulierter Zeitpunkte**. Geprüft: bestätigte Sängerübergaben und Zweierduette, sanfte Gesten und Blickkontakte, korrektes Cue-Track-Matching, Pausen-/Reduced-Motion-/Low-Tier-/Manual-Guards, nichtfinite Zahlen, Abstands-/Kollisionsbegrenzung, keine neuen Sängerrollen und deterministisches Seek-Verhalten.
- `npm run test:v687:types`: **PASS**, strenger isolierter TypeScript-Check des neuen V687-Moduls.
- `npm run test:quick`: **PASS** (V669–V687, Syntax, Architektur, Modulschreibweise, Test-Typ-Isolation und Spotify-Umgebung).
- `npm run test:legacy:interaction`: **PASS** (V506, V517, V527, V539, V548 und V616). Ältere Prüfverträge wurden an die mit V680 eingeführte Trennung zwischen schnellem Build und historischer Regressionssuite angepasst. Fachliche Funktionsprüfungen bleiben erhalten.
- Weitere gezielte Regressionen: `npm run test:v508`, `npm run test:v638`, `npm run test:v664`: **PASS**.
- Die V687-Pipeline ist sowohl in `GroupDancersV326SceneV492.tsx` (3/4 Performer) als auch in `DanceFormationActorsV492.tsx` (2 Performer) verkabelt. Beide Pfade verwenden die bestehende V452-Gestenbegrenzung und den vorhandenen Kollisionsschutz. Beim Duo erfolgt die Kollisions-Gestendämpfung nach den neuen optionalen Akzenten erneut.

## Grenzen / ausdrücklich nicht verifiziert

- `npm run check:dependencies` und `npm run build`: **BLOCKIERT**. Die Arbeitsumgebung enthält weder `node_modules` (17 fehlende npm-Abhängigkeiten) noch `package-lock.json`. Damit konnten **kein vollständiger App-TypeScript-Check und kein Next.js-Produktionsbuild** abgeschlossen werden.
- Kein visueller Browser-/WebGL-Test mit realen GLB-Avataren oder Spotify-Audiotests; auch keine echte Vocal-Stem- oder Sprechererkennung in diesem Release.
- V687 verwendet **ausschließlich** bereits bestätigte, zur Song-ID passende V385/V416/V496/V517-Cues. Ein Künstler-Credit oder optisch ausgewählter Lead ist kein Nachweis, dass diese Person gerade singt. Die neuen Reaktionen werden aus vorhandenen Cue-Zeitfenstern berechnet, nicht aus neu erkannten Audioereignissen.
- Keine neuen Tanzclips, keine Änderung importierter GLBs, Lipsync-/Viseme-Timelines, Vocals, Lyrics, Foot IK, Bühnenroot-Positionen oder Kamera.

## Windows-Abnahme nach dem Entpacken

```powershell
npm install
npm run test:v687
npm run test:v687:types
npm run test:quick
npm run build
```

In der laufenden visuellen Vorschau ein bestätigtes Zweierduett, einen Sängerwechsel mit `handoffFrom`, ein 3-/4-Avatar-Feature, manuelle Choreografie, Pause, unsichere Abstände sowie fehlende Sprecher-Cues vergleichen. Ohne ausdrückliche Sprecherzuordnung darf V687 nicht reagieren.
