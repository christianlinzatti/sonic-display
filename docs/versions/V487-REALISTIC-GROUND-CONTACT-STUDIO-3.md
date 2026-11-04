# Sonic Display V487 – Realistic Ground Contact Studio 3.0

**Basis:** V486. **Version:** `0.1.0-v487`. **Datum:** 23.10.2026.

## Implementierung

1. `components/visualizer/groundContactStudioV487.ts`: Reine, deterministische Kontakt- und Abweichungsbewertung. Sicherer Stand erfordert eine **bereits vorhandene Foot-IK-Messung** plus Kontaktkonfidenz ≥ 0,35; der horizontale Knöchelversatz gegenüber dem gespeicherten Standanker wird anhand der Beinlänge in eine **modellbezogene Zentimeter-Schätzung** umgerechnet. Das ist ausdrücklich keine echte Messung einer Fußsohle auf dem Boden. Zustände: nicht messbar, ohne sichere Standphase, stabil, beobachten und mögliche Drift.
2. `components/visualizer/ThreeAvatar.tsx`: Über ein weiteres stabiles Context-Ref publiziert die bereits aktive GLB-Foot-IK (V135/V322) Kontakt, Konfidenz und Standankerabweichung an die Vierergruppen-Regie. Keine neuen Animationen, IK-Korrekturen, zweite WebGL-Szene oder Render-Schleife. Bei beobachteter Drift wird **nur die optionale V485/V486-Root-Schrittbewegung** zusätzlich auf 65 % (Beobachtung) oder 32 % (größere Abweichung) ihrer ohnehin begrenzten Geschwindigkeit gedrosselt. Ohne optionale Zusatzbewegung, bei fehlender Messung, Pause oder Reduced Motion bleibt die ursprüngliche Regie unangetastet. Das vorhandene Foot-Lock und manuelle Choreografien haben Vorrang.
3. `components/visualizer/GroundContactPanelV487.tsx` und `components/visualizer/StageDirectorControlsV287.tsx`: Im Stage-Director-Einstellbereich zeigt eine **lesende Diagnose** links/rechts Stand, Konfidenz, geschätzte Abweichung, Geschwindigkeitsdrosselung und einen auf 40 Werte begrenzten Verlauf. Aktualisiert maximal zweimal pro Sekunde aus der bestehenden Bühnen-Frame-Schleife. Nur lokaler Arbeitsspeicher; keine Übertragung. Die Fußsymbole sind eine vereinfachte Vorschau – kein gerendertes GLB-Preview.
4. Der Avatar wird bei fehlender sicherer IK **nicht** zwangsweise an den Boden geheftet. V481 Hocke, V482 Übergänge und V486 alternierende prozedurale Schritte bleiben unverändert.

## Einschränkungen

Ein als „mögliche Drift“ markierter Wert misst die Distanz vom gespeicherten Standanker, **nicht** die beobachtete Relativbewegung der Fußsohle gegen ein physikalisch modelliertes Bühnenmesh. Animationen, unterschiedlich skalierte Rigs, Kameraansichten und eine schwankende IK-Bodenhöhe können weitere Fehler verursachen. V487 verspricht keine universelle Fußrutschkorrektur und ersetzt weder IK-Retargeting noch echte GLB-Visualtests. Die Diagnose steht im Mehrfachavatar-Stage-Studio für importierte GLB-Tänzer mit aktivem IK-Solver zur Verfügung; prozedurale Figuren liefern keine echten Fuß-Kontaktproben.

## Tests

```powershell
npm install
npm run test:v487
npm run test:v487:types
npm run build
```

Die Regression prüft Prioritäten, nicht vorhandene Beobachtungen, Modellwerte, vier unabhängige Fußpaare, deterministische Langzeitwerte und die Source-Integration. Produktions-Build und visuelle GLB-Beurteilung sind auf dem eigenen Rechner bzw. Raspberry Pi durchzuführen, wenn keine npm-Abhängigkeiten in der Prüfungsumgebung vorhanden sind.
