# V1119 – Test- und Freigabenotizen

`npm run test:v1119` kompiliert die echten TypeScript-Module und prüft 256
Genre×Cap×Stil×Stärke-Kombinationen, Songgrenzen, Fokus, Kamera-Varianten,
Opt-in-Preset, Manipulationsschutz und ungültige Eingaben. Der isolierte
`npm run test:v1119:types` prüft die strikten Kern-Typen.

Die neuen `tests/e2e/ai-cinematic-camera-v1119.spec.cjs`-Tests laufen in der
Ubuntu-GitHub-Pipeline gegen einen echten `next start` auf Chromium Desktop und
Touch: Vorschau ohne Netzanfrage/Showplan-Schreiben sowie blockierte Live-Freigabe
bei ausgeschaltetem Show Director.

Außerdem laufen die KI-Regressionen V1106 bis V1118, die Source-Vorprüfung und
Import-/Layout-Checks. Der vollständige Node-24-Next-Build, Windows und
Playwright können erst nach dem Import über GitHub Actions abschließend als
bestanden bezeichnet werden.
