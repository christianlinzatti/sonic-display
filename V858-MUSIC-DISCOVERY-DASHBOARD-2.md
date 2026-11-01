# V858 · Music Discovery Dashboard 2.0

## Integration

V858 ergänzt die bestehende Last.fm-History aus V857 um eine übersichtliche, auf Touchbedienung abgestimmte Startseite. Sie erscheint nach den bestehenden Import- und Statusmeldungen **vor dem gemeinsamen History-Filter und den ausführlichen Berichten**. Sie greift auf das vollständige, bereits geladene, kontogebundene V713-IndexedDB-Archiv zu. Es gibt **keine neuen Last.fm-/Spotify-API-Aufrufe**, keinen zweiten Pollingprozess, keine zusätzlichen Scrobble-Schreibzugriffe und keine neuen Berechtigungen.

- Ein neuer Hero-Bereich bündelt das Öffnen der History und der Chronik.
- Vier Kennzahlen zeigen insgesamt erfasste Scrobbles, Wiedergaben im gewählten Monat, Künstler und aktive Tage.
- Die interaktive 12-Monats-Grafik erlaubt die Auswahl von Monaten einschließlich archivierter Leerstellen. Leere Monate und Zeiträume vor dem ältesten Scrobble werden nicht als belegte Hörpausen interpretiert.
- Die Top-5-Künstler im ausgewählten Monat zeigen absolute Scrobbles und den beobachteten Monatsanteil.
- Drei Insights zeigen aufsteigende Künstler, erstmals im Archiv erfasste Künstler und einen Song mit mindestens 90 Tagen Abstand zwischen gespeicherten Scrobbles.
- Direkte Sprünge in die vorhandenen V722-, V856-, V857-, Kalender- und Künstler-Explorer-Ansichten. Kein dupliziertes Detailreporting.
- Zeitzone Wien/UTC sowie vergangene Monate sind auswählbar. Im Gegensatz zum gemeinsamen V726-Filter berücksichtigt das Dashboard stets das ganze Archiv; der Filter steuert weiterhin die anderen Ansichten.
- Bei leeren Archiven erscheint eine klare Leerseite. Keine Beispiel-/Demodaten oder künstlichen Trends.

**Geänderte Hauptdateien:** `components/LastFmDiscoveryHomeV858.tsx`, `lib/lastfm-discovery-dashboard-v858.ts`, `components/LastFmHistoryPanelV706.tsx`, `app/globals.css`. Navigationsanker in den existierenden V856- und V857-Panels ergänzt. Die Spotify-Lautsprechersteuerung V851–V854 bleibt unverändert.

## Installation und Test

Im entpackten Projektverzeichnis:

```bash
npm ci
npm run doctor:v858
npm run test:v858
npm run test:v858:types
npm run test:v858:ui-types
npm run typecheck
npm run build
```

`doctor:v858` zeigt fehlende Installationsabhängigkeiten an, repariert oder lädt sie aber nicht selbst. Die isolierten TypeScript-Tests ersetzen **nicht** den vollständigen TypeScript-Check und den Next.js-Build. Das vollständige Freigabeprotokoll steht in `V858-VERIFICATION.md`.
