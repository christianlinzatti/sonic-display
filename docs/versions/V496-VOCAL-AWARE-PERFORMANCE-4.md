# Sonic Display V496 – Vocal-Aware Performance 4.0

## Neues Vocal Timeline Studio

Unter dem vorhandenen **V416 Rap Duet Studio** können Sänger-/Avatarrollen jetzt zusätzlich mit **exakten Start- und Endzeitpunkten** in Sekunden mit zwei Dezimalstellen (10-ms-Eingabeauflösung) bearbeitet werden. Die Zeitmarken sind pro Spotify-Track in den bestehenden UI-Einstellungen gespeichert. Keine Netzwerkübertragung oder zusätzlichen Dienste.

- Solo, Duett und gemeinsame Hook für 2–4 sichtbare Avatare; editieren, löschen, Vorschau ohne Spotify-Seek, aktuelle Zeit übernehmen.
- Synchronisierte Lyrics sind **nicht notwendig**. Bei 2/3/4 Avataren werden nur vorhandene Slots verwendet. Die bisherigen V416-Lyrics-Regieanweisungen bleiben gültig.
- Priorität: **V385 manuell festgelegte Lyrics-Sänger > explizite V496-Zeitmarken > V416-Duett-Zeilen**. Ein manueller Stage-Cue kann neue Zeitmarken unterdrücken.
- Die **bestehenden** Duett-/Vocal-Rig-/Kamera-Interaktionspfade (V376/V385/V416/V368) werden weiterverwendet. Kein zweiter Mixer, keine zweite Morph-Animation-Schleife, kein erzwungener Kamera-Schnitt.
- Songwechsel/Seek sind zustandslos; Zeitmarken anderer Tracks werden nicht verwendet. Pause und fehlender Track deaktivieren den Cue.
- Die Zeitmarken sind **künstlerisch vom Nutzer gesetzte Regieangaben**, keine Sängererkennung, keine Stimmtrennung oder Phonem-Zeitstempel.
- Max. 120 gespeicherte Abschnitte je Track, 180 Tracks und eine Spieldauer von höchstens vier Stunden. Ungültige, übergroße und fehlerhafte Einträge werden beim Verwenden verworfen; spätere überlappende Einträge gewinnen.

## Architektur und Tests

- `vocalTimeDirectorV496.ts`: reine, deterministische Typ-/Zeit-/Cue-Logik.
- `VocalTimeEditorV496.tsx`: Editor in den Einstellungen.
- `VisualizerStage.tsx`: Song-spezifische Weitergabe an die bereits vorhandenen `VisualizerProps.lipSync`.
- `DanceFormationActorsV492.tsx` und `GroupDancersV326SceneV492.tsx`: V496-Cue im bestehenden V416-Cue-Pfad priorisieren. `StageCameraDirectorV289.tsx` verwendet die vorhandene Kamera für V496-Fokus nur, sofern keine manuelle Kamera aktiv ist. `useGltfVocalMotionV492.ts` und `ProceduralDancerAvatarV492.tsx` nutzen die bereits verteilten tatsächlichen Sänger-Cues für Gesten.
- `npm run test:v496` und `npm run test:v496:types` für isolierte Tests; `npm run typecheck && npm run build` auf dem Windows-Rechner.
