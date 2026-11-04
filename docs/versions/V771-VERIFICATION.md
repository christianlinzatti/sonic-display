# V771 – Verifikation (31.10.2026)

- PASS `npm run test:v771` (Mehrblockauswertung mit Testfällen für stabile Ressourcen, einzelne Ausreißer, anhaltendes Geometrie-/Textur-/Shader- und Heap-Wachstum, Cachebudget, unvollständige Daten, Kontextverlust).
- PASS `npm run verify:v771:static` einschließlich V765–V770-Tests, Syntax- und Architekturprüfung, Lockfile und Modul-Casing.
- PASS `node --check` für beide neuen V771-Skripte.
- NICHT VERIFIZIERT: realer Chromium-WebGL-Langzeittest. Browser ist installiert, aber kein lokaler Sonic-Display-Server verfügbar. Der Runner meldet korrekt `blocked` statt eines fiktiven Ergebnisses.
- BLOCKIERT: vollständiger TypeScript-Check wegen fehlender npm-Abhängigkeiten und Typdeklarationen (u. a. `next`, `react`, `@types/node`). Der Produktionsbuild hat nach bestandenen V763/V764- und weiteren Build-Gate-Regressionen die explizite `check:dependencies`-Prüfung erreicht, die 0/18 installierte Pakete meldet. Kein erfolgreicher Produktionsbuild behauptet.
- Behoben: ältere V763-/V764-Versionsprüfungen akzeptieren nun numerisch alle Releases ab V763 bzw. V764 (also auch V771).

Ein unauffälliges Ergebnis bedeutet nicht die Abwesenheit sämtlicher Speicherlecks.
