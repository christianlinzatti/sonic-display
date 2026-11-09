# V1127 – Crowd Frame Performance & Stability

- Acht räumliche Festival-Crowd-Samples werden **einmal pro gedrosseltem Crowd-Tick** erzeugt und von allen vorhandenen Instanzgruppen gemeinsam genutzt.
- Feste Sektorindizes für Körper, Köpfe, Arme, Handy- und Armbandlichter werden nur bei Crowd-/GPU-Stufenwechseln neu aufgebaut.
- Die freigegebene V1125-Livepartitur wird über die tatsächlich benötigten Show-, Wiedergabe- und Qualitätsparameter aktualisiert, nicht mehr in jedem Renderframe.
- Keine zusätzlichen Meshes, Zuschauer, Timer, API-Abfragen oder Hardwareeffekte; Pause, manuelle Handylichtmodi, reduzierte Bewegung und Low-GPU bleiben geschützt.
- 256 Konfigurationen mit 4.096 exakten räumlichen Vergleichswerten gegen V1125, plus Negativtests, 22 ältere Funktionstests und 22 isolierte TypeScript-Prüfungen.
- Die vorhandenen GitHub-Workflows erhalten lediglich die neue Standard-Versionsbeschriftung; keine Änderung an der CI-Logik.
- FPS-Gewinn ist hardwareabhängig; eine Laufzeitsteigerung wird nicht ohne echte Messung behauptet.
