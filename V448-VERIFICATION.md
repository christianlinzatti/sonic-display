# V448 Verification

**Basis:** V447 – Smart Genius Song Insights. `package.json`-Version `0.1.0-v448`.

## PASS (ohne zusätzliche npm-Installation)

- `npm run test:v448` – Bildquellen-Whitelist, Bild-Fallback, Credit-Chips, beide Richtungen von Sample-/Remix-Beziehungen, V447-Quiet-Window, alte Ansicht bei deaktiviertem V448, Reduced Motion, sicherer Trackwechsel und externe Links.
- `npm run verify:v448` – enthält V448 und die komplette bisherige `verify:v447`-Kette: V423–V426, V429–V447, Multi-Motion-Bibliothek V190, intelligente Tanzfolgen V242, Syntaxprüfung, Import- und Module-Case-Prüfung.
- `tsc -p tests/tsconfig.v448-core.json --noEmit` – strenge isolierte Typprüfung der V447/V448-Service-Kerne.
- Syntax: **613 TS/TSX**.
- Importintegrität: **971 Projektdateien / 2136 Imports**.

## Nicht als bestanden behauptet

- `npm run typecheck` für das gesamte Projekt: **nicht ausführbar ohne npm-Abhängigkeiten**; es fehlen in dieser Umgebung React, Next.js, Node-Typen und weitere deklarierte Pakete. Die resultierenden Missing-Module-Fehler erlauben keine fundierte Aussage über die vollständige Projekt-Typprüfung.
- `npm run build` / WebGL-Browser- und echter Genius-/Spotify-API-Test wurden ohne `node_modules`, Token und laufende Browserumgebung **nicht** durchgeführt.

Bei Nutzung lokal zuerst `npm install`, danach `npm run verify:v448`, `npm run typecheck` und `npm run build` aufrufen.
