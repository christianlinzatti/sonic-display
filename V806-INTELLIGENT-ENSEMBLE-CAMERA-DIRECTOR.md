# V806 – Intelligent Ensemble Camera Director

## Motivation

V805 zeigt eine statische 3D-Prüfung von zwei oder drei ausdrücklich ausgewählten GLB-Avataren. V806 ergänzt eine davon getrennte, **aktive** Live-Kamerakorrektur für songgebundene, bestätigte Duette, Rapper-Übergaben und Gruppenparts.

## Wirkliche Implementierung

- `components/visualizer/intelligentEnsembleCameraV806.ts`: `reviewEnsembleCameraV806`, `inspectEnsembleCameraV806` und `composeIntelligentEnsembleCameraV806`; rein deterministische Korrektur ohne neue Kamera und ohne weitere Render-Schleife.
- Die Korrektur verwendet ausschließlich **verifizierte V528-Sängerzuordnungen** sowie V797-Cues mit passender Track-ID und die gemessenen, sichtbaren V377-Bühnenpositionen. Fehlende Sänger, falsche Song-ID, Duplikate, pausierte Songs, Low-Tier und manuelle Kamera blockieren den Eingriff. Beim Songwechsel wird der Cache der Bühnenanker zurückgesetzt.
- Für jede Stimme und die gesamte Gruppe werden die approximierten Projektionen aus V550 und V540 untersucht. Kandidaten mit höherem Kopf-/Körper-/Randüberlauf werden verworfen. Kein künstlicher Sänger, keine GLB-Unsichtbarkeits-Garantie.
- Begrenzte X-Verschiebung und ggf. geringe Distanzanpassung, unveränderte FOV, kein harter Kameraschnitt. V351 schützt Lyrics weiterhin **nach** V806.
- Bei explizitem Lyrics-Schutz ist die automatische Gruppen-Nachkorrektur aus; die bestehenden Kamera- und Textschutz-Systeme bleiben verantwortlich.
- Bestehende manuelle V354/V400-Kamera-Timelines, Studio-Framing, Live-Edit und Kamerapresets werden nicht verändert.

## Grenzen

Die Live-Ansicht analysiert projizierte Näherungen anhand echter Avatar-Root-Positionen, nicht die tatsächlichen Oberflächen von GLB-Meshes. Echte Verdeckung, Augen/Silhouette, Pixel-Lyrics und optische Qualität brauchen einen späteren visuellen Browser-/GPU-Test. Die V805-Geometrievorschau ist separat und stellt keine Live-Sängererkennung bereit. Keine Persistenz, keine neuen Einstellungen, keine weiteren APIs.

## Tests

`npm run test:v806`, `npm run test:v806:types`, relevante V790–V805-Regressionen und Struktur-/Lockfile-Prüfungen. Details stehen in `V806-VERIFICATION.md`.
