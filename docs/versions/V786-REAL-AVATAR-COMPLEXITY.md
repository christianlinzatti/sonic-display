# V786 – Real Avatar Complexity Profiler

## Umfang

V786 analysiert eine oder mehrere **lokale GLB-2.0-Dateien** ohne npm-Abhängigkeiten und ohne Upload an einen Dienst. Die Originaldateien werden nicht verändert.

- Tatsächliche Dreiecke (triangles, triangle-strip, triangle-fan) in der **Standard-Szene**; Instanzen desselben Mesh werden nach Node-Vorkommen berücksichtigt.
- Referenzierte Vertex-Anzahlen, Primitives, ungefähre Mesh-Draw-Calls; Material-/Mesh-Hotspots sortiert nach Geometrieaufwand.
- Verwendete Skin-Joints, skinnierte Instanzen, Animationen und Kanäle, Morph-Target-Namen und benannte Mund-Kandidaten.
- Verwendete Materialien, Texturen und Bilder; eingebettete PNG-/JPEG-Abmessungen und ungefähres unkomprimiertes RGBA8-plus-Mipmap-Szenario. KTX2 und unbekannte/externe Bilder werden **nicht** als sichere Speicherwerte ausgegeben.
- Hinweise bei größeren Geometrien, vielen Materialien/Draw Calls, Skin-Joints, Morph-Targets und potenziell nicht unterstütztem Lip-Sync. Schwellenwerte sind heuristisch, **keine technischen Grenzwerte**.
- Auf Wunsch Vergleich mit einer **wirklich gemessenen V777-Browserauswertung**, die auf exakt dieselben GLB-SHA-256-Hashes, sechs vollständige Konzertszenen, bekannte Fixture und echte GPU geprüft wird.

## CLI: sofort und ohne Browser nutzbar

Die enthaltene Referenzfigur inspizieren:

```bash
npm run benchmark:v786:avatar -- --glb=public/benchmark/v777-reference-performer.glb
```

Eigene, mehrere GLBs untersuchen (lokale Pfade, keine Server-Uploads):

```bash
npm run benchmark:v786:avatar -- --glb=public/avatars/mein-taenzer.glb --glb=public/avatars/anderer-taenzer.glb --out=artifacts/v786/meine-avatars.json
```

Optional **mit** echtem V777-JSON-Benchmark auf exakt denselben Assets:

```bash
npm run benchmark:v786:avatar -- --glb=public/benchmark/mein-avatar.glb --benchmark=artifacts/v777/current.json
```

Bei nicht übereinstimmenden GLBs, fehlenden Szenen oder Software-Rendering wird die Verbindung mit FPS-Werten blockiert und der Befehl meldet Exitcode **2**. Die GLB-Statik wird trotzdem gesichert. Parserfehler ergeben Exitcode **1**; erfolgreiche Ausführung Exitcode **0**.

Resultate: `artifacts/v786/avatar-complexity.json` und `artifacts/v786/avatar-complexity.md` (oder der Pfad aus `--out`).

## Dashboard

Nach erfolgreichem `npm ci`, `npm run build`, `npm run start`:

`http://127.0.0.1:3000/diagnostics/avatar-complexity`

Im Dashboard die JSON-Datei lokal öffnen. Anzeige von Geometrie-Hotspots und den separat gekennzeichneten theoretischen 2/4-GLB-Multiplikatoren. GLB-Dateien selbst werden **nicht** hochgeladen.

## Grenzen

- GLB-Parser analysiert die erste/default Szene, nicht andere glTF-Szenen; die Daten gelten nicht als vollständiges Blender-/Importer-Validierungsergebnis.
- Das Auslesen von Accessor-Metadaten ist für Geometrie-Triangles ausreichend, aber es dekodiert keine Draco-/Meshopt-Primitive oder Animations-Binärdaten. Ungewöhnliche Extension-Geometrie erfordert manuelle Prüfung.
- Nicht alle Texture-Extensions/Formate und externe Bild-URIs haben dekodierbare Abmessungen. Der RGBA8-Mipmap-Wert ist **kein gemessener GPU-/VRAM-Verbrauch**, und wird nicht mit vier Avataren multipliziert.
- Draw Calls sind eine einfache Summe sichtbarer GLB-Primitives; tatsächliche Renderer-Passes, Transparenz, Shadows und Instancing können abweichen.
- Die Multiplikation von Dreiecken für zwei bzw. vier Darsteller sagt **nichts** über FPS oder Leistungsfähigkeit eines Raspberry Pi aus.
- Externe Motion-Dateien und das vollständige Spotify-Konzert müssen getrennt gemessen werden.
- Die V777-Browserdaten verwenden synthetische Musik- und Lyrics-Signale; keine echte Vocal-Stem- oder Spotify-Laufzeitmessung.

## Qualitätsprüfung

```bash
npm run test:v786
npm run test:v786:types
npm run check:syntax
npm run check:architecture
npm run test:module-case
npm run check:lockfile:v752
npm ci
npm run typecheck
npm run build
```

Ohne installierte Abhängigkeiten kann der vollständige Projekt-TypeScript-Check bzw. Produktionsbuild hier nicht positiv bescheinigt werden. Browser-/GPU-Messwerte müssen lokal aufgenommen werden.
