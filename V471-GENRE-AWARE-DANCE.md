# Sonic Display V471 — Genre-Aware Dance Performance

## Schwerpunkt Deutschrap + Pop + Rock

V471 setzt auf V470 (34 Genres einschließlich Rock-/Pop-Subgenres und Genre-Fusion) auf und ergänzt genreabhängige, abschnittssensitive Bewegungsakzente.

- **Deutschrap**: Verse mit Headnods, moderatem Groove und ruhigen Oberkörper-/Armgesten; Hooks mit stärkerer Pose-/Bassbetonung. Trap, Drill, Boom Bap und R&B verfeinern die Gestenprofile.
- **Rock**: In den Strophen Groove und Side-Steps, in Hooks Gitarren-/Headbang- und Drop-Akzente. Indie Rock, Alternative, Punk, Metal und Pop-Rock unterscheiden sich im Intensitätsprofil.
- **Pop**: Fließende Side-Steps und präzisere Refrain-Akzente; eigene Varianten für Indie-Pop, Electro-Pop und Dance-Pop.
- **Fusion**: Durch V470 bestätigte zwei Genres können Bewegungspräferenzen und Akzentgewichte kombinieren, wenn ihr Gewicht hinreichend groß ist. Die stärkere Stilrichtung behält Vorrang; manuell gewählte Genre-Korrekturen der MusicContext-Pipeline gelten weiterhin.
- **Musikstruktur**: Vorhandene Show-Cues für Verse, Hook, Build, Break und Drop haben Vorrang. Ohne Show-Cue bleiben die bestehenden heuristischen Struktursignale erhalten.
- **GLB**: V471 ergänzt ausschließlich additive, begrenzte Rotationen in der vorhandenen AudioMotionEngine und Akzente der prozeduralen Choreografie. GLB-Animationsdateien bleiben unverändert, Fuß-IK und Gesichts-/Lippensynchronisation werden nicht überschrieben.
- **Sicherheit & Performance**: Pause und Reduced Motion deaktivieren die Zusatzeffekte; manuell gespeicherte Choreografien reduzieren ihre Stärke deutlich. Keine weiteren GLB-Downloads oder Shader-Render-Pässe.

### Grenzen

Musikgenres und Songabschnitte sind abhängig von vorhandenen Metadaten/Erkennung. Eine echte Trennung von Hauptstimme, Feature-Rapper und Adlibs *mit präzisen Zeitstempeln* wird **nicht** aus Genre-Tags oder dem Basssignal erfunden. Die bereits vorhandenen Lyrics-/Vocal- und Feature-Cues behalten ihre eigene Priorität. Für präzise Artist-/Adlib-Gesten sind entsprechende Quellen oder manuell erstellte Zeitmarken nötig.

### Wichtige Dateien

- `components/visualizer/genreChoreographyV471.ts`: pure genre-, abschnitts- und fusionbasierte Bewegungsprofile
- `components/visualizer/advancedDanceChoreography.ts`: phrase-quantisierte genreorientierte Bewegungswahl und bounded motion accents
- `hooks/useAudioMotionEngine.ts`: genreorientierte additive GLB-Knochenrotationen
- `components/visualizer/ThreeAvatar.tsx`: Verwendung der Show-Cues im 3D- und prozeduralen Avatar
- `tests/v471-genre-choreography-regression.cjs`, `tests/tsconfig.v471-core.json`: Regressionen und isolierte Typprüfung

### Verifikation

- `npm run test:v471`
- `npm run test:v471:types`
- `npm run verify:v471` (einschließlich der V468–V470- und V467-Regressionen, Import- und Syntaxprüfungen)
- Nach lokalem `npm install`: `npm run typecheck && npm run build`

Ein vollständiger Next.js-Produktions-Build ist im Offline-Sandbox-Projekt ohne installierte npm-Abhängigkeiten nicht möglich; damit ist die Browser-/Raspberry-Pi-FPS-Qualität noch nicht hardwareseitig gemessen.
