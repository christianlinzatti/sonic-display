# V232 – Live Motion Matching Integration

V232 integriert den bereits in V231 vorhandenen Pose-/Velocity-Matcher in die reguläre Live-Clip-Umschaltung von `ThreeAvatar.tsx`.

- Bei Wechseln zwischen zwei verfügbaren Animationsclips wird die aktuelle Ausgangspose gegen bis zu 12 Positionen im nächsten Clip verglichen.
- Nur bei kompatiblen Spuren und einem hinreichend guten Score (kleiner 1,5) wird der optimale Einstiegspunkt gewählt.
- Sonst bleibt das bisherige beat-orientierte Phase-Matching beziehungsweise der normale Crossfade erhalten.
- Foot-IK-Zustand, Zeitplan für den Übergang, manuell gesteuerte Timeline-Segmente und explizite Loop-Grenzen bleiben erhalten.
- Keine zusätzlichen Pakete erforderlich.

Grenzen: Matching ist eine einfache Heuristik anhand identischer Animationsspur-Namen; bei unpassenden Retargetings greift der Fallback. Das ist kein vorab gemessener Qualitätsgewinn für jedes GLB. Die vollständige Next.js-Build-Prüfung benötigt installierte npm-Abhängigkeiten.

Prüfung: `npm run verify:offline`, danach `npm install && npm run verify`.
