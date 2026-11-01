# V655 – Natural Concert Camera Intelligence

## Ziel

Die bestehende Konzertkamera wirkt waehrend Deutschrap-Verse stabiler, zeigt
verifizierte Lead- und Duett-Saenger angemessen und vermeidet identische
Wiederholungen. V655 ersetzt keine vorhandenen Regie- oder Sicherheitsbausteine.

## Umsetzung

- Trackgebundener, deterministischer Kamerazustand mit Mindesthaltezeiten:
  8,8 s im Verse, 5,1 s in Hook/Drop, 6,8 s im Build und 7,6 s im Break.
- Bei verifiziertem Saengerwechsel Wechsel fruehestens nach 1,75 s.
- Drei alternierende Winkelvarianten, keine Frame-fuer-Frame-Zufallsauswahl.
- Portrait/Duett nur bei bestaetigter V528-Vokalrolle mit sichtbaren 3D-Ankern.
  Nur bestaetigte V604-Abschnitte erlauben neutrale Gesamtaufnahmen.
- Kleine kameraeigene Bias-Werte und langsameres Easing. V550/V540-Framechecks
  lehnen jeden verschlechterten Zuschnitt ab. V351 bleibt letzte Schutzinstanz.
- Bei Pause, Reduced Motion, niedriger Qualitaet, manuell gespeicherten Shots,
  manueller Timeline oder fehlender Evidenz keine neue Kamerabewegung.
- Trackwechsel, Ruecksprung und grosse Fortschrittsspruenge setzen die
  Kamerahaltung zurueck; kein eigener Playback-Timer.

## Dateien

`components/visualizer/naturalConcertCameraV655.ts` enthaelt die pure Regielogik.
`components/visualizer/StageCameraDirectorV289.tsx` integriert diese in die
vorhandene Three.js-Kamera vor dem abschliessenden Lyrics-Schutz.

## Verifikation

`npm run test:v655` testet die Haltezeit, verifizierte Saenger, Serienwechsel,
Pause/Seek/Autoritaet manueller Shots, vertraegliche Bildrahmen und mehrere
Tausend Zeitschritte. `npm run test:v655:types` prueft den Pure-TS-Baustein.
`npm run test:smoke:v655` prueft die Kette bis V654.

Der komplette Projekt-Typecheck und der Next.js-Produktionsbuild sind erst
mit installierten npm-Abhaengigkeiten moeglich und damit derzeit unbestaetigt.
