# V1020 – AI Concert Storytelling

## Features
- Deterministischer, lesender Dramaturgie-Planer mit verifizierter V604/V763-Timeline.
- Akte werden aus aufeinanderfolgenden Szenen derselben `actIndex` zusammengefasst, ohne aus Kameraschnitten neue Songabschnitte abzuleiten.
- Spannungsbogen mit Auftakt, Fokus, Build, Höhepunkt, Atempause und optionalem Finale; Finale nur für bestätigten letzten Hook/Drop und nahezu vollständige Timeline.
- Genre-bezogene, variierte Kamera-, Bühnen-, Avatar- und Licht-Looks als **Vorschau**, keine Ausgabe von Hardware-Kommandos.
- Neue Read-Only-Ansicht im Live-FX-Deck. Anzeige unterscheidet geplante Intensität von real gemessener Audioenergie.
- Gültigkeit an aktuellen Song, Duration, Fortschritt, verifizierte Timeline und aktivierte Regie gekoppelt; Pause/Seek/Blackout/manuelle Eingriffe stoppen die Story-Vorschau.
- Keine neuen Netzwerkanfragen, Speicherung, Timer oder Renderer-Ressourcen.

## Qualität / Auslieferung
- V1020-Versionsnummer in package.json, package-lock.json, README/ARCHITECTURE sowie allen gelieferten GitHub-Actions-Lauftiteln.
- Tests für zusammengefasste Kamera-Szenen, Finale, abweichende Tracks, unvollständige Timeline, reduzierte Bewegung und manuelle Prioritäten.
- Eingebunden in CI, Vercel und Release-Preflight. Für produktive Freigabe sind npm ci, vollständiges tsc, Next.js-Build sowie Playwright auf Node 24 notwendig.
