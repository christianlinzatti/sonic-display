# V916 – Prüfung und Freigabegrenzen

**Basis:** vollständig übernommenes Sonic Display V915, erweitert um V916 Smart Light Preset Library. Bestehende V909–V915-Logik und Raspberry-Pi-Bridge V910 unverändert. Der npm-Paketversionswert `0.1.0-v908` bleibt aus Kompatibilitätsgründen erhalten.

## Erfolgreich ausgeführt

| Befehl / Bereich | Ergebnis |
|---|---|
| `npm run test:v916` | **PASS**, 23 Testgruppen, 4.000 reproduzierbare Lichtberechnungen |
| `npm run test:v916:types` | **PASS**, strenger isolierter TypeScript-Kerncheck |
| `npm run test:v916:ui-types` | **PASS**, isolierter TSX-UI-Typecheck; nur lokale Teststubs, nicht produktive Types |
| `npm run verify:v916:focused` | **PASS**, vollständige fokussierte Govee-Regressionskette |
| `npm run test:v915` | **PASS**, 21 Testgruppen, 3.000 Lichtkombinationen |
| V914 | **PASS**, 18 Testgruppen, 4.000 Cue- und 4.000 Bewegungsprüfungen |
| V913 | **PASS**, 16 Testgruppen, 3.000 Farbkombinationen |
| V912 | **PASS**, 14 Testgruppen, 2.500 Lichtplanungen |
| V911 | **PASS**, 13 Testgruppen, 1.500 Genre-/Phasenkombinationen |
| V910 | **PASS**, sieben Pi-/Autostart-/Bridge-Gruppen |
| V909 | **PASS**, zehn LAN-Protokoll- und Bridge-Gruppen |
| V908 | **PASS**, 966 Prüfungen |
| V907 | **PASS**, 1.096 Prüfungen |
| `npm run check:syntax` | **PASS**, 1.339 TS/TSX-Dateien |
| `npm run check:architecture` | **PASS**, Architektur-Referenzen |

Getestet: Vorlagenvalidierung, Rollen, sechs Songphasen, sichere Helligkeiten/Übergänge, begrenzte RGB-Kanäle, Genres, eindeutige IDs, ausgewählte RFC1918-IP-Adressen, Zuweisung ohne Änderung fremder Leuchten, immutable Entwürfe, unveränderte V912-Speicherung, sichere Favoritenvalidierung und lokales Event, UI-Einbindung, keine Netzwerkanfragen oder Cloud-Schlüssel aus V916.

## Nicht als bestanden bewertet

- **`npm ci --offline --no-audit --no-fund` – FEHLGESCHLAGEN:** npm `ENOTCACHED` beim Abruf von `zustand-5.0.16.tgz`. Online-Installation war hier nicht verfügbar.
- **`npm run typecheck` – FEHLGESCHLAGEN:** Ohne `node_modules` fehlen React-, Next.js- und Node-Typen. Das erzeugt zahlreiche Import-/JSX-Fehler, aus denen keine vollständige Produktions-Typfreigabe abgeleitet werden darf. Die neuen Core- und isolierten UI-Checks sind davon unabhängig erfolgreich.
- **`npm run build` – NICHT ERFOLGREICH VERIFIZIERT:** Ohne die erforderliche Abhängigkeitsinstallation kann kein verlässlicher Next.js-Produktionsbuild bestätigt werden. Der Build ist in GitHub CI nach `npm ci` zu prüfen.
- **Physische Tests – NICHT DURCHGEFÜHRT:** Kein Raspberry Pi, keine echten Govee H6063/H610B/H61A2/H6051. UDP-Latenz, WLAN-Reconnect und Chromium-Local-Network-Berechtigung sind hardwareabhängig.

## Build-Integration

- Die CI-Workflow-Datei `.github/workflows/v832-continuous-validation.yml` enthält jetzt einen **V916-Test-, Core- und UI-Typecheck-Schritt**, vor dem vollständigen Next.js-Build-Gate für Linux und Windows.
- Der bestehende `prebuild` beginnt weiter mit dem verpflichtenden V908-Regressionstest, danach V916 inklusive Typechecks, anschließend V915 und der bisherigen Kette. Kein früherer Qualitätsschritt wurde entfernt.
- Test-Stubs liegen ausschließlich unter `tests/stubs` und werden nicht in produktiven `tsconfig.json`-Dateien geladen.
- Die ZIP-Datei muss mit vollständigem `zipfile.testzip()` ohne Fehler geprüft werden; generierte `tsconfig.tsbuildinfo` wird nicht ausgeliefert.
