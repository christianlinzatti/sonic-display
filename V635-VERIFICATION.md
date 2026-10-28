# V635 – Verifikation, 27. Oktober 2026

**Ergebnis:** Alle ausgeführten Offline-Regressionen und gezielten TypeScript-Kerntests bestanden.

- `npm run test:v635`: **54 Testgruppen, 12.000 simulierte Bühnenzustände** mit bestätigtem V604/V622-Songakt. Prüft Genre-Motive, Hook-Wiederholungen, Blackouts, Low-Tier, Lyrics, vier Avatare, ungültige Track-/Cue-Evidenz, Randübergänge, Begrenzungen, DOM-unabhängige Shader-/Runtime-Verkabelung.
- `npm run test:v635:types`: bestanden; prüft die V635- und V622-Core-Typen.
- `npm run test:smoke:v635`: bestanden; umschließt V634 bis V616 plus Syntax und Architektur.
- `npm run verify:v635`: bestanden; zusätzliche V601, V608, V609, V610, V621, V622, V624, V625, V628, V629, V633, V634, Syntax und Architektur.
- Getrennt bestanden: `test:stage-lighting`, `test:v308`, `test:v351`, `test:v555`, `test:v551`, `test:v542`, `test:v552`, `test:v602`, `test:v626`, `test:v627`.
- `check:syntax`: **859 TS/TSX-Dateien**. `check:architecture`: **517 geprüfte Referenzen, 10 Sektionen**.

**Nicht ausgeführt:** `npx tsc --noEmit` für das gesamte Next.js-Projekt, `npm run build` (Produktionsbuild erfordert installierte Next.js-/React-/Three-Abhängigkeiten) und echter GLB-/Browser-/10-Zoll-Sichttest. Die statischen Tests belegen nicht, dass die optische Qualität oder Framerate auf der Zielhardware optimal ist.

**Lokal ausführen:**

```powershell
npm install
npm run test:smoke:v635
npm run verify:v635
npx tsc --noEmit
npm run build
```
