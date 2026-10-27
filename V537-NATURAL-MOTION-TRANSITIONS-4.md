# V537 – Natural Motion Transitions 4.0

## Umsetzung

- `naturalMotionTransitionsV537.ts` ergänzt den bestehenden V492-Crossfade um eine **gebundene, anatomisch gewichtete Einstiegssuche** über maximal 20 Zeitkandidaten im folgenden GLB-Clip (Standard: 20). Betrachtet werden kompatible Hüft-, Oberschenkel-, Unterschenkel-, Fuß- und dezente Wirbelsäulen-Kurven, nicht Gesicht oder Finger.
- Originale Quaternionen werden vorzeichentolerant bewertet: `q` und `-q` sind dieselbe Rotation. Der Planer nutzt die originale Three.js-Interpolationsfunktion, wenn vorhanden, und liefert sonst eine robuste Interpolation. Ein kleiner Faktor vergleicht die anfängliche Bewegungsgeschwindigkeit.
- Der **tatsächlich durch bestehende IK ermittelte Fußkontakt** gewichtet die betroffene Bein-/Fußseite stärker. V135/V492 bleiben allein für echte Fußverankerung zuständig. V537 ersetzt weder diese IK noch retargetet es Posen.
- Bei hohem Posenunterschied, fehlenden passenden anatomischen Spuren, manueller Choreografie, pausiertem/reduziertem Modus oder niedrigem Sonder-Pose-Übergang bleibt der bisherige V232/V489/V492-Einstieg erhalten. Bestehende Crossfades werden nur bei erfolgreicher automatischer Zuordnung ggf. moderat verlängert, maximal 1,5 s.
- Eingebaut in `useGltfClipTransitionsV492.ts`, **kein** zusätzlicher Mixer, `useFrame`, Download, neuer Speicher oder Mutation der GLB-Keyframes.

## Qualität und Grenzen

Das Verfahren gleicht die **lokalen Gelenk-Rotationen und -Translationen** ab. Es berechnet **keine** präzise kinetische Fußbahn oder garantierte Zero-Slide-Korrektur. Die technische Fußkontaktinformation stammt aus der laufenden IK; geometrische Fußbewegungen lassen sich wie bisher getrennt im V534 Motion Quality Inspector kontrollieren. Ein manueller WebGL-Sichttest ist weiterhin notwendig, insbesondere für Deutschrap-Schritte und Hardstyle-/Hardtekk-Übergänge.

## Prüfung

`npm run test:v537 && npm run test:v537:types` prüft synthetische Gelenke, vorzeicheninvariante Quaternionen, manuelle Prioritäten, fehlende/defekte Kurven, 5 Original-GLBs mit je 20 Clips sowie 30 Transition-Paare. Dazu die bisherigen V536–V529-Regressionen und Syntax/Architekturchecks. Nicht verifiziert: vollständiger Next.js-Produktionsbuild oder reale Raspberry-Pi-WebGL-Qualität.
