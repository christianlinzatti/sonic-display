# Sonic Display V835 – Display Performance Studio

## Lieferumfang

- Grundlage: V834, keine Aenderung an Spotify, Lyrics, Avatar-/Lippensynchronitaet, Musik-/Kamerazeit oder autorisierten Show-Cues.
- Neues Modul `components/visualizer/displayStudioV835.ts`: reine, deterministische Richtlinie fuer DPR- und Pixelbudget-Obergrenzen; einstellbare Profile Aus / Auto / Mini-PC / Pi Balanced / Pi Eco und Ziel 30/45/60 FPS.
- `components/visualizer/displayStudioStoreV835.ts`: sichere, lokal persistierte V835-Einstellungen und Statusmeldungen. Gesonderter lokaler Schluessel `sonic-display:v835:display-studio`; nicht Bestandteil der bestehenden Komplettsicherung.
- `components/visualizer/DisplayPerformanceStudioV835.tsx`: Bedienung und geschaetzte Renderpixel/aktueller DPR im bestehenden Render-/Diagnosebereich.
- `components/visualizer/adaptivePerformance.tsx`: DPR wird NACH den vorhandenen V253/V355/V388/V602-Grenzen nur weiter gedeckelt. Ausgeschaltet: keine Aenderung. Nur ein bestehendes 1-Sekunden-Rendermessfenster; ohne zusaetzlichen RAF oder Renderer. Bei anhaltender Langsamkeit schrittweise nach unten, nach laengerer stabiler Wiedergabe schrittweise nach oben. Pausierte, verdeckte oder im Uebergang befindliche Fenster zaehlen nicht.
- Die Profile sind Vorschlaege, keine sichere Hardwareidentifikation. Browser-Framezeiten sind keine GPU-Zeiten, `estimatedPixels` ein CSS-Viewport-basierter Schaetzwert. 10 Zoll aus CSS-Pixeln nicht sicher bestimmbar. V835 aendert keine Canvas-CSS-Abmessungen und kein Touch-/Lyrics-Layout.

## Automatische Tests in dieser Umgebung (2026-11-01)

| Pruefung | Ergebnis |
|---|---|
| V835 neue Regressionen | PASS: 65 Gruppen |
| V835 strikter isolierter TypeScript-Check (Policy und Store) | PASS |
| Historische V800–V834 Regressionen | PASS: 35/35 Suiten; 4 historische Versionsannahmen auf V835 erweitert |
| Alt-Displaytests V388, V403, V648 | PASS |
| Modul-Dateinamen-/Case-Check | PASS |
| Globaler Dateinamenvergleich ueber alle Projektdateien | PASS: keine Kollisionen |
| Syntaxcheck | PASS: 1205 TS/TSX-Quelldateien (ohne versehentlich verschachtelten alten Projektordner) |
| Architektur | PASS: 931 Referenzen |
| Lockfile und Paketversion | PASS: beide V835 |
| V831 Build Doctor | BLOCKED: lokale Next.js- und TypeScript-Projektinstallation fehlt; Node/Lockfile/Casing/Release-Skripte okay |
| Vollstaendiger `npm run typecheck` | NICHT ABGESCHLOSSEN: nach 24 Sekunden abgebrochen, kein Erfolg attestiert |
| `next build` | NICHT DURCHGEFUEHRT: `next` fehlt lokal (kein `node_modules/next`) |
| Browser-/Touch-/GPU-Funktionsabnahme auf echter Hardware | OFFEN |

## Automatische CI-Pruefung

`.github/workflows/v832-continuous-validation.yml` laeuft weiterhin auf Push, Pull Request und manuellem Start (Windows und Ubuntu). Es installiert `npm ci` und ruft `verify:production:v831` auf, das `check:release` (nun mit V835), den ganzen TypeScript-Check und einen echten Next.js-Build verlangt. CI-Workflow vorhanden bedeutet **nicht**, dass eine CI-Ausfuehrung oder Produktionsfreigabe hier bestaetigt ist.

## Freigabe auf einer Umgebung mit Abhaengigkeiten

```powershell
npm ci
npm run test:v835
npm run test:v835:types
npm run verify:production:v831
```

Danach reale Shows auf der vorhandenen Hardware mit 1, 2 und 4 GLB-Avataren testen, Displayprofile vergleichen, FPS/P95/Renderpixel und Lyrics-Lesbarkeit protokollieren. Erst danach passende Mini-PC-/Pi-Hardware waehlen.

**Status:** Getesteter Integrationsstand, **keine** produktive Freigabe.
