# V688 – Cinematic Lyrics 2.0

**Ziel:** Bessere Lesbarkeit und schöneres Wort-Timing, ohne den bestehenden Performance-, Karaoke- oder Lyrics-Kompositionspfad zu überschreiben.

- `cinematicLyricsV688.ts`: reine, deterministische Planungsfunktion mit engeren Caption-Breiten bei 3–4 Avataren und langen Lyrics; Text-Hintergrund darf nur dunkler werden.
- `KineticLyrics.tsx`: CSS-Variablen für Breite, Platte, Zeilenabstand und aktive Wörter im bestehenden Textlayer. Originaltext und `--word-fill` bleiben erhalten.
- `Lyrics3DScene.tsx`: nutzt dieselbe Planung für das bestehende 3D-Textmesh und den schon vorhandenen Caption-Hintergrund; keine neuen Meshes pro Song oder zusätzliche Animationsschleifen.
- Cinematic Hooks erhalten Akzente nur bei explizit vorhandener Section-Cue; die 3D-Bühne erfindet keine Hook-Ereignisse.
- Nicht synchronisierte oder nur zeilensynchronisierte Lyrics bleiben lesbar, erhalten aber keine erfundenen Wortakzente.
- Nutzerposition, vorhandene V351/V381 Bühnenkomposition, V477/V541/V549 Wort-Fill, V606/V619/V634 Typografie, Sängerzuordnung und Kamera bleiben maßgeblich.
- Die Layout-Begrenzung schützt reservierte Textfläche konservativ. Ohne Messung echter projizierter Avatar-Bounds kann keine absolute Nicht-Überlappung garantiert werden.

## Testen

```powershell
npm install
npm run test:v688
npm run test:v688:types
npm run test:quick
npm run build
```
