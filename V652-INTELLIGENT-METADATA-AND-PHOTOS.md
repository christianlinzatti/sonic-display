# Sonic Display V652 – Intelligente Metadaten und szenenbasierte Künstlerfotos

## Daten-Zusammenführung

- **Künstler-Identität:** eine im begrenzten MusicBrainz-Suchergebnis genau einmal passende Künstler-ID hat Vorrang; das ist kein unabhängiger Identitätsnachweis. Stimmen MusicBrainz und Last.fm nicht überein, wird keine Künstler-MBID veröffentlicht und keine Song-/Album-MusicBrainz-Suche über eine widersprüchliche ID durchgeführt. Last.fm ohne unabhängigen MusicBrainz-Abgleich wird als `provisional` gekennzeichnet. Gleichnamige Künstler ohne eindeutige MusicBrainz-ID werden nicht erraten.
- **Provenienz:** `artist.fieldSources` zeigt für Name, Land, Gründungsdatum, Genre, Stil, Biografie, Hörerzahlen usw., woher die jeweiligen Werte stammen. `artist.identityStatus` benennt `verified`, `provisional`, `conflict` oder `unresolved`.
- **Genre und Songs:** Doppelte Genre-Tags werden unabhängig von Großschreibung/Abständen entfernt; leere und generische Platzhalter werden ignoriert. Last.fm-/TheAudioDB-Song- und Albumtreffer mit abweichendem Artist-Namen werden verworfen, falls der Anbieter den Artist liefert.

## Fotoauswahl für die Konzertbühne

- **Lyrics:** bevorzugt klare Künstlerportraits und ruhigere Bilder; Lyrics bleiben im Vordergrund.
- **Fotos (Hook/Drop):** bevorzugt große, breite Konzert- und Bühnenmotive.
- **Ausgewogen:** neutraler Wechsel; profilbasierte Spotify-Bilder und frei lizenzierte Commons-Aufnahmen haben höheren Vertrauensrang als reine Flickr-Suchergebnisse.
- **Dublettenschutz:** dieselben Bildseiten bzw. unterschiedliche Flickr-Auflösungen zählen als ein Motiv. Alle Bildquellen bleiben HTTPS; Bildcredits, Commons-Links und Flickr-Lizenzen bleiben erhalten.
- Die API `/api/stage-content/artist` ergänzt ihre bisherige Antwort um `selections: {lyrics,balanced,photos}`. Alte Clients können weiter `images`, `imageUrl`, `credits` verwenden. Der bestehende Bühnenrenderer wählt die Ordnung vorrangig anhand des bestehenden V350-Fotocues inklusive manueller Überschreibungen, ansonsten anhand von `lyricsActive` und dem Abschnitt (Verse/Hook/Drop); kein weiterer Renderloop und keine neuen Bilderdownloads durch die Regie.
- In der bisherigen Gallery-Vorschau kann zwischen den drei Bildszenen gewechselt werden. Es gibt **keine** automatische Garantie, dass ein Flickr-Suchergebnis tatsächlich den Künstler abbildet; das Bild muss gegebenenfalls manuell geprüft werden.

## Rechte und Betriebsgrenzen

- Flickr: nur die bereits erlaubten CC-Lizenzen (BY, BY-SA, CC0, Public Domain Mark) mit Urheber/Quelle; Lizenzpflichten können zusätzlich Namensnennung, Lizenzlink und Änderungskennzeichnung verlangen. Die Website-API-Nutzungsbedingungen gelten weiterhin.
- TheAudioDB-Fanart ist auf der Bühne standardmäßig **aus**, bis Bildrechte gesondert geprüft und `STAGE_THEAUDIODB_PHOTOS_ENABLED=true` gesetzt werden.
- Spotify-Künstlerbilder unterliegen den Spotify-Bedingungen, frei lizenzierte Bilder bleiben getrennt nachweisbar.
- Unterschiedliche Serverinstanzen können eine unabhängige MusicBrainz-Rate-Limit-Queue haben (bekannte Einschränkung aus V651).
- Keine neuen API-Schlüssel; bestehende `.env.local`-Konfiguration aus V651 bleibt gültig. Keine Secrets im Browser.

## Prüfungen

```powershell
npm run test:metadata:v652
npm run test:smoke:v652
npm run verify
```

Der vollständige TypeScript-Check und produktive Next.js-Build müssen in einer Umgebung mit installierten npm-Abhängigkeiten beziehungsweise durch GitHub Actions bestätigt werden. Bildidentität, Ästhetik und Darstellung auf der Zielhardware erfordern zusätzlich echte Browser-/Manuell-Tests.
