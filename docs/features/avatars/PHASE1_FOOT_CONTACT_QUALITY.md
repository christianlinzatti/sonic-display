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

## Schritt 2 – Ziel-Avatar nach dem Retargeting prüfen

Für externe GLB-Motions analysiert der vorhandene Button **Fußkontakt, Gelenke und
Übergang analysieren** nun zusätzlich die auf den **gewählten Ziel-Avatar**
übertragenen Rotationskurven. Die Quelle und das Ergebnis werden ausdrücklich
getrennt ausgewiesen. Die Diagnose zeigt Anzahl zugeordneter Animationsspuren,
die Zahl temporär geprüfter Posen sowie verdächtige Fußverschiebungen pro Seite.

Die Auswertung lädt beide GLB-Dateien in kurzlebige, privat entsorgte Three.js-
Szenen. Es werden nur der manuell ausgewählte Clip und maximal 81 Posen
ausgewertet, bei sehr großen oder fehlenden Clips wird abgebrochen. Die
originalen Animations- und Avatar-Dateien bleiben unverändert; auch der
Laufzeit-Avatar in der Live-Konzertshow wird nicht angerührt.

Unterschiedliche Avatar-Körperhöhen werden durch normierte horizontale
Fußgeschwindigkeiten vergleichbar gemacht. Der Test ist **keine physikalische
Fuß-Bodenkollision und kein optisches Qualitätsurteil**. Unbekannte Knochen
oder nicht kompatible Rigs liefern explizit „nicht auswertbar“. Für
Mixamo-FBX ohne Skin ist die zusätzliche Animation-only-Skelett-Unterstützung
aus PR #16 erforderlich; bis zum Merge dieses Pull Requests kann bei diesen
Quelldateien noch „nicht kompatibel“ erscheinen.

Der Qualitätsbericht ist an die konkrete Kombination aus Clip, Übergang und
Ziel-Avatar gebunden, sodass ein Avatar-Wechsel keine alte Diagnose anzeigt.

```sh
node tests/phase1-target-rig-quality-regression.cjs
```

Dieser synthetische Three.js-Test enthält zwei unterschiedlich große
Ziel-Rigs und echte AnimationMixer-Samples, ersetzt aber weiterhin nicht
den Sichttest einer realen Mixamo-FBX auf deinem Avatar.
