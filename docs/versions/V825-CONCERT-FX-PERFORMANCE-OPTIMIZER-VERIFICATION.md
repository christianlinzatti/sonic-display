# V825 — Concert FX Performance Optimizer: Integrations-/Prüfbericht

**Version:** `0.1.0-v825`. Basis V824. **Nicht produktiv freigegeben:** vollständiger TypeScript-Check und `next build` sind in dieser Umgebung nicht erfolgreich abgeschlossen.

## Implementierung

- `concertFxPerformanceOptimizerV825.ts`: pure Berechnung von adaptiven, priorisierten Multiplikatoren für 10 vorhandene FX-Gruppen (Laser, LED, Partikel, Schaum, Szenenübergänge, Publikum, Spektralvisuals, Atmosphäre, Kinetic, Vocal).
- Beobachtet die tatsächlichen Zeitabstände zwischen R3F-Frames über die **vorhandene** `DynamicStage`-Schleife. Das sind **keine GPU-Timings**, sondern ein Frame-Cadence-Surrogat. Kein behauptetes Hardware-Profiling; nur ein heuristisches relatives Kostenmodell.
- Erst nach anhaltender Verlangsamung wird gedrosselt; Einzelruckler und Tab-Aufwachspitzen ignoriert; Qualitätswiederherstellung bewusst langsam.
- Schaltet keine FX selbstständig ein. V810-Musik- und Blackout-Gates, V823-Mute-/Boost-Cues, Lyrics, Kamera/Vocal-Fokus und Gerätekategorie bleiben Autoritäten. Bei extremer Last können auch manuelle Booster herabgesetzt werden, um flüssige Wiedergabe zu priorisieren.
- In den instanzierten Renderern für V815, V816, V817 und V818 werden echte aktive Instanz-Zahlen reduziert, nicht nur die Opazität; V811/V812/V819 sowie V814/V820 werden in bestehenden Materialien abgeschwächt. Keine neuen WebGL-Meshes/Materialien.
- Konfigurierbar im Concert FX Studio: Ein/Aus, **Ausgewogen**, **FPS**, **Qualität** sowie Empfindlichkeit (0–100). Die angezeigte Last-Vorschau ist ausdrücklich simuliert, keine reale GPU-Messung.
- Normalisierung via `UiPreferencesContext.tsx` und `concertFxStudioV810.ts` sorgt für rückwärtskompatible gespeicherte Defaults.

## Tatsächlich bestandene Tests

- `node tests/v825-concert-fx-performance-regression.cjs`: **50 Testgruppen bestanden**.
- `tsc -p tests/tsconfig.v825-core.json --noEmit`: **bestanden**. Isolierte reine TypeScript-Kernmodule.
- `node tests/check-source-syntax.cjs`: **1188 TS-/TSX-Quelldateien erfolgreich geprüft**.
- `node tests/check-architecture.cjs`: **PASS V825**.
- Historische Regressionen: `test:v800` bis `test:v824` **bestanden**, V814 gesondert erfolgreich beendet. Ältere V800–V808-Tests erhielten nur die fehlende Paket-Versionsfreigabe für V825, ohne fachliche Prüfbedingungen zu lockern.
- `package.json` und `package-lock.json` konsistent `0.1.0-v825`.
- `test:v825` und `test:v825:types` am Anfang des normalen Preflight-/Fast-/Release-Ablaufs eingebunden.

## Noch offen und wichtig

- `npm run typecheck` hat keinen abschließenden Resultcode geliefert. **Nicht bestanden behaupten**; auf lokaler Hardware unbedingt komplett ausführen.
- `next build` konnte hier nicht ausgeführt werden, da `node_modules/.bin/next` **nicht installiert** ist. Deshalb kein zertifizierter Produktionsbuild.
- Visuelle WebGL- und Langzeitmessungen mit mehreren echten GLB-Avataren und hoher FX-Last (inkl. Schaumkanone, Crowd, LED, Lyrics) **nicht ausgeführt**.
- Frame-Abstände sind nur näherungsweise aussagekräftig; Browser-Hintergrundtasks, CPU und Rendering-Workload können Einfluss nehmen. Keine GPU-Benchmark-Ergebnisse oder garantierte FPS ableiten.

## Lokale Freigabeprüfung

```powershell
npm ci
npm run test:v825
npm run test:v825:types
npm run typecheck
npm run build
```

Danach echte GPU-Profiling-Sessions: 1/2/4 Performer, verschiedene Genres, 10-Zoll-Zielauflösung, CPU-/GPU-Belastung, Low/Medium/High, Wechsel zwischen manuellen Cues, Pause, Blackout, Reduced Motion, Tab-Wakeup sowie mehrstündiger Playback-Dauer.
