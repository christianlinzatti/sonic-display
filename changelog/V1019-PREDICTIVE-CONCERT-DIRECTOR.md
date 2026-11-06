# V1019 — Predictive Concert Director

## Änderungen

- **Neue vorausschauende Konzertregie-Vorschau:** anhand der verifizierten V604/V763-Timeline zeigt Sonic Display den nächsten Songabschnitt und die Restzeit an.
- **Vorbereitungsfenster:** 12 bis 3 Sekunden vor dem bestätigten Abschnitt, unter 3 Sekunden unmittelbar bevorstehend.
- **Vier koordinierte Vorschaukanäle:** Kamera, Bühnenbild, Avatar-Formation und Licht (nur Empfehlungen, keine Gerätekommandos).
- **Sicherheitsregeln:** automatische Vorschau aus bei Pause, manueller Übersteuerung, Seek, Blackout und fehlender/ungültiger Timeline; reduzierte Bewegung verändert die vorgeschlagenen Looks.
- **Keine erfundenen Marker:** Titel, Genre oder Bass alleine erzeugen niemals Hook-/Drop-Vorhersagen. Keine KI-Netzwerkabfragen, Timer, Speicherung oder zusätzlichen Render-Loops.
- **Release-Gates:** V1019 Regressionen, strikte Typprüfung für den reinen Planer, CI-Preflight und Vercel-/GitHub-Produktionsgate. Alle Workflow-Lauftitel auf V1019 aktualisiert.

## Technische Grenze

V1019 visualisiert **vorab** bestätigte Ereignisse, führt aber noch keine vorbereitenden Änderungen an realen Govee-Leuchten oder automatischen Kamera-/Avatar-Steuerungen aus. Die Live-Regie und bereits vorhandene Automatik bleibt ausschließlicher Auslöser. Eine spätere Version kann einen bewusst freigegebenen, regressionsgetesteten Preload/Commit-Mechanismus integrieren.

## Freigabe

`node tests/v1019-predictive-concert-regression.cjs`, `node scripts/v1019-release-readiness.cjs`, `npm run test:v1019:types`. Für die Gesamtfreigabe bleibt der echte Node-24-Workflow unter Windows und Ubuntu inklusive Next.js und Playwright maßgeblich.
