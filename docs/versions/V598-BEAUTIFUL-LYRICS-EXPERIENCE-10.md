# V598 – Beautiful Lyrics Experience 10.0

**Basis:** V597. **Datum:** 26.10.2026. **Ziel:** sichtbarer, ruhigerer Songtext auf dem 10-Zoll-Display und im bestehenden 3D-Bühnen-Overlay; keine Neuerfindung von Lyrics, Musik- oder Sänger-Daten.

## Eingebaute Komponenten

- `components/visualizer/beautifulLyricsExperienceV598.ts`: reine deterministische Layout- und Akzentplanung; unterscheidet kurze, dichte und sehr dichte Zeilen. Bei 3–4 Avataren im Immersiv-Modus wird die Breite begrenzt, während die bestehende Bühne und manuelle Platzierung unangetastet bleiben.
- `components/KineticLyrics.tsx`: verwendet denselben V598-Plan für die normale Songansicht und das immersive DOM-Overlay. **Nur verifizierte Wort-Timestamps** werden für einen zusätzlich sanft ein-/ausklingenden Wortglanz genutzt; Karaoke-Füllung, Wortreihenfolge und `aria` bleiben unverändert.
- `components/visualizer/VisualizerStage.tsx`: ein **bereits vorhandener** Bühnenabschnitt `hook` darf die Hook-Hervorhebung auslösen. Die automatische Bühnensektion ist ein Regiehinweis, **kein Beweis einer von Spotify gelieferten musikalischen Form**. Ohne Hook-Cue wird nichts erfunden.
- `app/globals.css`: dezenter typografischer Fokus, gestützter Kontrast, flache Hook-Unterstreichung und Breitenanpassung bei bis zu 1024 px. Nutzt **keinen zusätzlichen Canvas, Timer, Audio-Listener oder GPU-Textmesh**.

## Schutzgrenzen

1. Keine neuen Wort-, Silben-, Phonem- oder Sängerzeitstempel. Die bisherige Wortfüllung (`--word-fill`, V477/V541/V549) gehört den geprüften Lyrics-Daten.
2. Die vorhandenen Lyrics-Einstellungen für Größe, Farbe, Stil, Fokus und Position bleiben wirksam; `lyricsAnimationIntensity=0`, Pause und Reduced Motion deaktivieren die zusätzlichen animierten Akzente.
3. Bereits vorhandene V541-Kontrastplatten werden nicht abgeschwächt; besonders lange Zeilen erhalten engere Umbruchgrenzen, ohne Worttext zu kürzen.
4. Keine Änderung an GLB-Animationen, Tanz, Kamera, Foot IK, Rap-Lip-Sync, Sprecherzuordnung oder Spotify-API.
5. In der echten 3D-Troika-Wortmesh-Variante bleiben die bisherigen V541/V549-Renderregeln bestehen: Die neuen V598-Stile betreffen **DOM-Lyrics und das immersive DOM-Overlay**, nicht die separaten GPU-Textmeshes.

## Testen

```bash
npm run test:v598
npm run test:v598:types
npm run test:smoke:v598
npm run verify:v598
```

Die V598-Regression prüft Berechnungsgrenzen, Pause/Reduced Motion, Hook-Cues, fehlerhafte und fehlende Wort-Timestamps, seek-sichere Animation, Originaldaten-Unveränderlichkeit, 20.000 simulierte Wortpositionen sowie die Quellcode-Verknüpfung mit der echten `KineticLyrics`-Ansicht.

**Nicht hier durchgeführt:** Browser-/WebGL-Abnahme, echter GLB-Showvergleich, vollständiger `next build`, Messung mit Spotify sowie Raspberry-Pi-Hardware. Für diese Nachweise sind installierte Abhängigkeiten, reale Medien und Laufzeitzugriff erforderlich. Offline-Regressionen belegen keine optische Schönheits- oder FPS-Steigerung.
