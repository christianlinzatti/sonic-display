# V646 – Verifikation (27.10.2026)

## Erfolgreich

- `npm run test:v646`: **71 Regressionstest-Gruppen**, **12.000 simulierte Wiedergabezeitpunkte**, PASS. Enthält Songidentität, Actgrenzen, unverifizierte Lücken, V600/V604-Abgleich, V354-Manual-Override, V496-Sängerzeiten, Trackwechsel, JSON-Export, nicht-mutierendes Runtime-Wiring und Grenzen.
- `npm run test:v646:types`: **TypeScript-Kernprüfung des reinen Planers**, PASS (keine Aussage über vollständigen TSX-/Next-Build).
- `npm run verify:v646`: **Exitcode 0**, inklusive V645, V644, V643, V642, V641, V640 … V635, weiterer Vocal-/Bühnen-Regressionen sowie Syntax und Architektur.
- `npm run test:v354`: PASS. Alte, nicht mehr zutreffende Quelltextannahmen aus V354 über den finalen Kamera-Guard und eine feste Versions-Whitelist wurden auf die inzwischen bestehende V633-Kameraarchitektur und Release-Nummer-Prüfung aktualisiert; die fachlichen V354-Laufzeittests blieben unverändert.
- `npm run test:v600`, `npm run test:v604`, `npm run test:v629`, `npm run test:v641`, `npm run test:v642`, `npm run test:v645`, `npm run test:v572`: PASS.
- `npm run check:syntax`: **875 TS/TSX-Quelldateien**, PASS.
- `npm run check:architecture`: **525 Quellverweise**, PASS.
- Zusätzlich `npm run test:v622`, `test:v621`, `test:v620`, `test:v619`, `test:v618`, `test:v617`, `test:v616`: alle PASS.
- Die alten V546-/V572-Buildskript-Referenzen wurden von `verify:v645` auf `verify:v646` aktualisiert, ohne Lip-Sync-Code zu ändern.

## Eingeschränkt bzw. offen

- `npm run test:smoke:v646`: Die **rekursive Gesamtkette lief bis V623 grün** und wurde dann vom maximalen Ausführungsfenster unterbrochen. Anschließend wurden die fehlenden Tests V622–V616 separat erfolgreich nachgeholt. **Kein neuer ununterbrochener Komplettlauf belegt.**
- `npm run build`: in der aktuellen Umgebung nach erfolgreichem `prebuild` mit **`next: not found`** beendet; kein vollständiger Next.js-Produktionsbuild. React/Next/Three-Abhängigkeiten fehlen lokal im Container.
- `npx tsc --noEmit` für die vollständige Anwendung und echte Browser-/GLB-/FPS-Tests sind offen.
- V646 ist eine **schreibgeschützte Planungsansicht**: Kamera-/Licht-/Formationseinträge sind kein nachgewiesener tatsächlicher Framewechsel, keine Musiker- oder Sängererkennung und kein Qualitätsurteil.
- Keine Audiodaten oder Lyrics-Texte im JSON; Export enthält die Song-ID, daher lokal behandeln.

## Windows-Abnahme

```powershell
npm install
npm run test:v646
npm run test:v646:types
npm run verify:v646
npm run test:smoke:v646
npx tsc --noEmit
npm run build
npm run dev
```

Zum Sichttest Avatar-Bühne öffnen, **Regie-Zeitplan** anklicken; mit validierter V318-Strukturanalyse Songabschnitte sehen, optional V354-Manuellclips und V496-Sängerzeitmarken einschalten, Track wechseln, Pausen und Lücken prüfen, JSON exportieren. Mit vier GLB-Avataren und Lyrics weiterhin vollständige V641-/V592-Browserprüfung durchführen.
