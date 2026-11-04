# V868 – Concert Director 5.0

## Änderungen

- Nutzt den bestehenden verifizierten V604/V600-Songplan (kein Audio-Raten).
- Songweite Kapitel: Auftakt, Entwicklung, Ruhepunkt, Vorbereitung eines nachgewiesenen Drops, Höhepunkt und bestätigtes Finale.
- Bereits verfügbare Licht- und Bühnenakzente werden über die Songzeit stufenweise freigegeben oder reduziert; beim Zurückspulen reproduzierbar.
- Wiederholte Hooks erhalten anhand ihrer vorhandenen Kameramotive unterschiedliche Akzentgewichte. Die Kamera selbst bleibt unverändert in V848/V351 verwaltet.
- Manuelle V823-Effektspuren, Blackout, Lyrics-Schutz, reduzierte Bewegung und ältere Low-Tier-Fallbacks bleiben zwingend geschützt.
- Kein eigener Render-Loop, keine zusätzlichen GPU-Objekte, keine neuen Blitze, kein Erraten von Songabschnitten.

## Technische Integration

- `components/visualizer/concertSongArcDirectorV868.ts`: reine Inspektion und Gain-Formung, mit explizitem Fail-Closed.
- `components/visualizer/smartFestivalShowDirectorV850.ts`: führt die V868-Gain-Anpassung innerhalb der bestehenden V850-Regie aus.
- `components/visualizer/DynamicStage.tsx`: übergibt ausschließlich die mit Track und Gesamtdauer abgeglichene V604-Planung.
- `tests/v868-concert-song-arc-regression.cjs`: gezielte dramaturgische und Sicherheitsregressionen.
- `tests/tsconfig.v868-core.json`: isolierter strikter TypeScript-Check.

## Verifikation und Freigabestatus

- Bei eingesetzten Test-Abhängigkeiten: `npm run test:v868 && npm run test:v868:types`.
- Unter Windows: `npm ci`, `npm run test:smoke:v665:flat`, `npm run verify:production:v867`.
- Ohne installierte Browser-/Next-Abhängigkeiten ist **keine** vollständige Produktionsfreigabe möglich.
- Visualisierungen einschließlich Lyrics-Überdeckung und tatsächlicher Kameraeinstellungen müssen im Browser geprüft werden.
