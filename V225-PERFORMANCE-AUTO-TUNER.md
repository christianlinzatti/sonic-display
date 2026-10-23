# V225 – Performance Auto-Tuning Assistant

Erweitert den bestehenden automatischen High/Balanced/Low-Benchmark um **erklärbare, nicht automatisch angewendete** Tuning-Empfehlungen.

- Auswertung bestehender FPS-, Slow-Frame-, Draw-Call- und Dreieck-Messwerte ohne zusätzliche Arbeit im Renderloop.
- Hinweise für Auflösung/DPR bei deutlichem Performanceverlust von High gegenüber Balanced.
- Hinweise zu Szenenkomplexität und Avatar-LOD bei auffälligen Ressourcenwerten.
- Empfehlung zur Trennung von CPU-/Animationslast und Rendering, wenn Low kaum besser als Balanced ist.
- Unvollständige oder ungültige Tests erzeugen keine unberechtigten Qualitätsempfehlungen.
- Keine automatische Änderung von DPR, Schatten, Bühnenbeleuchtung oder Avatar-Modellen. Solche Änderungen erfordern einen separaten, vergleichbaren Test.
- Bestehende Benchmarkprofile und gespeicherte V224-Funktionen bleiben erhalten.

Offline-Test: `npm run verify:offline`. Vollständiger Next.js-Build: `npm install && npm run verify`.
