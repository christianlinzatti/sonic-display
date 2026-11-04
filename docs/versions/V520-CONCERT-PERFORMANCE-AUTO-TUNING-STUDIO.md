# Sonic Display V520 – Concert Performance Auto-Tuning Studio

## Ziel

Nach echten V518-Bühnenmessungen einen **bewusst gestarteten**, **rücknehmbaren** und nachgemessenen Qualitätstest durchführen. Der Test schreibt ausschließlich den bereits existierenden **Grafikmodus** über `setPerformanceMode`, wenn sein aktueller Wert und die Aufnahme stabil sind. Die zugehörige DPR-Änderung ist eine direkte Folge und wird ausdrücklich angezeigt: zwei veränderte Messfelder bedeuten nicht zwei unabhängige Bedieneingriffe.

## Bedienung

1. Raspberry-Pi-Geräteprofil **Aus** und Grafikmodus fest auf **High** oder **Balanced** stellen. Der Test wechselt keine bestehenden Geräteprofil-Einstellungen. V519 empfiehlt die Qualitätsreduzierung bei messbarer Last.
2. Dieselbe relevante Deutschrap-/Hardstyle-Passage mit zwei bis vier Charakteren mindestens sechs Ein-Sekunden-Fenster stabil laufen lassen; unter V518 **Messfenster übernehmen**.
3. Die Änderung (High → Balanced, ggf. Balanced → Low, samt möglicher DPR-Folge) prüfen und **Qualitäts-Test ausdrücklich starten**. Davor wird das bisherige Profil in `sessionStorage` gespeichert. Kein Autostart, kein Hintergrund-Tuning, keine neue Render-Schleife.
4. Die Passage mit unveränderten Lyrics, Lip-Sync, Licht und Besetzung erneut abspielen; **Messfenster übernehmen**. Der V520-Vergleich akzeptiert nur gültige Aufnahmen nach dem Start mit unveränderten sonstigen erfassten Einstellungen; zeigt FPS, schlechtestes Ein-Sekunden-Fenster-P95 und DPR mit allen Differenzen.
5. **Vorherigen Grafikmodus wiederherstellen** ist auch ohne Nachmessung möglich. **Messung akzeptieren und Änderung beibehalten** wird erst nach einer zulässigen neuen Messung und kontrollierter unveränderter Bedienung freigeschaltet. Bei externen Eingriffen wird nichts blind überschrieben.

## Rücknahmeschutz und Wiederherstellung

- Der alte Modus und die Ausgangsmessung werden **vor** dem opt-in-Wechsel in `sessionStorage` gesichert. Bei fehlendem Sitzungsspeicher startet V520 keinen Versuch. Beim Wiederöffnen derselben Browser-Sitzung ist der Testvermerk wieder sichtbar; die Wiederherstellung selbst ändert **keine** Einstellungen.
- Die Rücknahme schreibt ausschließlich den vorherigen Qualitätsmodus und nur, wenn dieser noch der vom Versuch gesetzte Modus ist und kein Pi-Geräteprofil die Regelung übernommen hat. Externe Änderungen werden nicht überschrieben. Das Beenden der Ansicht allein ist **keine** Rücknahme: der Test bleibt aktiv, bis der Nutzer ausdrücklich rückgängig macht oder bestätigt.
- V518 kann in einer Tab-Sitzung nur bis zu acht aktuelle Messpunkte speichern. Ein Neustart kann die Messpunkte verwerfen; der gesicherte V520-Versuch erlaubt dann immer noch die Rücknahme, sofern das Qualitätsprofil weiterhin dem Versuch entspricht.
- Der Test kann **keinen** garantierten FPS-Gewinn und keine Ursachen der Temperatur-/GPU-/Betriebssystemlast nennen. Vor und nach dem Test möglichst identische Songabschnitte, Kamera und Bühnen-Situationen wählen.
- Original-GLB-Clips, Rap-/Feature-Rollen, Wort-Timestamps, Lip-Sync, Lyrics, reaktives Licht, Kamera-Keyframes, Fuß-IK und manuelle Choreografien werden durch V520 nicht verändert. Andere V519-Vorschläge sind nach wie vor **manuell**.

## Implementierung

- `services/monitoring/concertAutoTuningV520.ts`: reine Prüfungen für aktuelle Referenz, manuelles Rendering-/Pi-Profil, V519-Tipp, zulässige Ein-Knopf-Änderung und kontrollierten Nachmessvergleich; Schutz gegen vermischte Captures.
- `components/visualizer/PiConcertAutoTuningStudioV520.tsx`: UI, Opt-in, Sitzungsspeicher, Rücknahme/Bestätigung, ohne neuen Render-Timer. Einbindung unter V519 in `PiConcertPerformanceStudioV518.tsx`.
- `tests/v520-concert-performance-auto-tuning-regression.cjs`: 45.000 synthetische Fälle und gezielte Sicherheits-/Integrationsprüfungen; `tests/tsconfig.v520-core.json`: isolierter TypeScript-Kern.

Vollständigen Next.js-Build und echte GLB-/Raspberry-Pi-Tests mit installierten npm-Abhängigkeiten lokal durchführen: `npm install && npm run build`.
