# V705 – Smart Music Discovery Studio

## Wo öffnen?

Sonic Display → **Zuletzt gespielt** → **♫ Musikvorschläge**. Nach bestätigter Spotify-Kontoidentität wähle Genre (Deutschrap / Hardstyle / Hardtekk) und Suchmodus:

- **Gemischt**: Zwei Genre-Katalogsuchen plus eine gezielte Suche nach einem im Archiv häufig erfassten Künstler.
- **Genre entdecken**: Drei auf jeweils zehn Ergebnisse begrenzte Spotify-Genre-Suchen.
- **Andere Künstler**: Genre-Suche, wobei bekannte Künstler-Credits aus dem lokalen Archiv ausgefiltert werden.
- **Bekannte Künstler**: Suche nach bis zu zwei häufig erfassten Künstlern des Archivs, ohne das gewählte Genre als verbindliches Kriterium zu behaupten.

**„Musikvorschläge suchen“** startet höchstens drei normale Spotify-Katalogabfragen; bei Spotify-Limits oder fehlender Berechtigung erscheinen begrenzte bzw. keine Ergebnisse mit Fehlermeldung. Die bestehende API `/api/spotify/music-discovery` wird unverändert wiederverwendet, **kein** Spotify-Recommendations-Endpunkt. Spotify kann ungenaue Genre-Treffer liefern. Die Katalogsuche sagt nichts über Bekanntheit oder Hörhistorie außerhalb dieses Geräts aus.

## Persönliche Einordnung, Datenschutz

- Die vorhandenen V701-Archivdaten bleiben im lokalen Browser-Speicher; keine Titelliste, Zeitstempel, Token oder Spotify-User-ID des Archivs werden an den neuen Such-Endpunkt gesendet.
- Ausschließlich die drei explizit auswählbaren Genre-Bezeichner oder – bei Gemischt/Bekannte Künstler – eine bereinigte Künstlernamen-Suchanfrage werden an die existierende serverseitige Spotify-Suche übermittelt.
- Vor dem Start jeder Suche wird die aktive Spotify-Kontoidentität erneut geprüft. Konto- oder Archivwechsel stoppt frühere Suchergebnisse.
- Treffer werden anhand der **Track-ID** gegen lokal archivierte Songs abgeglichen. Nicht im Archiv heißt **nicht nachweislich ungehört**; Genre-Suche heißt **kein verifiziertes Genre jedes Treffers**.
- Speicherung/Start einer Wiedergabe erfolgen nicht automatisch; ein Spotify-Link öffnet den Titel bei Spotify.
- Ohne angelegtes Archiv sind keine persönlichen Ausschlüsse möglich. Archiv-Funktion V701/702 und Live-Recorder bleiben unverändert.

## Implementierung / Qualität

`lib/smart-music-discovery-v705.ts`: reine, typisierte Suchplanung + defensive Ergebnisvalidierung, maximal 18 Kandidaten, max. 4 pro Künstler, höchstens 3 x 10 Ergebnisse. `components/SmartMusicDiscoveryStudioV705.tsx`: Modal-Panel mit Konto- und Archividentitätsprüfung, auf Klick ausgelösten Netzwerkabfragen, Abbruch vorangehender Abfragen, zugänglichen Auswahlfeldern, Herkunftshinweisen und responsiven Titellisten. Test-Skripte: `npm run test:v705`, `npm run test:v705:types`, `npm run test:v705:ui-types`; Regression: `npm run test:quick`. Für einen echten Browser-/Spotify-Test sind gültige Zugangsdaten und installierte npm-Abhängigkeiten erforderlich.
