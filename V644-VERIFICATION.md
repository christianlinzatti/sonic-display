# V644 – Verifikation (27.10.2026)

## Erfolgreich geprüft
- `npm run test:v644`: **89 Testgruppen**, 12.000 simulierte Song-/Avatar-Situationen. Einschließlich Trackwechsel, Opt-in, wieder geöffneter Einstellungen und Begrenzungen für manuelle Visem-Markierungen.
- `npm run test:v644:types`: TypeScript-Kernprüfung **PASS**.
- `npm run check:syntax`: **872** TS-/TSX-Dateien **PASS**.
- `npm run check:architecture`: **521** Code-Referenzen **PASS**.
- Eine frühere erweiterte V644-Verifikation für die relevanten älteren Lip-Sync-Module war erfolgreich. Die sehr lange rekursive Smoke-Kette wurde in dieser Umgebung nicht lückenlos als ein erfolgreicher Lauf nachgewiesen; einige ältere Tests prüfen eine überholte `prebuild`-Skriptstruktur.

## Ausstehend
- Vollständiger Next.js-Produktionsbuild sowie vollständige Projekt-TypeScript-Prüfung benötigen die lokal fehlenden Node-Abhängigkeiten (`next`, `react` usw.). **Nicht als bestanden ausweisen.**
- Visuelle Prüfung mit realen GLB-Avataren und authentischen, vom Nutzer ausgerichteten Visem-Zeitmarken im Browser.

## Fachliche Grenze
V644 erkennt **keine** Phoneme automatisch. Viseme werden bewusst manuell zeitlich markiert oder importiert. Ohne Opt-in läuft die vorherige automatische Mundregie weiter. Spotify-Audio wird nicht abgegriffen. Aktivierte Spuren bleiben beim Schließen der Einstellungen während der Sitzung bestehen, werden bei Songwechsel entfernt.
