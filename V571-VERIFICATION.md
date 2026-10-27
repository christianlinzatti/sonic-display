# V571 – tatsächliche Prüfergebnisse (25.10.2026)

## Erfolgreich

- `npm run test:v571`: **46** V571 Build-/Browser-Harness-Regressionstests bestanden, einschließlich Regression für alte Screenshots bei Browserfehlern.
- `npm run test:smoke:v571`: V571 + V570, 792 TS/TSX-Quelldateien auf Syntax und Architektur mit 348 Codeverweisen geprüft – **erfolgreich**.
- `npm run verify:v571`: bei der abschließenden V571-Funktionsprüfung **vor der zusätzlichen Screenshot-Aufräumregel** erfolgreich, inklusive sämtlicher gezielter Regressionen **V554–V571** und deren typgeprüften Konfigurationen. Die danach ergänzte isolierte Screenshot-Aufräumregel wurde in den **46 neuen** V571-Tests und dem erneuten Smoke-Lauf erfolgreich geprüft. Keine GLB-/Spotify-/Hardware-Sichtprüfung wurde daraus abgeleitet.
- `node scripts/v571-build-readiness.cjs`: erkennt Node v22.16.0, 0 von 17 direkt installierten npm-Abhängigkeiten, kein `package-lock.json` und meldet tatsächlichen Next-Build als `not-run`.
- Die neue GitHub Actions Matrix für Windows und Linux ist als CI-Workflow definiert, hier nicht ausgeführt.

## Blockiert / nicht bestanden

- `npm run typecheck`: **Exit 2**, zahlreiche fehlende React-/Next-/Node-Typdefinitionen (Projekt-Abhängigkeiten fehlen). Die vollständige App ist damit **nicht typecheck-validiert**.
- `npm run build`: **Exit 127** nach **erfolgreichem schnellen prebuild**, dann `sh: 1: next: not found` (Next.js nicht installiert). **Kein erfolgreicher Produktionsbuild**.
- `npm view next@15.5.27 version`: npm-Registry in dieser Umgebung nicht erreichbar. Deshalb wurde absichtlich **keine erfundene oder aus Vermutungen erzeugte Lockdatei** beigelegt.
- `node scripts/v571-browser-smoke.cjs --self-test ...`: Browser versuchte Navigation auf lokale Testfixture, aber die administrativ gesetzte Chromium-Richtlinie blockiert URLs (`URLBlocklist: ["*"]`). **Exit 1**, JSON `status: blocked`, **kein PNG**. Die Chrome-Policy wurde nicht umgangen. Dies ist kein App-Sichttest.
- **Offen:** echte Chromium-Sichtung der laufenden Next.js-App mit geladenem GLB und WebGL, Spotify-Authentifizierung/Zeitsynchronisation, visuelle Duett-/Tanz-/Lyrics-Bewertung sowie FPS-/RAM-/Thermal-Langzeitmessung auf Raspberry-Pi-Hardware.

## Auf lokalem Windows-PC freigeben

Die genauen, reproduzierbaren Anweisungen und die Trennung von Smoke- und Release-Tests stehen in [`V571-PRODUCTION-AND-BROWSER-VALIDATION.md`](V571-PRODUCTION-AND-BROWSER-VALIDATION.md). **Zuerst** echte Lockdatei erzeugen/committen und Abhängigkeiten mit `npm ci` installieren, **dann** `npm run typecheck && npm run build` und Browser-/Raspberry-Pi-Sichttests ausführen. Erst danach darf dieses Paket als produktionsgeprüft gelten.
