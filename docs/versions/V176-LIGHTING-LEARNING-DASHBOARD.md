# V176 – Lighting Learning Dashboard & Smart Preset Recommendations

Erweitert V175 vollständig; bestehende Funktionen bleiben enthalten.

## Dashboard
Im Lichtstudio „Lern-Dashboard öffnen“ auswählen. Es zeigt die lokale, auf maximal 250 Ereignisse begrenzte Historie pro Genre und Effekt (angenommen, abgelehnt, Zeitkorrekturen), Zustimmung je Cue-Art und eine begründete Preset-Empfehlung. Bei weniger als sechs Annahme-/Ablehnungs-Entscheidungen wird ausschließlich „Balanced“ empfohlen und eine Übernahme gesperrt. Empfehlungen sind transparente Heuristiken und keine statistisch kalibrierten Wahrscheinlichkeiten.

Die Schaltfläche „Empfehlung in Editor laden“ ändert nur den ungespeicherten Preset-Entwurf; erst „Preset speichern“ schreibt das Preset. Das Zurücksetzen des Feedbacks bleibt verfügbar; die Empfehlung überschreibt niemals Song-Timelines.

## Verifikation
`npm run test:learning-dashboard`, `npm run verify:offline`, nach `npm install` außerdem `npm run typecheck` und `npm run build`. Ein Browser-/Raspberry-Pi-Test ist separat erforderlich.
