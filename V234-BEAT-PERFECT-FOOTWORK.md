# V234 – Beat-Perfect Footwork 2.0

Basis: V233. Neue `beatPerfectFootworkV234.ts`-Steuerung verbindet vorhandene Beat-/Kickdaten mit dem Live-FootIK. Ein erkannter Kick-Onset wechselt die bevorzugte Stützseite; eine exponentielle, BPM-abhängige Abklingkurve verhindert Ruckler. Genreprofile für Hardstyle/Hardtekk und Deutschrap berücksichtigen die unterschiedliche Schrittenergie. Clamp-Grenzen halten Korrekturen klein. Anker, Joint-Safety und Fallbacks aus dem bestehenden IK-Solver bleiben erhalten; ohne kompatibles Bein-Rig wird unverändert auf FootContact zurückgegriffen.

Wichtig: Dies ist kein Audio-Sample-genaues Footstep-Placement und keine garantierte neue Fußanimation. Die Verbesserung stabilisiert Kontakt- und Lock-Gewichte synchron zu bereits erkannten Kicks. `npm run verify:offline` führt sämtliche Regressionstests aus. Ein vollständiger Build erfordert installierte npm-Abhängigkeiten (`npm install && npm run verify`).
