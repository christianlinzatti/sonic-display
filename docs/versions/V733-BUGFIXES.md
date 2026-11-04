# Sonic Display V733 – Korrekturen der gemeldeten Befunde

Stand: 30. Oktober 2026. Basis: vollständiges V732-Projekt. Die nachstehenden Punkte entsprechen den gemeldeten Fehlern und Erweiterungen. Einige Schutzmechanismen waren in dieser Projektbasis bereits vorhanden; diese sind ausdrücklich gekennzeichnet.

## Upload und lokale Installation

1. Modell-, Animations- und FBX-Uploads begrenzen den Body während des Lesens auf 36 MiB einschließlich Multipart-Verpackung. Die Dateigrenze bleibt 35 MiB. Das funktioniert auch ohne Content-Length; der Stream wird bei Überschreitung abgebrochen. Hosting-/Proxy-Limits wurden nicht geprüft.
2. Beim FBX-Import wird bei EXDEV kopiert und anschließend die temporäre Quelldatei entfernt. Andere Dateisystemfehler werden nicht als EXDEV behandelt.
3. Die lokale Hostprüfung verwendet URL-Parsing und erkennt `[::1]:3000` korrekt.

## Spotify, Lyrics und Genre

4. Retry-After wird nicht mehr auf 120 Sekunden gekürzt. Eine absolute Sperrzeit verhindert auch vorzeitige manuelle/Visibility-Aktualisierungen.
5. Lyrics werden bereits in der V732-Basis unabhängig vom Playback geladen und beim Titelwechsel abgebrochen. Beibehalten und erneut geprüft.
6. Bei `track: null` werden Lyrics ausdrücklich gelöscht, auch wenn kein Titelwechsel erkannt wird.
7. Nach erfolgreicher Tokenrotation bleibt das neue Sitzungscookie auch bei einem anschließenden Netzwerkfehler und HTTP 503 erhalten.
8. Die bereits vorhandene Generationserkennung gegen verspätete Antworten bleibt erhalten. Abmelden und Unmount brechen zusätzlich die laufende Playback-Anfrage ab.
9. Lyrics-Anbieterausfälle ohne erfolgreiches Ergebnis erzeugen einen Fehler statt eines erfolgreichen `null`. Ein nicht konfigurierter Genius-Anbieter zählt nicht als erfolgreiche Suche. Echtes „nicht gefunden“ bleibt `null`.
10. Nicht verwertbare Track-Tags lösen den Künstler-Tag-Fallback aus.
11. Genre, Fusion, Confidence und Quellenangaben sind während eines Titelwechsels nicht mehr dem neuen Titel zugeordnet. Die Rückgabe ist an die aktuelle Track-ID gebunden.

## Einstellungen, Backups und Mikrofon

12. Die bestehende Fehlerbehandlung beim Speichern der UI-Einstellungen erhält eine sichtbare Meldung, dass die Änderungen nur für diese Sitzung verfügbar sind.
13. Große Einstellungswerte werden nicht stillschweigend aus dem Backup entfernt.
14. Der Export wird durch denselben Parser wie der Import geprüft, einschließlich der 2-MiB-Gesamtgrenze und Eintragsgrenzen. Zu große oder ungültige Sicherungen schlagen mit Meldung fehl statt eine unbrauchbare Datei zu liefern.
15. Mikrofonspuren, Worker und AudioContext werden bereits in der Basis bei Startfehlern unmittelbar freigegeben. Beibehalten und durch vorhandene Lifecycle-Regressionen geprüft.
16. Die Abbruchprüfung nach AudioContext.resume ist bereits in der Basis vorhanden. Sie verhindert die nachträgliche Aktivierung eines abgebrochenen Starts.
17. Geräteprofil-Speichern liefert seinen Erfolg zurück. Erstellen und Import überschreiben eine Speicherwarnung nicht mehr mit einer Erfolgsmeldung.

## Push und Live-Nachrichten

18. Erfolgreiche Release-Zustellungen werden je Abonnement in Redis vermerkt (30 Tage). Das Konto markiert einen Release erst als abgeschlossen, wenn alle vorhandenen Geräte zugestellt oder endgültig ungültig sind. Vorübergehende Fehler halten die Seite für einen erneuten Versuch zurück; bereits erfolgreiche Geräte werden übersprungen.
19. Die mitgelieferte Cron-Konfiguration prüft stündlich statt täglich zwei Konten. Bei 30 Konten dauert eine Konto-Runde damit rechnerisch 15 Stunden statt 15 Tage, sofern alle geplanten Aufrufe stattfinden. Das ist keine Garantie für beliebig viele Konten/gefolgte Künstler oder dauerhafte Anbieterfehler. Der Hosting-Tarif muss den stündlichen Takt unterstützen; es wurde nichts extern bereitgestellt oder am Hostingkonto geändert.
20. „Dieses Gerät deaktivieren“ sendet ohne lokales Abonnement keine kontoweite Löschung mehr. Der ausdrücklich beschriftete Knopf für alle Geräte bleibt separat.
21. Die vorhandene Vordergrund-Einstellung wird beim Auffinden neuer Releases ausgewertet. Systemhinweise werden nur mit erteilter Browserberechtigung und aktiviertem Schalter ausgelöst; Web Push bleibt unabhängig.
22. Cron-Sperren haben eine UUID. Das abschließende Redis-EVAL löscht die Sperre atomar nur bei übereinstimmendem Besitzer. Der bestehende Ablaufzeitpunkt bleibt erhalten; diese Änderung verhindert insbesondere das Löschen einer nachfolgenden Sperre.
23. Live-Nachrichten haben eine begrenzte Warteschlange (30 wartende Meldungen). Hohe Priorität wird vor normalen Meldungen angezeigt; normale Nachrichten ersetzen eine laufende wichtige Meldung nicht. IDs werden zur Duplikatunterdrückung begrenzt aufbewahrt.

## Katalog, Künstlerdaten und Bühneninhalte

24. Beim Nachladen weiterer Albumtitel bleibt die bisherige Liste erhalten. Sie wird nur bei der ersten Seite bzw. beim Albumwechsel zurückgesetzt.
25. Bühnenquellen veröffentlichen Ergebnisse einzeln. Jede Quelle hat eine eigene 8-Sekunden-Grenze und ein Abbruchsignal. Ein hängender Anbieter hält das Albumcover nicht zurück.
26. Der Künstlerfoto-Endpunkt verwendet in der V732-Basis bereits ausschließlich einen exakten Spotify-Namenstreffer und keinen ersten Suchtreffer als Ersatz. Diesen Schutz beibehalten.
27. Künstler-/Konzert-Normalisierung erhält Unicode-Buchstaben und -Ziffern, einschließlich kyrillischer und japanischer Namen.
28. useAvatarModel verwendet einen gemeinsamen Katalogcache und bündelt parallele Anfragen.
29. Nach Änderungen aus Motion Library, Batch Installer, Motion Installer und Einstellungen wird dieser Katalog invalidiert. Offene Avatar-Hooks laden die Zuordnung erneut, auch bei unveränderter Avatar-ID.
30. Konzert-ID und Uhrzeit werden erhalten; getrennte Auftritte am selben Ort/Tag bleiben getrennt. Die Anzeige übernimmt vorhandene Uhrzeiten. Bei unsicheren quellübergreifenden Treffern wird konservativ nicht zusammengeführt.
31. Negative Ticketzustände werden vor positiven geprüft; „unavailable“ und „nicht verfügbar“ werden korrekt angezeigt.
32. Ticketmaster-Absagen und Verschiebungen werden erhalten und verständlich dargestellt.
33. Konzertposter werden nach kleinster Entfernung zur Zielbreite 850 Pixel ausgewählt.
34. Bildidentität erhält Pfad-Groß-/Kleinschreibung und Query-Parameter. Nur das URL-Fragment wird ignoriert. Dadurch können Auflösungsvarianten häufiger nebeneinander verbleiben; unterschiedliche Ressourcen werden nicht mehr aggressiv zusammengeführt.

## Timeline und 3D-Vorschauen

35. Bézier-Koordinaten verwenden die korrekten Kontrollpunkte und den Endpunkt 1; Start und Ende sind exakt 0 bzw. 1.
36. Null-/ungültige Keyframes werden bei der Bereinigung ausgelassen.
37. Explizite Keyframes bei Sekunde 0 und am Segmentende haben Vorrang vor Standardwerten.
38. Aus importierten Beats abgeleitete Takte sind als importiert markiert. Die Schutzprüfung gegen weit außerhalb liegende Snap-Ziele greift auch dort.
39. Beim Austausch externer Vorschauclips werden deren Mixer-Aktionen und Clips freigegeben.
40. Keyframes werden je unverändertem Segment/Keyframe-Array vorbereitet und zwischengespeichert, statt jedes Renderframe neu sortiert zu werden. Änderungen erfolgen wie im Editor durch neue Arrays/Segmente.
41. Doppelte Segment-IDs werden beim Import deterministisch durch eindeutige IDs ersetzt.
42. Clipgewichte liegen in einem Objekt ohne Prototyp; Namen wie `constructor`, `toString` und `__proto__` bleiben numerisch nutzbar.
43. Die lokale Timeline hält ihre erreichte Position bei einer Pause und setzt dort fort.
44. Ein Track-ID-Wechsel setzt die lokale Timeline zurück. Der ausdrücklich song-synchronisierte Zeitpfad bleibt erhalten.
45. AvatarPreview3D und Timeline-Vorschau haben lokale Fehlergrenzen mit statischer Ersatzdarstellung, Meldung und erneutem Ladeversuch. Die Live-Bühne behält ihren vorhandenen Schutz.
46. Die Systempräferenz „Bewegung reduzieren“ gilt standardmäßig auch für die zentrale Bühnenpräferenz. Eine bewusst gewählte Übersteuerung wird separat im Einstellungsobjekt gespeichert und respektiert.
47. Importierte Songabschnitte sind nur innerhalb ihrer angegebenen Dauer aktiv. In Lücken greift wieder die Live-Erkennung.

## Performance-Daten

48. Gespeicherte Experimente müssen alle benötigten Messfelder enthalten. Ungültige Einträge werden übersprungen und im Assistenten gemeldet; die Bewertung ist zusätzlich gegen unvollständige Eingaben abgesichert.
49. Ein Benchmark benötigt mindestens vier verwertbare FPS-/Framezeit-Paare in seinem Messfenster. Ohne diese gibt es kein übernehmbares Ergebnis und keinen Ranglisteneintrag; die Oberfläche meldet fehlende Renderdaten.

## Prüfung und Grenzen

`npm run test:v733` führt die neuen deterministischen Kern-, Async- und React-Tests aus. Der Prüfbericht nennt die tatsächlich ausgeführten weiteren Tests, den Typecheck und den Buildstatus. Keine produktiven Spotify-/Last.fm-/Redis-/Web-Push-Zugangsdaten wurden verwendet; Redis, Providerfehler, Speicherfehler und EXDEV wurden simuliert. Keine echte Blender-Konvertierung, Mikrofon-Hardwaremessung oder visuelle 3D-Abnahme auf einem Endgerät. Für vollständige Betriebssicherheit sind diese Integrationen in der Zielumgebung zusätzlich zu prüfen.
