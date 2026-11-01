# V678 – Musikalische Atmosphäre aus Live-Audio

## Implementierung

- **Opt-in**, standardmäßig **AUS**: Konzert-Designer → „Musikalische Atmosphäre“. `liveMoodEnabledV678`, `liveMoodStrengthV678` (Standard 45%), `liveMoodDanceV678` (Standard an).
- Datenquelle ausschließlich **aktiviertes Mikrofon** aus vorhandener `AudioAnalysisProvider`-Kette. Ohne Berechtigung/Signalquelle keine Messung, keine Annahme aus Spotify-Playback oder Genre. Kein Spotify-Audiofeatures-API-Zugriff, keine zusätzlichen Netzwerkanfragen.
- Akustische Heuristik: `ruhig` (geringe Lautheit), `atmosphärisch` (weicher/perkussionsärmer), `treibend` (mehr Energie), `druckvoll` (hohe Energie/Impulse). **Keine echte Erkennung von Trauer, Glück, Aggressivität oder individueller Stimmung.**
- 4 Sekunden Fenster / maximal 40 Stichproben, 8 Stichproben Initialisierung, 5-fache Bestätigung für einen Moduswechsel, Mindestabstand 1,5 Sekunden. Songwechsel, Pause, Verbindungsverlust und ausgeschaltetes Mikrofon leeren den Modus. Keine Speicherung von Mikrofondaten oder Samples.
- Bühnenreaktion **ohne mutierende Settings**: Nach allen V669/V670/V671-Regeln maximal ±8 Punkte finales Licht und ±8% additive Tanzintensität, ausschließlich wenn keine manuell festgelegten Clips, Timelines, Blends oder Tänze vorrangig sind. Bei `reducedMotion` keine Akzente. Kamera, Text, Sängerzuweisung, Keyframes und gespeicherte Looks bleiben unverändert.
- Die Opt-in-Werte sind in `UiPreferences` enthalten und damit über vorhandene Einstellungen und Backup gesichert; die temporären Akustikproben niemals.

## Validierung

`npm run test:v678`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run typecheck` und `npm run build`. Vor einer produktiven Freigabe den tatsächlich erfolgreichen TypeScript- und Next.js-Build auf einem System mit allen Node-Abhängigkeiten prüfen.
