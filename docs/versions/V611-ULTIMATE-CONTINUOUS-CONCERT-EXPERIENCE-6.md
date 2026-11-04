# Sonic Display V611 – Ultimate Continuous Concert Experience 6.0

**Basis:** V610 · **Status:** implementierte Bühnen-Runtime und deterministische Offline-Tests; reale Sichtabnahme ausstehend.

## Ziel: eine abgestimmte Show über den ganzen Song

`components/visualizer/continuousConcertExperienceV611.ts` ist eine sehr kleine, abschnittsgebundene, deterministische Finishing-Schicht über der bereits vorhandenen V600/V604-Gesamtregie, V607-Sängerinteraktion, V608-Lichtdramaturgie, V609-Übergängen und V610-Genreausrichtung. Alle automatischen Bühnenkanäle nutzen **denselben** aktuell bestätigten Track, Songabschnitt, Zeitstempel und V604-Motiv. Nur diese vorhandenen Live-Berechnungen werden moduliert:

- **Intro/Verse:** ruhigeres Tanz- und Kamera-Mikromovement, dezente Beams; bestehende Gesichts-Key-/Fill-Lichter bleiben gut lesbar.
- **Build-up:** kleiner, anhand tatsächlich vorhandener Energie verstärkter Spannungsbogen.
- **Hook 1:** breitere Ensembleaufnahme, mehr vorhandenes Bühnenlicht.
- **Hook 2:** stärker portrait-/spotlightbezogener Moment, weniger breite Kamerabewegung. Die abwechselnden Motive entstammen ausschließlich dem verifizierten V604-Repetition-Index.
- **Break:** bewusst geringere Tanzenergie, Beam- und Haze-Intensität.
- **Drop:** zusätzliche Bewegung nur mit dokumentiertem `drop`-Abschnitt **und** gemessener Kick-/Energieunterstützung, niemals aufgrund des Genres allein.
- **Finale:** kleiner gemeinsamer Schlussakzent nur bei V604-bestätigter letzter Songphase und ausreichender Abdeckung bis zum Trackende.

Die Zusatzgewinne sind ausdrücklich eng begrenzt, bei 0 an einem Szenenrand neutral und bei dichter Lyrics-Passage weiter gedämpft. Die dramaturgische Glättung stammt aus dem bereits geprüften V604-`transition`-Envelope; es werden **keine** neuen Audioanalysen, Beat-Raten oder Sängerzeitstempel erfunden.

## Tatsächliche Runtime-Einbindung

- `components/visualizer/VisualizerStage.tsx`: automatisch berechnete Tanzenergie und Avatar-Bewegungsintensität; manuelle Clips, eigene Choreografie und festgelegte Motion-Timelines bleiben unverändert.
- `components/visualizer/StageCameraDirectorV289.tsx`: minimaler Drift-/FOV-/Interpolation-Zusatz auf der einen vorhandenen automatischen Kamera, danach unverändert `guardAutomaticCameraV351`. Manuelle Keyframes, Kamera-Editor, Timeline, harte Schnitte und Sängerprioritäten gewinnen.
- `components/visualizer/DynamicStage.tsx`: kleine Gain-Anpassungen an den bestehenden Key-/Fill-/Beam-/Sweep-Kanälen innerhalb der alten Lichtbudgets.
- `components/visualizer/ConcertAtmosphereRendererV308.tsx`: vorhandene Beams, Spots, Haze und ihre Sweeps erhalten dieselbe verifizierte Songphase; keine neuen WebGL-Objekte.

Schutz: Spotify-Track-ID, Dauer, verifizierter V604-Akt samt Kapitel/Motiv/Wiederholung, aktiviertes V610-Genre, Playing, Low-Tier, Reduced Motion, vorhandene Lyric-Schutzlage und jede manuelle Tanz-/Kamera-/Licht-Priorität. Ein ungeprüfter Abschnitt oder Datenlücke bleibt exakt neutral. Bestehende Karaoke-Wortzeiten, GLB-Skelette, Lip-Sync, IK, 2–4-Performer-Interaktion und authored Licht-Blackouts werden nicht verändert.

**Nicht enthalten:** eine neue animierte 3D-Lyrics-Engine, ein zusätzlicher Kamerashot-Generator, neue GPU-Lichter oder Laser. Die behauptete Konzertwirkung ist *noch nicht* durch echte Spotify-/WebGL-Aufnahmen und GLB-Sichtprüfungen belegt. Ein Raspberry Pi wurde noch nicht gekauft; Hardwareauswahl folgt auf den geplanten universellen V618-Benchmark.

## Offline-Tests

```bash
npm run test:v611
npm run test:v611:types
npm run test:smoke:v611
npm run verify:v611
```

Die Tests belegen deterministische numerische Regiecues und das Quellcode-Wiring. Für künstlerische Abnahme sowie reale FPS, Browser-Kompatibilität und verifizierten Build sind zusätzliche Läufe mit installierten Abhängigkeiten und realer Bühne nötig.
