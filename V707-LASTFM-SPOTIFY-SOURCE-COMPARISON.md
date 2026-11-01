# V707 – Last.fm und Spotify in „Meine Statistik“ / „Entdeckungen“

## Bedienung

1. In **Zuletzt gespielt → Last.fm-History** einen Last.fm-Benutzernamen auswählen und echte Scrobbles importieren (V706). Der Schlüssel `LASTFM_API_KEY` ist nur für diesen Import erforderlich.
2. Optional in **Zuletzt gespielt → Mein Archiv** die Spotify-Wiedergaben lokal sichern (V701/V702).
3. **Meine Statistik** oder **Entdeckungen** öffnen. Im neuen Feld **Datenquelle** Spotify, Last.fm oder Gemeinsam auswählen. Spotify (bisherige Oberfläche) bleibt Standard.
4. In Last.fm und Gemeinsam liest das Dashboard ausschließlich die lokalen, validierten Archive; „Archive aktualisieren“ stößt **keinen** externen Last.fm-Import an. Das Last.fm-Archiv und das Spotify-Archiv werden nie überschrieben oder zusammen gespeichert.

## Interpretation und Matching

- Last.fm-Scrobbles enthalten gewöhnlich **keine Spotify-Track-ID**. Deshalb kann eine doppelte Wiedergabe nicht sicher über eine gemeinsame ID identifiziert werden.
- **Gemeinsam** verwendet einen konservativen, einmaligen Paarabgleich: Unicode-normalisierter Künstler-Credit **und** Tracktitel gleich, gespeicherte Zeitstempel höchstens **90 Sekunden auseinander**, jedes Quellereignis nur einmal als Paar. Der gemischte Zähler ist `Spotify + Last.fm − erkannte Paare`. Ungepaarte Ereignisse bleiben erhalten. Unterschiedliche Albumversionen können denselben Künstler-/Titel-Credit haben; Remix-Bezeichnungen werden nicht entfernt. Bei Last.fm/Spotify abweichenden Timestamp-Semantiken kann es zu nicht erkannten Paaren kommen.
- **Wichtig:** Das ist keine verifizierte dienstübergreifende Deduplizierung. Bei unterschiedlichen Geräteuhren, unterschiedlichen Künstler-Credits und verschobenen Scrobble-Zeitpunkten können echte Doppelungen übrig bleiben. Bei beinahe gleichzeitig abgespielten gleichen Songs können zwei unabhängige Plays irrtümlich als Paar gelten.
- „Unterschiedliche Songs“ fasst zur Vergleichbarkeit **Künstler-Credit + Tracktitel** zusammen und unterscheidet daher unter Umständen Live-, Remaster- oder Albumversionen nicht. Die Originalarchive bleiben vollständig erhalten.
- **Meine Statistik**: Monate (inklusive leere Monate), Top-Songs, Künstler-Credits, Tageszeiten und Wochentage, vier Zeitraumfilter sowie Vergleich der letzten zwei abgeschlossenen Kalendermonate.
- **Entdeckungen**: Comebacks mit mindestens 30 Tagen Abstand, selten erfasste Titel, erstmals in den erfassten Quellen vorkommende Titel, 30-Tage-Repeats und Muster der Künstler-Credits (nur bei mindestens acht Ereignissen in beiden Vergleichsfenstern).
- Alle Zahlen sind **gespeicherte Ereignisse** statt nachgewiesener Hörminuten, vollständiger Spielzeiten oder Spotify-/Last.fm-Gesamtstatistiken. Browser-Zeitstempel nutzen lokale Kalendergrenzen.
- Der gemischte Modus erfordert ein validiertes Spotify-Archiv und ein validiertes Last.fm-Archiv. Sind Konto, Zuordnung oder Daten beschädigt, meldet die Oberfläche einen Fehler und verändert nichts. Last.fm-only erfordert keine zusätzliche Spotify-History-API-Abfrage.
- Keine neuen Spotify-Rechte, keine Last.fm-Schreib-/Scrobble-Rechte und kein Server-Upload der Archive. Last.fm-Songlinks werden nur bei gültiger `https://last.fm/music/`-URL verwendet, Spotify-Links ausschließlich aus geprüften Track-IDs gebildet.

## Dateistruktur und Tests

- `lib/listening-sources-v707.ts`: normalisierte Quellenanzeige, heuristischer 1:1-Zeitstempelabgleich, Langzeitstatistik und Entdeckungen; ohne Netzwerk/Browser-APIs.
- `components/ListeningSourceDashboardV707.tsx`: Datenquellenwechsel, kontoabhängige schreibgeschützte Archivprüfung, responsiver Statistik-/Entdeckungsdialog. Die bisherigen V703/V704-Komponenten bleiben als Spotify-Standardansichten unverändert verfügbar.
- `components/RecentlyPlayedV672.tsx`: Einbindung in vorhandene Tabs.
- `tests/v707-lastfm-source-comparison-regression.cjs`: Matching, Wiederholungen, sichere Links, Quellenauswahl, Statistik, Entdeckungen, Kontotrennung und ungültige Datensätze.
- `tests/tsconfig.v707-core.json`, `tests/tsconfig.v707-ui.json`: isolierte TS/JSX-Typchecks. Test-Only-React-Deklaration ist nicht Teil der produktiven `tsconfig.json`.

```powershell
npm run test:v707
npm run test:v707:types
npm run test:v707:ui-types
npm run test:quick
npm run typecheck
npm run build
```

Eine reale Sichtprüfung mit einem Spotify-Konto, korrekt passendem Last.fm-Benutzernamen und tatsächlich überschneidenden Scrobbles bleibt erforderlich. Siehe `V707-VERIFICATION.md`.
