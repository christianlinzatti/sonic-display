# Sonic Display V651 – Erweiterte Künstler- und Musikmetadaten

## Neue Datenquellen

- **MusicBrainz:** Künstler-MBID, Herkunft, Gründungsdatum, Recording-MBID/ISRC und Release-Group mit erstem Veröffentlichungsdatum. Kein Key; identifizierender User-Agent und maximal eine Anfrage pro 1,1 s pro Serverprozess. Bei mehreren Serverinstanzen kann keine gemeinsame IP-Rate garantiert werden.
- **TheAudioDB:** Künstlergenre, Stil, Stimmung, Biografie (DE bevorzugt, EN Fallback), Label, Album-/Track-Informationen. V1-Key `123` ist die öffentliche eingeschränkte Teststufe, eine Premium-ID kann gesetzt werden. Fanart in der Galerie nur bei explizitem Opt-in.
- **Last.fm:** `artist.getInfo`, `track.getInfo` und `album.getInfo` mit Tags, ähnlichen Artists, Hörerzahlen, Biografie und Songdetails. Vorhandene `/api/genre`-Integration bleibt unverändert.
- **Flickr:** `flickr.photos.search` mit Künstler-Abgleich, SafeSearch, ausschließlich CC BY / CC BY-SA / CC0 / Public Domain Mark und Bildnachweisen. Die Suche garantiert nicht, dass alle Treffer tatsächlich den Künstler darstellen; daher Vorschau kontrollieren. API-Key erforderlich.

## API

Mit gültiger Spotify-Sitzung:

`GET /api/music-metadata?artist=Coldplay&track=Yellow&album=Parachutes`

Ausgabe: Künstler-, Track- und Albumobjekte sowie pro Provider `ok`, `empty`, `disabled`, `error`. Keine externen API-Keys in Browserantworten. Externe Fehler reduzieren die Daten, legen aber nicht die ganze API lahm. Album/Track sind optional.

## Sichtbare Integration

Im vorhandenen **Gallery Preview Editor** kann man Künstler, optional Song und Album eingeben. Anzeige von Genres, Bio, Hörerzahlen, ähnlichen Artists und API-Status. Die bestehende Bühnen-Fotogalerie erhält lizenzgeprüfte Flickr-Bilder, TheAudioDB-Bilder nur optional. Die vorhandene Künstler-Biografie erhält TheAudioDB/Last.fm als Fallback nach Wikipedia.

## Konfiguration (`.env.local`, ausschließlich Server)

```dotenv
LASTFM_API_KEY=...
FLICKR_API_KEY=...
THEAUDIODB_API_KEY=123
MUSICBRAINZ_ENABLED=true
THEAUDIODB_ENABLED=true
STAGE_FLICKR_ENABLED=true
STAGE_THEAUDIODB_PHOTOS_ENABLED=false
```

Für MusicBrainz ist kein API-Key erforderlich; Flickr und Last.fm benötigen Schlüssel. Spotify bleibt die Authentifizierung für die bestehenden Bühnen-Endpunkte. Produktive Nutzung und Rechte hängen von den jeweiligen Anbieterlizenzen ab; insbesondere TheAudioDB-Fanart ist ohne gesonderte Prüfung deaktiviert.

## Build und Tests

- `npm run test:metadata:v651` – pure JSON-Normalisierung und simulierte Provideraufrufe inkl. Key-Isolation und Cache.
- `npm run test:smoke:v651` – integriert die neuen Tests in die bisherige V651-Suite.
- `npm run check:release` – schließt die Metadaten-Tests ein, zusammen mit dem vollständigen Typecheck.
- `npm run verify` – vollständige Alt-Regressionen, Typecheck und Next.js-Produktionsbuild.

Keine Secrets werden beim Modulimport oder beim Next.js-Build benötigt. Netzwerk-Live-Tests benötigen eine gültige Spotify-Session, die Provider-Keys und eine Internetverbindung und sind nicht Teil der deterministischen CI-Tests.
