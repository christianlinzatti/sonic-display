# V816 — Reactive Particle Studio (31.10.2026)

## Implementiert

- Grundlage: Originalprojekt **V815 Virtual Concert Crowd**. Bestehende V810–V815-Effekte, Bühnenregie, Künstlerpositionen, Lyrics und Kameras werden weiterverwendet.
- `components/visualizer/reactiveParticlePlannerV816.ts`: reiner, deterministischer Partikel-Cue mit überprüften V810-Konzertabschnitten und den bereits vorhandenen Audio-Features (Energie, Kick, Bass, Höhen). Keine unbestätigten Peaks, keine erfundenen Zeitmarken. Intro/Verse schwach, Break inaktiv, Drop und Finale stärker. Konfetti ausschließlich Hook/Finale.
- `components/visualizer/ReactiveParticleStudioV816.tsx`: vier unabhängige, instanzierte Renderflächen für seitliche Funken, digitale Splitter, fallendes Konfetti und Energieringe. Maximale Anzahl: 96/72/72/8 Instanzen; höchstens 4 Draw Calls für die neue FX-Gruppe. Updates der Instanzmatrizen maximal 20-mal pro Sekunde. Keine zusätzlichen Lichtquellen, Partikel-Physik, Shadow-Maps, Timer oder zufällige Allokationen im Renderloop. Die mittlere Sichtachse bleibt frei.
- `components/visualizer/DynamicStage.tsx`: nutzt exakt die V810-Cue-Autorität (verifizierter Songabschnitt, Titel-ID, Pausen, authored light tracks, Blackouts, Reduced Motion, Low-Tier und vorhandene Geräte-Budgetierung). Teilt den adaptiven V640-LED-Dekorbudget-Faktor mit dem Publikum.
- `components/visualizer/concertFxStudioV810.ts` + `ConcertFxStudioV810.tsx`: separat steuerbare Funken, Splitter, Konfetti, Energieringe, Intensität, Dichte und Preview. Drei Qualitätsstufen Performance, Balanced und Ultra. Ältere Backups bekommen sanft normalisierte Defaults.

## Verifizierte Prüfungen

- **PASS:** `npm run test:v816` (22 Prüffälle: Aktivierung, Sicherheit, Sound, Songabschnitte, Qualität, Genre, Rendering-Integration).
- **PASS:** `npm run test:v816:types`, `npm run test:v815:types`, `npm run test:v810:types` (isolierte TypeScript-Prüfungen der reinen Planer; keine vollständige UI-Typprüfung).
- **PASS:** `npm run test:v800` bis `npm run test:v815` (17 Versionsreihen inklusive V816, alle bestanden). Historische Tests V800–V808 hatten feste Versionsobergrenzen bis V815; diese wurden auf V816 erweitert. Fachliche Assertions wurden nicht geändert.
- **PASS:** `npm run check:syntax` (1171 TypeScript-/TSX-Dateien) und `npm run check:architecture` (868 Architektur-Verweise).

## Noch offen / keine Produktivfreigabe

- Vollständiges `npm run typecheck`: gestartet, aber in der verfügbaren Ausführungszeit nicht beendet, also **nicht verifiziert**.
- Vollständiges `npm run build`: gestartet; `prebuild` führt eine lange historische `check:fast`-Kette aus. Der eigentliche `next build` wurde in der Ausführungszeit nicht erreicht. **Nicht verifiziert**.
- Komplettes `node_modules` fehlt in dieser Ausführungsumgebung. Deshalb keine vollständige produktive UI-Typisierung und kein realer WebGL-/GPU-Test mit GLB-Avataren.
- Die Display-Leistung auf Raspberry Pi oder Mini-PC ist noch nicht gemessen. V816 ist implementiert und funktional/strukturell geprüft, **nicht produktiv freigegeben**.

## Lokale Abnahme

```sh
npm ci
npm run test:v816
npm run test:v816:types
npm run test:v815
npm run test:v810
npm run check:syntax
npm run check:architecture
npm run typecheck
npm run build
```

In der lokalen 3D-Vorschau: prüfe auf Deutschrap-Hooks, Hardtekk-Drops und Deutschrock-Finale (mehrere GLB-Avatare), Textlesbarkeit, Lip-Sync-Sichtbarkeit, Pause, manuellen Blackout und alle drei Qualitätsstufen. Vor einer Freigabe GPU-Draw-Calls, FPS, Renderer-Speicher und lange Songwechsel messen.
