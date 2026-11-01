# V765 – Concert Show Library Studio

## Einstieg

**Einstellungen → Dynamic Stage → V764 Smart Concert Timeline Automation → V765 Concert Show Library Studio**. Die V765-Bibliotheksverwaltung befindet sich direkt unter der bisherigen V764-Vorschlags- und Songbibliothek. Der V354-Editor bleibt die einzige Live-Playback-Instanz.

## Funktionen

- **Suche** gespeicherter Shows nach Name oder echter Song-ID, **Sortierung** nach Name, Cue-Anzahl oder Länge.
- **Umbenennen** gespeicherter Einträge mit 1–60 Zeichen und Schutz vor gleichzeitigen Änderungen. Eine Änderung des Bibliotheksnamens überschreibt keine offene V354-Show.
- **Einzelexport** einer Songshow als JSON im V764-Bibliotheksschema. Der Export enthält niemals eine aktivierte Songwechsel-Automatik.
- **JSON-Import** vollständiger V764-Bibliotheksexporte oder einzelner V765-Shows. Maximal 4 MB, 32 Songshows, je höchstens 400 Cues. Es werden ausschließlich vorhandene, gültige V354-Werte und Song-IDs übernommen.
- **Konfliktvorschau** mit Anzahl neuer, identischer und widersprüchlicher Song-IDs. Standard ist `skip`: bestehende Shows bleiben unverändert. Die Alternative `replace` ersetzt betroffene **gespeicherte** Bibliothekseinträge nur nach einer separaten Bestätigung sowie einer zusammenfassenden Importfreigabe.
- **Stale-Preview-Guard:** Wenn sich die V764-Bibliothek seit der Vorschau geändert hat, wird der Import abgebrochen und muss neu überprüft werden.
- **Kapazitätsschutz:** Überschreitet der gesamte Import die 32-Song-Grenze, wird er vollständig abgelehnt. Bei Speicherfehlern wird kein Erfolg behauptet; nach dem Speichern wird der persistierte Zustand gegen den Plan geprüft.

## Was V765 ausdrücklich nicht tut

V765 ersetzt nicht die aktive V354-Timeline, lädt keine Shows in die Live-Bühne und setzt die `autoLoad`-Einstellung aus importierten JSON-Daten **niemals**. Es erzeugt weder Songabschnitte noch Sänger-Zeitmarken, GLB-Clips oder Kameraschnitte. Die automatische V764-Songbibliothek und die portable Sicherung verwenden weiterhin den identischen Schlüssel `sonic-concert-song-library-v764`; vorhandene Backup-Dateien und Shows bleiben kompatibel.

Browser-`localStorage` ist gerätegebunden. Vor dem Ersetzen von Songshows und beim Gerätewechsel ein vollständiges V764-Backup exportieren. Der Dateiupload bleibt ausschließlich im Browser, ohne Server- oder Drittanbieterzugriff.

## Technische Dateien

- `services/stageContent/concertShowLibraryStudioV765.ts`
- `components/visualizer/ConcertShowLibraryStudioV765.tsx`
- `components/visualizer/SmartConcertTimelineAutomationV764.tsx` (Integration)
- `tests/v765-concert-show-library-studio-regression.cjs`
- `tests/tsconfig.v765-core.json`, `tests/tsconfig.v765-ui.json`
