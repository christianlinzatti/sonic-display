# Sonic Display V676 – Persönlicher Konzert-Designer

**Neu:** Im Dialog **Zuletzt gespielt** gibt es den Tab **Konzert-Designer**. Er funktioniert auch ohne Spotify-Verbindung oder geladene Hörchronik. Das Musikprofil liefert optional Inspiration aus V675, sobald Last.fm-Genres auf ausdrückliche Nutzeraktion ermittelt wurden.

## Show-Look gestalten

- Stilisierte, schlanke Vorschau (kein 3D-Live-Renderer) mit auswählbarer Bühnenwelt.
- Genre-Tag für Deutschrap, Hardtekk, Hardstyle, Rock, Pop und alle weiteren Genres der zentralen `config/musicGenres.ts`-Registry, oder universeller Look.
- Einstellbar: Bühne (`stageTheme`), Lichtstärke, musikreaktives Licht, Tanz-Preset, DanceFX-Ein/Aus und FX-Stärke. **Lyrics, Kamera, Songdramaturgie, Sängerzuordnung, Avatar-Modelle, Bewegungsklipps und andere Settings werden weder gespeichert noch überschrieben.**
- „Aktuelle Show übernehmen“ kopiert nur die sechs sichtbaren Regler in den Entwurf. Ein Musikprofil-Vorschlag kopiert nur dieselben Show-Werte; beide Aktionen verändern die laufende Bühne **nicht**.
- „Speichern“ legt einen neuen Look an oder aktualisiert einen zuvor gewählten Look, maximal 24. Liste mit Genre-Filter, „Bearbeiten“, „Kopie erstellen“, zweistufigem „Löschen“ und explizitem „Auf Bühne anwenden“.
- „Letzten Look rückgängig machen“ stellt die vorherigen sechs Werte wieder her, **nur sofern sie inzwischen nicht erneut geändert wurden**. Es gibt keinen automatische Genre-Umschaltung.

## Speicher und Gerätewechsel

- Lokales Schema `sonic-concert-looks`, Version 1, maximal 24 Looks, mit strikter Validierung aller Felder und Grenzen. Vorhandene beschädigte Daten werden nicht stillschweigend überschrieben.
- Speicherung in `sonic-display:v676:concert-looks`. Keine Spotify-Hörchronik, Cookies, Tokens oder Account-ID werden gespeichert.
- Manuell JSON exportieren/importieren, bei Import werden bestehende Looks nicht überschrieben.
- Neu in `services/settings/unifiedBackup.ts` explizit als UI-Einstellung freigegeben. Somit werden die Looks in der einheitlichen und portablen Gesamtsicherung beim Gerätewechsel erfasst.
- Die bisherigen V650-Konzertprofile bleiben vollständig separat und unverändert.

## Tests

- `npm run test:v676` prüft 26 Testgruppen einschließlich Grenzwerten, Import, Backup, manuellem Anwenden, Undo, Theme-/Genre-Daten und responsiver Integration.
- `npm run test:v675`, `npm run test:v674`, `npm run test:v673`, `npm run test:v672`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`, `node tests/unified-backup-regression.cjs`.
- Für Freigabe weiterhin `npm run typecheck` und `npm run build` **nach Installation der Abhängigkeiten** erforderlich. Im Prüfbericht werden nicht ausführbare Validierungen ausdrücklich dokumentiert.
