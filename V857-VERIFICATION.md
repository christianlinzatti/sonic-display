# V857 · Prüfbericht (01.11.2026)

## Erfolgreich

- `npm run test:v857`, `test:v857:types`, `test:v857:ui-types`: Künstler-Trends, neue Künstler, sechsmonatige Stichprobe, Zeitzonen, Genre-/API-Validierung, Datenabdeckung, Account-Isolation und UI.
- `npm run test:v856`, `test:v856:types`, `test:v856:ui-types`: bestehende Music-Memory-Insights.
- `npm run test:v855`, `test:v855:types`, `test:v855:ui-types`: History Studio.
- `npm run test:v714` / `test:v714:types` sowie `test:v701` (History).
- `npm run test:v849`, `test:v850` und `test:v851` bis `test:v854` (Konzert-FX und Spotify-Wiedergabe).
- `npm run check:syntax`, `npm run check:architecture`.

## Nicht abgeschlossen / nicht freigegeben

- `npm run typecheck`: keine abgeschlossene Ausgabe innerhalb des verfügbaren Prüffensters; als **offen** bewertet, nicht bestanden.
- `npm --ignore-scripts run build`: **nicht möglich**, da in der Umgebung keine Next.js-Installation vorhanden ist (`next: not found`). Auch der reguläre Build inklusive Vorprüfungen ist damit nicht als bestanden zu betrachten.
- Browser-/Touch-/Last.fm-Live-Test noch offen. Der Genre-API-Teil erfordert einen konfigurierten `LASTFM_API_KEY` und die Spotify-/Last.fm-Authentifizierung der vorhandenen Installation, soweit genutzt.

## Manuelle Freigabe auf Projekt-Rechner

```bash
npm ci
npm run typecheck
npm run build
```

Anschließend im Last.fm-Bereich mehrere Monate mit echten Scrobbles testen, Genre-Metadaten nur per Klick abrufen, unerkannte Tags und API-Ausfall prüfen, Kontowechsel und 10-Zoll-Touch-Layout testen.
