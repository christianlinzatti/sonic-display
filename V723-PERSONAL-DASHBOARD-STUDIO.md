# V723 – Personal Dashboard Studio

## Umsetzung

Das V722-Last.fm-Dashboard ist weiterhin der zentrale Einstieg in die vorhandenen Statistiken. V723 fügt **eine frei anpassbare, lokale Darstellung der sechs vorhandenen Bereiche** hinzu, ohne Daten neu abzurufen oder erneut zu scrobbeln.

1. **Sechs Widgets:** Archivkennzahlen, Schnellzugriffe, Hörrekorde, Monatsübersicht, Künstlerentwicklungen und zuletzt erstmals archivierte Künstler. Die bisherigen V722-Inhalte und Navigationsaktionen werden wiederverwendet.
2. **Sichtbarkeit:** Checkboxen im Bearbeitungsmodus; mindestens ein Widget bleibt sichtbar. Verborgene Widgets bleiben in der Konfiguration und können später wieder eingeschaltet werden.
3. **Reihenfolge:** Drag & Drop auf Desktop; große Pfeiltasten als gleichwertige Bedienung auf Touchscreen und Tastatur. Die Pfeile wechseln die Reihenfolge der sichtbaren Widgets auch dann, wenn ausgeblendete dazwischenliegen.
4. **Größe:** Jedes Widget kann volle Breite oder halbe Breite einnehmen. Auf schmalen Bildschirmen wird aus dem zweispaltigen Layout automatisch eine Spalte.
5. **Automatische Persistenz:** Gespeichert wird in `localStorage`, getrennt nach kanonischem Last.fm-Nutzernamen (`sonic-display:lastfm:insights-layout:v723:<account>`). Beim Kontowechsel und bei Änderungen in anderen Browser-Tabs wird das passende Layout erneut geladen. Keine Speicherung in Spotify, Last.fm oder einem Cloud-Dienst.
6. **Sicheres Zurücksetzen:** Standardlayout wiederherstellen löscht nur den entsprechenden V723-Layout-Eintrag. Die Hörhistorie in IndexedDB bleibt unangetastet.
7. **Validierung und Fehlerbehandlung:** Versioniertes JSON-Schema (v1), maximal sechs bekannte IDs, keine Duplikate, geprüfte Größen und booleans, maximale Leselänge, gesicherte Browser-Speicherzugriffe. Ungültige Einstellungen laden ohne Ausnahme das Standardlayout.

## Bedienung

Unter Last.fm → Personal Music Insights auf **Dashboard anpassen** klicken. Widgets über die Checkboxen wählen, mit ↑/↓ oder Drag & Drop verschieben, mit **Breit / Halb** die Größe wechseln. Änderungen werden sofort gespeichert. Ein Hinweis zeigt, ob der Browser die Speicherung zugelassen hat. Über **Standardlayout wiederherstellen** zur Ausgangsreihenfolge zurückkehren.

## Datenschutz und bestehendes Scrobbling

Es werden nur Widget-IDs, Reihenfolge, Sichtbarkeit und Breiten lokal gespeichert. Es werden keine Wiedergabelisten, Scrobbles, Tokens oder Account-Passwörter in der Layoutkonfiguration gespeichert. Bestehendes Spotify→Last.fm-Scrobbling bleibt die alleinige Scrobble-Quelle; der Lesebereich macht keine neuen API-Anfragen.

## Technischer Nachweis

- `lib/lastfm-dashboard-layout-v723.ts`: serialisierbare Pure Functions, Account-Scope, Validierung, Reset.
- `components/LastFmDashboardStudioV723.tsx`: editor/controller inklusive Tastatur- und Touch-Fallback, Fehlerrückmeldungen, CSS Grid.
- `components/LastFmPersonalInsightsDashboardV722.tsx`: alle sechs unveränderten bestehenden Inhalte als V723-Widgets gerendert.
- `components/LastFmHistoryPanelV706.tsx`: übergibt den aktiven Last.fm-Account.
- `tests/v723-dashboard-studio-regression.cjs`: 112 Checks für Persistenz, Read/Write-Fehler, Sicherheit, Anzeige und Navigation.
- `tests/tsconfig.v723-core.json`, `tests/tsconfig.v723-ui.json`: gezielte TypeScript-Prüfungen.

## Grenzen

Ohne verfügbare npm-Pakete kann hier weiterhin kein vollständiger Next.js-Build freigegeben werden; ein echtes `package-lock.json` darf nicht erfunden werden. Für reproduzierbare Installation auf dem Windows-Rechner `npm install` und danach `npm run typecheck` und `npm run build` ausführen; die dabei erzeugte Lockdatei in der Versionsverwaltung einchecken. Ein `npm ci` setzt danach eine vorhandene Lockdatei voraus.
