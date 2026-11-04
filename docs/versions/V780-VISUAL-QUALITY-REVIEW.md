# V780 – Visual Concert Quality Review

V780 verwendet die echte V777-WebGL-Konzerntestbuehne (Drei-Text, echte GLBs, AnimationMixer, Mouth-Morphs, Licht und DanceFX) als visuelle Vergleichsbasis. Es ist **kein** End-to-End-Test der Spotify-Show. Die Rhythmussignale und Lyrics sind synthetisch.

## Ablauf

Nach `npm ci`, `npm run typecheck`, `npm run build` und `npm run start` (auf einem Rechner mit Chromium):

```bash
npm run benchmark:v780:visual -- --url=http://127.0.0.1:3000 --glb=/benchmark/mein-avatar.glb --frames=96,208 --out=artifacts/v780
```

Die eigenen GLB-Dateien vorher unter `public/benchmark/` ablegen. Optional `--glb2=/benchmark/zweiter-avatar.glb`, `--chromium=/pfad/zu/chromium`, `--software` (Software-Rendering **nicht** fuer Performance-Schluesse!). Wenn kein GLB angegeben wird, wird die kleine Referenz-GLB aus V777 eingesetzt.

Pro Profil, Buehne, Avatarzahl und Frame wird ein echtes PNG erfasst. Standard: 3 Profile x 3 Buehnen x 2 Avatarzahlen x 2 Frames = **36 PNGs** in `artifacts/v780/`. Die Konzerntakte `96` und `208` zeigen verschiedene synthetische Text-/Musikphasen. `manifest.json` enthaelt Quelle, Renderer, GLB-Pruefsummen, PNG-Hashes und Aufnahmeeinstellungen.

Danach `artifacts/v780/index.html` lokal oeffnen und die drei Profilspalten direkt vergleichen. `assessment.json` dokumentiert technische Checks und Pixelunterschiede (kein kuenstlicher Bildqualitaets-Score). `README.md` ist die Kurzuebersicht. Offlinerevalidierung: `npm run benchmark:v780:report -- --dir=artifacts/v780`.

Wichtig: Die Profile beeinflussen Licht, Effektbudget und Animationsfrequenz, **nicht** die GLB-Polygonzahl. Alle Snapshots zeigen dieselbe logische Songposition; die Canvas-Flaeche wird nur fuer den expliziten V780-Lokaltest mit `preserveDrawingBuffer` gelesen. Bei ungueltigen GLBs, nicht erreichtem Server, fehlerhaften Bildern, fehlenden 36 Szenen oder abweichender GPU/GLB/Viewport markiert der Runner den Bericht als `blocked`. Er erfindet keine Bilder oder FPS-Werte.

## Qualitaetskriterien (manuelle Sichtpruefung)

- **Licht:** Sind Lead-Avatare klar ausgeleuchtet? Sind Atmosphaeren-Farben und Verse-/Hook-Wirkung erhalten?
- **Nebel:** Verschluckt er die Darsteller? Ist das Buehnenbild lesbar?
- **Tanz:** Sind die wichtigen Posen erkennbar, gibt es deutliche Spruenge im Bewegungsfluss? (Einzelfotos ersetzen keinen Bewegungstest.)
- **Lyrics:** Sind beide Textzeilen lesbar, bleiben sie frei von Ueberlagerungen?
- **Effekte:** Sind Schockwellen/Leuchtspuren vorhanden, wo sie musikalisch auftreten sollen?

## Abgrenzung

V780 ist ein statischer visueller Bericht, kein echter FPS-Benchmark. Fuer Performance V779 nutzen, fuer reale Geraeteentscheidung eigene GLBs und Hardwaremessungen. Renderunterschiede durch Echtzeit-Shader koennen trotz fixierter logischer Zeit kleine Schwankungen erzeugen. Ein Screenshot beweist keine flüssige Animation; hierfuer weiterhin den V777/V779-Frame-Benchmark verwenden.
