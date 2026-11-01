# Sonic Display V828 – Concert Experience 4.0: Verifikation

**Stand:** V828 ist ein integrierter Quellcode- und Teststand auf Basis von V827, **keine Produktionsfreigabe**.

## Implementiert

- `concertExperienceDirectorV828.ts`: deterministische, auf bestätigte V604-/V761-Songabschnitte begrenzte Showmotive für Intro, Verse, Hook, Build, Drop, Break und Finale. Vier stabile, je Song und Akt unterschiedliche Signaturen, bewusst ruhigere Verse und Breaks, Steigerung im Build und stärkerer Drop-/Finale-Akzent. Kein erratener Beat/Drop, keine neue Kameraentscheidung, keine Timerschleife.
- `DynamicStage.tsx`: Der V828-Kompositionsfaktor wird auf die fünf vorhandenen Effektspuren Laser, LED, Partikel, Schaum und Übergänge angewandt; das bestehende V825-Geräte-/Framebudget folgt **danach** und bleibt begrenzend. V823 manuell gesetzte Spuren behalten Vorrang. Die bestehende LED-Wand wechselt nur bei Auto-Modus den Look, vorhandene Bühnenarchitektur und Hintergrund-/Bodenfarbe werden behutsam animiert. Manuelle Lichtregie, V810-Freigabe, Blackouts, Pausen, niedrige Performanceklasse, Gesichtsfokus, Lyrics, reduzierte Bewegung sind weiterhin bindend.
- `ConcertMomentCrownV828.tsx`: neue seitliche Konzert-Lichtkrone aus **einem einzigen InstancedMesh** mit maximal zwölf Segmenten über/hinter den seitlichen Bühnenflügeln, ohne Schatten oder neue Lichtquellen. Nur bestätigte Builds, Hooks, Drops und Finalen, niemals bei manuell festgelegter LED-Timeline, LED-Abschaltung oder ausgeschaltetem Modul. V825 reduziert tatsächliche Instanzen und Opazität unter Last.
- `concertFxStudioV810.ts` und `ConcertFxStudioPanelV810.tsx`: gespeicherte Optionen für Ein/Aus, Stil Cinematic/Dynamic/Festival, Showintensität und Lichtkrone; auswählbare Demo-Vorschau. Einstellungen verwenden vorhandene Backup-/Import-Verwaltung.
- Release-Prüfungen `test:v828`, `test:v828:types`, `verify:fx-v828` und V828-Präfix in `check:fast`, `check:release`, `build:preflight`.

## Bestätigte Prüfungen

- `npm run test:v828`: **PASS, 64 Testgruppen** (Songauthentizität, Genreprofile, Songabschnitt, Zeitgrenzen, 4 Signaturen, Schutzzonen, manuelle FX, LED-Wahl, Lichtkrone, Instanzen und Konfiguration).
- `npm run test:v828:types`: **PASS**, isolierte strenge TypeScript-Prüfung der V810-/V823-/V824-/V828-Kernlogik.
- `node tests/check-source-syntax.cjs`: **PASS, 2388 TS-/TSX-Quelldateien/Importbindungen**.
- `node tests/check-architecture.cjs`: **PASS, 908 aktuelle Codeverweise**.
- Historische `npm run test:v800` bis `npm run test:v827`: **PASS, alle 28 Testsuiten**. Lediglich deren feste Versions-Regexe wurden erweitert; fachliche Assertions blieben unverändert.
- Windows-/Linux-konfliktfreie Dateinamen (Casefold-Prüfung), übereinstimmende Version in `package.json`/`package-lock.json`, ZIP-Test, flache Projektwurzel.

## Nicht abgeschlossen / Einschränkungen

- **Vollständiger TypeScript-Check:** `npm run typecheck` wurde ausgeführt, konnte innerhalb des Laufzeitfensters nicht abgeschlossen werden. Keine generelle Kompilierung bestätigt.
- **Next.js-Produktionsbuild:** nicht durchführbar in der Umgebung: `node_modules/.bin/next` beziehungsweise die Projektabhängigkeiten fehlen. **Keine Produktionsfreigabe.**
- **GPU-/Browser-Qualitätsabnahme:** Nicht durchgeführt. Der 1-/2-/4-Avatar-Benchmark aus V827 erfordert reale GLBs bei gleicher Zielauflösung und Effektlast auf dem Zielrechner.
- **Kamera:** V828 verändert bestehende Kamerapfade nicht direkt. Die Verbesserungen betreffen die Bühneninszenierung während bereits bestätigter Szenen.
- **Lichtkrone:** Maximal ein zusätzlicher Instanced-Mesh-Draw-Call bei aktivem Effekt. V828 ersetzt nicht die GPU-Profilierung. Die alte V827-Qualitätsautomatik bleibt bestehen.

## Freigabe auf dem Zielrechner

```powershell
npm ci
npm run test:v828
npm run test:v828:types
npm run typecheck
npm run build
```

Anschließend visuelle Abnahme bei Deutschrap, Hardtekk und Deutschrock (Intro/Verse/Hook/Build/Drop/Finale), mit 1, 2 und 4 tatsächlich geladenen GLB-Avataren sowie manueller LED-Timeline, Lyrics, Kamera und Schaumkanone testen. Die Wirkung der V828-Lichtkrone auf die tatsächlichen Draw Calls und FPS im V826-Dashboard messen.
