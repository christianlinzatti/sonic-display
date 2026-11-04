# V886 – LED Wall Creative Director (3.0 Creative Extension)

V886 erweitert die **bereits vorhandene** V842 LED Wall Experience 3.0, die V870-Motive
und die V821-Frequenz-LEDs um vier sichtbar unterschiedliche, shaderbasierte Looks.
Es wird **kein** zweites LED-Mesh, WebGL-Renderpass, zusätzliche Textur oder neue
Lichtquelle erstellt. Die vorhandene V635-Wand bleibt die einzige Renderfläche.

## Neue Visuals

- **Skyline Equalizer:** 36 bewegliche, abwechselnd von gemessenen Bass-/Mitten-/Höhenwerten
  gespeiste Frequenzspuren für Verse und ruhige Abschnitte.
- **Kaleidoskop:** Sich langsam drehende, symmetrische Polygon-Facetten für Hooks.
- **Kinetic Chevrons:** Diagonal wandernde, kontrollierte Winkelmuster für Build-ups.
- **Drop Vortex:** Radial rotierender Strudel für *bestätigte* Drops und Finales.

Bei **Automatisch** bestimmt ausschließlich die verifizierte V810-Sektion das Muster.
Manuell lässt sich der *Look* wählen, die Berechtigung zum Abspielen des Effekts
bleibt jedoch an die bestätigte Szene geknüpft. Vortex in Verse/Hook/Build wird
abgewiesen. Genre (Deutschrap, Hardtekk/-style, Deutschrock, Pop) beeinflusst
nur die sanfte Geschwindigkeit, nicht die Erkennung oder den Ablauf der Musik.

## Bedienung

`Concert FX Studio` → `V886 · LED Wall Creative Director`: Aktivierung, Look,
0–100 % Effektstärke, drei Geschwindigkeiten und Kameraschutz. Im Bedienfeld
wird eine **simulierte Vorschau** für den gewählten Test-Songabschnitt angezeigt.
Die Einstellungen sind in den bestehenden `ConcertFxSettingsV810` enthalten,
werden durch `normalizeConcertFxV810()` sicher übernommen und über die
bestehenden UI-Präferenzen gespeichert.

## Schutzmechanismen und Performance

- Fehlt eine verifizierte Songszene oder ist der Song pausiert, wird V886 deaktiviert.
- Auch bei Blackout, Low-GPU-Stufe, `reducedMotion`, manuell gesetzten
  LED-/Licht-Timelines und festen älteren LED-Looks bleibt V886 deaktiviert.
- Lyrics-Vorschau, Vocal-Fokus, Performer-Nahaufnahmen und mehrere Künstler
  reduzieren die Zusatzhelligkeit.
- Die V821-Teilfreigaben für Equalizer, Geometrie und Drop-Visuals bleiben
  bindend. Es gibt keine eigenständige Beat-, Tempo- oder Gesangserkennung.
- V886 benutzt exakt die V810-Audio-Snapshot-Werte und den Songzeitstempel;
  keine eigenen `setInterval`, React-Frame-Updates oder Random-Trigger.
- Der zusätzliche Shader-Anteil ist auf einen Wert von **0,045** begrenzt,
  übernimmt die V635-Vignette/Transparenz-Grenze und wird bei null Leistung
  im Shader per bedingtem Zweig übersprungen.
- Keine Blitze, Strobo-Trigger oder Full-Stage-Flashes.

## Dateien und Prüfung

Kern: `components/visualizer/ledWallCreativeDirectorV886.ts` und
`components/visualizer/ledWallCreativeShaderV886.ts`.
Integration: `components/visualizer/DynamicStage.tsx`,
`components/visualizer/ConcertFxStudioPanelV810.tsx` und
`components/visualizer/concertFxStudioV810.ts`.
Regression: `tests/v886-led-wall-creative-director-regression.cjs`,
`tests/tsconfig.v886-core.json`, `tests/tsconfig.v886-ui.json`.
Windows: `scripts/verify-v886-windows.ps1`.

Prüfstatus: `V886-VERIFICATION.md`. **Ohne vollständige installierte
Abhängigkeiten ist der Next.js-Produktionsbuild nicht freigegeben.**
