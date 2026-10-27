# V596 – Verifikationsbericht (26.10.2026)

## Ergebnis

Natural Dance & Footwork Quality 6.0 ist in die bestehende V524-Gruppen- und V545/V587-GLB-Pipeline eingebunden. Die neuen Zustandsautomaten arbeiten auf bestehenden additiven Bewegungswerten, ohne die ursprünglichen GLB-Animationsclips, manuellen Bewegungsentscheidungen oder den Fuß-IK-Kontaktlöser zu verändern.

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v596` | **PASS: 47 Testgruppen**, 25.000 synthetische Frame-Zeitpunkte, 30/60/120-FPS-Phasen, Seek, Track-/Modellwechsel, 3/4 Tänzer, Schutzregeln und V524→V587→V596-Integration |
| `npm run test:v596:types` | **PASS** – isolierte TypeScript-Quellen V596 einschließlich V524, V545 und V587 |
| `npm run test:smoke:v596` | **PASS** – im ersten vollständigen Durchlauf (46 V596-Gruppen) inklusive V595 (34), V594 (35), V593 (23), V592 (10), V591 (10), V590 (14) und Architektur |
| `npm run verify:v596` | **PASS** – vollständiger erster Durchlauf mit 46 V596-Gruppen, zusätzlich V524/V545/V486/V494/V587/V588/V589/V572 und Syntaxscan; nach zusätzlichem V524→V587→V596-Test (47 Gruppen) wurde der Wiederholungslauf beim V588-Test durch das Ausführungslimit unterbrochen |
| `npm run test:v588`, `npm run test:v589`, `npm run test:v572` | **PASS separat** – nach dem zusätzlichen V596-Test erneut ausgeführt |
| `npm run check:syntax` | **PASS** – 821 TypeScript-/TSX-Dateien auf Syntax und doppelte Importnamen geprüft |
| `npm run check:architecture` | **PASS** – V596, 420 referenzierte Quellpfade, 10 Pflichtkapitel |

Die ältere V595-Prüfung auf eine exakt feststehende Paketversionsnummer und die V594-Prüfung auf nur V594/V595 wurden auf Mindestversionen erweitert. Die inhaltlichen Szenarien/Qualitätserwartungen der beiden Prüfdateien bleiben identisch. Das fälschlich angenommene, im Repository nicht vorhandene `test:v576`-Kommando wurde in `verify:v596` durch die vorhandenen, bestandenen Fußarbeits- und Grounding-Regressionssuiten V486 und V494 ersetzt.

## Grenzen

- Keine visuellen Echt-GLB-/WebGL-Tests mit eigenen Tanzmodellen; die Behauptung, eine konkrete Animation habe weniger Fußrutschen, ist **noch nicht belegt**.
- Kein vollständiger Next.js-Produktionsbuild, keine System-TypeScript-Prüfung des gesamten Projekts: `node_modules` sind hier nicht vorhanden. Die **isolierte** V596-TypeScript-Prüfung und Syntax-/Importscan decken nicht alle Laufzeit- und JSX-Typen ab.
- Kein Raspberry-Pi-Hardwaretest, kein realer FPS-/GPU-/Temperaturvergleich.
- Die V596-Gruppensteuerung gilt für den bestehenden 3-/4-Avatar-Automatismus; sie lädt keine neue Animation, verändert keine importierte Clipdatei und weitet keine vorherigen Importlimits aus.

## Lokal wiederholen

```bash
npm run test:v596
npm run test:v596:types
npm run test:smoke:v596
npm run verify:v596
```

Danach vollständige Abnahme mit installierten Abhängigkeiten über `npm run build`, eigene GLB-Tänzer visuell prüfen und V592/V594/V595-Benchmarkvergleich durchführen.
