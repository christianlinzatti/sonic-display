# V764 – Verifikation und Freigabestatus

## Erfolgreich geprüft

- `npm run test:v764`: **36.113 Assertions**; Szenen-Quellenprüfung, Entwurf und Änderung von Cues, expliziter Import, Überschneidungsschutz, Wiederholungen, Pausen, Track-ID-Abgrenzung, Bibliotheksgrenze, Legacy-V354-Backup, korrupte lokale Daten, Quota-Fehler und opt-in Songwechsel.
- `npm run test:v764:types`: isolierte strenge TypeScript-Prüfung der V764-Regellogik und V354-Typen.
- `npm run test:v764:ui-types`: isolierte strenge React/UI-TypeScript-Prüfung (nur test-only Stubs).
- **29/29 Versionstests V735 bis V763** sowie aktuelle Syntax-, Architektur-, Lockfile- und Case-Collision-Prüfung.
- Zusätzliche erfolgreiche Einzeltests: `test:v354`, `test:v657`, `test:v657:types`, `test:v658`, `test:v658:types`, `test:v660` und `test:v660:types`. Der V354-Kamerastrukturtest wurde auf den tatsächlich seit V747 vorhandenen, gleichwertigen automatischen Kameraschutz aktualisiert.
- Windows-/Linux-konsistente Dateinamen, Release-Skripte und CI-Gate.

## Noch NICHT freigegeben

- `npm ci --offline --ignore-scripts` ist mit **ENOTCACHED** bei `zustand-5.0.16.tgz` fehlgeschlagen. Der vollständige `npm run typecheck` wurde ausgeführt und scheiterte an fehlenden React-/Next.js-/Node-Typen. `npm run build` wurde ausgeführt: Die Vorprüfung stoppte bei **0/18 installierten direkten npm-Paketen**, vor der eigentlichen Next.js-Kompilierung. Kein behaupteter Produktionsbuild.
- Browserbasierte visuelle Abnahme mit echten GLB-Modellen und Last-/Langzeittest.

## Lokal prüfen

```powershell
npm ci
npm run verify:v764:static
npm run typecheck
npm run build
```

V764 ist bis zur erfolgreichen Vollprüfung ein **getesteter Quellcode-Buildkandidat**, kein produktionsverifizierter Release.
