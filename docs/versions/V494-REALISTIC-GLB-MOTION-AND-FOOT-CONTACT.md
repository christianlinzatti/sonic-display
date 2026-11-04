# Sonic Display V494 – Realistic GLB Motion & Foot Contact

## Ziel und Wirkung

V494 nutzt die **bereits von der Foot-IK gemessenen Standanker/Knöchel-Drift-Schätzungen** aus V487, um **ausschließlich optionale automatische Gruppen-Schrittverschiebungen aus V486** beim Hocken, Aufstehen und bei Seitwärtsschritten weicher zu machen. Die echte Fuß-IK, AnimationMixer-Überblendungen, GLB-Schlüsselbilder und die manuellen Stage-Targets werden **nicht** geändert.

## Implementation

- `realisticGlbFootContactV494.ts`: reine, deterministische, zustandsbehaftete Regel (Track-/Modellwechsel und Seek setzen den Dämpfungszustand zurück, Sicherheitsgrenzen für nicht-finite Eingaben, Kontaktkonfidenz, Drift-Schwellen und Pose-Übergänge).
- `GroupDancersV326SceneV492.tsx`: nutzt exakt denselben `useFrame` und die V487-Vorframe-Messungen. Skaliert nur `advancedFootworkV486.slots[i].offsetX/Z` beim Berechnen des optionalen Zielversatzes. Von V326 festgelegte `targetX/targetZ`, die V487-Geschwindigkeitsregel und alle IK-Solver bleiben unverändert.
- `GlbGroundingCalibrationPanelV494.tsx`: modellgebundene lokale Kalibrierung (Stancedämpfung, Übergangshaltezeit, Drift-Schwelle, An/Aus). Anzeige nutzt ausschließlich die vorhandene maximal 2-Hz-Gruppen-Event-Schleife; kein zusätzliches Render-Polling.
- `StageDirectorControlsV287.tsx`: Studio unter dem bisherigen V487-Diagnosepanel eingebaut.
- Browser-Einstellungen sind per Modell-ID gespeichert und werden ausschließlich bei Änderung geladen; keine externen Dienste.

## Sicherheitsgrenzen

Automatik nur bei echten zuvor verfügbaren V487/IK-Daten, aktiver automatischer 3-/4-Avatar-Gruppenshow, Wiedergabe, gültigem Track, normaler Renderqualität und ohne Fußsperre, manuelle Formationen oder reduzierte Bewegung. Fehlen Daten oder fallen Guards, kehrt die Ausgabe sofort zu V486 zurück. Kein Anspruch auf gemessene Physik, Fußsohlen-Kontakt oder biomechanisches Retargeting. Modell-/Rig-Charakteristik benötigt visuellen Vergleich mit realen GLB-Dateien.

## Checks

`npm run test:v494`, `npm run test:v494:types`, `npm run typecheck`, `npm run build`.
