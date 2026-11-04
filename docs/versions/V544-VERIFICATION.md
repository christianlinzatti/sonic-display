# V544 – Prüfbericht (25. Oktober 2026)

## Geprüft
- `npm run test:v544`: **bestanden**, 192 deterministische Variationen plus Grenzfälle; keine simulierten Werte als echte Performance ausgegeben.
- `npm run test:v544:types`: **bestanden** (isolierte TypeScript-Kernprüfung der reinen Datenlogik).
- `npm run verify:v544`: **bestanden**, einschließlich V539–V543, V544 und Syntax/Architektur.
- Alle Funktionstests und isolierten TS-Kernprüfungen **V522–V543**: **22/22 + 22/22 bestanden**; fünf im Test verwendete Original-GLBs vorhanden, keine Stand-ins bei V543.
- `npm run check:syntax`: **bestanden**, 760 TS/TSX-Dateien.
- `npm run check:architecture`: **bestanden**.

## Nicht verifiziert
- **Vollständiger Next.js-Produktionsbuild**: `npm run build` führt zuerst einen äußerst langen historischen `prebuild`-Testlauf aus, der unter dem Laufzeitlimit unterbrochen wurde. `node_modules` enthält weder Next.js/React/Three.js noch die entsprechenden installierten Pakete. `npm ci --offline` ist darüber hinaus nicht möglich, da das Quellpaket **keine package-lock.json** enthält. Keine SWC/React/Three-Produktionskompilierung bestätigt.
- **Browser- und Raspberry-Pi-Sichtprüfung**: Hier kein laufender WebGL-Renderer oder Gerätezugriff. Keine gemessenen FPS auf einem Pi, keine Screenshot-Pixelanalyse.
- Die neuen UI-Komponenten sind Syntax-/Struktur-geprüft, aber kein vollständiger React/Next-Typen- oder WebGL-Integrationstest wurde ausgeführt.

## Für die lokale Prüfung
1. `npm install` (erzeugt bei Bedarf `package-lock.json`) im entpackten Projekt ausführen.
2. `npm run verify:v544` und `npm run typecheck` ausführen.
3. `npm run build` ausführen; die lange vordefinierte `prebuild`-Testsuite wird absichtlich nicht übersprungen.
4. `npm run dev -- --hostname 127.0.0.1`, Konzertbühne mit GLB-Dateien aktivieren, QA öffnen und A/B-Proben aus echtem Browserbetrieb vergleichen.
5. Auf dem Ziel-Raspberry-Pi drei V543-Szenario-Benchmarks und manuelle Gesicht/Tanz/Lyrics-Prüfung durchführen.
