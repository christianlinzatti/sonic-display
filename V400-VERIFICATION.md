# V400 – Verifikation

- Version: `0.1.0-v400`
- Projektbasis: V399, 1235 Quelldateien aus dem letzten Release erhalten.
- V400 neue Dateien: 5 einschließlich dieses Berichts.
- Offline-Regression: **142/142 Prüfbefehle erfolgreich** (inklusive V400-Funktionsprüfung).
- TypeScript-/TSX-Syntax: **539 Dateien erfolgreich geprüft**.
- Basis-ZIP: CRC geprüft, alle vorherigen Dateien vorhanden.
- Vollständiger Next.js-Produktionsbuild und Typecheck: **nicht ausgeführt / nicht verifiziert**.
- `scripts/build-preflight.cjs`: Fehlt `package-lock.json`; 16 von 17 npm-Abhängigkeiten fehlen.
- Reale Browser-/WebGL-Laufzeittests auf Zielhardware: **nicht durchgeführt**.

Windows-Test nach dem Entpacken:

```powershell
npm install
npm run verify
```

Die Tests prüfen Datenvalidierung, songbezogene Speicherung, Sprünge, Pause, Reduced Motion, Sichtbarkeit und Integration. Sie ersetzen keine TypeScript-Typprüfung mit allen React/Next.js-Modulen.
