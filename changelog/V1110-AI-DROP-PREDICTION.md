# V1110 · AI Drop Prediction – Local Drop Radar

- Nutzt bestehende lokale, freiwillige V1108-Audiomessung. Keine echte Vorhersage zukünftiger Audiodaten oder sicherer Drop-Zeitmarken.
- Bewertet aufeinanderfolgende Fenster anhand Energie, Bass, Beat-Stärke und Attack. Zustände: steady, building, impact-observed, cooldown.
- Keine Auswertung bei Stille, kurzer Messdauer, fehlendem Mikrofon, pausierter Wiedergabe oder unsicherem Signal.
- Sichtbare, freiwillige Übernahme der Drop-Regieidee nur in die nächste Vorschau; keine automatischen Gerätebefehle.
- Bei Übernahme wird der unveränderte, validierte V1106 Showplan angewendet, mit Kamera-/Laser-/Dance-Akzenten, begrenzter Intensität und Rückgängig-Funktion.
- Unterstützt V1109 Story Engine mit konsistenten Story-Beats. Keine Veränderung manueller Song-Zeitgrenzen.
- Tests: lokale deterministische V1110-Fälle, TypeScript und Playwright Desktop/Touch (nach Import in GitHub Actions).
