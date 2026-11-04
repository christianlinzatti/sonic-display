# V908 – Live Avatar & FX Benchmark Verification

## Was wird überprüft?

- Bei jeder existierenden V826-Telemetrie-Veröffentlichung (~0,5 s) wird das
  bereits vorhandene V830-Szenengraph-Verfahren ausgeführt: nur sichtbare
  SkinnedMeshes unter `v377-vocal-stage-slot-0…3` zählen als belegte Performer.
- Die **gleichen V826-Snapshots** liefern zusätzlich die tatsächlich geplanten
  Effektmengen für Publikum, Partikel, Schaum, Kinetik und Spektraleffekte.
- V905 akzeptiert wie bisher ausschließlich echte, neue Renderer-Fenster und
  verwirft die ersten zwei Warm-up-Fenster. V908 liest nur die V905 akzeptierten
  Messfenster und markiert einen ganzen Lauf nur dann als bestätigt, wenn alle
  Messfenster denselben vollständigen, sichtbaren Skinned-Mesh-Besatz zeigen.
- Ein veralteter Snapshot, ein anderes Lied, fehlender Nachweis oder eine
  zeitweise unsichtbare Figur verhindert das positive Urteil.

## Wichtige Grenzen

- Sichtbare **geriggte** Figuren beweisen nicht die Herkunft aus einer GLB-Datei.
  Die App kann GLTF-Dateien, geteilte Animationsdaten und LOD-Fallbacks verwenden.
- V826 erfasst nur Effekt-Instanzzahlen in bestimmten Lanes. Eine leuchtende
  LED-Wall oder ein Laser kann sichtbar sein, ohne einen positiven Lane-Zähler
  in dieser Nachweisgruppe zu haben; daher keine generelle Aussage „FX aus“.
- Die V907-Auswahl „reduziert“, „Standard“ oder „stark“ ist weiter eine
  Nutzerangabe. V908 zeigt **beobachtete** Effekt-Lanes zusätzlich, bestätigt
  aber ausdrücklich NICHT diese relative Intensitätsklasse.
- Alle Daten bleiben im Arbeitsspeicher und werden beim Löschen entfernt.
  Der JSON-Export ist anonymisiert.
- Das System stellt keine GPU-Timings, optische Qualität, FPS auf einem
  Raspberry Pi oder tatsächliche GLB-Dateiherkunft fest.

## Tests

`npm run test:v908`, `npm run test:v908:types`, `npm run test:v908:ui-types`,
`npm run verify:v908:focused`, `npm run typecheck`, `npm run build`.

Status: Entwicklungsversion. Produktive Freigabe nur nach bestandenem vollständigem
TypeScript-/Next.js-Build mit installierten Projekt-Abhängigkeiten.
