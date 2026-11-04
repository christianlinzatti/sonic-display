# V424 – Prüfprotokoll

Stand: 21. Oktober 2026

- `npm run test:v424`: **PASS**. Geometrische Normalisierung (relative und absolute Morphs), ungültige und nicht vorhandene Morph-Positionsdaten, Multiple-Morph-Kanäle, sichere Intensitätsgrenzen, unveränderte manuelle Einstellungen, explizite Überschreibung, persistente Avatar-Profile und Live-Bindung.
- `tsc -p tests/tsconfig.v424-core.json`: **PASS**, isolierte strenge Typprüfung der neuen Core-Logik plus V370/V383 und zugehöriger Typen mit deklarierten Test-Stubs.
- `npm run check:syntax`: **PASS**, 574 TS/TSX-Quelldateien.
- `npm run test:imports`: **PASS**, 1.932 Imports aus 909 Projektdateien.
- `npm run test:module-case`: **PASS**, 909 Module ohne Windows-Kollisionen.
- `test:v404` bis `test:v424`: **PASS**, 21/21 direkte Regressionen.
- Historische Testauswahl: `test:v367`, `v368`, `v370`, `v383`, `v384`, `v385`, `v389`, `v390`, `v392`, `v393`, `v400`, `v403`, `camera-hold` und `multi-avatar`: **PASS**, 14/14 nach Versionsfreigabe im V370-Test. Die fachlichen Prüfungen wurden nicht entschärft.
- Preflight-Dependency-Check: **BLOCKED**, keine `package-lock.json`, nur 1 von 17 Paketen in dieser Umgebung vorhanden. Daher kein erfolgreich bestätigter projektweiter `npx tsc --noEmit` oder `npm run build`.
- Release-ZIP: separat auf Integrität, Dateinamen und enthaltene Versionsnummer geprüft.

**Grenze:** Morph-Verformungsstärke ist ein geometrischer Proxy, kein messbarer Lip-Sync-/Avatar-Qualitätsscore. Der Effekt muss mit realen importierten GLB-Modellen visuell überprüft werden.
