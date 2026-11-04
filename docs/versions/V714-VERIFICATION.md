# V714 – Release-Prüfbericht

**Release**: `0.1.0-v714` · **Funktion**: Last.fm Music Taste Evolution.

## Erfolgreiche Prüfungen

- `npm run test:v714`: **PASS**, 83 Testgruppen; 12.000 absichtlich fehlerhafte Datensätze abgewiesen; Datensätze über der historischen 8.000er-Grenze berücksichtigt.
- `npm run test:v714:types`: **PASS**, isolierter TypeScript-Kern ohne produktive Dummydeklarationen.
- `npm run test:v714:ui-types`: **PASS**, isolierte JSX-Prüfung mit `tests/stubs/v701-react-jsx.d.ts`; diese Stub-Typen sind nur Teil der Testconfig, nicht der Produktionsconfig.
- `npm run test:quick`: **Exit-Code 0**. Versionsprüfungen V669–V714 und die zugehörigen Test-Typchecks sowie Syntax-/Architektur-/Dateinamen-/Typisolation-/Spotify-Sicherheitstests wurden erfolgreich ausgeführt. V714-Code ist damit syntaktisch und strukturell getestet.

## Nicht bestandene/noch offene Prüfungen

- `npm run build`: **BLOCKIERT / Exit-Code 1** vor der Next.js-Kompilierung durch `check:dependencies`: **0/17** npm-Abhängigkeiten installiert, **kein `package-lock.json`**. Kein erfolgreicher Next.js-Produktionsbuild bestätigt.
- `npm run typecheck`: **Exit-Code 2**, erwartet wegen fehlender Next.js-/React-/Node-/Three-Typdefinitionen und Bibliotheks-Module. Der komplette produktive TypeScript-Check ist **nicht bestanden**, auch wenn die isolierten V714-Typechecks erfolgreich waren.
- Echte Chromium-/Touch-/Last.fm-Liveprüfung und langfristige IndexedDB-Migration auf einem realen Gerät: **nicht ausgeführt**. Für einen vollständigen Release sind ein `npm install` (anschließend versioniertes Lockfile), `npm run typecheck`, `npm run build` und echte Browser-Abnahme mit Last.fm nötig.

## Sicherheits- und fachliche Hinweise

- Jahresdaten sind **erfasste Scrobbles**, keine Hörminuten und keine garantierte vollständige Historie.
- „Erstmals“ und „Comeback“ gelten ausschließlich relativ zum lokalen Archiv; fehlende Jahre beweisen keine Hörpause.
- Keine Genres aus Künstlernamen geraten; keine zusätzlichen Scrobbles gesendet.
- Noch offene `npm`-Installations- und Browserabhängigkeiten werden nicht als bestanden ausgegeben.
