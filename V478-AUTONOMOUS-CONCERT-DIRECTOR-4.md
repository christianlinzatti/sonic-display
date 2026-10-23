# Sonic Display V478 – Autonomous Concert Director 4.0

Basis: V477 – Beautiful Lyrics 4.0. Diese Version ergänzt die bereits vorhandene visuelle Konzertregie – **keinen eigenen Playback-Timer, keine neuen 3D-Lichtquellen und keine Änderung an automatischer Sängeridentifikation**.

## Umsetzung

- `services/show/autonomousConcertDirectorV478.ts` ist ein reiner, deterministischer Coordinator *hinter* `automaticConcertExperienceV464.ts`.
- `components/visualizer/VisualizerStage.tsx` führt V464 und V478 nacheinander aus; der bestehende `ultimateShowV456`/`featureDirectionV460`-Datenpfad bleibt unverändert. V454 erhält die modifizierten Kamera-Cues weiterhin über seine **bestehende** Prop-Übergabe.
- Die Bilderzählung folgt der **geschätzten visuellen** Songdramaturgie: eröffnende und abschließende Ensembleaufnahmen, Verse als Portrait, wiederkehrende Hooks und visuelle Antworten als Ensemble. Der zugrundeliegende V446-Plan kann aus verlässlichen Lyrics-Zeitstempeln oder als Tempo-Fallback entstehen: Deshalb sind diese Szenen *Regievorschläge*, keine analysierten Live-Sängerwechsel.
- Die bestehende reaktive Bühnenbeleuchtung nutzt dieselbe visualisierte Szene als dezenten Multiplikator (innerhalb der bestehenden V456-Budget-Grenzen 0,90–1,15). Die Regie aktiviert keine bislang abgeschaltete Beleuchtung und verändert keine manuellen Lichtszenen oder Blackouts.
- Bei Lyrics-Fokus wird **kein neuer Kamera-Cue** ausgegeben; reduzierter Bewegung, Pause, niedriger Qualität, manueller Kamera und manueller Vocal-Steuerung gebührt Vorrang. V454 hält Aufnahmen und schützt die Kamera beim Seek/Track-Wechsel. Die komplette GLB-/Rap-/Lip-Sync-Pipeline bleibt unangetastet.
- `data-v478-shot` ist ein rein diagnostisches Bühnenattribut (`none`/`portrait`/`ensemble`/`lyrics`). Keine zusätzlichen DOM-Elemente oder 3D-Ressourcen.

## Prüfung

```powershell
npm run test:v478
npm run test:v478:types
npm run check:syntax
npm run check:architecture
npm run build
```

`npm run build` startet zunächst die umfangreiche `build:preflight`-Regression einschließlich des neuen V478-Tests, danach TypeScript und Next.js. Die isolierte V478-Kernprüfung kommt ohne React/Next.js-Module aus. **Der reale Next.js-Produktions-Build muss mit installierten npm-Abhängigkeiten geprüft werden.**

### Garantierte Grenzen

1. Manuell gesetzte Kamera-Keyframes, Sprecherrollen, Motion-Clips und Lichtszenen werden nicht ersetzt.
2. Credits, Genius-Metadaten und visuelle Replies sind **keine** echten Sprecherzeitstempel.
3. Keine Random-Werte, Zeitgeber, Hintergrundprozesse, Web-Abfragen oder zusätzlichen GPU-Lichter.
4. FPS, tatsächliche Kamerakomposition und optischer Eindruck werden erst durch den Lauf auf einem realen Gerät bestätigt.
