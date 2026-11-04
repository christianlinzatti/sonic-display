# V929 – Prüfbericht (04.11.2026)

**Version:** Sonic Display V929 – Smart Govee Troubleshooting Assistant, auf Basis V928.  
**Freigabestatus:** Neue Funktion und ältere Einzelregressionen **bestanden**; vollständiger TypeScript-Projektcheck und Next.js-Produktionsbuild **nicht verifiziert**.

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v929` | **PASS:** 66 neue Testgruppen, 5.000 deterministische Diagnosefälle |
| `npm run test:v929:types` | **PASS:** isolierter TypeScript-Kern |
| `npm run test:v929:ui-types` | **PASS:** isolierter TSX-Check (mit bestehenden Test-Stubs) |
| V909 bis V928, jeweils `npm run test:vNNN` | **PASS:** alle 20 Einzelregressionen, einschließlich V909 HTTP-/Auth-/CORS-/PNA-Bridge-Test |
| `npm run test:v908` | **PASS:** 966 Basisprüfungen |
| `npm run test:v907` | **PASS:** 1.096 Basisprüfungen |
| `npm run check:syntax` | **PASS:** 1.365 TS-/TSX-Dateien |
| `npm run check:architecture` | **PASS:** 1.103 Code-Referenzen |
| `npm run test:module-case` | **PASS:** 2.338 Moduldateien, keine Dateinamenskollisionen |
| `npm run typecheck` | **Nicht abgeschlossen:** nach 12 Sekunden mit Exit 124 beendet; kein erfolgreicher Gesamtcheck |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | **FAIL `ENOTCACHED`:** `zustand@5.0.16` ist nicht im lokalen Offline-Cache |
| `npm run build` | **Nicht verifiziert:** Dependencies unvollständig, vollständige lange historische Prebuild-Kette nicht als Ganzes durchlaufen |
| `npm run verify:v929:focused` | **Nicht als einzelner Komplettlauf ausgeführt:** die enthaltenen Versions-Funktionstests wurden einzeln geprüft |
| Echte Govee H6063, H610B, H61A2, H6051 / Raspberry Pi | **Nicht getestet** |
| ZIP-Prüfung | Im letzten Verpackungsschritt `ZipFile.testzip()`, Dateianzahl und SHA256 dokumentiert |

## Was geprüft wurde

- Alle vier Geräte-Modelle, unbekannte Modelle, ohne Bridge-Geräteregistrierung nicht vorgetäuschte Modellerkennung.
- Bridge „unchecked“, „offline“, UDP-Fehler, veraltete Statusdaten, fehlendes Token und manuell aktualisierbare Diagnose.
- Nicht ausgewählte, in der Bridge nicht registrierte, ohne frische UDP-Antwort gemeldete und länger als 90 Sekunden nicht bestätigte Leuchten.
- Bewusst ausgeschaltete Integration, ausgeschaltetes Auto-Sync, fehlende gespeicherte Show, fehlende V911-Voraussetzung für aktive Module.
- Fehlende Laufzeit-Telemetrie für Mikrofon und sichtbare LED-Wirkung – **keine** erfundenen Aussagen über den tatsächlichen Audioeingang oder physische Reaktionszeiten.
- Symptom-Checklisten für „Kein Licht“, „Kein Bass/Kick“, „Zeitversatz“ und „Hook/Drop-Show fehlt“.
- Sichere Diagnose-Codes im Export (ohne IP, Endpoint, Token, Namen, Raumkoordinaten, raw UDP errors). Tests nutzen absichtlich Geheimnis-Marker, die nicht im Export erscheinen dürfen.
- Kein neuer Timer, HTTP-/LAN-Sender, Browser-Storage-Writer oder automatische Änderungen an bestehenden Reglern; ausschließlich lokale React-Anzeige und Benutzeraktionen.
- Touchfreundliche Darstellung, Tastaturnavigation und funktionierende Links zu konkreten Einstellungs-Ankern.
- 5.000 Kombinationen aus Bridge-Zustand, ausgewählter Geräteliste, Mikrofon-/Show-Voraussetzungen, Zeitstempel und Fehlern; deterministische Prioritäten und eindeutige Diagnose-IDs.
- Unveränderte V908-Prebuild-Sicherheitsprüfung als erster Schritt; V928-Guard-Reihenfolge beibehalten.

## Risiken vor Deployment

1. Vollständiges `npm ci` **mit Zugriff auf das npm-Register** in GitHub Actions / Entwicklerumgebung durchführen.
2. `npm run typecheck` und `npm run build` ausführen; dabei auf Next.js-/React-Runtime und Import-/JSX-Probleme achten, die isolierte TypeScript-Stubs nicht abdecken.
3. V929-UI unter Pi-Chromium testen: LNA-Freigaben, Bridge-Authentifizierung, Anker-Navigation, Einträge/Filter, Diagnoseberichte.
4. Mit realen Govee-Modellen testen; diagnostizierter UDP-Sichtungstatus garantiert keinen sichtbaren Schaltvorgang.

**Hinweis zur Versionsnummer:** `package.json.version` bleibt wegen historischer Regex-Guards `0.1.0-v908`. V929 ist in Implementierung, Skripten, CI und Dokumentation gekennzeichnet.
