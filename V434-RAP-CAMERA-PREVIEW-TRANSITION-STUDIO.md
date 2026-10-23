# Sonic Display V434 – Rap Camera Preview & Transition Studio

## Funktionen

- Im vorhandenen `ExpressiveRapDirectorPanelV425` erscheint unmittelbar nach V431 ein A/B-Studio.
- A nutzt die lokal gespeicherten V433-Werte, B hält einen gesonderten Entwurf mit Übergangsweichheit (0–100 %) und BPM-Raster an/aus.
- Beide Varianten nutzen dieselbe Lyrics-Zeile, dieselbe vorherige Rapper-Rolle, denselben Ziel-Shot und dieselbe verschiebbare Vorschauzeit. Eine überlagerte Fortschrittsgrafik zeigt die Wirkung der Parameter.
- Die 3D-Vorschau lädt bei Bedarf `CameraLivePreviewV291` mit installiertem Avatar (neutraler Fallback). Es wird **nur ein** Vorschau-Canvas für das gewählte A/B-Bild geöffnet.
- Übergangsposen werden über `advanceRapCameraTransitionV433` gesampelt; die Kameraziele stammen aus `composeRapCameraV429` und den gespeicherten V416/V430-Projektionen. Bei unverändertem Shot/Lead wird kein künstlicher Übergang simuliert.
- Der BPM-Wert kommt aus `useAudioAnalysis`, soweit verfügbar. BPM-Raster ist heuristisch und nicht zwingend phasenrichtig. Vergangene Kick-Akzente werden nicht erfunden. Die Vorschau rechnet mit einer statischen Verse-Grundkamera und kann vom finalen Bühnenbild abweichen.
- Eine explizite Aktion **„Variante B übernehmen“** aktualisiert ausschließlich `rapCameraTransitionSmoothnessV433` und `rapCameraBeatSyncV433`. Weder Live-Freigabe noch V432-Keys, Songposition oder andere Einstellungen werden geändert.
- Panel wird beim Titel-/Lyrics-Zeilenwechsel über React-Key neu angelegt, wodurch alte B-Entwürfe nicht in neue Songs übernommen werden.

## Technische Dateien

- `components/visualizer/rapCameraTransitionPreviewV434.ts` – reine, deterministische A/B-Sampling-Funktionen.
- `components/visualizer/RapCameraTransitionPreviewPanelV434.tsx` – UI mit Zeit-Scrubber, Verlaufsgrafik, A/B-Option und 3D-Vorschau.
- `components/visualizer/ExpressiveRapDirectorPanelV425.tsx` – bestehender Editor (erweitert).
- `tests/v434-rap-camera-transition-preview-regression.cjs`, `tests/tsconfig.v434-core.json` – Regression und strenge Typprüfung.

## Verwendung

1. Titel mit synchronisierten Lyrics laden und Rapper-Rollen im V416-Duett-Studio zuweisen (mindestens zwei Avatare).
2. Im V431-Kamera-Zeitstrahl eine Lyrics-Zeile mit Shot-Wechsel wählen.
3. Im V434-Studio die Übergangszeit mit dem Schieberegler untersuchen und A/B wählen.
4. B-Weichheit und BPM-Einstellung einstellen, 3D-Vorschau aufklappen und vergleichen.
5. **Variante B übernehmen** speichert die Parameter; optional V429/V433 live aktivieren.

## Prioritäten und Grenzen

Die komplette V433-Live-Pipeline ist unverändert. V432-Autorenkeyframes, manuelle Kameras, V400-Kamerazeitachsen, aktive Regiemodi, Lyrics-Schutz und reduzierte Bewegung werden weiterhin in der StageCameraDirector-Pipeline geschützt. Die 3D-Vorschau allein aktiviert keine Kameraänderung in der Bühne. Ein erfolgreicher Browser-/Next.js-Sichttest ist zusätzlich erforderlich.
