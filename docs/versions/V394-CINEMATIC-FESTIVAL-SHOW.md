# Sonic Display V394 – Cinematic Festival Show 3.0

## Überblick

V394 ergänzt die vorhandene Konzertregie um eine **optionale, abschnittsabhängige Festival-Inszenierung**. Verse bleiben ruhiger und etwas näher, Builds steigern Licht- und Nebelbewegungen, Hooks/Drops öffnen die Bühne. V394 nutzt vorhandene V387-Lichtkanäle und die schon vorhandene R3F-Kamera; es ersetzt weder den V387-Director noch V393 Vocal Performance, V392 Gruppenregie, die GLB-Motions oder den Lyrics-Editor.

## Bedienung

Unter **Einstellungen → Avatar tuning/Vocal Performance → V394 · Cinematic Festival Show 3.0**:

- **Aus** (Standard): keine Änderung gegenüber V393.
- **Cinematic**: gedämpfte, musikalisch dynamische Bühnen- und Kameraakzente – geeignet für Rap-Verse und Hooks.
- **Festival**: stärkerer Build-/Hook-/Drop-Verlauf mit optionalen, sparsamen Laserfächern.
- **Intensität**: 0–100 %.
- **Kamera**, **Scheinwerfer**, **Nebel/Lichtkegel**: unabhängig schaltbar.
- **Laserfächer**: standardmäßig deaktiviert; nur bei hoher Geräte-Performance, elektronischer Musik und Festival-Modus.

## Technik

`components/visualizer/festivalShowDirectorV394.ts` führt die bestehende Song-Timeline (V318) mit aktueller Energie und dem vorhandenen Beat-Signal zusammen. Die pure Regie verwendet die tatsächlich gemeldeten Songabschnitte `break`, `verse`, `build`, `hook`, `drop`. Eine kurzzeitige falsche Abschnittserkennung wird durch eine **250-ms-Hysterese** unterdrückt; Songwechsel und größere Zeitsprünge setzen den Verlauf zurück. Schnelle Kicks allein können **keinen Drop erfinden**. Es gibt keine Stroboskop-Blitze oder eigenständige Audiospurerkennung.

- **Kamera:** `StageCameraDirectorV289` arbeitet ausschließlich auf automatisch komponierten Kameraposen. Rap-Verse bewirken einen subtilen engeren Ausschnitt; Builds und Drops einen sanft breiteren Ausschnitt mit leichter horizontaler Bewegung. Manuelle Keyframes/Editoren und geschützte Lyrics-Komposition haben Vorrang. Blendzeiten und bestehende Kamera-Limits bleiben erhalten.
- **Licht:** `DynamicStage` multipliziert die vorhandenen V387-Lichtkanäle mit begrenzten V394-Gewichten. Maximalwerte, vorhandene Blackouts, Licht-Timelines und Regie-Prioritäten bleiben geschützt. Keine neuen physischen Spotlights oder Shadow Maps.
- **Atmosphäre:** `ConcertAtmosphereRendererV308` nutzt vorhandene Beam-/Haze-Materialien. Bei aktiviertem High-Tier-Laserfächer werden nur zwei schmale additive Meshes eingesetzt (keine reale Laser- oder volumetrische Simulation). Die Animation arbeitet über bestehende `useFrame`-Refs ohne React-Updates pro Frame; bei Pause oder geringerer Geräteleistung bleibt der Zusatz aus.
- **Performance:** Die Stärke wird bei low/balanced-tier begrenzt. Die 3D-Dancer-, Foot-IK-, Lip-Sync- und Audio-Berechnungen bleiben unverändert.

## Eingebaute Schutzmaßnahmen

1. Standardmäßig **Aus**, also keine Änderung an bestehenden Installationen.
2. Der Abschnittswechsel erhält eine Zeit-Hysterese; Drop-Puls läuft aus statt zu blitzen.
3. Manuelle Kamera-/Licht-Timelines, Blackouts und Lyrics-Schutz haben Vorrang.
4. Reduced Motion, Pause und deaktivierte Musikreaktion unterdrücken die Effektaktivität.
5. Laserfächer nur bei High-Tier + Elektronikgenre + aktiviertem Festivalkonzept.
6. Keine isolierte Spotify-Audioanalyse, kein Erkennen einzelner Sänger, keine Aussage, dass ein starker Kick selbstständig einem Drop entspricht.

## Neue und geänderte Dateien

- `components/visualizer/festivalShowDirectorV394.ts` – pure Regie und Kamera-/Lichtkomposition
- `components/visualizer/VisualizerStage.tsx` – V394-Zustand und Bühnen-Prop-Wiring
- `components/visualizer/StageCameraDirectorV289.tsx` – optionale Kamerakomposition
- `components/visualizer/DynamicStage.tsx` – begrenzte additive Lichtverstärkung
- `components/visualizer/ConcertAtmosphereRendererV308.tsx` – sparsame optionale Laserfächer und Atmosphäre
- `components/visualizer/ThreeAvatar.tsx`, `components/visualizer/registry.tsx`, `types/music.ts`, `context/UiPreferencesContext.tsx`, `components/SettingsPanel.tsx` – Integration, Einstellungen und Reset
- `tests/v394-festival-show-regression.cjs` – Sektionen, Drop, Kamera, Prioritäten, Gerätebudgets, Bounds und Integration

## Prüfung

- `npm run test:v394`: bestanden.
- `npm run check:syntax`: 526 TypeScript-/TSX-Quelldateien bestanden.
- 136/136 Befehle aus `verify:offline`: einzeln ausgeführt und bestanden.
- `npm run build:preflight`: blockiert; 16 von 17 npm-Abhängigkeiten fehlen und `package-lock.json` fehlt. Der vollständige Typecheck und Next.js-Produktionsbuild wurden **nicht verifiziert**.

Mit installiertem Node/npm auf einem Netzrechner: `npm install`, anschließend `npm run verify`.
