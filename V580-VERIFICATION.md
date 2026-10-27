# V580 – Tatsächliche Verifikation (26.10.2026)

**Status:** V573–V580-Funktionsänderungen integriert, gezielte automatisierte Regressionen bestanden; **keine Produktions-/Raspberry-Pi-Freigabe**.

## Nachweislich erfolgreich

- `npm run test:v580`: **79** Integrations-, Grenz-, Rollen-, manuelle-Priorität- und Sicherheitsprüfungen plus **12.000** deterministische Testzeitpunkte. Die 12.000 Proben sind reine Logiktests und keine Hardware-/FPS-Messung.
- `npm run test:v580:types`: TypeScript-Prüfung der sechs neuen isolierten Kernmodule erfolgreich.
- `npm run test:smoke:v580`: V580, V572, V571, V568, V555, V556, V545 sowie Syntax- und Architekturprüfung erfolgreich. Bestehende `npm run build`-Prebuild-Prüfung enthält dieselben schnellen Tests.
- `npm run check:syntax`: **799 TS/TSX-Dateien**, inklusive V580-3D-Lyrics- und GLB-Integration, syntaktisch/mit Importbindungen geprüft.
- `npm run check:architecture`: **361** referenzierte Projektpfade sowie zehn Dokumentationsabschnitte geprüft.
- Weitere manuell einzeln ausgeführte alte Tests erfolgreich: V564, V546 (25.000 Wortproben), V528 (3.600 Frames), V523 (36.000 Fälle), V500, V502 (18.000 Fälle), V451, V549 (86.304 Zeitproben), V555, V569, V570 und V571.
- `npm run verify:v580`: Teile V580–V565 und zugehörige TS-Teilmengen erfolgreich ausgeführt, jedoch **nach dem 200-Sekunden-Ausführungslimit abgebrochen**, als V564 begann. **Kein vollständiges `verify:v580`-Ergebnis**.

## Blockiert oder nicht durchführbar

- `npm run typecheck`: **Exit 2**, weil `node_modules`, React-/Next-/Node-/Three-Typdefinitionen in der isolierten Entwicklungsumgebung fehlen. Die komplette Anwendung wurde damit **nicht** typenvalidiert.
- `npm run build`: **Exit 127**. Der schnelle V580-Prebuild lief vollständig erfolgreich; `next build` konnte mangels installierter Next.js-Abhängigkeit nicht starten (`next: not found`). Es fehlt außerdem weiterhin ein ehrlich durch `npm install` erzeugtes `package-lock.json`.
- `node scripts/v580-pi-benchmark.cjs --seconds=10`: erwarteter **Exit 1 / JSON `status: blocked`** auf Linux x64, ohne ARM-Pi-Hardware. Keine FPS, Temperaturen, sichtbaren Konzert-Screenshots oder Laufzeitmessungen erfunden.
- Kein echter WebGL-/GLB-Kamera-/Gesichts-Sichtvergleich, kein Spotify-Audio-/Wort-Synchronvergleich und kein 2-Stunden-Pi-Langzeittest durchgeführt. V553-Produktionsmatrix weiterhin nicht abgenommen.

## Auf lokalem Entwicklungs-PC / Pi nachholen

Erst `npm install --no-audit --no-fund`, generiertes Lockfile committen, `npm ci`, `npm run typecheck`, `npm run build` und `npm run verify:v580`. Dann die echte App mit geladenen GLBs und nachweislich laufendem Musik-/Lyrics-Szenario am 10-Zoll-Pi prüfen:

```bash
npm run benchmark:v580:pi -- --url=http://127.0.0.1:3000/ --seconds=120 --out=artifacts/v580/pi
```

JSON-Bericht und PNG nur von einem tatsächlich gelaufenen lokalen Browser verwenden. Der `--headless`-Modus gilt ausschließlich als diagnostisch. Zeit-/Emotions-/Voice-Genauigkeit, Temperatur und visueller Eindruck sind weiterhin **separat manuell** zu beurteilen.
