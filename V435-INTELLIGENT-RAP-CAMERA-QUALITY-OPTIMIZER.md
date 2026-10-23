# Sonic Display V435 – Intelligent Rap Camera Quality Optimizer

## Neuerungen

Der vorhandene **V434 Rap Camera Preview & Transition Studio** zeigt jetzt zusätzlich einen freiwilligen **V435-Qualitätsprüfer**. Er arbeitet ausschließlich im Editor und benutzt die bestehende V433-Kamera-Interpolation, V431-Lyrics-Zeitachse sowie V416/V430-Shot-Zuordnungen.

- **A/B-Qualitätsindikator:** Bewertet Variante A (gespeicherte V433-Weichheit und BPM-Raster) und Variante B (ungespeicherter Entwurf) getrennt. Maximal 100 heuristische Punkte – kein objektives Film- oder Sichtbarkeitsurteil.
- **Konkrete Warnungen:** Übergang endet zu spät für die aktuelle Lyrics-Zeile, relativ schnelle räumliche Kamerafahrt, mehr als zwei Perspektivwechsel in einem Vier-Sekunden-Fenster sowie vorsichtige Hinweise auf sehr kleine Kameraabstände oder auffälligen FOV-Bereich.
- **Messgrößen:** Maximale Kamerabewegung in 3D-Einheiten/s (24 Samples), verbleibende Haltezeit nach dem Übergang, Anzahl an Wechseln in den letzten vier Sekunden.
- **Parameteroptimierung:** Prüft begrenzt die bestehenden V433-Einstellungen **Weichheit in 5-%-Schritten** und **BPM-Raster an/aus**. Ein Verbesserungsvorschlag erscheint nur, wenn der heuristische Indikator tatsächlich steigt. Bei Gleichstand bleibt die Ausgangskonfiguration erhalten beziehungsweise die kleinste Änderung wird bevorzugt.
- **Keine ungewollte Übernahme:** „Optimierungsvorschlag in Variante B übernehmen“ ändert *nur* den lokalen B-Entwurf. Erst der bereits vorhandene Button „Variante B übernehmen“ speichert die Werte. Die Live-Kamera wird dadurch weder eingeschaltet noch während des Prüfens verändert.
- **V434-3D-Vorschau:** Die vorgeschlagene Variante kann mit dem vorhandenen 3D-Vorschaubild und den überlagerten A/B-Verlaufskurven verglichen werden.

## Bedienung

1. Einen Track mit synchronisierten Lyrics und gespeicherten V416-Rapper-Szenen laden.
2. **Einstellungen → Anzeige → Rap Performance Editor → V429 → V431 Timeline → V434/V435 A/B-Studio** öffnen.
3. Eine Lyrics-Zeile mit Rapper-/Shot-Wechsel auswählen.
4. Die Qualitätsindikatoren und Empfehlungen für A und B vergleichen.
5. Gegebenenfalls den **Optimierungsvorschlag in Variante B übernehmen**, den gemeinsamen Zeitregler und die 3D-Vorschau benutzen.
6. Nur bei gewünschter dauerhafter Änderung **„Variante B übernehmen“** klicken. Die vorhandene Live-V433-Freigabe ist weiterhin separat erforderlich.

## Grenzen und Sicherheit

Die Punktzahl basiert auf **bewusst einfachen, dokumentierten Heuristiken**. Es werden keine Videos pixelweise analysiert; verdeckte Gesichter, Avatar-Morphologie, Hindernisse, Kollisionen oder die tatsächliche Bühne können nicht sicher beurteilt werden. Die V434-Vorschau nutzt eine neutrale Verse-Grundkamera, und BPM liefert keine garantierte Beat-Phase. Zu häufige Shot-Wechsel und problematische echte Bildausschnitte können nicht durch globale V433-Regler behoben werden – der V435-Prüfer verweist dafür auf den manuellen V430-Editor und die 3D-Vorschau.

V435 verändert **keinen** Live-Kamerapfad. Bestehende manuelle Kameras, V400-Zeitachsen, V432-Keyframes, reduzierte Bewegung und die Prioritätsprüfungen des StageCameraDirector bleiben unverändert. Die Qualitätsberechnung verwendet React-Memoisierung, damit Spotify-Wiedergabeupdates nicht ständig alle möglichen Entwürfe durchrechnen.

## Technische Dateien

- `components/visualizer/rapCameraQualityOptimizerV435.ts`: Reiner, strikter TypeScript-Inspektor und begrenzte Parametervorschläge.
- `components/visualizer/RapCameraTransitionPreviewPanelV434.tsx`: Bestehendes A/B-Studio mit zusätzlichen Messwerten, Warnungen und Entwurfsaktion.
- `tests/v435-rap-camera-quality-regression.cjs`: Grenzfälle, Unveränderlichkeit, Preview-/Live-Trennung und manuelle Bestätigung.
- `tests/tsconfig.v435-core.json`: Strenge Typprüfung ohne Next.js-Abhängigkeiten.

## Lokale Prüfung

```powershell
npm install
npm run verify:v435
npm run test:imports
npm run typecheck
npm run build
```

Der hier tatsächlich abgeschlossene Prüfstand steht in `V435-VERIFICATION.md`.
