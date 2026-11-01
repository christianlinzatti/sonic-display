# V660 – Smart Vocal Assignment (28.10.2026)

## Funktionsumfang

- Die vorhandene V496/V547-Feature-Vocal-Zeitachse hat einen geschlossenen **V660 Vorschlagsassistenten**. Er verwendet denselben gespeicherten Track-Key, dieselben Singer-Slots, dieselbe Zeitbasis und dieselbe V632-Bühnenregie; kein zweiter Lip-Sync-/Kamera-Timer.
- Zulässige Evidenz ist **ausschließlich ausdrücklich gespeicherte Rollenregie**: V385 manuelle Lyrics-Zuordnung (höchste Vorschlagspriorität), V416 Rap-Duett-Regie oder exakte `[vocal:rolle:slot]`-Markierungen zu synchronisierten Lyrics (niedrigste Priorität). Beispiel: `[vocal:feature:2]`, `[vocal:duet:1,2]`, `[vocal:hook:1,2,3]`, `[vocal:adlib:3]`. Es gibt **keine behauptete Sprechererkennung**; Spotify-Credits, Künstlernamen im Songtitel, gewöhnliche Hook-Texte und Adlib-Lautmalereien werden nicht als Sängeridentität gewertet.
- Vorschläge sind Vorschau-Objekte im React-State. Erst nach Auswahl und ausdrücklicher Bestätigung werden passende `VocalTimeSegmentV496` für die **aktuelle Spotify-Track-ID** gespeichert und die Zeitregie aktiviert.
- Vorhandene Hauptstimmen-Zeitmarken werden nicht überschrieben. Eine ausdrücklich markierte Adlib-Stimme darf gleichzeitig mit der Hauptstimme aktiv sein; wiederholte Importe derselben Adlib sind idempotent. Inkompatible Vorschläge und ungültige Zeitstempel werden übersprungen; höchstens 120 neue Zeitmarken je Song, analog zum bisherigen Zeitachsen-Validator.
- V416 `reply` behält den bereits redaktionell festgelegten 62%-Handoff und wird bei der Konvertierung auf zwei Zeitscheiben aufgeteilt. Konsekutive Zeitmarken desselben Rollenprofils mit ohne/geringem Abstand werden zusammengeführt.
- **Prioritäten der bestehenden Live-Bühne bleiben unverändert:** manuelle Kamera-/Show-Cues vor automatischer Regie; V385 vor V496, V496 vor V416. V660 gibt keinen zusätzlichen Live-Cue aus, sondern setzt nur nach Freigabe die vorhandenen V496-Einträge. Für eine vollständige Übernahme alter V385-Zuordnungen muss der Nutzer deren Live-Modus bei Bedarf manuell deaktivieren.

## Grenzen

Es muss eine Spotify-Track-ID und synchronisierte Lyrics mit gültigen Zeilenzeiten geben. Automatische Quellen liefern keine belastbaren Performer-Slot-Timestamps. Artist-IDs und echte Stimmeinträge können damit **nicht** automatisch erkannt werden. Bei vier Avataren müssen die Slot-Zahlen zur Live-Bühne passen. Der Assistent nutzt keinen Audiostream oder Stems und verändert weder Lyrics noch Spotify-Playback.

## Prüfung

`npm run test:v660` prüft Prioritäten, Timeline-Merging, Duett-/Adlib-Auswahl, ungültige Tags, Idempotenz und den 120er-Grenzfall. `npm run test:v660:types` prüft den reinen Zuordnungsplaner. `npm run test:smoke:v660` führt danach die V659–V616-Regressionskette aus. Vollständiger TS-Check und Next.js-Build über `npm run verify` erfordern die regulären npm-Abhängigkeiten.
