# V1012 – Intelligent Network Health & Auto Recovery

- Erweiterung des vorhandenen V1010-Netzwerk-Koordinators; keine neuen Hintergrund-Pollings und kein globaler Serverzustand.
- Optionale Dienste pausieren nach wiederholten transienten Fehlern (Circuit Breaker). Die Pause wächst bis maximal zwei Minuten; danach ist nur eine regulär anstehende Prüfanfrage zugelassen.
- Beim Wiederverbinden werden ausstehende optionale Anfragen zeitversetzt (250–3000 ms) gestartet; Playback und Benutzeraktionen behalten getrennte Slots.
- Bewusste Aktionen bleiben unabhängig von einer optionalen Dienstpause. HTTP 429 und `Retry-After` gelten weiterhin für denselben Provider über alle Prioritäten hinweg.
- Das Network Performance Dashboard zeigt offline, Authentifizierungsprobleme, Limits, Dienstpausen, Wiederanlauf und sichere Handlungsempfehlungen an. Es erzeugt keine Diagnose-HTTP-Requests.
- Aggregierte Recovery-Zähler: gestaffelte Aufträge, halb offene Prüfungen, erfolgreiche Erholung, eröffnete Dienstpausen. Keine URLs, Spotify-Accounts oder Zugriffstoken in Telemetrie.
- Konkrete Regressionen für Circuit Breaker, geschützte Benutzeraktionen, 429-Pausen, nicht wiederholte Auth-Fehler, Staffelung beim Reconnect, Kontowechsel und UI-Integration.
- Neu: `test:v1012`, `test:v1012:types`, V1012-Vercel-Gate und GitHub-Actions-Validierung mit Node 24.

## Freigabe

Die fokussierten Tests und isolierten Typprüfungen werden lokal ausgeführt. Ein vollständiger Next.js-Produktionsbuild benötigt die installierten Projektabhängigkeiten und Node 24 auf GitHub Actions; er darf vor dem erfolgreichen CI-Lauf nicht als bestanden markiert werden.

## GitHub Actions

Für den fehlgeschlagenen V1011-Lauf 42207021151 wurden die historischen `resolveMetadata`-Test-Fakes so angepasst, dass `sonicFeatureRelease` wie in Produktion geprüft wird. Diese Test-Fix-Datei wurde bereits direkt auf `master` committed; sie liegt auch in diesem Paket. Die zusätzlichen Feature-Validierungs-Workflows werden ausschließlich manuell ausgelöst, um die einzige automatische Production-Matrix nicht zu duplizieren. Da der ZIP-Importer `.github/workflows/` nicht überschreibt, muss der neue V1012-Workflow bei Bedarf separat ins Repository aufgenommen werden.
