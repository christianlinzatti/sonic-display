# Sonic Display V846 — Papier-Luftschlangen

## Enthalten
- Neuer Effekt **Papier-Luftschlangen** als begrenzter GPU-Instancing-Effekt
- Neue Optionen in `ConcertFxSettingsV810`
- Planung über `festivalPaperStreamersPlannerV846.ts`
- Rendering über `PaperStreamersV846.tsx`
- Integration in `DynamicStage.tsx`
- UI-Steuerung und Vorschau in `ConcertFxStudioPanelV810.tsx`
- Neue Regressionstests `tests/v846-paper-streamers-regression.cjs`
- Neues Typprüfungsprofil `tests/tsconfig.v846-core.json`

## Durchgeführte Prüfungen
- `node tests/v846-paper-streamers-regression.cjs` ✅
- `node tests/v845-bubbles-full-stage-flash-regression.cjs` ✅
- `node tests/v844-festival-special-fx-regression.cjs` ✅
- `npx tsc -p tests/tsconfig.v846-core.json --noEmit` ✅
- `npx tsc -p tests/tsconfig.v845-core.json --noEmit` ✅

## Nicht vollständig geprüft
- Vollständiger Projekt-TypeScript-Check: **nicht ausgeführt**
- Next.js-Produktionsbuild: **nicht ausgeführt**
- Reale Browser-/GPU-Showprüfung: **nicht ausgeführt**

## Sicherheits- und Designgrenzen
- Keine ungebremste Partikelsimulation
- Keine Zufallsquellen, Timer oder ungebundenen Burst-Emitter
- CO₂ hat Vorrang; Konfetti/Funken dämpfen Luftschlangen nur
- Reduzierte Bewegung, manuelle Lichtregie, Blackout und Low-Tier blockieren den Effekt
