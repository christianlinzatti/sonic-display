# V401 – Verifikation

- Basisversion: Sonic Display V400, **1.240** Dateien vollständig erhalten.
- V401: **4** neue Dateien einschließlich dieses Berichts; Code, Test, Dokumentation und Bericht.
- Offline-Regression: **143/143 Prüfbefehle erfolgreich**, inklusive neuer zeitlicher Vocal-Kameratests.
- Syntaxprüfung: **540 TS/TSX-Dateien bestanden**.
- Zusätzlich geprüft: automatische Kameraprioritäten, sichtbare Avatare, Lyrics-Schutz, Pause und Reduced Motion; erhaltene Daten und Suite-Funktionalität.
- **Build nicht verifiziert**: `build:preflight` meldet fehlende `package-lock.json` und 16 fehlende npm-Abhängigkeiten (1 von 17 vorhanden).
- **Keine** echte TypeScript-Typprüfung, Next.js-Produktionsbuild- oder Hardware-Browsermessung durchgeführt.

Für Windows: `npm install` und danach `npm run verify` ausführen. Bei Fehlern die exakten Compiler-Ausgaben zur Verfügung stellen.
