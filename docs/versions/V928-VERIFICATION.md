# V928 – Prüfbericht (04.11.2026)

**Funktion:** Room Light Performance Dashboard auf Basis von Sonic Display V927. **Status:** Funktions- und isolierte TypeScript-Prüfungen bestanden; vollständiger Projekt-Typecheck / Next.js-Produktionsbuild **nicht** erfolgreich verifiziert.

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v928` | **PASS** – 58 Testgruppen und **5.000** deterministische Bridge-/Gerätestatuszustände |
| `npm run test:v928:types` | **PASS** – isolierter TypeScript-Kern |
| `npm run test:v928:ui-types` | **PASS** – isolierter TSX-Typecheck mit vorhandenen Test-Stubs |
| V909–V927 | **PASS** – alle 19 jeweiligen Funktionstests einzeln, einschließlich V909 HTTP-/Auth-/CORS-/PNA-Bridge-Test |
| `npm run test:v908` | **PASS** – 966 Prüfungen |
| `npm run test:v907` | **PASS** – 1.096 Prüfungen |
| `npm run check:syntax` | **PASS** – 1.363 TS/TSX-Dateien |
| `npm run check:architecture` | **PASS** – 1.103 Code-Referenzen |
| `npm run test:module-case` | **PASS** – 2.335 Moduldateien, keine case-insensitive TS/TSX-Kollisionen |
| Vollständiger Projekt-Typecheck | **Nicht abgeschlossen:** nach 24 Sekunden mit Exit 124 abgebrochen; keine vollständige TS-Verifikation |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | **FAIL `ENOTCACHED`** – `zustand@5.0.16` im Offline-Cache nicht vorhanden |
| Next.js-Produktionsbuild (`npm run build`) | **Nicht verifiziert** – Projektabhängigkeiten unvollständig, gesamte historische Prebuild-Kette nicht als Ganzes durchlaufen |
| Raspberry Pi / Govee H6063, H610B, H61A2, H6051 | **Nicht getestet** – tatsächliche Hardware/Antwortlatenzen weiterhin unbekannt |
| `npm run verify:v928:focused` | **Nicht als ungeteilter Gesamtlauf ausgeführt** – relevante Funktionstests und isolierte Gates einzeln erfolgreich |
| ZIP-Integrität | Nach Verpackung separat per `ZipFile.testzip()` geprüft |

## Testabdeckung und Einschränkungen

- Status bei noch nicht geprüfter Bridge, Verbindungsverlust, gemeldetem UDP-Fehler und über **30 Sekunden** alter vollständiger Geräteabfrage.
- **90 Sekunden** Zeitfenster für `lastSeen` plus explizites `online`-Signal; gespeicherte IPs, manuell hinzugefügte Geräte ohne UDP-Nachweis und veraltete Snapshots werden **nicht** als erreichbar angezeigt.
- Ausgewählte, unregistrierte oder nicht kürzlich gesehene Leuchten, private IPv4-Filterung, Duplikate und Null-/Zukunftszeitpunkte.
- Unterscheidung zwischen „Modul eingeschaltet“ und „notwendige Konfiguration vorhanden“; abweichend davon keine Behauptung, dass aktuell Musik läuft, Mikrofon aktiv ist oder ein LED-Befehl tatsächlich umgesetzt wurde.
- Gespeicherte V912-Show-ID und erforderliche V911-Lichtregie, V915-Gruppendimmung, V926-Raumposition und optischer V927-Offset (separat vom HTTP-/Bridge-Roundtrip).
- **Datenschutz:** Generierter Diagnosebericht enthält keine Passwörter/Tokens, Bridge-Adressen, IPs, individuellen Gerätenamen, Gruppennamen oder Raumkoordinaten.
- **Keine zusätzlichen Netzwerk-Timer, `fetch`-Aufrufe, LAN-Sender, Mikrofon- oder Licht-/Power-Kommandos.** Nur der bestehende V909-Refresh und 12-Sekunden-Poll des Panels bleiben aktiv.
- Der alte V927-Prebuild-Guard wurde so angepasst, dass die neue V928-Prüfung nach dem weiterhin zuerst laufenden V908-Guard eingebaut werden kann. Anschließend bestanden alle Einzelregressionen erneut.

## Freigabeempfehlung

V928 ist als Quellcode-Funktionstest **erfolgreich**, aber **nicht produktionsbuild-verifiziert**. Vor Deployment auf Vercel sowie vor Raspberry-Pi-Hardwarebetrieb müssen vollständige npm-Installation, Projekt-Typecheck, Next.js-Produktionsbuild und die gesamte CI erfolgreich durchlaufen. Auf dem Pi zusätzlich Bridge-/Geräteanzeigen anhand echter UDP-Antworten gegenprüfen. Die neue Diagnose misst **keine** optische LED-Reaktionszeit und kann keine synchronisierte Hardwarewirkung garantieren.

**Build-Sicherheit:** `prebuild` beginnt weiterhin mit `npm run test:v908`, gefolgt von den V928-Prüfungen und den bisherigen Tests. `.github/workflows/v832-continuous-validation.yml` führt die neuen V928-Gates aus. Historische `package.json.version` bleibt aus Regression-Kompatibilitätsgründen bei `0.1.0-v908`.
