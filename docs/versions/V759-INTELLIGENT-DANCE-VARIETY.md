# Sonic Display V759 – Intelligent Dance Variety

V759 erweitert das vorhandene System um einen deterministischen, pro-Avatar verwalteten Variations-Director für additive **bereits vorhandene** GLB-Rig-Bewegungen. Das Ziel ist weniger unmittelbar wiederholte Bewegungsmotive zwischen aufeinanderfolgenden Phrasen.

## Implementiert
- Sechs Motive (`groove`, `counter`, `shoulders`, `flow`, `punch`, `sway`) mit unterschiedlichen Gewichtungen existierender Kopf-, Schulter-, Arm- und Oberkörperkanäle. Keine neuen GLB-Clips oder Animation-Mixer.
- Vier Abschnittstypen (Verse, Hook, Drop, leise Passagen), motivspezifische Auswahl, pro Track/Modell/Avatar-Slot eigener Verlauf und Schutz vor direkter Wiederholung.
- Phrasentakt mit 4/8/16 Beats aus vorhandenem BPM und Songfortschritt. Einstellbare Stärke, Vielfalt und Überblendung; Effekte maximal ±15 % auf vorhandene Skalare.
- Reset bei Pause, Trackwechsel, Zeitsprung, fehlerhaften Zeitdaten und `reducedMotion`.
- Integration in die Live-GLB-Pipeline **V666 → V759 → V684** sowie in die GLB-Avatar-Studiovorschau. Die Studiovorschau verwendet ausdrücklich simulierte Sekunden und einen ausgewählten Abschnitt.
- Einstellungen im Bereich Avatar & Tanz. Bestehende Vorlagen und Musikgenres bleiben erhalten.

## Garantierte Prioritäten und Einschränkungen
- Keinerlei Änderung von importierten Clips, Clipspeed, Looping, Mixer-Aktionen, manuellen Timelines oder expliziter Gruppenauswahl.
- Keine Änderung an Hüftübersetzung, Fuß-, Bein-, Becken-, Gesichts-, Mund- oder Root-Kanälen. Finales V492 Foot-IK bleibt unverändert.
- Bei manuellem Vorrang, reduzierter Bewegung und geringer Qualitätsstufe wird V759 übersprungen.
- Die Variation basiert auf **musikalischen Phrasen und bestehenden Rig-Skalaren**, nicht auf einer semantisch erkannten Originalchoreografie. Sie kann nicht eigenständig neue Tanzschritte erzeugen oder die Wahrnehmung einer längeren Konzertshow ohne visuelle GLB-Prüfung garantieren.

## Prüfung
`npm run test:v759`, `npm run test:v759:types`, `npm run verify:v759:static`, danach mit vollständigen npm-Abhängigkeiten `npm run typecheck` und `npm run build`. Weitere Statusangaben in `V759-VERIFICATION.md`.
