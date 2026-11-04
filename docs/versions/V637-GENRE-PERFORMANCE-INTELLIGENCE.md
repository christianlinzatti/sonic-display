# V637 – Genre Performance Intelligence

Basis: V636, 27. Oktober 2026. **Implementiert im Runtimepfad, reale Browserprüfung offen.**

- **Gemeinsame Genre-Regie:** `genrePerformanceIntelligenceV637.ts` wird *nach* V610/V624/V625 in `genreConcertExperienceV610.ts` komponiert. Daher beziehen `VisualizerStage`, `StageCameraDirectorV289`, `DynamicStage` und `ConcertAtmosphereRendererV308` die gleiche Regie. Neue Hooks werden nicht erraten.
- **Deutschrap:** versebetonte, stabile Sängerporträts (kein neues Sängererkennungsmodul), ruhiger Hintergrund, stärkerer Lyrics-Schutz; bestätigte Hooks wechseln zwischen Ensemble und Solo/Spot-Fokus.
- **Hardstyle:** breitere Bühnenbilder, Beam-/Drop-Balance nur mit gemessenem Kick und Energie. **Hardtekk** bleibt als eigenständiger, etwas stärkerer Dance-/Sweep-Groove unterscheidbar.
- **Rock:** ruhigere geerdete Strophen und breite Ensemble-Hooks, keine erfundenen Instrumenten-Avatare. **Pop:** mehr Porträt-, Key-/Fill- und Spot-Akzente ohne dramatische Kamera-Schnitte.
- **Dramaturgie:** Wiederholungen, Build-Fortschritt und kurze Abschnitts-Fades sind deterministisch an bestätigte Act-Positionen gebunden. Pausen, geringe GPU-Qualitätsstufe, reduzierte Bewegung oder widersprüchliche Metadaten ergeben ausschließlich neutrale Zusatz-Cues.
- **Schutz:** Manuelles Tanzen, manuelle Kamera und Licht bleiben jeweils exakt neutral; vorhandene Budgets begrenzen die neuen Faktoren. Zusätzliche Dekorationen werden bei Lyrics-Schutz abgeschwächt. Keine neuen GLB-Animationen, Shader, Lichter, Netzwerkzugriffe oder Renderloops.

## Prüfung

```powershell
npm run test:v637
npm run test:v637:types
npm run test:smoke:v637
npm run verify:v637
npx tsc --noEmit
npm run build
```

Offline-Tests messen weder tatsächliche visuelle Qualität noch Performance mit echten GLB-Avataren oder Spotify-Audiodaten. Der vollständige Next.js-Produktionsbuild erfordert installierte Projektabhängigkeiten.
