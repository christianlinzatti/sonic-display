# Sonic Display V449 – Smart Artist & Music Discovery

Aufbauend auf V448 und ohne zusätzliche Serverdienste, Token oder neue Datenquellen.

## Was V449 kann

- **Verifizierte Songverbindungen:** Genius-`song_relationships` liefern explizit verknüpfte Sample-/Interpolations-/Cover-/Remix-Songs samt konkreter Genius-Quelle. Bis zu sechs unterschiedliche Titel werden pro Song angezeigt, ohne doppelte URLs.
- **Produzenten & Feature-Künstler:** Bis zu drei Produzenten und zwei Feature-Artists aus den Credits. Wenn ein individuelles Genius-Profil nicht vorhanden ist, verweist der Genius-Link auf die Credits des aktuellen Songs statt auf ein geratenes Profil.
- **Entdeckungs-Teaser:** Ein kurzer Hinweis wechselt alle 42 Sekunden zwischen den tatsächlich vorhandenen Daten. Er bleibt in der Songspalte und liegt nie über der 3D-Bühne oder Lyrics.
- **Aufklappbare Detailansicht:** Enthält Gründe für die Verbindung, Künstlernamen, anklickbare Quellen und eine direkte Spotify-Katalogsuche. Standardmäßig geschlossen.
- **Verbindung mit bestehender Spotify Music Discovery (V361):** „Auf Spotify suchen“ öffnet den vorhandenen Song-Suchdialog mit dem gewählten Titel/Künstler oder Produzentennamen. Ergebnisse sind Spotify-Katalogtreffer, **keine geprüften Produktionstitel oder personalisierten Empfehlungen**.
- **Option in Anzeige-Einstellungen:** `geniusDiscoveryEnabledV449` (Standard `true`), gleichzeitig bleibt V447 an/aus der übergeordnete Genius-Schalter.

## Datenquellen und Grenzen

Die Songdaten kommen über denselben geschützten `/api/genius/insights`-Endpunkt wie V447/V448. Der `GENIUS_ACCESS_TOKEN` bleibt auf dem Server und vorhandenes In-Memory-Caching gilt weiter. Kein neuer externer Request je Entdeckungs-Teaser. Ohne gültigen Spotify-Login/Genius-Token, ohne eindeutigen Song-Treffer oder ohne belegte Verbindung erscheinen keine Empfehlungen.

Genius liefert nicht für alle Songs Sample- und Künstler-Beziehungen. Die direkte Spotify-Suche **behauptet keine Verfügbarkeit** und sucht bei Produzenten nur nach deren Namen. V449 erstellt keine fiktiven Song-IDs, Sprecherwechsel, Sample-Jahreszahlen, Lyrics-Zeitstempel, Rankings oder Künstler-Ähnlichkeiten. Bereits gespeicherte Vocal-/Camera-/Motion-Overrides bleiben unverändert. Externe Quellen werden auf erlaubte HTTPS-Genius-Domains begrenzt; fremde Bilder werden nicht nachgeladen.

## Technische Integration

- `services/genius/musicDiscoveryV449.ts`: rein funktionale, begrenzte Parsing-/Auswahl- und Query-Logik.
- `services/genius/songInsightsV447.ts`: zusätzliche optionale `discoveries` im bereits bestehenden Antworttyp.
- `components/GeniusMusicDiscoveryV449.tsx`: barrierearme, standardmäßig geschlossene `<details>`-Liste; verlinkt zu Originalquellen.
- `components/GeniusSongInsightsV447.tsx`: eigenständige Entdeckungsleiste auch während V447-Ruhephasen; getrennt vom zeitgesteuerten Kartenwechsel.
- `components/MusicDiscoveryV361.tsx`: akzeptiert ein eng validiertes internes Suchereignis und öffnet den vorhandenen Spotify-Suchdialog.
- `components/SonicDisplay.tsx`, `components/SettingsPanel.tsx`, `types/music.ts`, `context/UiPreferencesContext.tsx`: Weiterleitung und Preference.
- `app/globals.css`: begrenzte Abmessungen, Fokusmarkierungen, Reduced Motion.

## Lokal prüfen

```bash
npm install
npm run verify:v449
npm run typecheck
npm run build
```

Die Offline-Prüfungen prüfen nur Quelltext/Kernfunktionen; echte Genius- und Spotify-Antworten und WebGL-Rendering benötigen einen laufenden Browser mit Zugangsdaten.
