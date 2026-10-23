# V263 · Intelligent Performance Bottleneck Detector

Integriert in Einstellungen → Diagnose → Performance Session Analyzer.

- Erkennt auf Basis der letzten 12 Messwerte wahrscheinliche Avatar-Callback-, Rendering- oder Heap-Wachstums-Indizien; mindestens 6 valide FPS-/Frame-Messungen.
- CPU-Indiz bei niedriger FPS/hoher P95 und >=7 ms gemessener Animations-Callback-Zeit.
- Render-Indiz bei niedriger FPS/hoher P95 und >=150 Draw Calls im Mittel.
- Heap-Indiz nur bei verfügbarer Browser-Heap-Messung über >=60 Sekunden, mindestens 40 MiB Wachstum und mehrheitlich steigendem Verlauf. Für Heap werden bis zu 24 Messwerte betrachtet (bis rund 2 Minuten), für FPS/CPU/Rendering die letzten 12.
- Empfehlungen beschreiben manuelle Abhilfemaßnahmen; verändern weder Qualität noch Avatare.
- Unklassifizierte Ruckler werden gesondert angezeigt.
- CPU-Callback-Zeit ist keine Gesamt-CPU-Last, Draw Calls kein GPU-Timer, JS-Heap kein RAM-Wert. Mehrere Ursachen können gleichzeitig angezeigt werden.
