# V927 – Prüfbericht (04.11.2026)

**Funktion:** Intelligent Room Light Calibration auf Basis der vollständigen V926-Version. **Ergebnis:** Isolierte V927-Kern-/UI-Checks, V907/V908, Govee V909–V926 und Source-Checks bestanden; vollständiger Next.js-Produktionsbuild und optische Hardwaremessung offen.

| Prüfung | Resultat |
|---|---|
| `npm run test:v927` | PASS – **61 Testgruppen** sowie **5.000** deterministische Zeit-/Wellenzustände |
| `npm run test:v927:types` | PASS – isolierter TypeScript-Kern |
| `npm run test:v927:ui-types` | PASS – isolierter UI-Typecheck mit vorhandenen Tests-Stubs |
| V909 bis V926 | PASS – alle 18 jeweiligen Funktionstestskripte einzeln ausgeführt, inklusive V909 HTTP-Bridge-Test |
| `npm run test:v908` | PASS – **966 Prüfungen** |
| `npm run test:v907` | PASS – **1.096 Prüfungen** |
| `npm run check:syntax` | PASS – **1.361 TS-/TSX-Quelldateien** |
| `npm run check:architecture` | PASS – **1.103 Code-Referenzen** |
| `npm run test:module-case` | PASS – **2.332 Dateipfade**, keine problematischen case-insensitive Modulkonflikte |
| `npm run typecheck` | **Nicht abgeschlossen:** nach 24 Sekunden mit Exit 124 abgebrochen; keine erfolgreiche vollständige TS-Verifikation |
| `npm ci --offline --ignore-scripts --no-audit --no-fund` | **Fehlgeschlagen (`ENOTCACHED`):** Paket `zustand@5.0.16` nicht im lokalen Cache |
| Vollständiger `npm run build` / Next.js-Produktionsbuild | **Nicht verifiziert**, npm-Pakete fehlen und die gesamte historische Prebuild-Kette wurde nicht abschließend ausgeführt |
| Raspberry Pi / H6063 / H610B / H61A2 / H6051 | **Nicht getestet**; tatsächliche visuelle Verzögerungen unbekannt |
| Vollständiges ZIP | Wird nach der abschließenden Verpackung separat überprüft |

## Getestete Sicherheitsbedingungen

- V927 ist **standardmäßig ausgeschaltet**, gespeicherte Einzel-Offsets standardmäßig **0 ms**. Deaktivieren verändert bestehende Lichtwellen nicht.
- Zulässige manuelle Verzögerungen **0 bis 500 ms**, globale Vorlaufgrenze **0 bis 500 ms**. Falsche/öffentlich erreichbare IPs, NaN, Infinity, ungültige Daten und beschädigter localStorage werden sanitisiert.
- `/status` wird nur **auf ausdrücklichen UI-Klick** und bei deaktivierter Musik-Auto-Synchronisierung dreimal gelesen. Die Bridge wartet ca. **350 ms** und bestätigt nicht die sichtbare Lampenreaktion; gespeicherter Roundtrip beeinflusst den Vorlauf **niemals**.
- Keine zusätzlichen Hintergrund-Timer, LAN-Sender, Geräte-Ein/Aus-/Strobe-Befehle, automatischen MIDI-/Mikrofon-Impulse oder RGBIC-Segmentkommandos in V927. Die vorhandene Rate und V915-Gruppendimmung bleiben bestehen.
- Neue vorgezogene Festival-Lookberechnung bleibt innerhalb derselben **bestätigten, beschrifteten V318-Songphase**. Es gibt keine künstliche Drop-Vorhersage.
- Nur bewusst gespeicherte Einstellungen wirken auf den Live-Pfad; Vorschau und Diagnose verändern vorhandene Shows nicht.
- Schema und Daten bleiben browserlokal und enthalten **keine** Passwörter oder Bridge-Tokens.
- Bestehende V920-/V923-/V924-/V926-Textregressionen wurden an die zusätzliche V927-Phase bzw. Abhängigkeitsliste angepasst. Alle Funktionsregressionen wurden danach erneut ausgeführt.

## Offene Verifikation

1. Nach regulärem `npm ci` mit Netzwerkzugang den vollständigen TypeScript-Check und Next.js-Produktionsbuild in der **Linux-/Windows-CI** erfolgreich ausführen.
2. Auf dem Raspberry Pi die V910-Bridge und Chromium samt Local-Network-Berechtigung prüfen.
3. Mit echten Govee-Leuchten und einer Zeitlupenaufnahme die sichtbar beobachtete Reaktionszeit pro Leuchte erfassen und die manuellen Offsets kalibrieren. Die UI-Diagnose misst nur die Bridge-Statusrunde, nicht die physische LED-Latenz.
4. Für Hardtekk/Hardstyle separat beurteilen, wie gut die langsame LAN-Kommandorate zur jeweiligen Musik passt. Es wird **keine** Framegenauigkeit behauptet.

**Build-Sicherheit:** `prebuild` beginnt weiterhin mit dem V908-Guard, gefolgt von V927 und früheren Tests. Die CI-Schritte sind ergänzt. Die historische `package.json.version` verbleibt absichtlich auf `0.1.0-v908`.
