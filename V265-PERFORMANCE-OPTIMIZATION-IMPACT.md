# V265 – Performance Optimization Impact Analyzer

Auf V264 aufgebaut. Bei der expliziten Übernahme speichert V265 die letzten sechs 5-Sekunden-Stichproben als Ausgangsfenster und vergleicht sie mit den ersten sechs neuen Stichproben **nach** der Übernahme. Gezeigt werden FPS, P95-Framezeit, Anteil langsamer Frames und gemessene Avatar-Callback-CPU-Zeit, inklusive absoluter Änderung und Richtung. Daten fehlen als `—`, nicht als Null. Ein Undo beendet die Gegenüberstellung. Nach Reload keine gespeicherte Analyse.

Der Vergleich ist nur unter vergleichbaren Szenen-/Musikbedingungen sinnvoll und kein kausaler Beweis. GPU-Laufzeiten werden nicht direkt gemessen. Fehlende Messwerte bleiben unbekannt. Der Nutzer behält Kontrolle über alle Einstellungen.

Prüfen: `npm run test:v265 && npm run check:syntax` sowie `npm install && npm run typecheck && npm run build`.
