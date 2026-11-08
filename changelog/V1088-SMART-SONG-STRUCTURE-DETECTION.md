# Sonic Display V1088 — Smart Song Structure Detection

- Verifizierte V604-Songabschnitte eindeutig von vorläufigen V896-Audiohypothesen unterscheiden.
- Aufbau- und Break-Hypothesen benötigen mindestens 3 Sekunden und 4 neue aufeinanderfolgende Messpositionen.
- Titelwechsel, Pause, Seek, Messlücke und ungültige Messungen invalidieren den Zustand.
- Kein Erfinden von Hooks/Drops, Beat-Grenzen oder Spotify-Audioanalysen.
- Das Live FX Deck zeigt Quelle, Vertrauensgrad und bestätigte nächste Passage.
- Die bestehende Bühnen- und Govee-Regie bleibt unverändert.
- Kompatibilitätstests: V1080 bis V1088; eigener Source-Preflight; Windows-/Ubuntu-Produktionspipeline bleibt Zertifizierungsinstanz.
