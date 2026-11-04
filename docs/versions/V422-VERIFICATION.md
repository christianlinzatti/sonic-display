# V422 – Prüfbericht (20. Oktober 2026)

**Quelle:** Sonic Display V421 mit V422 Smart Articulation Assistant. Version `0.1.0-v422`.

## Erfolgreich in der Erstellungsumgebung

- `npm run test:v422`: deterministische und begrenzte Vorschläge, Track-/Wortidentität, Zeitstempelvalidierung, Schutz gespeicherter Edits, UI-Entwurf und kein automatisches Speichern.
- `npm run test:v421`: unveränderter V419/V420-A/B-Vergleich.
- Alle **19 direkten Versionsprüfungen V404–V422** erfolgreich.
- `tsc -p tests/tsconfig.v422-core.json` – isolierte strenge Prüfung der V422-Kernlogik und importierter Vocal-Module.
- `npm run check:syntax` – **571 TS/TSX-Dateien**, keine Parserfehler.
- `npm run test:imports` – **903 Projektdateien / 1.917 Imports** geprüft.
- `npm run test:module-case` – **903 Quelldateien**, keine Windows-Modulnamenkonflikte.
- Paketarchiv und ZIP-CRC werden separat vor Lieferung geprüft.

## Einschränkungen

- `node scripts/build-preflight.cjs` meldet fehlendes `package-lock.json` und 16 nicht installierte direkte npm-Pakete (1/17 verfügbar). Daher sind `npx tsc --noEmit`, `npm run build` und Browser-/Spotify-/GLB-End-to-End-Tests hier **nicht durchgeführt**. Das ist kein nachgewiesener Next.js-Build-Erfolg.
- Die neue V422-Analyse ist **heuristisch** und verwendet nur V419-Vorhersagen, nicht das tatsächliche Audiosignal oder gemessene visuelle Synchronität. Die Zahl zur Änderung je Stichprobenschritt ist **kein Qualitätswert**.

## Windows-Prüfung
```powershell
npm install
npm run test:v422
npx tsc --noEmit
npm run build
```
