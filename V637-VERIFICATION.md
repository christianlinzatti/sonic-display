# V637 – Verifikationsprotokoll, 27. Oktober 2026

**Status:** Erfolgreich ausgeführte lokale Code-, TypeScript-Kern- und Offline-Regressionstests. Browserbild und vollständiger Next.js-Produktionsbuild noch nicht validiert.

- `npm run test:v637`: **57 Testgruppen / 13.160 simulierte, an bestätigte V600/V604-Abschnitte gebundene Songpositionen** für Deutschrap, Hardstyle, Hardtekk, Rock und Pop; manuelle Tanz/Kamera/Licht-Lanes, Lyrics, Ruhephasen, Kick-basierte Drops, Refrainvariation, Metadatenwechsel, Seek-Stabilität und Bereichsgrenzen.
- `npm run test:v637:types`: **PASS** – Kern-TypeScript der V637-Komposition und V610-Abhängigkeiten.
- `npm run test:smoke:v637`: **PASS** – V637, TypeScript und die bestehende vollständige Smoke-Kette bis V616, inklusive Syntax/Architektur.
- `npm run verify:v637`: **PASS** – V637, V610, V624, V625, V629 bis V636, V542, Syntax und Architektur. Diese Verifikation wiederholt die Smoke-Kette nicht, da beide Befehle unabhängig ausführbar sind.
- `check:syntax`: **861 TS/TSX-Dateien**. `check:architecture`: **517 Quellreferenzen, 10 Abschnitte**.

**Nicht geprüft:** vollständiges `npx tsc --noEmit` und `npm run build` mit allen React-/Next-/Three-Projektabhängigkeiten, da `node_modules` in der Arbeitsumgebung fehlen. Kein echter Browser-WebGL-Test, keine visuelle GLB-Abnahme, keine GPU-/FPS- oder Raspberry-Pi-Messung. Keine neuen Lyrics-Timings, keine Sänger-, Instrument- oder Beat-Erkennung.

**Lokal unter Windows:**

```powershell
npm install
npm run test:smoke:v637
npm run verify:v637
npx tsc --noEmit
npm run build
```
