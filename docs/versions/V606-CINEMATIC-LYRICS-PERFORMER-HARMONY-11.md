# V606 – Cinematic Lyrics & Performer Harmony 11.0

**Basis:** V605, Projektversion `0.1.0-v606`.

## Integration

- Gemeinsamer Planner: `components/visualizer/concertLyricsPerformerHarmonyV606.ts` verwendet nur den vorhandenen Playback-Zeitwert, vorhandene Text-Zeitmarken, bereits bestätigte V604-Songabschnitte und – falls vorhanden – die explizit bestätigten V528-Sängerrollen. Wort-/Lead-/Duett-Identitäten werden niemals aus Text, Songcover oder heuristischen Beats erfunden.
- Die vorhandene `components/KineticLyrics.tsx` im regulären UI und immersiven Bühnen-DOM wird angepasst: abgesicherte Zeilenbreite/Backdrop für Rap, dezente wortzeitmarkenabhängige Akzente, gemeinsamer Hook-Moment nur bei verifiziertem V604/V600-Hook. Der vorhandene Karaoke-Fill bleibt ausschließlich unter V477/V541/V549-Steuerung.
- In `components/visualizer/StageCameraDirectorV289.tsx` liegt V606 nach V605 und vor dem letzten V351-Sicherheitsguard. Das nutzt die vorhandene R3F-Kamera und vorhandene V540/V550-Frame-Metriken. Es gibt keine neue Kamera und keine zweite Kamerasteuerung. Die Vorlage bewegt die Kamera höchstens leicht zurück/seitlich für klarere Sänger-/Lyrics-Komposition; bei unsicherer Pose wird sie verworfen.
- Ressourcen: kein neuer Shader, kein Textmesh, kein Audio-/Request-/Render-Loop. Die Kamera fragt die aktuelle Liedzeile per binärer Suche ab und verarbeitet keine Wortliste pro R3F-Frame.

## Grenzen

- Manuelle Keyframes, Live-Editing, Rap-Shot-Overrides, manuelles Bühnenlayout, Fonts/Farben und Reduced Motion gewinnen. V606 greift bei Stopp, Low-Tier, fehlender gültiger Szenenidentität oder ungesicherten Textdaten nicht ein.
- Die V540/V550-Bildmetrik schätzt Bildschirmprojektionen; sie kann keine echte Occlusion, Lip-Sync-Glaubwürdigkeit, Lesbarkeit in Bewegung oder Bühnenschönheit beweisen.
- Die alternative 3D-Textmesh-Darstellung bleibt bewusst unangetastet. Die Kopplung ist für den vorhandenen Lyrics-DOM-Pfad und sein immersives Overlay gedacht.

## Befehle

```bash
npm run test:v606
npm run test:v606:types
npm run test:smoke:v606
npm run verify:v606
npm run build
```

`npm run build` verlangt lokale installierte Abhängigkeiten. Die Tests mit reinen Quellcode-Projektionen ersetzen keine Browser-/Pi-Abnahme.
