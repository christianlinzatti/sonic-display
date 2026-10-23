# Sonic Display V315 – Visual Dance Improvement Assistant

## Ziel
V315 ist eine **manuell ausgelöste, nachvollziehbare Einstellungsempfehlung** auf Basis der begrenzten V314-Daten. Die Anwendung verändert vor dem Klick auf „Übernehmen“ keine Einstellungen. Kein KI-Cloud-Service, kein ML-Training und keine neuen Asset-Dateien.

## Bedienung
1. Avatar-Show abspielen; V314 muss aufzeichnen (max. 480 Messpunkte des aktuellen Songsegments).
2. Settings → Dynamic Stage → Smart Stage Director → Visual Dance Improvement Assistant V315.
3. „Aufzeichnung analysieren“ klicken. Mindestens acht Messpunkte und zwölf Sekunden sind erforderlich.
4. Einzelne Empfehlungen markieren; **Bisher / Vorgeschlagen** samt Messgrundlage und Einschränkung prüfen.
5. „Ausgewählte Änderungen übernehmen“ – nur die markierten Regler werden verändert.
6. „Änderungen rückgängig machen“ prüft, ob ein Regler seitdem manuell verändert wurde, bevor er zurückgesetzt wird. „Änderungen beibehalten“ beendet die Rückgängig-Sicherung.

## Diagnose und Begrenzung
- Schnelle automatische Schnitte im gleichen Songabschnitt → V310 Mindesthaltezeit.
- Lange automatische Kameraperspektive innerhalb eines Abschnitts → V310 Abwechslung.
- Wiederholt hohe automatische Effekte im Break bzw. viele FX-Sprünge → V310 FX-Obergrenze.
- Häufige zusätzliche Fußimpulse bei Bodenkontakt → V311 Fußschutz (kein GLB-Fußrutsch-Beweis).
- Wenig additive Bewegung bei hoher Musikenergie → V307 Ausdrucksintensität.
- Mehrere starke Sprünge in additiver Bewegungsenergie → V311 Geschmeidigkeit (kann musikalisch gewollt sein).

Die Heuristiken sind **keine objektiven Qualitätsurteile**. Insbesondere wird die tatsächliche Beatgenauigkeit ohne Motion-Capture nicht quantifiziert. Keine Empfehlung, wenn die Stichprobe nicht ausreicht oder der betroffene Regler deaktiviert ist. Manuelle Animationen, Kamerapfade, eigene Keyframes, Reduced Motion und importierte GLB-Assets bleiben unverändert. V315 liest den V314-Session-Snapshot nur beim Klick; es führt keine zusätzliche kontinuierliche Datenaufzeichnung ein. Die Sicherung ist bewusst nicht persistent.

## Entwicklung und Verifikation
- `npm run test:v315`
- `npm run verify:offline`
- `npm install && npm run verify` für echten Next.js-Build und TypeScript-Typprüfung auf einer Maschine mit vollständigen Abhängigkeiten.
