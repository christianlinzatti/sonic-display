# Sonic Display V369 – Facial Performance & Vocal Camera

**Basis:** vollständiges ZIP V368, Version `0.1.0-v369`. Bestehende Spotify/LRCLIB/Genius-, Musik-, Choreografie- und Lyrics-Komponenten bleiben erhalten.

## Neue Funktionen

- `facialPerformanceV369.ts`: gemeinsame abgestimmte Kiefer-/Lippen-Targets für GLB-/prozedurale Avatare, Lippenverschluss bei B/M/P mit Priorität vor Kieferöffnung, gegenseitige Dämpfung von Round/Wide, zusätzliche Wangen-/Augen-Squint-Ziele bei kompatiblen Morphs; Kiefer-Slider.
- `vocalCameraV369.ts`: ausschließlich textbasierte Vorhersage markanter Vocals aus getakteten Wörtern, Phrasenende und Interpunktion. Modi **Aus / Nur markante Wörter / Performance**. Kurzer deterministischer Kamera-Hold über Wortlücken, langsame weiche Kameraübergänge, seek-/pause-feste Rückstellung.
- Beide bisherigen exklusiven Kameratreiber werden erweitert, **kein zweiter Kamera-Controller**: `StageCameraDirectorV289` respektiert explizite Live-Edits, Manual Mode und gespeicherte Presets, `SmartStageCameraV236` verwendet dieselbe reine Cue-Planung. Die V351-Kollisions-/Lyrics-Schutzlogik bleibt zuletzt aktiv und garantiert minimale Kameradistanz/FOV bei eingeblendeten Lyrics.
- Wenn vorhanden, wird die Welt-Y-Position des Kopfknochens eines GLB oder des prozeduralen V369-Kopfes höchstens viermal pro Sekunde gelesen; sonst nur ein konservativer Höhenoffset. Bei Duos bleibt die Kamera deutlich weiter entfernt.
- Anzeige-Einstellungen: `avatarJawFollowV369`, `avatarVocalCameraV369`, `avatarVocalCameraStrengthV369`, mit Defaults/Reset und bestehender Preference-Speicherung.

## Einschränkungen

Keine Audio-/Phonem-Extraktion, kein Sprecheridentitäts-Erkennen und keine garantierte echte Lippensynchronität. Kamera-Nahaufnahmen nur bei echten Wort-Zeitstempeln, nicht bei LINE_SYNCED, unsynchronisierten Lyrics oder instrumentalen Zeilen. Gesichts-Morphs wirken nur bei kompatiblen Avatar-Rigs; der Kieferknochen bleibt Fallback. Manuelle Kamerasteuerung und gespeicherte Shots haben Priorität. Reduced Motion deaktiviert automatische Nahaufnahmen.

## Prüfungen

`npm run test:v369` prüft Kiefer-/Lippenkoordination, Pausen, Auto-Akzente, Nahaufnahme-Begrenzung, Lyrics-Schutz, kurze Haltezeiten, Seeking sowie Verkabelung von Steuerung und UI. `npm run check:syntax` überprüft alle TS/TSX-Quellen. Vollständiger `npm run verify` benötigt lokal installierte `node_modules` und Next.js-Abhängigkeiten; das Archiv enthält diese nicht.
