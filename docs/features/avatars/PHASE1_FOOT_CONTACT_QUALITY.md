# Phase 1 – Fußstabilität und Motion-Qualität

## Änderungen

1. **Sichere Fußverankerung (V322):** Ein Fuß darf nicht durch eine schnelle
   Bewegung nach unten oder oben als stabiler Standkontakt gelten. Ungültige
   Koordinaten, ungültiger Bodenschätzwert, Tempo oder Frame-Zeit lassen alte
   Anker sofort los; ohne validen Messwert wird keine IK-Korrektur ausgelöst.
   Die Verankerung bleibt wie zuvor **opt-in** und benutzt weiterhin denselben
   bestehenden Foot-IK-Solver.
2. **Foot Stability Check:** Im bereits vorhandenen erweiterten Motion-Inspector
   werden für jeden Fuß separat mögliche Standphasen, auffällige seitliche
   Verschiebungen und die jeweilige Beobachtungsdauer angezeigt. Der Test
   läuft nur, wenn im Installer ausdrücklich **Fußkontakt, Gelenke und
   Übergang analysieren** gewählt wird.
3. **Keine zusätzlichen Frame-Schleifen:** Die Prüfung nutzt dieselben
   höchstens 81 3D-Skelett-Stichproben wie die vorhandene V534-Qualitätsanalyse.
   Die reine Auswertefunktion begrenzt selbst bis zu 121 Posen.

## Grenzen

Eine Fußposition nahe der niedrigsten gemessenen Höhe ist lediglich ein
**Standkandidat** und keine bestätigte Bodenberührung. Das Ergebnis ist eine
diagnostische Empfehlung zur manuellen Sichtprüfung, **keine automatische
Anpassung der Originalanimationen**. Die Zahlen beziehen sich bei importierten
Motions auf deren Quell-Skelett, nicht auf ein noch ungetestetes Retargeting auf
ein fremdes Rig. Es werden keine neuen AnimationMixer, GLB-Uploads, GPU-Pässe
oder Hintergrundabfragen ausgelöst.

## Tests

```sh
node tests/phase1-foot-contact-quality-regression.cjs
node tests/v322-foot-lock-ground-contact-regression.cjs
```

Diese Tests laufen auf Windows und Linux vor dem vollständigen
Production-/Playwright-Gate. Für die visuelle Beurteilung echter Mixamo-FBX
muss weiterhin die 3D-Vorschau mit dem gewünschten Ziel-Avatar verwendet
werden.

**Architekturhinweis:** Die Umsetzung ist von `master` abgezweigt und
ändert Pull Request #16 nicht. Nach dessen Freigabe kann der gemeinsame
Qualitätsworkflow unverändert für importierte Mixamo-GLB genutzt werden.
