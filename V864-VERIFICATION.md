# V864 – Playlist Taste Analyzer: Verification Report

## Integration

- Basis: V863; Versionsstand `0.1.0-v864` in Manifest und Lockfile.
- Im bestehenden Spotify-Playlist-Dialog befindet sich nach der Trackliste ein manuell gestarteter Analyzer.
- Maximal die **ersten 500 Spotify-Playlist-Positionen** werden gelesen. Nicht verfügbare Einträge zählen bei der Begrenzung mit. Weitere Einträge lösen einen Hinweis auf unvollständige Abdeckung aus.
- Künstler-/Titelabgleich ausschließlich mit einem **lokalen**, Last.fm-benutzergebundenen Archiv; das Archiv wird nicht verändert. Bei leerer IndexedDB und vorhandener älterer lokaler History wird der begrenzte Kurzzeitspiegel mit deutlichem Hinweis gelesen.
- Titelabgleich ist heuristisch; keine Verwechslung von nicht erfassten Wiedergaben mit garantiert ungehörten Songs. Remixes/Live-Versionen werden bewusst nicht ungeprüft zusammengelegt.
- Spotify kann für fremde, lediglich gefolgte Playlists HTTP 403 melden. Die UI zeigt die aktuelle Zugriffsregel (eigene / gemeinsam verwaltete Playlists).
- Ohne Last.fm-Archiv bleiben Song- und Künstlerübersicht verfügbar. Keine Last.fm-API-Requests und kein Hintergrund-Polling; keine weiteren Spotify-OAuth-Berechtigungen.

## Erfolgreich überprüft

- `npm run test:v864`: Datenabgleich, Normalisierung, Doppelungen, Archiv vorhanden/fehlend, Scrobble-Grenzen, Positional-Cap, UI-Anbindung, Opt-in, Quellcode-Regeln.
- `npm run test:v864:types` und `npm run test:v864:ui-types`: gezielte TypeScript-Prüfungen.
- `npm run test:v849` bis `npm run test:v863`: Funktions-Regressionstests bestanden.
- `npm run test:v858:types` bis `npm run test:v863:types` sowie jeweilige UI-Prüfungen; zusätzlich `test:v857:types`: erfolgreich. Weitergehende Typ-Prüfkette nicht vollständig abgeschlossen (Zeitlimit).
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`, `npm run check:lockfile:v752`: bestanden.

## Offene Prüfungen

- `npm run typecheck`: **nicht bestanden**, da in dieser Laufzeit Projektpakete und Typdeklarationen (u. a. `react`, `next`, `@types/node`) fehlen. Daraus folgt keine Aussage, dass der Projekt-Typcheck nach `npm ci` fehlerfrei wäre.
- `npm run build` (Next.js-Produktionsbuild separat): **nicht bestanden**; `next: not found` ohne lokal installierte Abhängigkeiten.
- `npm ci --offline`: **nicht möglich**, da `zustand-5.0.16.tgz` nicht im lokalen Cache liegt. Ein Online-Installationsversuch wurde nicht erfolgreich durchgeführt.
- Reale Spotify-Premium-/Last.fm-Session, Playlists mit Spotify-403 und Touch-Display-Browser wurden hier **nicht** praktisch getestet.

## Auf einem Rechner mit Abhängigkeiten

```sh
npm ci
npm run test:v864
npm run test:v864:types
npm run test:v864:ui-types
npm run typecheck
npm run build
```

Kein Release als vollständig produktionsvalidiert markieren, solange diese Prüfungen offen sind.
