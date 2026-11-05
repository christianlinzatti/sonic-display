# Smart Dance Director V97

- In **Settings → Avatar & Tanz → Smart Dance Director** einschalten; standardmäßig AUS, damit bestehende Choreografien nicht unerwartet überschrieben werden.
- Automatik bewertet gespeicherte V95/V96-Choreografien anhand Name, Genre, BPM und Audioenergie. Namen wie `Hakken`, `Jumpstyle`, `Shuffle`, `Chill` und `Groove` helfen bei der Zuordnung. Alle passenden Choreografien können genutzt werden, auch ohne solche Schlüsselwörter.
- Auswahl ist ein heuristisches Ranking, **keine echte Drop-Erkennung**. Audioenergie und BPM können ohne Mikrofon nur geschätzt sein.
- Zwischen automatischen Entscheidungen liegen mindestens 12 Sekunden; Prüfung alle 2 Sekunden. Manuelle Übersteuerung wählt eine bestimmte gespeicherte Choreografie.
- Nur Choreografien mit passender Avatar-URL und Animations-URL werden berücksichtigt. Einzelne Loops und bestehende Animationen bleiben als Fallback vorhanden.
- Clips werden über den vorhandenen AnimationMixer mit den pro Schritt gespeicherten Übergängen abgespielt. Keine GLB-Datei wird verändert.
- Die Profile bleiben wie bisher browserlokal (`localStorage`).
