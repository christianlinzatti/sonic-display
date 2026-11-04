# V420 – Verifikation (20. Oktober 2026)

**Basis:** vollständiger V419-Projektbaum mit V420-Visual-Syllable-Articulation-Editor und allen bisherigen Fixes.

## Erfolgreich in dieser Umgebung

- V420-Keyframe-Regressionsprüfung, einschließlich geschützter B/P/M-Verschlüsse, rein visueller Editierung, Wortidentität/Track-ID, Seek/Pause/Mehr-Avatar-Rollen, Datenvalidierung und Opt-in.
- V419-Regressionsprüfung weiter bestanden.
- Alle 17 direkten V404–V420-Tests einzeln bestanden.
- 18 weitere ausgewählte historische Vocal-/Kamera-/Multi-Avatar-Tests einzeln bestanden (V356, V359, V366, V372, V373, V374, V383, V384, V385, V390, V392, V393, V397, V399, V400, V401, V402, V403).
- Strenger TypeScript-Kerncheck: `tsc -p tests/tsconfig.v420-core.json` bestanden (ohne npm-Pakete).
- `npm run check:syntax`: 567 TS/TSX-Dateien bestanden.
- `npm run test:imports`: 897 Projektdateien / 1903 Imports bestanden.
- `npm run test:module-case`: 897 Quelldateien, keine Windows-Kollision.
- `npm run build:preflight`: alle enthaltenen Regressionen erfolgreich, jedoch zuletzt bei der Prüfung von npm-Abhängigkeiten blockiert.

## Nicht hier ausführbar

- Vollständiges `npx tsc --noEmit` und `npm run build`: kein installierter `node_modules`-Baum; `package-lock.json` fehlt ebenfalls in der gelieferten Basisversion. 16 direkte npm-Pakete sind in der Umgebung nicht installiert.
- End-to-End-Browserprüfung mit echtem Spotify-Zugriff und eigenen GLB-Avataren wurde nicht durchgeführt.

## Windows-Validierung

```powershell
npm install
npx tsc --noEmit
npm run build
```

`npm install` erstellt bei fehlender Lockdatei eine neue `package-lock.json`. Für reproduzierbare CI-Builds diese anschließend in Versionskontrolle aufnehmen.
