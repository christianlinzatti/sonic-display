# V789 – Cinematic Light Architecture

## Was in der echten Konzertbühne neu ist

- **Galaxy:** ein unterbrochener, leuchtender Sternentor-Halo hinter den Tänzern mit seitlichen Lichtakzenten.
- **Rock:** eine warme Arena-Traverse mit gestaffelten Leuchtsegmenten.
- **Cyberpunk, Neon, Festival, Vaporwave und Classic:** räumliche Portalrahmen mit Lichtflügeln und dezenten Dachakzenten.
- **White und Minimal:** zurückhaltende Studio-Lichtlinien statt unnötiger Effekte.
- **Musikalische Dramaturgie:** leise Verse, stärkere Hooks, mehr Energie für Drops, bewusst weniger Licht in Breaks. Bestätigte V761-Szenen-Intents können die Intensität modulieren.
- **Wandernde Farbakzente:** statt Stroboskop läuft ein sanfter Farbwechsel langsam über die Leuchtsegmente. Das vorhandene Musikfarbschema wird verwendet.

Die Segmente werden in **nur einem InstancedMesh** gezeichnet (maximal 64 Geometrieinstanzen in einem Draw Call). Matrizen entstehen beim Bühnenwechsel, nicht pro Frame. Das GPU-Instanzfarben-Array wird für die leichte Farbchoreografie maximal zehnmal pro Sekunde aktualisiert. Es gibt keine zusätzlichen Spotlights, Schattenkarten, Postprocessing-Pässe, Timer oder gespeicherten Nutzerdaten.

## Schutz von Darstellern, Texten und manueller Regie

- Alle Leuchtsegmente befinden sich auf der hinteren Bühnenebene, nicht vor Gesichtern.
- Lyrics-Schutz reduziert die Helligkeit; keine Änderung an Lyrics oder Sängerzuweisungen.
- Ein manueller Licht-Cue reduziert die Auto-Dekoration, ein Blackout blendet sie **sofort** aus.
- `reducedMotion` stoppt die Animation; der statische Rahmen bleibt als Design-Element erhalten.
- Die bestehenden `no-rings`- und `minimal-lights`-Szenendetail-Modi können den Effekt abschalten; `no-pulse` unterbindet die Bewegung.
- Auf `low`-Performance-Tier, beim V640-`minimal`-Budget und beim V788-Governor-Budget `strength<40` wird die neue Architektur ausgeblendet. Die wichtigsten Show-Funktionen werden nicht reduziert.
- Es werden weder echte Sänger erkannt noch künstliche Stimmwechsel oder Song-Zeitstempel erfunden.

## Geänderte Dateien

- `components/visualizer/architecturalLightPlanV789.ts`: reine, deterministische Bühnenlayouts und Lichtdynamik.
- `components/visualizer/ConcertArchitectureV789.tsx`: performanter Renderer.
- `components/visualizer/DynamicStage.tsx`: Einbindung in die bestehende Bühne.
- `tests/v789-cinematic-architecture-regression.cjs`: neue Regressionstests.
- `package.json`, `package-lock.json`, `ARCHITECTURE.md`: Version und Release-Gates.
- `tests/v788-concert-governor-regression.cjs`: Versionsprüfung akzeptiert auch nachfolgende Versionen.

Die neue Version ersetzt keine vorhandenen Bühnen oder Einstellungen; die zusätzliche Lichtarchitektur läuft in den vorhandenen Stage-Profilen.
