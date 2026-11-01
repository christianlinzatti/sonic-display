# Sonic Display V714 – Music Taste Evolution

## Funktionsumfang

Unter **Zuletzt gespielt → Last.fm-History → Dein Musikgeschmack im Wandel** erscheint die rein lesende Zeitreihenanalyse für die auf dem Gerät gespeicherten Last.fm-Scrobbles. Die Ansicht wird aus demselben vollständigen, kontogebundenen IndexedDB-Archiv wie V711/V712 berechnet, nachdem V713 gegebenenfalls die ältere localStorage-History migriert hat. Es entstehen **keine zusätzlichen Last.fm- oder Spotify-Anfragen**.

- **Jahresvergleich**: Scrobbles, Künstler, verschiedene Songs und aktive Kalendertage; Null-Jahre werden explizit als 0 gezeigt. Bezugsjahr ist frei wählbar; die Vergleichsbasis ist das Kalenderjahr davor. Ein Auf-/Abwärtstrend wird nur berechnet, wenn beide Jahre überhaupt erfasste Wiedergaben enthalten.
- **Neu im Archiv**: Künstler, deren ältester *lokal erfasster* Scrobble dem ausgewählten Kalenderjahr zugeordnet ist. Keine Behauptung über erstmaliges tatsächliches Hören oder Veröffentlichungen.
- **Wiederentdeckt**: Künstler mit Scrobble im ausgewählten Jahr und mindestens einem vollständig dazwischenliegenden Kalenderjahr ohne archivierten Scrobble. Die Aussage bezieht sich ausdrücklich auf die Archivdaten, nicht auf bewiesene Hörpausen.
- **Im Jahresvergleich häufiger/seltener**: absolute Differenzen der tatsächlich gespeicherten Scrobbles; bei fallenden Künstlern werden auch solche mit null Events im Zieljahr berücksichtigt. **Keine** automatischen Aussagen über Beliebtheit, Stimmungen oder Hörzeit.
- **Langjährige Favoriten**: Künstler, die in mindestens drei verschiedenen Kalenderjahren und im gewählten Zieljahr erfasst wurden.
- **Künstlerjahres-Matrix**: sechs relevante Künstler über sämtliche Archivjahre, mit explicit Nullwerten.
- **Zeitzone**: `Europe/Vienna` inklusive Sommer-/Winterzeit oder `UTC`, mit zeitzonengerechten Kalenderjahresgrenzen.

## Datenvertrag und Grenzen

Der Datenkern `lib/lastfm-taste-evolution-v714.ts` akzeptiert ausschließlich plausible Scrobble-Daten nach Jahr 2000, kanonische UTC-Zeitstempel, begrenzte Artist-/Track-Texte und keine Zukunftsdaten. Er normalisiert Künstler- und Titelschreibweisen (Unicode NFKC, trimmen, Kleinschreibung), zählt echte Scrobbles aber einzeln. Input wird nicht verändert. Das Modul hat weder Netzwerk- noch Browserspeicher-Zugriffe. Die Oberfläche `components/LastFmTasteEvolutionPanelV714.tsx` zeigt nur die bereits in der Parent-Komponente geladenen Events an.

Auch das IndexedDB-Langzeitarchiv ist **keine Garantie einer lückenlosen Last.fm-Historie**. Ohne archivierte Wiedergaben darf eine Nullreihe nicht als „nicht gehört“ interpretiert werden. Weil Track-/Artist-Genres aus der Historie allein nicht zuverlässig ableitbar sind, **werden Genres in V714 bewusst nicht behauptet**. Mögliche Last.fm-Tags einschließlich fehlender oder mehrdeutiger Zuordnung gehören erst zu V717 „Personal Genre DNA“.

### Bewahrte Verträge

- V713 IndexedDB, Legacy-Migration und JSON-Backup bleiben unverändert.
- Die Spotify-History V701–V705 und V707-Quelle bleiben unverändert; keine zusätzliche Scrobble-Übertragung.
- Die bestehende Last.fm-API und der serverseitige API-Schlüssel werden nicht erweitert.
- Bereits aktiviertes Spotify Scrobbling in Last.fm bleibt allein für die Übertragung zuständig.

### Tests

`npm run test:v714`, `npm run test:v714:types`, `npm run test:v714:ui-types`, `npm run test:quick`. Der isolierte Datenkern-Test prüft 83 Testgruppen, 12.000 falsche Events und über 8.000 gültige Archiv-Einträge. Siehe `V714-VERIFICATION.md`.
