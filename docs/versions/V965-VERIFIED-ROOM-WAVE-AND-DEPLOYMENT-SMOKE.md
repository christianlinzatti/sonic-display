# V965 – Verifizierte Govee-Raumlichtwelle und Deployment-Smoke

## Funktionen

- Optionaler, langsamer räumlicher Lichtverlauf für **bestätigte Hook-/Drop-Abschnitte** einer V318-Trackanalyse.
- Genreangepasste, sanfte Helligkeitswelle (Deutschrap vs. Hardtekk/Hardstyle), keine Blitz- oder Power-Befehle.
- Nutzt **ausschließlich** die bestehende Govee-LAN-Sendeschleife; maximal 32 ausgewählte Lampen, mindestens 2.
- Bestehende V912-Lichtshows, manuelle V354-Bühnen-Timelines, V948-Cues und V934-Geräte-Recovery haben Vorrang.
- V961 bleibt der letzte Governor für Farbübergänge und Helligkeit.
- Wie in V958 bleibt der Einstellungsschlüssel unverändert; `roomWaveV965` ist standardmäßig `false`.

## Deployment-Freigabe

- Vor jedem Release: `npm ci --include=dev`, vollständiges `tsc --noEmit`, alle ererbten Regressionen und tatsächliches `next build` auf Windows und Linux.
- Der V964-Ausgabecheck leitet den Startzeitpunkt ohne CLI-Argument nun ausschließlich von einem **erfolgreichen, aktuellen V964-Produktionsbeleg** ab, sonst Fail-Closed.
- Der bestehende Vercel-Buildweg prüft V965 vor dem Next.js-Build auf Node 24 und liest anschließend die erzeugten `.next`-Artefakte.
- Neue, getrennte öffentliche Readiness-Probe (GitHub Actions `deployment_status` oder manueller Aufruf) prüft eine auf `sonic-display*.vercel.app` begrenzte URL. Sie meldet nur **öffentliche HTML-Erreichbarkeit**, nicht authentifizierte Spotify-/LAN-Funktionalität oder Commit-Identität.

## Tests

- `node tests/v965-room-wave-regression.cjs`: 42 Testgruppen, 6.000 deterministische Zustände.
- `node tests/v965-vercel-deployment-smoke-regression.cjs`: URL-Whitelist, HTTP/HTML, Umleitungen und Netzwerkfehler.
- `node tests/v964-next-build-artifact-regression.cjs`: fehlende/fehlerhafte/alte Belege und Artefakte.
- Nach ZIP-Import: GitHub Actions V965 Node-24-Matrix und Vercel-Produktionsprüfung; **kein Freigabeversprechen ohne grüne Build-Läufe**.
