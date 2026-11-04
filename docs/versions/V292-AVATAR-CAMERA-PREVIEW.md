# V292 – Avatar Camera Preview

Visueller Kameraeditor: Auswahl installierter GLB-/GLTF-Charaktere über die vorhandene `/api/avatars`-Bibliothek (einschließlich lokaler und Blob-Modelle). Die 3D-Vorschau lädt erst nach Öffnen des Kameraeditors, klont Skinned Meshes für isoliertes Rendering und normalisiert Modellhöhe/Fußbodenposition. Bei Ladefehlern erscheint das neutrale Modell. Keine Veränderungen am Live-Avatar, keine automatische Animation. Bei nicht erreichbarer API werden die vorkonfigurierten Modelle angeboten.

## Prüfen
`npm run verify:offline` und lokal mit installierten Dependencies `npm run build`.
