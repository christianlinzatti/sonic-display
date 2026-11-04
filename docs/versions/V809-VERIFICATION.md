# V809 – Verifikationsbericht (31.10.2026)

## Bestanden

- `npm run test:v809`: **60 Prüfgruppen und 2.500 deterministische Kamera-/Interaktionsproben** bestanden. Validiert: Duett, Handoff, Ensemble/Hook, Song-ID, Zeitgrenzen, Auswahl der authentischen Anker, Stale Cues, manuelle/geschützte Kamera, reduzierte Bewegung, niedrige Stufe, Kopf-/Körper-/Bildrand-Sicherheit, Bounds, deterministische Ausgabe.
- `npm run test:v809:types`: isolierter strikter TypeScript-Check bestanden.
- `npm run test:v790` bis `npm run test:v809`: alle 20 aktuellen Funktionstests bestanden.
- `npm run test:v790:types` bis `npm run test:v809:types`: alle 20 isolierten TypeScript-Prüfungen bestanden.
- Weitere angrenzende Regressionen: V354 (manuelle Show-Timeline, aktualisierte Strukturannahme), V655 (natürliche Kamera), V747 (Performance-Kamera), V751 (Qualitätsdashboard), V494 (Fußkontakt), V495 (Formation), V506/V508 (Kollisionen), V687 (Duett) bestanden. Insgesamt **29 von 29** in der gezielten funktionalen Matrix nach Korrektur der V354-Versionsannahme.
- `npm run check:syntax`: 1.160 TS-/TSX-Dateien – Syntax und Import-Bindings bestanden.
- `npm run check:architecture`: 854 Architektur-Querverweise, 10 Abschnitte – bestanden.
- `npm run test:module-case`: 1.971 Quellen, keine Windows/Linux-Dateinamenkollisionen – bestanden.
- `npm run check:lockfile:v752`: Lockfile-, Versions- und CI-Integrität – bestanden.

## Nicht verifiziert / Umgebung

- `npm run typecheck`: gestartet, nach **18 Sekunden** wegen Ausführungslimit beendet (Exit 124). Kein bestandenes Gesamt-TypeScript-Ergebnis.
- `npm run check:dependencies`: **fehlgeschlagen**, 0 von 18 direkten npm-Paketen vorhanden; Next.js, React, Three.js, @types u. a. fehlen.
- `npm run build`: **nicht erfolgreich ausführbar**. Next.js-CLI ist mangels Installation nicht vorhanden; die vorgeschaltete Preflight-Kette und der Produktions-Build können hier nicht abgeschlossen werden.
- Reale Browser-, GPU-/WebGL- und visuelle GLB-Prüfungen sind **nicht durchgeführt**. Die Frames in den Tests sind mathematische Proben, keine Screenshots.

## Nachprüfung auf dem Zielrechner

1. `npm ci --no-audit --no-fund` mit Internetzugang ausführen.
2. `npm run test:v809 && npm run test:v809:types`.
3. `npm run typecheck` und `npm run build` **vollständig** ausführen.
4. Test mit realen GLB-Duett-/Feature- und Hook-Animationen durchführen, einschließlich Lyrics-Schutz, manueller Kamera, Wiedergabepause, Songwechsel, Performance und GPU-Speicher. Bis dahin keine Produktionsfreigabe.
