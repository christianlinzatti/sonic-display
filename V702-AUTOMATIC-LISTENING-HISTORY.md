# V702 – Automatische, datensparsame Hörverlauf-Sicherung

## Verwendung

1. Spotify verbinden und in **◷ Zuletzt gespielt → ▣ Mein Archiv** wechseln.
2. Zuerst das **lokale Archiv aktivieren** (V701).
3. Optional **Automatische Sicherung einschalten**. Diese zweite Zustimmung ist standardmäßig **AUS**, auch wenn das V701-Archiv bereits existiert.
4. Sonic Display im aktiven Browser-Tab geöffnet lassen. Der Sammler synchronisiert höchstens alle drei Minuten die letzte Spotify-Verlaufsseite (bis zu 30 Ereignisse). Beim Öffnen des Verlaufs können auch weitere Seiten ausdrücklich geladen/übernommen werden.
5. Über **Automatische Sicherung ausschalten** jederzeit stoppen. Das vorhandene Archiv bleibt erhalten; die Schaltfläche zum manuellen Abgleich funktioniert weiterhin. Über **Archiv löschen / deaktivieren** das Archiv und die Einstellung entfernen. JSON-Sicherung für einen Gerätewechsel verwenden.

## Tatsächliche technische Grenzen

- Der Sammler in `components/AutomaticListeningHistoryRecorderV702.tsx` wird **nur in der verbundenen Sonic-Display-Oberfläche** gerendert, unabhängig vom geöffneten Verlaufsdialog.
- Er prüft bei jeder Abfrage die Spotify-Konto-ID **erneut** und schreibt ausschließlich in das auf diese Konto-ID begrenzte lokale V701-Archiv. Keine Songdaten werden an einen zusätzlichen Dienst hochgeladen. Normale Spotify-GET-Anfragen laufen über den vorhandenen `/api/spotify/recently-played`-Endpunkt.
- Er arbeitet nur solange **Sonic Display geöffnet**, der Browser-Tab **sichtbar und fokussiert** und das Gerät **online** ist; Schließen, Ausblenden und Deaktivieren beendet bzw. stoppt den Zugriff. Er ist **kein Service-Worker, kein autonomer Hintergrunddienst und keine Spotify-Hörhistorie außerhalb der Laufzeit**.
- Die Spotify-API gibt nur einen **begrenzten, unvollständigen Verlauf** zurück; bei längeren Unterbrechungen können Titel fehlen. Spielzeit pro Titel oder vollständiger Songdurchlauf werden **nicht** aus den Ereignissen geschätzt.
- Exakt gleiche `trackId + playedAt`-Paare werden nicht doppelt erfasst; getrennte Wiedergaben desselben Songs bleiben bestehen. Maximal **5.000** Ereignisse und begrenzter Browser-Speicher (wie V701).
- Eine bereits aktive V701-Archivsicherung schaltet **V702 nicht automatisch** ein. Die V701-Übernahme beim Laden weiterer Spotify-Seiten erfolgt in V702 nur bei aktivierter Automatik, ansonsten weiterhin über den expliziten Button.
- Das Profil enthält eine kontoabhängige, versionierte Einwilligung und ausschließlich einen kleinen Zeit-/Zählerstatus. Es enthält **keine Zugangstoken, Audio-/Lyrics- oder Titelinhalte**. Lokaler Browser-Speicher bleibt unverschlüsselt, synchronisiert nicht zwischen Geräten und kann im privaten Modus/bei Bereinigung verloren gehen.
- Spotify-Rate-Limits (HTTP 429) werden nicht als Erfolg verbucht und `Retry-After` wird (bis 24 h) für die nächste zulässige Anfrage respektiert. Browserfehler, fehlende Berechtigung, beschädigter Speicher oder Kontowechsel verhindern automatische Schreibvorgänge.

## Code, Prüfungen und Tests

- `lib/automatic-listening-history-v702.ts`: Einwilligungs-/Statusschema, pro Konto getrennte Schlüssel und fail-closed Zusammenführung in V701.
- `components/AutomaticListeningHistoryRecorderV702.tsx`: browserseitiger Sammler bei aktiver Sitzung mit Abbruch, 3-Minuten-Throttle, Sichtbarkeits- und Kontoprüfung.
- `components/PersistentListeningHistoryPanelV701.tsx`: zusätzliche Aktivierung, Deaktivierung und letzter erfolgreicher Abgleich.
- `components/RecentlyPlayedV672.tsx`: Sammler unabhängig vom Dialog montieren.
- `tests/v702-auto-listening-history-regression.cjs`, `tests/tsconfig.v702-core.json`, `tests/tsconfig.v702-ui.json`.

Eine reale Spotify-/Chromium-Abnahme und ein erfolgreicher Next.js-Produktionsbuild sind für eine volle Freigabe erforderlich; Regressionen mit simulierten Events allein belegen keine erfolgreiche Spotify-Datenübertragung.
