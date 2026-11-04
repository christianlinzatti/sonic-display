# V610 – Genre-Specific Concert Experience 6.0

**Basis:** Sonic Display V609 · **Datum:** 26.10.2026 · **Status:** Live-Runtime-Integration und Offline-Regression; echter Browser-/GLB-Test offen.

## Echte Änderungen

`components/visualizer/genreConcertExperienceV610.ts` erzeugt aus dem **verifizierten V604/V600-Songakt** mit passender Spotify-Track-ID, Dauer, Abschnitt und Zeitposition einen genreabhängigen, begrenzten Regiecuesatz. Nur ausdrücklich bekannte Deutschrap-, Hardstyle- und Hardtekk-Genres erhalten zusätzliche Akzente. Das System erkennt **keine** neuen Beats, Songabschnitte, Vocals, Sänger oder Lyrics-Zeitmarken.

- **Deutschrap:** In verifizierten Rap-Strophen werden bestehende Gesichtsausleuchtung und Lyrics-Lesbarkeit bevorzugt; Kamera-Mikrobewegung und Haze bleiben ruhiger. Wiederholte Hooks wechseln begrenzt zwischen einem breiteren Gruppenbild und kleineren Spotlightakzenten.
- **Hardstyle:** Zusätzliche, sehr kleine Beam-/Spotlight-/Tanz-/Kameraakzente in bestätigten Builds, Hooks und **nur gemessen unterstützten** Drops (Kick >= 0,17 und Energie >= 0,34). Kein erfundener Drop, kein Stroboskop.
- **Hardtekk:** Ähnliche Regeln wie Hardstyle, aber etwas flottere vorhandene Kamerabewegung und automatischer Tanz; keine künstlich erhöhten Audiozeitstempel oder Clipgeschwindigkeiten.

**Tatsächlich verwendete Runtime:** `VisualizerStage.tsx` übernimmt V610 nur für automatisch generierte Bewegungsenergie und Avatar-Intensität, niemals eine manuell gespeicherte Choreografie. `StageCameraDirectorV289.tsx` setzt minimale Drift/FOV-Akzente an der einzigen bestehenden automatischen Kamera **vor** dem V351-Lyrics-Bildrahmen-Schutz; manuelle Keyframes/harte Schnitte bleiben vorrangig. `DynamicStage.tsx` und `ConcertAtmosphereRendererV308.tsx` modulieren konservativ bestehende Key-/Fill-/Beam-/Haze-/Spot-/Sweep-Werte nach V608 und V609, innerhalb der bestehenden Lichtbudgets. Ein zusätzliches Renderobjekt, Shader, Laser, Netzwerkaufruf, Beat-Timer oder Frame-Callback entsteht nicht.

## Prioritäten / Grenzen

Live bestätigte Songabschnitte, Genre-Identität und zeitgleicher Track sind notwendig. Fehlende oder widersprüchliche Daten -> exakte neutrale Gains. Die drei Regielanes bleiben separat geschützt: `manualDance`, `manualCamera`, `manualLighting`; Pausen, Reduced Motion und Low Tier deaktivieren zusätzliche V610-Effekte. Hohe Lyrics-Dichte reduziert die zusätzliche Energie deutlich, ohne die tatsächlichen Karaoke-Wortzeiten anzutasten. Vorhandene V352-Genre-Fusion, bestehende Genre-Licht-Presets und V609-Übergänge bleiben erhalten; V610 implementiert **keine neue fiktive Fusion-Erkennung**.

## Validierung

```bash
npm run test:v610
npm run test:v610:types
npm run test:smoke:v610
npm run verify:v610
```

Die reinen Offline-Pläne und Quellcode-Wiring-Tests ersetzen **keinen** echten Next.js-Build, keine GLB/WebGL-Sichtprüfung, keine Spotify-Live-Verifikation und keine FPS-Messung. Ein Raspberry Pi ist noch nicht angeschafft; für eine Kaufentscheidung ist stattdessen der geplante plattformübergreifende V618-Benchmark sinnvoll.
