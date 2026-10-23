# Sonic Display V270 – Adaptive Performance Benchmark Studio

- Manuelle Tests der Renderqualitäten high, balanced und low.
- Jede Messung: 2 Aufwärm-Samples plus 6 Auswertungs-Samples der bestehenden 5-Sekunden-Telemetrie.
- Für Vergleichbarkeit denselben Track, dieselbe Szene und dieselbe Avatar-Anzahl beibehalten.
- Zeigt FPS, P95-Framezeit, Slow-Frame-Anteil und Avatar-Callback-Zeit.
- Modus wird nach Abschluss/Abbruch/Unmount zurückgesetzt.
- Rein lokale Sitzungsergebnisse, keine automatisierte Profilübernahme.
- Keine echten CPU/GPU-Lastmessungen.
- Verifikation: npm run test:v270, npm run verify:offline, npm run typecheck, npm run build.
