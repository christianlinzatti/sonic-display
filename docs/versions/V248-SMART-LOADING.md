# V248 – Smart Loading & Runtime Performance

- Einstellungs-UI wird erst bei der ersten aktiven Öffnung importiert und gemountet. Bei Hover/Fokus wird der Code-Chunks vorgeladen.
- Das bestehende SettingsPanel behält alle Funktionen; `initiallyOpen` öffnet nach dem ersten Laden direkt den Dialog.
- Messung der **Modul-Ladezeit** für Einstellungen, 3D-Bühne und Audio-Visualizer mit `performance.now()`.
- Unter Diagnose werden die letzten acht Ladezeitmessungen dieser Sitzung angezeigt. Maximal 30 Einträge im Speicher; keine Telemetrie oder Speicherung.
- Alle V247-Optimierungen bleiben erhalten. Echte Laufzeiten und Bundlegrößen können erst durch `npm run build` und Browsertests ermittelt werden.
- Test: `npm run test:v248`; Prüfung: `npm run typecheck && npm run build`.
