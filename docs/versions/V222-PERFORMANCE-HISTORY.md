# V222 – Performance History & Intelligent Recommendations

- Zeigt die letzten 60 FPS-Stichproben grafisch und hält maximal 120 im RAM vor.
- Nutzt ausschließlich die bestehenden, ungefähr sekündlich veröffentlichten Diagnose-Snapshots; keine zusätzlichen Berechnungen pro WebGL-Frame.
- Durchschnittliche FPS, Frame-Zeit, Anteil langsamer Frames, Minimum und Maximum.
- Heuristische, rein lesende Empfehlungen nach mindestens fünf Intervallen; niemals eine behauptete Ursache ohne isolierten Vergleich.
- Verlauf lässt sich zurücksetzen; keine persistente Speicherung von Profildaten.
- Der Diagnose-Store ist bislang global und spiegelt den zuletzt berichtenden Avatar wider, nicht automatisch den gesamten Multi-Avatar-Aufwand.
- Test: `npm run test:v222`; Offline-Suite: `npm run verify:offline`.
- Vollständiger Build benötigt installierte npm-Abhängigkeiten.
