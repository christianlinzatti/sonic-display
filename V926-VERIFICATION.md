# V926 – Prüfbericht (04.11.2026)

**Stand:** V926 Smart Spatial Light Director auf V925. Der neue Funktionskern und UI-Typecheck, die V909–V925-Regressionen und die Source-Checks bestehen. **Vollständiger Projekt-Typecheck und Next.js-Produktionsbuild sind nicht verifiziert.**

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v926` | PASS – **59 Testgruppen** plus **5.000** deterministische Raum-/Lichtzustände |
| `npm run test:v926:types` | PASS – isolierter TypeScript-Kern |
| `npm run test:v926:ui-types` | PASS – isolierter TypeScript-UI-Check |
| V909–V925 – **einzeln gestartet** | PASS – alle jeweiligen Funktions- und Regressionstests einschließlich V909 lokaler HTTP-Bridge ohne reale Leuchte |
| `npm run test:v908` | PASS – 966 Prüfungen |
| `npm run test:v907` | PASS – 1.096 Prüfungen |
| `npm run check:syntax` | PASS – 1.359 TS/TSX-Dateien |
| `npm run check:architecture` | PASS – 1.103 aktuelle Code-Referenzen |
| Dateinamen-Groß-/Kleinschreibungsprüfung | PASS – keine casefold-Kollisionen unter den geprüften Projektdateien |
| ZIP-Integrität | Bei finaler Verpackung separat geprüft |
| `npm run typecheck` | Nicht bestanden/verifiziert – nach 24 Sekunden ohne Testergebnis zeitlich abgebrochen (`timeout` Exit 124) |
| `npm ci --offline --ignore-scripts` | Nicht erfolgreich – `zustand@5.0.16` ist nicht im lokalen npm-Cache (`ENOTCACHED`) |
| `npm run build` / vollständiger Next.js-Build | Nicht erfolgreich nachgewiesen (fehlende Pakete; vollständige Prebuild-Kette nicht abschließend gestartet) |
| Raspberry Pi / H6063 / H610B / H61A2 / H6051 | Nicht an realer Hardware getestet |

Die auf V926 angepassten älteren **V920/V923/V924/V925-Text-Assertions** akzeptieren eine neue, optionale Spatial-Ebene; ihre Funktionstests/Property-Sampling wurden nach der Anpassung vollständig erneut ausgeführt.

## Relevante Sicherheitsregeln

- **Opt-in:** `enabled:false`, keine automatischen Gerätebefehle aus dem Raumplan oder der Vorschau. Nur ausdrücklich gespeicherte Raumpositionen beeinflussen den bestehenden Live-Sender.
- **Geometrie:** fünfstellige Beispiel-IPs der Tests sind synthetische private LAN-Adressen, keine echten Nutzer-IPs. Relative X-/Y-Koordinaten; stabile Sortierung auch bei gleichen Werten; sechs Richtungen; max. 32 Geräte.
- **Alte Beleuchtung bleibt bei deaktivierter V926 unverändert:** `spatialIndexV926` liefert dann direkt den alten Listenindex. Kein zusätzliches HTTP/UDP- oder Timer-Verhalten.
- **Helligkeit:** V926 verstärkt maximal +8 Punkte vor V915-Gruppendimmung; max. Farbmischung 30%, V911-Glättung bleibt aktiv. Keine Power-, Blackout-, Strobe- oder LED-Segmentkommandos.
- **Original-Gruppenpriorität:** V915-Dimmer wird **zuletzt** auf die zusammengesetzte V926-Lichtdarstellung angewendet; bei `unison` derselbe `sourceIp`.
- **Audio-Integrität:** V926 selbst erzeugt keine Beat-/Drop-Detektion und kann ohne echte Mikrofonimpulse keinen V922-Bassschock auslösen. V925 Drop-Finale bleibt an bestätigte Songmarker gebunden.
- **Privatsphäre:** Gerätestandort nur relativ; validierte lokale IPv4-Adressen können im Browserprofil gespeichert werden. Es werden **keine** Bridge-Tokens, GPS-Daten oder Cloud-Daten im neuen Store abgelegt.

## Offene Punkte

Vollständige Tests der importierten React-/Next-/Three-Projekttypen, Next.js-Produktion mit `npm ci` und echte Messung der Govee-LAN-Latenzen bleiben offen. Eine musikalisch plausible räumliche Reihenfolge ist **keine** nachgewiesene frame- oder millisekundengenaue Synchronisierung mit den virtuellen R3F-Effekten.

Die historische `package.json.version` bleibt für bestehende Regressionen `0.1.0-v908` – der Funktionsstand ist V926. Der CI-Workflow prüft V926 vor V925; im `prebuild` bleibt der bestehende V908-Sicherheitscheck **zuerst**.
