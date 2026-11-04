# V730 – Profile vertiefen, vergleichen und merken

V730 erweitert den vollständigen V729-Stand. Der vorhandene Artist & Track Explorer bleibt über Last.fm History und über Künstler-/Songprofil-Aktionen in der Chronik erreichbar.

## 1. Zeitraum, Monate und Jahresvergleich

„Von“ und „Bis“ begrenzen Detailprofile, Statistiken, Vergleiche und CSV einschließlich beider lokaler Kalendertage. Ein leeres Datum lässt die jeweilige Grenze offen. „Gesamtes Archiv“ setzt die Grenzen zurück; „Letzte 30 Kalendertage“ umfasst heute und die 29 Tage davor. Ungültige oder umgekehrte Bereiche liefern einen Fehler und keine exportierbaren Werte.

Der Suchkatalog umfasst weiterhin das gesamte Archiv, damit auch Profile ohne Wiedergaben im aktuellen Zeitraum erreichbar bleiben. Die Chronikfilter bleiben unabhängig. Erste/letzte Wiedergabe und Wiederentdeckungen im Detailprofil beziehen sich auf den gewählten Zeitraum.

Der Monatsverlauf zeigt zwölf Werte pro ausgewähltem erfasstem Jahr, einschließlich Monaten ohne Scrobbles. Zwei erfasste Jahre lassen sich monatlich und insgesamt vergleichen. Änderungen sind B minus A; ein Prozentwert ohne Ausgangswert wird nicht erfunden. Nullwerte belegen keine tatsächliche Hörpause. Unvollständige Jahre, gesetzte Datumsgrenzen und Archivlücken können Jahresvergleiche verzerren.

## 2. Zwei Profile vergleichen

Ein Profil öffnen und „Aktuelles Profil als A“ wählen. Danach ein anderes Profil öffnen und als B übernehmen. Der Vergleich erlaubt zwei Künstler oder zwei Songs. Dasselbe normalisierte Profil wird abgewiesen; Künstler gegen Song ist nicht zulässig.

Die Tabelle zeigt Scrobbles, unterschiedliche Songs, erfasste Jahre und beobachtete Wiederentdeckungen. Hinzu kommen die Scrobble-Differenz B minus A und lokale Kalendertage, an denen beide Profile erfasst sind. Das bedeutet keine gleichzeitige Wiedergabe, keine Ähnlichkeit und keine garantierten Hörminuten. Beide Seiten erhalten exakt denselben Zeitraum.

## 3. Favoriten und CSV

„Profil merken“ speichert bis zu 100 Künstler-/Songprofile pro Last.fm-Konto im lokalen Browser. Gemerkte Profile lassen sich wieder öffnen oder entfernen. Kontowechsel trennt Favoriten und setzt Vergleichsauswahlen zurück. Favoriten enthalten nur Künstler/Titel, keine Scrobbles oder Zugangsdaten. Sie werden nicht zum Server übertragen und sind kein Bestandteil des bisherigen History-JSON-Backups.

Es gibt keine automatischen Schreibvorgänge beim Laden. Beschädigte gespeicherte Favoriten werden nicht überschrieben. Ist Speichern nicht möglich, bleibt eine explizite Änderung für die aktuelle Sitzung sichtbar; die Oberfläche meldet, dass sie nicht dauerhaft gespeichert wurde.

„Profilstatistiken als CSV“ exportiert sämtliche aggregierten Werte des gewählten Profils, nicht nur die sichtbare Liste. „Vergleich als CSV“ enthält beide Profile sowie gemeinsame Tage und die Differenz. Die Dateien enthalten Filtergrenzen, Jahres- und Monatswerte, Top-Songs, erste/letzte UTC-Zeitpunkte und Rückkehrabstände. Kalendergruppen beziehen sich auf die lokale Zeitzone. Die Dateien verwenden UTF-8-BOM, Semikolon, CRLF und gequotete Felder. Formelartige Textzellen erhalten ein führendes Apostroph zum Schutz beim Öffnen in Tabellenprogrammen. CSV ist ein Statistikexport, kein vollständiges History-Backup.

## Installation und Prüfung

Nach dem Entpacken `npm ci`, anschließend `npm run test:v730`, `npm run test:v730:types`, `npm run test:v730:ui-types`, `npm run typecheck` und `npm run build`. Das reguläre Build behält seine vorhandene umfangreiche Vorprüfung bei. Tatsächliche Ergebnisse stehen in `V730-VERIFICATION.md`.

Die V730-Interaktionstests verwenden React und React Test Renderer. Sie sind keine visuelle Browser- oder Spotify-Live-Abnahme. Es gibt keine neuen API-Endpunkte, OAuth-Berechtigungen oder Archivmigrationen.
