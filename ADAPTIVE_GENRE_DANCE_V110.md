# V110 – Adaptive Genre Dance Intelligence

## Bedienung
Settings → Avatar & Tanz → Motion Timeline Studio → Adaptive Genre Dance Intelligence.

- **Auto** reagiert auf Track-/Genrewechsel. Automatische Ausführung ist bewusst **standardmäßig deaktiviert**, damit bestehende Timelines nicht überschrieben werden.
- **Live Smart Dance** aktiviert die bestehende reaktive Tanzsteuerung und schaltet eine zuvor aktive Timeline aus.
- **Generierte Timeline** generiert aus den verfügbaren Clips eine neue Choreografie; bei aktiviertem Auto kann das eine selbst bearbeitete Timeline ersetzen.
- Profile: Deutschrap/Trap (weniger aggressiv, Head-Nod und Bounce), Hip-Hop, Hardstyle, Hardtekk, Techno, Pop, Ambient.
- Genre-Override und BPM-Override sind möglich; Einstellungen werden mit den bisherigen UI-Preferences gespeichert.

## Grenzen
Spotify gibt keinen auswertbaren Audiostream an die Web-App. Die Genreeinschätzung hängt von der vorhandenen API-Genreerkennung ab; "Deutschrap" wird als manuelle Profileinstellung sicher unterstützt, bei Genre-Erkennung kann Hip-Hop als Fallback auftreten. Das Mikrofon liefert nur lokal gemessene Audiosignale. Ein Lied wird nicht zuverlässig in Verse/Hook/Drop unterteilt, ohne eine vorherige separate lokale Dateianalyse. Nur vorhandene Animationsclips können abgespielt werden.

## Build
`npm install && npm run typecheck && npm run build`
