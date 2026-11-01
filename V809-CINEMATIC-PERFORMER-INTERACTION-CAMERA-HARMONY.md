# Sonic Display V809 – Cinematic Performer Interaction & Camera Harmony

## Ziel

Bei gesicherten Deutschrap-Duetten, expliziten Sängerübergaben und gemeinsamen Hooks soll die vorhandene Konzertkamera dezente Akzente zu Bühnenbewegung (V808) und Blicken/Gesten (V807) setzen. Bestehende Regie- und Sicherheitsmechanismen haben Vorrang.

## Änderungen im Projekt

- `components/visualizer/cinematicPerformerCameraHarmonyV809.ts`: neue, deterministische und seiteneffektfreie Kameraplanung `reviewCinematicPerformerHarmonyV809` (inkl. Diagnose) und `composeCinematicPerformerHarmonyV809` (inkl. Pose).
- `components/visualizer/StageCameraDirectorV289.tsx`: V809 auf der vorhandenen R3F-Kamera nach V806 und vor dem letzten V351-Lyrics-Guard eingebunden. Gleiche gespeicherte Bühnenanker aus der V377-Abtastung und derselbe aktuelle Song-/Sänger-Kontext wie V806; keine neue Szene, AnimationMixer, Canvas oder Frame-Schleife.
- `tests/v809-cinematic-performer-camera-harmony-regression.cjs`: 58 Testgruppen mit 2.500 reproduzierbaren Geometrie-/Interaktionsproben; `test:v809` und `test:v809:types` in Release-Gates aufgenommen.
- `tests/v354-show-timeline-regression.cjs`: historische rein strukturelle Erwartung um den jetzt letzten Kameraschritt V809 ergänzt; unveränderte Priorität manueller Kamera-Cues.

## Verhalten

1. V809 verlangt einen aktiven, zeitlich gültigen V528-Szenenplan **und** den dazu passenden, ausdrücklich bestätigten V797-Vocal-Cue für denselben Song. Performer-Slots müssen exakt übereinstimmen; jeder Slot muss durch einen eindeutig sichtbaren und endlich positionierten echten V377-Bühnenanker belegt sein.
2. Bei Duetten wird das Augenmerk zeitweise zum Lead und wieder zum Ensemble-Mittelpunkt verschoben, passend zu den langsamen V807-Blickmotiven. Übergaben berücksichtigen beide Sänger, Hooks können je nach Breite minimal mehr Platz erhalten. Keine Behauptung über tatsächlich gerenderte Gesichtssichtbarkeit.
3. Verschiebungen des Kameraziels sind auf maximal 0,115 Bühneneinheiten je Frame-Schritt begrenzt, zusätzliche Distanz auf 2,8 Prozent. Die Verläufe beginnen und enden weich innerhalb des geprüften Vocal-Zeitfensters.
4. Vor der Übernahme werden dieselben V550-/V540-Geometrieprüfungen für die ganze Gruppe und **jeden** Performer gegen den vorherigen Kamerazustand ausgeführt. Jede Verschlechterung bei geschätztem Kopf-, Ganzkörper- oder Bildrand-Overflow führt zum Verwerfen des Kandidaten. Bei fehlenden Angaben bleibt die ursprüngliche Pose erhalten.
5. Explizite manuelle/gespeicherte Kamera-Cues, reduzierte Animation, niedrige Grafikstufe, pausierte Wiedergabe und geschützter Lyrics-Bereich sperren die zusätzliche V809-Korrektur. Der V351-Sicherheitsguard bleibt die finale Instanz.

## Grenzen

Die Bühnenanker sind gemessene Root-Positionen, nicht vollständige GLB-Mesh-Projektionen. Kopf-/Fußgrenzen sind Näherungen; echte Sichtverdeckung von Gesichtern, Bühnennebel und tatsächliche Text-Überlagerung werden hier **nicht** pixelgenau nachgewiesen. V809 verändert keine Bühnenposition, Gesichtsanimation, Lip-Sync, Show-Timeline oder Avatar-Bewegung. Bei fehlendem Vocal-Timing bleibt die bisherige Regie unverändert.

## Start und Prüfung

Nach `npm ci --no-audit --no-fund`: `npm run test:v809`, `npm run test:v809:types`, `npm run typecheck`, `npm run build`. Für den Browser die realen Mehr-Avatar-GLBs mit Duett/Hook und manuellen Kamera-Cues prüfen. Prüfstatus dieser Ausgabe in `V809-VERIFICATION.md`.
