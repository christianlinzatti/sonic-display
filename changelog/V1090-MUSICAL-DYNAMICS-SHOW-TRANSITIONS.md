# V1090 · Musical Dynamics & Show Transitions

- Neue reine, deterministische `stepMusicalDynamicsV1090`-Logik für songbezogene Licht-Kurven aus gemessener Energie, Bass und Attack.
- Drei wählbare Übergangsstile: Ausgewogen, Cinematic, Festival. Sanfter Anstieg/Abstieg statt harter Szenenschnitte.
- Die bereits vorhandene LED-Wand, Laserfächer und Lasertunnel verwenden *denselben* begrenzten Intensitätsfaktor. Kein neuer Draw Call, kein Shader-Overdraw, keine zusätzliche Uhr.
- Bisherige Helligkeit bleibt die Obergrenze; ein Faktor unter 1 dimmt bestehende Pixel, steigende Energie kann sie höchstens bis zur Originalhelligkeit wiederherstellen.
- Opt-in über Arena Show Designer, standardmäßig aus. Manuelle Laser- und LED-Muster werden nicht verändert.
- Kein synthetischer Drop, keine Änderung an Audioanalyse, Govee, echten Lichtern, Playlists, Kameras oder Spotify.
- Fail-safe bei Pause, Seek, Titelwechsel, fehlenden/ungültigen Audiodaten, Reduced Motion und niedriger Grafikqualität.
- Regressionstests für 260.000 State-Schritte, Release-Preflight, CI, isolierte TypeScript-Prüfung.
