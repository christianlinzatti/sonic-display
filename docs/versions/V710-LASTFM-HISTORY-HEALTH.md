# Sonic Display V710 – Last.fm History Health & Auto Recovery

## Funktion

`Zuletzt gespielt → Last.fm-History` bietet einen neuen Abschnitt **History Health** und eine zwölfmonatige Statistik aus tatsächlich lokal gespeicherten Last.fm-Scrobbles. Sichtbar sind die Zahl der erfassten Wiedergaben in den letzten bzw. vorigen 30 Tagen, die Anzahl unterschiedlicher erfasster Hörtage in den letzten 365 Tagen, zwölf zusammenhängende Kalendermonate (UTC, auch Monate mit null Ereignissen) und vier UTC-Tageszeitfenster. Die Werte beziehen sich auf das **begrenzte lokale Archiv**, nicht auf vollständige Hörminuten oder den kompletten Last.fm-Verlauf.

## Automatische Nachholung nur nach separater Zustimmung

1. `LASTFM_API_KEY` auf dem Sonic-Display-Server konfigurieren, Last.fm-Konto auswählen und Archiv aus V706 einrichten.
2. V708-Automatik ausdrücklich aktivieren. V709 erkennt ggf. eine **mögliche**, nicht bewiesene, Lücke nach einem erfolgreichen regulären 200er-Abruf.
3. **„Automatische Lückenreparatur einschalten“** im History-Health-Bereich bewusst aktivieren (standardmäßig AUS). Diese zweite Zustimmung gilt getrennt je Last.fm-Konto.
4. Nur bei gültiger V709-Lückenwarnung und vorhandenem ursprünglichem Vor-Lücken-Scrobble lädt der V710-Sammler jeweils **höchstens eine zusätzliche API-Seite**. Zwischen erfolgreichen Versuchen liegen mindestens **fünf Minuten**. Fortsetzungszustand (fester `to`-Snapshot, Seitenindex, Ergänzungen) liegt separat und begrenzt im lokalen Browser-Speicher und wird bei Wiederaufnahme streng geprüft.
5. Spätestens nach **100 Seiten** bleibt die Warnung ausdrücklich stehen; keine automatische Endlosschleife. Der Vorgang beendet sich früher bei Treffer des **ursprünglichen Vor-Lücken-Ankers** oder beim Ende der API-Seiten. Historisch nie an Last.fm übertragene Scrobbles können nicht rekonstruieren werden.

V710 nutzt den bestehenden V709-Validierungskern und den bestehenden ausschließlich lesenden `/api/lastfm/recent-tracks`-Endpunkt. Das Spotify-Archiv und die übrigen Last.fm-Einträge werden nicht überschrieben, sondern geprüft und dedupliziert ergänzt. Das lokale Last.fm-Archiv ist auf **8.000 Scrobbles** begrenzt; die ältesten Einträge können verdrängt werden.

## Sicherheit und Grenzen

- Keine Hintergrundaufzeichnung bei geschlossenem Browser. Der separate Sammler arbeitet ausschließlich in einem **sichtbaren, fokussierten, online verbundenen Tab** mit unterstützten Browser-**Web Locks**. Ohne Web Locks erfolgt **keine** automatische Nachholung; die manuelle V709-Recovery bleibt verfügbar.
- Zusätzlicher API-Abruf ausschließlich nach separater Aktivierung und vorhandener Lückenwarnung, kein weiteres Spotify-OAuth-Scope. Die Last.fm-API-Zugangsdaten bleiben serverseitig; keine Scrobble-Schreib-API.
- Konten-, Einwilligungs-, Archiv- und Gap-Zustand werden **vor jedem Schreibvorgang** geprüft; JSON-Fehler pausieren die Funktion ohne stillschweigende Zurücksetzung. Ein Kontowechsel und Tab-Verbergen brechen laufende Abrufe ab, 429 berücksichtigt `Retry-After`.
- Browser-`localStorage` ist kein transaktionales Speichermedium. Das Web-Locks-Protokoll reduziert gleichzeitige Anfragen, garantiert jedoch keine Synchronisierung über **verschiedene Geräte**. Vor umfassendem Nachholen wird ein JSON-Backup empfohlen.
- Eine V709-Warnung ist nur ein begründetes Signal. Selbst nach Abgleich kann der Verlauf unvollständig bleiben; insbesondere können Backfills nie gespeicherte Scrobbles nicht ersetzen.

## Dateien

- `lib/lastfm-health-v710.ts`: strikt validierter Einwilligungs-/Fortsetzungszustand, pro Seite kontrollierter Commit und reine Langzeitaggregation.
- `components/AutomaticLastFmRecoveryV710.tsx`: opt-in, Web-Locks-geschützte Browser-Automatik, ein Seitenabruf je Intervall.
- `components/RecentlyPlayedV672.tsx`: Sammler immer gemountet, unabhängig vom History-Dialog.
- `components/LastFmHistoryPanelV706.tsx`, `app/globals.css`: synchronisierungsorientierte Oberfläche, separate Einwilligung, Fortsetzungsanzeige und Langzeitstatistik.
- `tests/v710-lastfm-health-regression.cjs`, `tests/tsconfig.v710-*.json`: Regressionen und isolierte Typprüfung.

Prüfstatus und vollständige Produktions-Freigabegrenzen: `V710-VERIFICATION.md`.
