# Sonic Display V175 – Adaptive Lighting Learning Engine

V175 baut auf V174 auf. Der automatische Licht-Cue-Generator kann Feedback (übernommen, verworfen, zeitlich verschoben) lokal und nach Genre getrennt berücksichtigen.

- Datenablage: `localStorage`, maximal 250 Ereignisse, ohne Serverübertragung.
- Genre-Fallback `general`, genreabhängige und begrenzte Gewichtung (maximal 15 Prozentpunkte).
- Wenig Feedback wird stark zur neutralen Bewertung gewichtet. Die Roh-Konfidenz aus V174 bleibt sichtbar als Grundlage.
- Zeitkorrekturen wirken erst nach mindestens drei Edits gleicher Cue-Art im selben Genre, maximal ±1,5 Sekunden.
- Mit **Lernfunktion aktivieren** lässt sich die Anpassung deaktivieren. **Lernfeedback zurücksetzen** löscht die lokale Historie.
- Generierte Cues werden nie automatisch gespeichert. Nur der Benutzer kann Cues in die Timeline übernehmen und die Timeline speichern.
- **Wichtig:** Der Score bleibt heuristisch, ist keine statistisch kalibrierte Wahrscheinlichkeit. Spotify-Audiodaten liegen nicht als vollständige Offline-Aufnahme vor.

## Tests

`npm run test:lighting-learning`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
