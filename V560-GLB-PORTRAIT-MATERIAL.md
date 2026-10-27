# Sonic Display V560 – Schonende GLB-Porträtmaterialien

## Neue Funktion

- **Eigene Materialkopien** für erkannte Gesichts-/Haut-Meshes echter GLB-Avatare. Die Original-GLB-Datei, gecachte GLTF-Materialien, Skeleton-Bones, Gesichts-Morphs, Animationen, Texturen, Color-Maps und UVs bleiben unangetastet.
- **PBR-Glanzkontrolle**: Nur Standard-/Physical-PBR-Materialien mit sicher erkannten Gesichts-/Haut-Bezeichnungen; glatte Haut wird bis maximal Roughness 0,47 sanft mattiert und stark metallische Haut bis maximal Metalness 0,16 abgemildert. Jede Änderung skaliert mit dem Schieberegler und bleibt reversibel.
- Transparente Teile, Augen, Haare, Zähne, Kleidung, Spezial-/Emissive-Materialien und Objekte mit Metallness-Map sind ausgeschlossen. Unbekannte GLBs bleiben unverändert; es wird **keine Hauterkennung aus Pixeln oder Geometrie** behauptet.
- Keine zusätzlichen Schattenquellen oder GPU-Pässe: Die räumliche Tiefenwirkung kommt aus vorhandenen Key-/Fill-Lichtern und PBR-Materialparametern. Das erzeugt **keinen echten Selbstschatten/Ambient-Occlusion-Pass**.
- Optionaler **echter GLB-Vergleich** in der großen 3D-Bühnenvorschau: gewählten Avatar laden, Hautmaterial Original/Optimiert umschalten, Nahaufnahme. Nur Solo-/Hook-/Rap-Demos. Duett weiterhin mit synthetischen Demofiguren. Statisches Gesicht in der GLB-Vorschau: **keine gesungene Audio- oder Lippenanimation**.
- Optional per Settings-Schalter (standardmäßig ein), Stärke 0–100 %, im Low-Tier keine Veränderung. Materialkopien werden beim Unmount entsorgt; keine Texture-/Geometry-Disposal.

## Einschränkungen und Prüfung

- `npm run verify:v560` führt 25 neue Fälle, gezielte isolierte Typprüfungen sowie V554–V559-Regressionen aus.
- Externe GLBs mit untypischen Namen erhalten absichtlich keine automatische Materialänderung. Statt falscher Hauttönung wird Originaldarstellung beibehalten.
- Zielhardware-/Browser-WebGL-Praxistest, echtes Live-Lip-Sync und voller Next.js-Produktionsbuild sind nicht automatisch durch Source-Tests bewiesen. Dazu lokal `npm install && npm run typecheck && npm run build` und GLB-Sichtkontrolle auf dem Endgerät ausführen.
