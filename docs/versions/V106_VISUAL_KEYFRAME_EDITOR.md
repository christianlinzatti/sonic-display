# V106 – Visual Keyframe & Curve Editor

Die V105 Multi-Clip-Timeline bleibt bestehen. V106 bietet pro Segment einen interaktiven SVG-Gewichtseditor, das Verschieben/Löschen/Hinzufügen von Keyframes und individuell einstellbare kubische Bézier-Easing-Kurven mit zwei Kontrollpunkten. Die Einstellung `curve: "bezier"` und die optionalen `bezier`-Koordinaten werden im Timeline-JSON gespeichert; ältere V105-Sequenzen bleiben kompatibel. Diese Interpolation wird direkt in der Live-Gewichtsberechnung genutzt.

Prüfen: `npm install && npm run typecheck && npm run build`.
