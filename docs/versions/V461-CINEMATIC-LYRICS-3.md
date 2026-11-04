# Sonic Display V461 – Cinematic Lyrics 3.0

## Änderungen

- `components/visualizer/cinematicLyricsV461.ts`: statischer, playback-bewusster Layoutplan. Kombiniert die vorhandene V455-Dichte- und Lesbarkeitsanalyse mit Stage-/3D-Layoutgrenzen. Es werden keinerlei Phoneme, Sängeridentitäten oder Wortmarken erfunden.
- `components/KineticLyrics.tsx`: bei dichten **synchronisierten** Zeilen zeigt der immersive Modus die aktive Zeile, statt mehrere lange Zeilen in den kleinen Bühnenbereich zu quetschen. Normaler Split-Screen, Plain-Text-Lyrics und die manuell gewählten Schriftstile/-positionen bleiben erhalten. Wortanimationen werden bei schnellen Rap-Passagen gedämpft.
- `components/visualizer/VisualizerStage.tsx`: markiert die immersive Variante explizit für das Bühnenlayout; respektiert weiterhin die ausgewählte linke/rechte Bühnenposition.
- `components/visualizer/Lyrics3DScene.tsx`: verwendet denselben Layoutplan, verengt den Textbereich bei langen Zeilen, begrenzt die GPU-Troika-Textbreite und nutzt für extrem lange Wörter die bestehende Full-Line-Darstellung mit Umbruch. Bei dichten synchronisierten Zeilen konzentriert sich die 3D-Ansicht auf die aktive Zeile.
- `app/globals.css`: Bühnenbereich, lesbare Zeilenabstände, responsive Begrenzungen und Unterstützung für `prefers-reduced-motion`.
- Die Herkunft des Wort-Timings wird nun anhand der **aktuell angezeigten Zeile** eingestuft. Fehlende oder ungültige Wortmarken werden als geschätztes Timing behandelt.

## Sicherheits- und Kompatibilitätsregeln

1. Keine Erweiterung der Spotify- oder Genius-Schnittstellen.
2. Keine zusätzlichen APIs, Schlüssel, Einstellungen oder Netzwerkaufrufe.
3. Keine Änderungen an GLB-Dateien, Tanz-Kits, gespeicherten Kamera-/Vocal-Keyframes oder User-Presets.
4. Lyrics- und Color-Karaoke-Stile (Kinetic/Cinematic/Neon) bleiben erhalten.
5. Normale Lyrics sind nicht von automatischem Zeilen-Cropping betroffen; der aktive Fokusmodus wird nur bei der immersiven, synchronisierten, dichten Darstellung reduziert.
6. Reduzierte Bewegung und Pause deaktivieren die zusätzlichen Bewegungsakzente.

## Prüfen

```powershell
npm install
npm run verify:v461
npm run typecheck
npm run build
```

Isolierte TS- und Strukturprüfungen ersetzen weder einen echten Browser-/WebGL-Check noch den vollständigen Next.js-Produktionsbuild. Mit echten GLB-Avataren auf dem Zielgerät testen, insbesondere bei vier Avataren und einem 10-Zoll-Bildschirm.
