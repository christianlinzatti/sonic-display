# V272 – Performance Stability Guard

Ein Opt-in-Schutz auf Basis der bestehenden 5-Sekunden-Telemetrie. Aktivierung in Einstellungen → Diagnose → Performance Session Analyzer. Wähle zuvor eine stabile Renderqualität; sechs aufeinanderfolgende schlechte Messwerte (FPS < 30 oder P95 > 45 ms) lösen genau einen Wechsel zur bestätigten Zielqualität aus. Nur bei sichtbarem Tab, frischen Daten und mindestens 60 Sekunden seit dem letzten Guard-Wechsel. Danach wird der Schutz deaktiviert; ein Undo steht bereit. Manuelle Renderwechsel beenden den Schutz. Es werden weder Avatar-Daten noch Choreografien verändert. Die Schwellwerte sind heuristisch, keine garantierte Hardware-Diagnose.

Test: `npm run test:v272`. Ein vollständiger Next.js-Build erfordert installierte Abhängigkeiten.
