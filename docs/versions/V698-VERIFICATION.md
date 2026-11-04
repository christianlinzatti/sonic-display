# V698 – Prüfprotokoll (29. Oktober 2026)

## Erfolgreich ausgeführt

- `npm run test:v698`: **PASS**, 42 gezielte Prüfgruppen / 12.000 absichtlich ungültige Einträge, inklusive verschiedener Song-/Bild-Identitäten, Auflösung, Modus, Metadaten/Referenz-ID, Schema, Duplikate, Archivgröße, manuellem Status sowie erzwungenem `evidenceVerified:false` und `automaticallyApproved:false`. Alle Testdaten sind **synthetisch**; keine echten Bühnen-Screenshots.
- `npm run test:v698:types`: **PASS**, isolierte strenge TypeScript-Prüfung des Datenkerns.
- `npm run test:v698:ui-types`: **PASS**, isolierter TSX-/JSX-Test mit **test-only** React-Deklarationen, kein Ersatz für den produktiven React-/Next.js-Typcheck.
- Aktuelle schnelle **Versionsregressionen V669–V698**: Alle im `npm run test:quick` durchlaufenen Versions-/UI-Testaufrufe **PASS**, bis einschließlich V669. Danach wurde der Sammelaufruf durch das Tool-Zeitlimit beendet, **bevor** er die abschließenden Strukturprüfungen erreichte. Die Strukturprüfungen wurden deshalb **separat** gestartet und erfolgreich beendet.
- Separat **PASS**: `npm run check:syntax` (964 TS/TSX-Dateien), `npm run check:architecture` (610 Referenzen), `npm run test:module-case` (1632 Dateien ohne Windows-/Linux-Case-Kollisionen), `npm run check:test-types` (8 test-only Ambient-Deklarationen ausgeschlossen) und `npm run test:env:spotify-build` (OAuth/Cookie/Import-Sicherheit).
- V697-V696-Vertragskompatibilität behalten; der historisch fest auf V697 eingestellte Paketversions- und Testketten-Test von V696 wurde an die aktuelle Folgeversion V698 angepasst. Der V696-CLI und das V697-`review.json`-Format sind **nicht** geändert worden.

## Tatsächlich geprüft, aber blockiert

- `npm run check:dependencies`: **Exit 1** – Node v22.16.0, 0/17 npm-Direktabhängigkeiten installiert; `package-lock.json` fehlt.
- `npm run build`: **Exit 1** – stoppt beim unveränderten Prebuild-Gate `check:dependencies`, **Next.js-Produktionsbuild fand nicht statt**.
- `npm run typecheck`: **Exit 2** – projektweit fehlende Next-/React-/Node-/Three-Module und Typen (`TS2307`, `TS2580` usw.). Vollständiger Projekt-TypeScript-Check **nicht erfolgreich**.
- Kein echter Chromium- oder GLB-Lauf mit 1, 2 oder 4 Darstellern, kein tatsächlicher Sichttest von `/acceptance`, keine Live-FPS- oder Lyrics-/Lip-Sync-Qualitätsmessung. Die früher dokumentierte Chromium-Loopback-Sperre wurde nicht als überwunden nachgewiesen. Raspberry-Pi-Hardware ist nicht verfügbar.

## Lokale Windows-Abnahme

1. ZIP entpacken, `npm install`, Lockfile sichern, `npm run typecheck`, `npm run build`, `npm run start`.
2. `/acceptance` öffnen. Alle sechs V696-Aufnahmen auf echten GLB-Modellen prüfen, pro Profil `report.json` und PNG-Bilder importieren.
3. In V698 zwei passende Screenshots auswählen. Verschiedene Genres und Auflösungen müssen gesperrt bleiben. Notiz erstellen, Priorität/Status ändern, explizit speichern, Browser neu öffnen. Notizen müssen vorhanden, Bilder dagegen erneut auszuwählen sein.
4. Gespeicherte V694-Historie anzeigen und Eintrag desselben Songs zuordnen. Prüfen, dass die V694-Historie **nicht** verändert wird. Fehlerhafte und übergroße V698-JSONs müssen ohne Verlust der bestehenden Daten abgewiesen werden.
5. Separate JSONs für V698-Notizen, V697-Review und V694-Qualitätshistorie sichern. Die echten originalen `artifacts/v696/captures/*` mitnehmen.
6. `npm run audit:v696:collect` und `npm run audit:v695:release` für die unabhängigen GLB-/PNG-/Browser-/Build-Nachweise ausführen; Künstlerisches weiterhin menschlich beurteilen.

**Freigabe-Urteil: Quellcode-/Datenkernregressionen bestanden; tatsächliche Produktions- und GLB-Konzertabnahme nicht nachgewiesen, folglich weiterhin blockiert.**
