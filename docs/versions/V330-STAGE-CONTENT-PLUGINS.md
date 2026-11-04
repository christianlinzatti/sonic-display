# Sonic Display V330 — Stage Content Plugins

## Ziel

V330 fügt eine **optionale Content-Leinwand im 3D-Avatar-Modus** hinzu. Die Leinwand ist als CSS3D-HTML-Fläche an der React-Three-Fiber-Bühne befestigt, damit Spotify-Canvas-Videos ohne Zugriff auf eine WebGL-VideoTexture abgespielt werden können. Das reduziert Probleme durch fehlende CORS-Header, garantiert aber **keine** Wiedergabe (Host-/Browser-/Autoplay-Beschränkungen gelten weiterhin). Bei Videofehlern erscheint das Albumcover. Bestehende Bühnen und GLB-Animationen bleiben unangetastet.

Einstellungen: `Settings → Dynamic Stage → Stage Content Plugins V330`. Die Integration ist standardmäßig **aus**. Albumcover + Canvas können aktiv sein, sobald die Leinwand eingeschaltet wird; die Spotify-Künstlerfotoquelle ist einzeln zuschaltbar.

## Module und Status

| Plugin | ID | Sofort nutzbar? | Voraussetzung |
| --- | --- | --- | --- |
| Spotify Canvas | `canvas` | Bei erfolgreicher inoffizieller API | Spotify-Sitzung; gültiger 22-stelliger Track-ID; zugängliche Canvas-URL |
| Albumcover | `cover` | Ja | Cover-URL im Track-Objekt |
| Künstlerfoto | `photos` | Optional sofort über Spotify-Suche | Spotify-Sitzung; `/api/stage-content/artist?artist={artist}` |
| Künstlerbeschreibung / Texte | `text` | Adapter fertig, API anzuschließen | Next.js-Route mit JSON; kein Spotify-Biografie-Endpunkt |
| Nächste Konzerttermine | `concerts` | Adapter fertig, API anzuschließen | Next.js-Route mit zulässigem Event-Provider |

## Die Architektur

- `services/stageContent/stageContentV330.ts`: Datenvertrag, Speicherung und Eingabevalidierung.
- `services/stageContent/providersV330.ts`: Plugin-Registry und asynchrone Adapter; liefert immer dieselbe `StageContentV330`-Form.
- `services/stageContent/useStageContentV330.ts`: Trackwechsel, AbortController, Rotation, Farbwahl.
- `services/stageContent/paletteV330.ts`: performantes 48×48-Quantisierungsverfahren, mehrere repräsentative Albumfarben, Wiederverwendung der bestehenden Bühnenlichter.
- `components/visualizer/StageContentScreenV330.tsx`: 3D-Leinwand für Videos, Fotos, Texte, Veranstaltungsliste.
- `components/visualizer/StageContentPluginSettingsV330.tsx`: Einstellungen, Provider, API-Pfade und aktuelle Vorschau.
- `app/api/canvas/route.ts`: Spotify Canvas via serverseitigem Sitzungstoken (inoffizieller Spotify-Endpunkt).
- `app/api/stage-content/artist/route.ts`: optionaler Künstlerfoto-Provider via Spotify Artist Search.

## API-Verträge für Erweiterungen

**Wichtig:** In die Einstellungen nur lokale Next.js-API-Pfade unter `/api/...` eintragen, **keine** API-Schlüssel und **keine** URLs zu externen Diensten. Für einen künftigen Dienst (z. B. Song-Biografie/Konzertdaten) erst eine eigene Route mit serverseitigem `process.env.PROVIDER_API_KEY` schreiben und deren JSON-Ergebnis an den Client liefern. Die UI verlangt weder neue GLB-Materialien noch eine Änderung an der Bühnenkomponente.

Platzhalter in konfigurierten Routen: `{artist}`, `{trackId}`, `{title}`. Beispiel:

`/api/stage-content/concerts?artist={artist}`

### Text / Künstler-Biografie

```json
{
  "title": "Über den Künstler",
  "text": "Dieser Künstler ..."
}
```

Alternativ `description` oder `bio` statt `text`. Text ist auf 1600 Zeichen begrenzt.

### Künstlerfotos

```json
{
  "title": "Artist Name",
  "imageUrl": "https://cdn.example.com/artist.jpg"
}
```

Alternativ `photoUrl`, `url` oder `images: [{"url":"https://..."}]`. Nur HTTPS-Medien (oder HTTP von localhost) werden akzeptiert.

### Nächste Konzerte

```json
{
  "title": "Tourtermine",
  "events": [
    { "date": "2026-11-21", "title": "Live in Wien", "venue": "Arena", "city": "Wien", "url": "https://tickets.example.com/xyz" },
    { "date": "2026-12-03", "title": "Live in Graz", "venue": "Postgarage", "city": "Graz" }
  ]
}
```

Alternativ `concerts` statt `events`; `name` statt `title` und `startDate` statt `date`. Höchstens zwölf Datensätze werden verarbeitet, maximal vier gleichzeitig angezeigt. Kein Konzertdatum wird erfunden; fehlende Ergebnisse führen zu keinem Platzhaltertermin.

## Spotify Canvas: technische Risiken

`https://spclient.wg.spotify.com/canvaz-cache/v1/tracks?track_ids=...` ist **keine öffentlich dokumentierte Spotify-Web-API**. OAuth-Token des Web-Players können vom Dienst abgewiesen werden. Response-Format und Verfügbarkeit können sich ändern. Der Endpunkt validiert IDs und behandelt Antworten ohne Canvas mit `{canvasUrl:null}`. Eine erfolglose Quelle verhindert nicht, dass Cover oder andere Plugin-Inhalte angezeigt werden. Der Browser muss externe Video-URLs tatsächlich laden und wiedergeben dürfen. Die Nutzung sollte mit den Spotify-Plattformbedingungen abgeglichen werden.

## Farbpaletten

Inspiriert von **ColorThief / SpotifyColorSorting**, allerdings als kleines TypeScript-Modul umgesetzt und in die bestehende V168/V169-Beleuchtung integriert. Das Bild wird verkleinert, in 4-Bit-RGB-Buckets gesammelt und nach Häufigkeit sowie Farbsättigung gewichtet. Die zweitstärkste Kontrastfarbe wird als `secondary` verwendet. Die ursprünglichen Lichtfarben bleiben erhalten, wenn Sampling (etwa wegen CORS) scheitert. Diese Coverfarben werden **nur** bei aktivierter Option `Coverfarben für Bühnenlichter` angewandt.

## Manuelle Konfiguration

- Quellen ein-/ausschalten (Canvas, Album, Text, Fotos, Konzerte)
- Reihenfolge der Anzeige entspricht der Provider-Registry; nur tatsächlich verfügbare Inhalte werden rotiert
- Wechselintervall 5–120 Sekunden
- Position hinten, links, rechts; Skalierung 50–200 %, Höhe -0.4…2.8
- Coverfarben für die vorhandenen Bühnenlichter separat aktivieren
- Text-, Foto-, Konzert-API-Pfade lokal konfigurieren

## Entwicklung / Prüfstand

```bash
npm install
npm run test:v330
npm run verify
```

Die Offline-Regressionen bis V330 und die isolierte strenge TypeScript-Prüfung der Kernmodule wurden durchgeführt. Ohne installierte npm-Abhängigkeiten sind ein vollständiger Next.js-Produktionsbuild und ein Browser-/WebGL-Test nicht möglich; Video- und Spotify-API-Verhalten müssen mit einer angemeldeten Spotify-Sitzung geprüft werden.
