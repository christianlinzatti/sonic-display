# V258 – Smart Avatar Performance Advisor

Aufbauend auf V257 zeigt Diagnose → Avatar CPU-Profiling eine neue, rein beratende Rangliste für 1–4 Avatar-Modelle. Mindestens 30 Messungen pro Modell sind nötig. Die Rangliste verwendet P95 der zentralen synchronen Animations-Callbacks, zeigt Konfidenz nach Stichprobenumfang und schätzt deren kumulierte Kosten anhand einer heuristischen 3,5-ms-Grenze. Die bestehenden Modelle und Choreografien werden **nicht** automatisch verändert. Ein Modell wird höchstens einmal empfohlen; Mehrfachinstanzen desselben Modells können abweichende Kosten aufweisen.

**Grenzen:** Kein GPU-Zeitmesser, keine vollständige Framezeit, keine FPS-Prognose. Ergebnisse verschiedener Geräte sind nicht übertragbar. Im Raspberry-Pi-Browser erneut messen. Die bisherige Qualitätssteuerung und die Audio-/Beatsynchronisation bleiben unverändert.

Prüfung: `npm run test:v258`, `npm run test:v257`, `npm run check:syntax`, lokal mit Abhängigkeiten `npm run build`.
