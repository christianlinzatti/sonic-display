# Sonic Display V674 – Prüfprotokoll (28.10.2026)

## Umfang

Neue visuelle Albumcover-Galerie, Detailansicht und Künstler-Credits-Favoriten für den in V672 geladenen Spotify-Verlauf. Optionaler Last.fm-Genreabruf mit maximal 12 unterschiedlichen Songs je Nutzeraktion und maximal zwei parallelen Anfragen. Genrestatistik mit transparenter Abdeckung. Genreabhängiger Bühnen- und Avatar-Tanzstil-Vorschlag, ausdrücklich nur nach Klick übernehmbar und unmittelbar rückgängig. Keine Änderung des Avatarmodells, der Spotify-Wiedergabe, der Lyrics oder der Kamera durch diese Aktion.

## Erfolgreiche Prüfungen

- `npm run test:v674`: **16 Prüfungen bestanden**, inklusive Genres ohne Evidenz, Feature-Credits, begrenzter Abfragen, UI-Integration und sicherer Bühnenpatches.
- `npm run test:v673`: **12 Prüfungen bestanden**.
- `npm run test:v672`: **12 Modell-/UI-Prüfungen + 7 API-Szenarien bestanden**.
- `npm run test:v671`, `npm run test:v670`, `npm run test:v669`: bestanden (Konzertregie-Regression).
- `npm run test:v671:types`, `npm run test:v670:types`, `npm run test:v669:types`: bestanden (isolierte Core-Typprüfungen).
- `npm run check:syntax`: bestanden, 932 TS/TSX-Dateien (nach der letzten V674-Anpassung).
- `npm run check:architecture`, `npm run test:module-case`, `npm run check:test-types`: bestanden.

## Nicht erfolgreich abschließbar / offene Prüfung

- `npm run typecheck` wurde ausgeführt, aber React, Next.js und weitere Pakettypen sind nicht installiert. Die Fehlermeldungen sind dadurch in großer Zahl nicht verwertbar. **Kein bestandener vollständiger TypeScript-Check.**
- `npm run build` wurde ausgeführt. Das `prebuild`-Skript führt eine ausgedehnte rekursive Testkette aus; der Vorgang erreichte vor dem `next build` das verfügbare Laufzeitlimit. Die Next.js-Abhängigkeit steht zusätzlich nicht zur Verfügung. **Kein bestandener Produktionsbuild.**
- Ein tatsächlicher Test gegen den eigenen Spotify- und Last.fm-Account sowie ein visueller Browser-/Touch-Test war hier nicht möglich.
- Zugriff auf die npm-Registry war hier nicht möglich. Keine vollständige Installation der Projektabhängigkeiten.

## Lokal abschließen (Windows / Git Bash / PowerShell)

1. In einem frischen Projektverzeichnis `npm install` ausführen.
2. `npm run test:v674` und `npm run typecheck` ausführen.
3. `npm run build` ausführen (einschließlich der vorhandenen großen Prebuild-Regressionskette).
4. Auf dem Gerät Spotify verbinden, „Zuletzt gespielt → Cover-Galerie“ öffnen und danach „Genre-Mix“ testen. Für Genres ist serverseitig `LASTFM_API_KEY` erforderlich. Den Bühnen-Look nur bei passendem Vorschlag manuell übernehmen.

Die Genre-Auswertung ist eine Momentaufnahme geladener Songs. Sie darf nicht als vollständige Langzeit-Hörstatistik interpretiert werden.
