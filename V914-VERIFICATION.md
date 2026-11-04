# V914 – Prüfbericht

- Ausgangsbasis: vollständiges V913-ZIP (4.216 Dateien, ZIP-Integrität OK).
- Neu: V914-Kernmodul, sechs Kurven, zwei sanfte Bewegungen, Govee-Show-Cue-Felder, Editor-Grafik, Live-Integration, Altformat-/V913-Harmonie-Erhalt, fokussierte Regression, isolierter TS-Kerncheck, CI-Gate, Dokumentation.
- **Bestanden:** `npm run test:v914` – 18 Gruppen mit je 4.000 parametrisierten Cue-/Bewegungsberechnungen.
- **Bestanden:** `npm run test:v914:types` – isolierter strenger TypeScript-Core.
- **Bestanden:** `npm run verify:v914:focused` – enthält V913/V912/V911/V910/V909, V908 (966 Checks), V907 (1.096 Checks), Syntax (1.335 TS/TSX-Dateien) und Architekturprüfung.
- **Nicht verifiziert:** vollständiger TypeScript-/Next.js-Produktionsbuild. `npm ci --offline --no-audit --no-fund --ignore-scripts` fehlgeschlagen: npm-Paket `zustand@5.0.16` nicht offline verfügbar. Keine `node_modules` vorhanden.
- **Nicht verifiziert:** reale Govee-H6063/H610B/H61A2/H6051-Hardware und Raspberry Pi. V910-Bridge bleibt unverändert.
- Version in `package.json` bleibt wegen historischer Versions-Assertions `0.1.0-v908`; V914 ist der aktuelle Feature-Stand.
