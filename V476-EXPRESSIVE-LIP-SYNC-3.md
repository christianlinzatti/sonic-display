# V476 – Expressive Lip-Sync 3.0

## Ziel

Mehr Ausdruck in Mund und Gesicht bei schnellem Deutschrap und Gesang, **ohne** zusätzliche API-Anforderungen, unnötiges Render-Workload, ungesicherte Phonem- oder Sängerzuordnungen oder überschriebenes Benutzer-Editing.

## Implementierung

- `components/visualizer/expressiveLipSyncV476.ts`: pure Funktion `refineExpressiveLipV476(lyrics,base,cue,context)` als Finishing-Pass **nach** V453 und V459. Nur aktiv mit synchronisierten Lyrics, `confidence: "word"`, zugehörigem bestätigten Wort und gültiger Wiedergabezeit. Die Zeitstempel kommen aus den Lyrics und werden **nicht** durch Buchstabenpositionen interpoliert.
- Kleine, zeitlich geglättete Mund-/Kiefer-Akzente innerhalb bestätigter Wortgrenzen. Ein einzelner geschriebener Vokal wird **nur als visuelle Formheuristik** eingesetzt, nicht als angeblich genau erkannter Laut.
- Zurückhaltende Augenbrauen-/Wangenreaktionen und begrenzte Attack-/Release-Raten. Keine generierten Schwingungen oder Fake-Audio-Impulse.
- `components/visualizer/VocalRigV368.tsx`: Pass für reale GLB-Morph-Targets/Jaw-Bone; bestehendes Overlay zieht seine eigenen vorherigen Beiträge ab und überschreibt die importierten Clips nicht.
- `components/visualizer/ThreeAvatar.tsx`: identischer Finishing-Pass für den prozeduralen Mund. Der GLB-Kopf-/Körper-V459-Pfad bleibt erhalten.
- **Priorität:** V420-Edits, V423 explizite Audio-Munddaten, V415 B/P/M-Lippenkontakt, explizite Vocal-Rollen, Pause, Reduced Motion, ungetimte Lyrics und Demo-Preview werden nicht neu geschrieben.

## Testen

```powershell
npm run test:v476
npm run test:v476:types
npm run check:architecture
npm run build
```

Die Regression prüft u.a. Determinismus, 30 Minuten synthetische Zeitsprünge, sichere begrenzte Blendshape-Werte, Audio-/Edit-Priorität, Pausen, Sängerrollen, fehlende Wortmarker sowie die Integration in beide Renderer. **Kein** Ersatz für einen echten Browser-/GLB-/Raspberry-Pi-Langzeittest.

## Grenzen

Spotify-Gesang ist weiterhin keine separat verfügbare Phonemspur. V476 ist **verbesserte Darstellung verifizierter Wortzeitfenster**, keine echte phonemgenaue Lippensynchronisation oder automatische Vocal-Stem-Erkennung. Lücken oder nur zeilenweise Lyrics bleiben neutral.
