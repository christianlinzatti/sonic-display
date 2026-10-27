# V567 – Verification (25.10.2026)

## Durchgeführt

- `npm run test:v567` – **55/55** deterministische Tests für gültige Wort-Zeitmarken, Zeilen-Fallback, Wortlücken, Pause/Reduced Motion, ungültige Provider-Markierungen, nur autorisierte Sängerrollen, unveränderte Kiefer-/Lippenkanäle, Mikro-Karaoke-Akzente und reale GLB-/Procedural-Verkabelung.
- `npm run test:v567:types` – gezielte TypeScript-Prüfung des neuen Planers erfolgreich.
- `npm run verify:v567` – komplette V554–V567-Releasekette einschließlich gezielter TS-Checks, `check:syntax` (**789 TS/TSX-Dateien**) und `check:architecture` (**340 Quellverweise / 10 Abschnitte**) erfolgreich.
- Weitere gezielte Alt-Regressionen: V415, V472, V473, V476, V499, V515, V516, V523, V526, V538, V551, V552 und V553 ausgeführt und bestanden. Statische Quellcode-Assertions der früheren Tests wurden an den neuen tatsächlichen Pipeline-Pfad angepasst, ohne ihre Fachlogik zu ändern.

## Nicht durchgeführt

- `npm install`, vollständiges `tsc --noEmit` im ganzen Projekt und `next build` (kein installiertes `node_modules` in der gelieferten Quelle, kein Netzwerkzugriff in der Arbeitsumgebung).
- Echte WebGL-GLB-Sichtprüfung, gemessene Raspberry-Pi-FPS/Temperatur oder Spotify-Playback mit Live-Lyrics; deterministische Tests ersetzen diese nicht.

## Bekannte Grenzen

- Wortmarken sind Provider-Timing, **keine erkannte Stimme oder Akustik-Phoneme**. Während der Wiedergabe können bestehende nutzerdefinierte Mund- und Lyrics-Zeitoffsets bewusst unterschiedlich sein.
- Zusätzliche Bewegung wird nur in vorhandene, erlaubte Gesichts-/Tanzkanäle eingestreut; Wort-Lücken und line-only Quellen bekommen keine synthetische Wort-Bewegung.
- High-Tier: minimaler Zusatzakzent auf 3D-Karaoke-Skalierung und Outline; Low-Tier: kein zusätzlicher V567-Akzent.
