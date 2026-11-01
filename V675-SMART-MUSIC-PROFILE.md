# Sonic Display V675 – Smart Music Profile

**Neu:** In „Zuletzt gespielt“ gibt es den fünften Tab **Mein Musikprofil**. Er zeigt auf Basis der aktuell geladenen Spotify-Wiedergaben die meistgehörten **Hauptkünstler** (Spotify Primary Artist, keine Schätzung) und aus den in V674 per Knopfdruck ermittelten Last.fm-Genres abgeleitete Musikrichtungen. Der Anteil bezieht sich **nur auf erfolgreich erkannte Wiedergaben**. Unbekannte Daten und die Prüfquote werden offengelegt. Es gibt kein Server-Profil, keine lokale Datenspeicherung der Musikchronik und keine neue Berechtigung gegenüber V674.

**Show-Empfehlungen:** Maximal drei Musikrichtungen werden aus Genre-Familien gewichtet und nur vorgeschlagen, wenn mindestens drei Wiedergaben und zwei verschiedene Songs zu der Richtung vorhanden sind. Jeder Vorschlag zeigt Bühne, Lichtintensität, Tanzstil und einen stilistischen Show-Hinweis. Die vollständige V669–V671 Konzertdramaturgie bleibt unverändert aktiv; der Hinweis ist ausdrücklich kein zweiter Regieprozess.

**Manuelle Kontrolle:** Erst der Klick auf „Look für die Bühne übernehmen“ ändert `stageTheme`, `stageLightStrength`, `stageReactive` und `avatarDancePreset`. Nur bei gesondert gesetztem Häkchen werden `danceFxEnabled` und `danceFxStrength` übernommen. Sofortiges Rückgängig stellt die vorherigen Werte wieder her, sofern sie seit dem Übernehmen nicht von anderer Stelle verändert wurden. Avatar-Modelle, automatische Songabschnittserkennung, Sänger, Lippenbewegungen, Lyrics und Kamera sind kein Teil des Patches.

**Einrichtung:** Spotify verbinden, „Zuletzt gespielt“ öffnen, im Genre-Mix Last.fm-Daten für bis zu zwölf unterschiedliche Songs je Aktion abrufen (benötigt `LASTFM_API_KEY`), danach „Mein Musikprofil“ öffnen. Bei neuen Daten oder nachgeladenen Titeln aktualisiert sich das Profil. Für ein aussagekräftigeres Profil weitere Songs laden bzw. prüfen. Die Ergebnisse bleiben eine Momentaufnahme und keine längerfristige Hörstatistik.

**Tests:** `npm run test:v675`, `npm run test:smoke:v675`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`, `npm run typecheck`, `npm run build`.
