# V720 – Qualitäts-/Testbericht

## Neue Tests (durchgeführt)

- `npm run test:v720` – **PASS**, 105 eigene Prüfungen (Berechnungen, deterministische Rankings, Favoritenschwelle, ISO-Datumsvalidierung, 2000er-Zeitgrenze, DST Wien, lokale Jahresgrenze, Unicode/NFKC, Trefferbegrenzung, über 12.000 Archivscrobbles, UI-Verknüpfungen und Read-only-Verhalten).
- `npm run test:v720:types` – **PASS**, isolierte TypeScript-Prüfung der Kernlogik.
- `npm run test:v720:ui-types` – **PASS**, isolierte TypeScript-Prüfung der V720-Komponente und der übergeordneten History-Integration.
- `npm run test:v718`, `npm run test:v719`, `npm run test:v690` – **PASS** als gezielte Rückwärtskompatibilität.
- `npm run check:syntax` – **PASS**, 1.005 TypeScript-/TSX-Dateien.
- `npm run check:architecture` – **PASS**, 674 reale Referenzen und 10 Dokumentationsabschnitte.
- `npm run test:module-case` – **PASS**, 1.697 Dateiidentitäten ohne Windows/Linux-Groß-/Kleinschreibungskollisionen.
- `npm run check:test-types` – **PASS**, Test-only-TypeScript-Typen bleiben von Produktions-Typen getrennt.

## Vollständige Qualitätsprüfungen

- `npm run test:quick`: **PASS (Exit 0)**, vollständige Release- und historische Projekt-Regressionen inklusive Spotify-Session-Build-Umgebung und der V720-Testsequenz erfolgreich.
- `npm run check:dependencies`: **BLOCKIERT**, 0/17 geforderte npm-Pakete installiert und `package-lock.json` fehlt in der zugrunde liegenden Paketquelle.
- `npm run typecheck` (vollständig): **NICHT ERFOLGREICH** (Exit 2), wegen nicht verfügbarer `next/server`, Node-/React- und weiterer Pakettypen. Dies belegt keine inhaltliche V720-Typfehlerfreiheit des Gesamtrepos; die V720-Modultypen wurden separat geprüft.
- `npm run build`/Next.js-Produktionsbuild: **NICHT BESTÄTIGT** wegen fehlender Abhängigkeiten und Lockfile. Ein „Build erfolgreich“ wird nicht behauptet.

## Nachtest auf Windows

```powershell
npm install
npm run test:quick
npm run typecheck
npm run build
```

Die fehlende `package-lock.json` sollte nach Installation erzeugt, geprüft und für einen reproduzierbaren Build ins Git-Repository übernommen werden. Für eine strengere CI-Freigabe ist danach `npm ci` zu bevorzugen.

## Funktionale Grenzen

Interpretationen wie „zum Favoriten geworden“, „neuer Künstler“, „prägende Songs“ beruhen ausschließlich auf beobachteten Last.fm-Scrobbles. Fehlende historische Daten, eine erst kürzlich aktivierte Last.fm-Verbindung und einzelne lückenhafte Monatsabschnitte können die Ergebnisse deutlich verändern. Die Funktion erzeugt keine Last.fm-Scrobbles und verändert keine persönlichen Konfigurationen oder den archivierten Verlauf.
