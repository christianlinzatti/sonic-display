# V787 – Smart Avatar LOD Director (diagnostischer Pilot)

## Neu

- `npm run avatar:lod:v787 -- --lod0=public/avatars/artist_LOD0.glb --lod1=public/avatars/artist_LOD1.glb --lod2=public/avatars/artist_LOD2.glb` analysiert drei **tatsaechliche** GLB-Dateien; JSON und Markdown unter `artifacts/v787/lod-review.*`.
- Offline-Sicherheitspruefung: GLB-2.0-Struktur, Skin-Joint-Namen, Animationsclip-/Target-Belegung, Morph-Target-Namen und SHA-256 pro Variante. Unterschiedliche Rigs/fehlende Varianten blockieren die Vorschau. Eigenstaendige Tanzclips muessen in allen drei Varianten enthalten sein; abweichende externe Motion-Loesungen sind hier nicht abgedeckt.
- `/diagnostics/avatar-lod` importiert den Bericht und **verifiziert im Browser erneut die SHA-256-Hashes der tatsaechlich geladenen Dateien**. Es werden ausschliesslich gleich-originige, unter `public/` abgebildete GLBs verwendet.
- Die 3D-Vorschau zeigt nur ein Modell, laedt fuer fliessende LOD-Uebergaenge **alle drei Varianten** und setzt die aktivierte `AnimationMixer`-Pose auf denselben logischen Zeitpunkt. Ein synthetisches Mundsignal animiert benannte Morphs unabhaengig. Damit startet der Tanz beim Wechsel nicht von vorn. Achtung: **Clips oder Rig-Retargeting werden nicht harmonisiert**, gleichnamige Morph-Targets garantieren keine identische Verformung.
- Kameraabstand-Limits: unter 4 m LOD0; ab 4 m LOD1; ab 8 m LOD2. Mit 0,55 m Hysterese und 550 ms Mindesthaltezeit. Bei fehlender vereinfachter Variante wird eine vorhandene **hoeherwertige** Variante bevorzugt. Nicht mit einer fehlenden GLB in `useGLTF` laufen.
- Dreiecksreduktionen sind reale statische Werte aus der GLB-Geometrie; keine fps-Werte, automatischen Hardwareempfehlungen oder behaupteten GPU-Gewinne.

## Bewusste Grenzen

- **Keine Aenderung an der produktiven Live-LOD**. Der bestehende `AutomaticLODAssetLoader` wurde nicht umgestellt, da er durch React-Remount Playback neu starten kann. Vor einer produktiven Uebernahme muessen echte GLBs auch visuell und ueber einen Browser-FPS-Test auf Kompatibilitaet, Fusskontakt, Gesicht und Speicherlast geprueft sein.
- Preview laedt drei GLBs gleichzeitig und braucht daher mehr Speicher als ein Laufzeitsystem mit nur einem aktiven LOD. Sie ist kein verlaesslicher VRAM-/FPS-Vergleich.
- Offline-Signatur prueft die Namen und Animationstargets, **nicht** die Hautgewichte, inverse Bind-Matrizen, Texturqualitaet oder echte Deformationen. Diese bleiben manuell zu pruefen.
- Referenz-GLB kann fuer die Funktionspruefung dreimal unter unterschiedlichen Dateinamen kopiert werden. Es wird dann **keine** Dreieckseinsparung angezeigt (entsprechende Warnung).
- Sind LOD1 oder LOD2 nicht vorhanden oder nicht kompatibel, lautet der Status `blocked`, nicht `ready`.

## Tests

`npm run test:v787 && npm run test:v787:types && npm run check:syntax && npm run check:architecture`

`npm ci && npm run typecheck && npm run build` fuer die vollstaendige Release-Abnahme. Echtes WebGL und reale LOD-Avatare sind separat zu pruefen.
