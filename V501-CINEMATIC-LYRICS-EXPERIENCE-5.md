# Sonic Display V501 – Cinematic Lyrics Experience 5.0

## Was sich gegenüber V500 ändert

`components/visualizer/cinematicLyricsExperienceV501.ts` ergänzt den **bestehenden** V455/V461/V477-Lyrics-Pfad mit zurückhaltenden, playbackzeitgesteuerten Lesbarkeits- und Hervorhebungseffekten. Die Rendering-Anbindung erfolgt unmittelbar in `components/KineticLyrics.tsx` und `components/visualizer/Lyrics3DScene.tsx`. Es gibt keinen neuen Lyrics-Provider, API-Endpunkt, Render-Loop, Audio-Worker oder zusätzlichen Text-/Audio-Sync.

- **Lesbare Zeilenübergänge:** 250-ms-Ein- und 210-ms-Ausblend-Kurve, begrenzt auf 82–100 % Lesbarkeit. Kleine vertikale Akzente ergänzen vorhandene CSS-Bewegungen, ohne die Wiedergabezeit zu verändern. Bei Pause oder reduzierter Bewegung steht die Zeile statisch in voller Deckkraft.
- **Echt zeitmarkierte Karaoke-Wörter:** Ein dezenter Glanzakzent folgt dem tatsächlich verifizierten Wortbeginn; er verändert **niemals** den ursprünglichen Wortfüllstand. Ohne vollständige gültige Wortmarken zeigt die Anzeige weiterhin ausschließlich den vorhandenen Zeilenfortschritt bzw. unsynchronisierten Text.
- **Mehr Avatar-Raum:** Bei drei oder vier Tänzern verdichtet V501 die immersive Beschriftung und begrenzt die maximale 3D-Wortzeilenbreite. Ein leicht verstärkter, abgedunkelter Caption-Hintergrund erhält den Kontrast bei hellem Bühnenlicht. Vorhandene benutzerdefinierte Lyrics-Positionen und das V381-3D-Layout bleiben erhalten.
- **Leichte 3D-Effekte:** Maximale Wortanimationen werden unverändert von der vorhandenen GPU-Qualitätsstufe begrenzt. Bei niedrigem Profil bleibt die kostenarme Zeilentext-Darstellung. Für schnelle Deutschrap-Zeilen werden zusätzliche Wortbewegungen unterdrückt.

## Schutzgrenzen und Einschränkungen

V501 liest **nur** vorhandene Lyrics-/Wortmarken und die übergebene Spotify-Wiedergabeposition. Es erfindet keine Wort-Timestamps, Sprecher, Phoneme, Verse-/Hook-Grenzen oder Emotionen. V500-Duettregie, V499-Lipsync, V498-Kamera/Licht und manuelle Einstellungen werden nicht verändert. Eine optische Qualitätseinschätzung mit echten GLB-Avataren am Zielmonitor wurde nicht durchgeführt; die reine Berechnung kann keine Rendering-Stabilität auf dem Raspberry Pi beweisen.

## Prüfen

```powershell
npm run test:v501
npm run test:v501:types
npm run test:v477
npm run test:v461
npm run test:v500
npm run check:syntax
npm run check:architecture
npm install
npm run build
```

Die reine V501-Funktion wird über 15.000 deterministische Zeit-/Avatar-Samples getestet; zusätzlich werden Schutzgrenzen (Pause, Seek, reduzierte Bewegung, ungültige Zeitmarken, 2D/3D-Verkabelung, Word-Mesh-Fallback) kontrolliert. `npm run build` bleibt erst nach installierten Next.js-/React-Abhängigkeiten auf einer vollständigen Entwicklungsumgebung verbindlich prüfbar. Die alte V382-Versionsliste wurde auf einen vorwärtskompatiblen Mindestversions-Test umgestellt, ohne seine eigentlichen Funktionsassertions abzuschwächen.
