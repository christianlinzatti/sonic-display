# V547 – Test- und Freigabeprotokoll

## Geprüft
- `npm run test:v547`: bestanden – 12.800 Zeitpunkte mit Lead, Feature, Adlib, selektiven Hooks, manuellen Vorrangregeln und Song-Sprüngen.
- `npm run test:v547:types`: bestanden – reine TypeScript-Kernlogik.
- `npm run test:v496`: bestanden – alte Zeitmarken, überlappende Priorität, 30-Minuten-Simulation.
- `npm run test:v546` / `test:v546:types`: bestanden.
- `npm run test:v545`, `test:v544`, `test:v543` und `test:v540` bis `test:v544` mit ihren Typentests: bestanden.
- Regression V522–V539 mit zugehörigen Kern-Typentests: separat bestanden. Ein weiterer gesamter sequenzieller Testlauf bis V544 wurde durch ein Zeitlimit unterbrochen; die fehlenden Versionen wurden anschließend separat geprüft.
- `npm run check:syntax`: bestanden, 763 TS/TSX-Dateien.
- `npm run check:architecture`: bestanden.

## Nicht geprüft
- Vollständiger Next.js-Produktionsbuild (installierte Next/React/Three.js-Abhängigkeiten fehlen).
- Echter WebGL-/GPU-Durchlauf und Raspberry-Pi-Langzeittest.
- Optische Qualität der einzelnen Avatare und tatsächliche phonemgenaue Sprechererkennung.

## Schutzregeln
- Gespeicherte V496-Zeitmarken ohne V547-Felder bleiben kompatibel.
- V385 manuelle Sprecherzuordnung und manuell gesteuerte Bühne bleiben vorrangig.
- Singer-Zeitmarken gelten nur für den passenden Track und nur mit aktivem Schalter.
- Edits sind explizite visuelle Regieanweisungen; keine erkannte Audio-Sprecheridentität.
- Keine Original-GLBs sind im Quellarchiv enthalten.
