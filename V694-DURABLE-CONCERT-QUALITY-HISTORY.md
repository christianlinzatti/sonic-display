# V694 – Dauerhafte Konzert-Qualitätshistorie

## Bedienung

1. **QA öffnen**. Die neue Historie erscheint bereits vor der ersten Songaufnahme. Bereits gespeicherte Aufgabenstatus (unter **Gespeicherte Aufgabenstatus** auch ohne neue Aufnahme wieder bearbeitbar), Vorher- und Nachher-Aufnahmen und archivierte Vergleiche werden beim Öffnen **aus dem lokalen Browserspeicher geladen**.
2. Wie gewohnt V641-Songaufzeichnung **manuell starten und beenden**, im V693-Studio eine Aufgabe bei Bedarf auf **In Prüfung** oder **Von mir geprüft** stellen. Der Status wird beim Benutzerklick lokal gesichert.
3. **Vorher merken**, dieselbe Wiedergabe mit gleicher Avatar-Konfiguration neu aufnehmen, **Nachher merken**. Die beiden zusammengefassten Aufnahmen werden ebenfalls im Browser gespeichert. Sie werden **nicht ungefragt** zu einem historischen Bericht archiviert.
4. **Aktuellen Vorher-/Nachher-Vergleich archivieren** klicken. Das geht ausschließlich bei verschiedenen, vergleichbaren Aufnahmen. Die Archivliste zeigt Datumsangabe, Track-ID, Release der Vorher-/Nachher-Aufnahme, Browser-Median-Deltas und Hinweise zu jeder der fünf Messdomänen.
5. Die Liste bleibt beim QA-Schließen, Neuladen und Browserneustart auf **demselben Browserprofil und Gerät** erhalten, sofern der Browser die Website-Daten behält und genügend Speicherplatz zulässt. Der Vergleich zum vorherigen archivierten Bericht desselben Tracks zeigt eine vorsichtige Tendenz über Release-Grenzen hinweg (nur wenn Song, Abdeckung und GLB-Konfiguration vergleichbar sind).
6. Für Gerätewechsel **QA-Historie als JSON sichern** und auf dem Zielgerät über **JSON-Sicherung importieren** wiederherstellen. Ein Import ersetzt die bestehende Historie nur nach Bestätigung. Einzelne Archivberichte können ebenfalls ausdrücklich gelöscht werden. **Lokale Historie löschen** löscht alle QA-Aufgabenstatus, Vorher-/Nachher-Markierungen und Archivberichte nach erneuter Bestätigung.

## Sicherheits- und Datenregeln

- Lokaler `localStorage`-Schlüssel: `sonic-display:concert-qa-history:v694`. **Keine Cloud, kein Server, kein Sync, kein Hintergrundmonitoring**. Website-Daten löschen/Inkognito beendet die Persistenz; ein JSON-Export ist die verfügbare portable Sicherung.
- Versioniertes, strikt geprüftes JSON-Schema (`sonic-v694-quality-history`, Schema 1), höchstens **30 archivierte Vergleiche**, **300 Benutzer-Aufgabenstatus**, **600.000 JSON-Zeichen**. Zu große, beschädigte, veraltete und manipulierte Import-/Speicherdaten werden nicht als gültige Aufnahmen angenommen. Der alte beschädigte Eintrag wird nicht ohne **ausdrücklichen** Import-/Löschklick überschrieben.
- Gespeichert werden nur: Song-ID/Dauer, zusammengefasste Avatar-/GLB-Zahlen, Messpunkte/Abdeckung, FPS-/P95-Mediane, fünf bereits vorhandene V692-Findings samt Handlungshinweis und *vorhandenen* Song-Zeitmarken, vom Nutzer gesetzte Aufgabenstatus sowie Version/Zeitpunkt der gewählten Aufnahmen. **Keine Roh-Beobachtungsreihen, Audio-/Video-/Foto-Dateien, Lyrics-Wörter, Spotify-Cookies oder Tokens**. Strikte Feldlisten verhindern zusätzliche Datenfelder über die Importfunktion.
- Vergleiche respektieren unverändert die V693-Grenzen: **mindestens 30 Messpunkte**, mindestens **60 % Songabdeckung**, maximal **15 Prozentpunkte** Abdeckungsunterschied, gleiche Song-ID/-Dauer und vergleichbare Avatar-/GLB-Slots, verschiedene Aufzeichnungs-IDs. Neue Capture-IDs berücksichtigen auch neu geladene Baselines.
- Historische Titel/Detailtexte kommen ausschließlich aus den vorhandenen, lokal erzeugten V692-Checklisten. **Keine automatischen Korrekturen**, keine pauschalen Qualitätsbewertungen, keine Aussage zur messbaren Tanz-/Licht-/Lip-Sync-Qualität. `manuell-geprueft` und ein fehlender Folgewarnhinweis sind niemals „behoben“ oder „Produktionsfreigabe“.
- Fehlt/versagt `localStorage`, bleibt das QA-Studio in der Sitzung benutzbar; die Oberfläche meldet, dass Speichern nicht nachgewiesen wurde. Der **manuelle JSON-Export** bleibt ein alternativer Sicherungsweg.

## Technische Integration

- `components/visualizer/concertQualityHistoryV694.ts`: reine Version-/Schema-/Größen- und Vergleichsvalidierung, Aufnahme-, Archiv- und Statusänderungen.
- `components/visualizer/concertQualityHistoryStorageV694.ts`: gekapselter Browser-Speicheradapter mit Fehlerbehandlung.
- `components/visualizer/ConcertQualityHistoryPanelV694.tsx`: immer erreichbare Archivansicht inkl. Datums-/Versionsvergleich, Import/Export, gezieltem Löschen.
- `components/visualizer/FullConcertQualityAuditPanelV641.tsx`: Integration in vorhandene QA, keine zusätzliche Renderebene.
- `app/globals.css`: ausschließlich QA-bezogene Stile.
- `tests/v694-concert-quality-history-regression.cjs`, `tests/tsconfig.v694-core.json`: Regressions- und strenge isolierte TypeScript-Prüfung.

## Offene Abnahme

Für vollständigen TypeScript-Check und Next.js-Produktionsbuild fehlen in dieser Sandbox die produktiven npm-Abhängigkeiten und `package-lock.json`. Manuelle Browserprüfung mit echtem WebGL/React und realen GLBs, einschließlich Browserneustart, Gerätewechsel per JSON und Speicher-Sperrmodus, steht noch aus.
