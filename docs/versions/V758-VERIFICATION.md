# V758 – Verifikation / Release-Kandidat

## Durchgeführte Prüfungen

- `node tests/v758-natural-dance-motion-regression.cjs`: **461.659 Prüfungen bestanden**, einschließlich sechs Kontaktzuständen, 20.000 deterministisch variierter Kombinationen und Quellverkabelung für Live-GLB, Vorschau und UI.
- `tsc -p tests/tsconfig.v758-core.json --noEmit`: **bestanden**; isolierte, strenge Typprüfung der neuen Logik mit Test-Fixture für das Rig.
- `npm run check:lockfile:v752`, `npm run test:v752`: **bestanden**, einschließlich absichtlich beschädigter Lockfile/CI-Fixtures.
- `npm run check:syntax`: **bestanden** (1.069 TS/TSX-Dateien).
- `npm run check:architecture`: **bestanden** (765 relevante Verweise, 10 Abschnitte).
- `npm run test:module-case`: **bestanden** (1.806 Quelldateien, keine betriebssystemabhängigen Groß-/Kleinschreibungs-Kollisionen).
- Versionstests `npm run test:v735` bis einschließlich `npm run test:v757`: **23/23 bestanden**.
- `npm run check:test-types`: **bestanden** (8 test-exklusive Typdeklarationen).
- `npm run verify:v758:static`: sämtliche bis zu `check:test-types` sichtbar durchlaufenen Stufen bestanden; **Gesamtausführung durch Umgebungs-Zeitlimit unterbrochen**. `check:test-types` separat erfolgreich geprüft.

## Produktionsverifikation

**Nicht freigegeben als fertiger Produktionsbuild:** `npm run check:dependencies` meldete **0/18 installierte Abhängigkeiten**. `npm run typecheck` scheiterte an fehlenden React-/Next.js-/Node-Typen. `npm run build` durchlief die V758-Vorprüfungen und stoppte mit `[BLOCKIERT]` bei derselben Abhängigkeitsprüfung, **bevor Next.js kompiliert wurde**. `npm run verify:v758:static` erreichte die abschließende Typ-Isolation, wurde aber zeitlich unterbrochen; dieser letzte Schritt bestand danach einzeln. Ein realer, sichtbarer GLB-/Foot-IK-Test steht ebenfalls aus. Die isolierten Prüfungen stellen keine vollständige Projekt-Typprüfung dar.

## Lokale Freigabereihenfolge

```powershell
npm ci
npm run verify:v758:static
npm run typecheck
npm run build
```

**Manueller Browser-Test:** GLB-Avatar öffnen und jeweils Hip_Sway/Hip_Circle/Hip_Bounce mit 1–4 Performern vergleichen. Standfuß bei bekannten Kontaktzuständen beobachten; manuelle Clips, Pause, Seeks und reduzierte Bewegung ausprobieren. Besonders auf Hüft-Hüpfen, Standbeinrutschen, übermäßige Körperdrehungen und zurückbleibende Pose bei Pausen achten. Ein visueller Test wurde hier nicht durchgeführt.
