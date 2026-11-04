# Sonic Display V459 – Advanced Vocal Performance 3.0

**Schwerpunkt:** Ruhigere, überzeugendere Gesichts- und Mundübergänge bei schnell aufeinanderfolgenden Deutschrap-Wörtern und längeren Gesangswörtern. V459 erweitert **V453** und die vorhandenen V368–V423/V452–V458-Systeme, ohne eine zweite Vocal-Erkennung zu erstellen.

## Neu

1. **Zeitmarkenbasierte Wortverbindungen:** Nur bei gültigen *Wort*-Zeitstempeln wird zwischen nachweislich benachbarten Wörtern der Mundabschluss etwas sanfter gehalten und der nächste Worteinsatz schneller gefasst. Größere Wortpausen lassen die Bewegung zügiger abklingen. Das ist kein erkanntes Phonem-Timing.
2. **Behutsame Koartikulation:** Kurz vor dem Ende eines Worts kann sich der Mund geringfügig an der geschriebenen Vokalkategorie des *tatsächlich zeitmarkierten nächsten Worts* orientieren (maximale Beimischung 7,5 %). Keine Überblendung über Pausen, in ein nächstes P/B/M-Wort oder in dessen manuell bearbeitete Form.
3. **Ausdrucksstarke Rap-Mimik:** Sehr kleine Ergänzungen der Kiefer-, Wangen- und Brauenbewegungen plus begrenzte Kopfneigung (zusätzlich höchstens 0,006 rad) und Kopfdrehung (0,009 rad). Die bestehende V453-Kopfbewegung bleibt erhalten.
4. **Zwei reale Renderpfade:** Der prozedurale 3D-Avatar nutzt die abgestimmte Gesichtsform und Kopfbewegung. Das GLB-Facial-Rig nutzt dieselbe Mundform, während sein vorhandenes morph-basiertes Overlay sauber von der ursprünglichen Clip-Animation getrennt bleibt; der GLB-Körper erhält dieselben kleinen Kopfakzente über die vorhandene Stage-Overlay-Pipeline.
5. **Schutz der vorhandenen Arbeit:** Manuelle Wort-Keyframes (V420) und zugelassene lokale Audiomund-Informationen (V423) behalten die alleinige Kontrolle über Kiefer-, Weit-, Rund- und Lippenverschluss-Werte. Manuell ausgeschlossene Sänger-Slots, handgesetzte Body-Motions, reduzierte Bewegung, Pausen und ausgeschalteter Lip-Sync lösen keine V459-Akzente aus. Song-/Seek-Reset des GLB-Rigs bleibt unverändert.
6. **Keine neue Konfiguration:** Keine neuen API-Schlüssel, Hintergrunddienste oder App-Einstellungen; bestehende Stärke- und Qualitätsoptionen bleiben maßgeblich.

## Integrationsdateien

- `components/visualizer/advancedVocalPerformanceV459.ts` – rein funktionaler, deterministischer Folgeplaner von V453; keine persistenten Daten und keine Audioabfrage.
- `components/visualizer/ThreeAvatar.tsx` – beide 3D-Renderwege erhalten V459-Kopfakzente, prozeduraler Avatar erhält neue Gesichtswerte.
- `components/visualizer/VocalRigV368.tsx` – GLB-Morph-Kanäle erhalten V459-Gesichtswerte und angepasste Interpolationsgeschwindigkeiten; erhalten bleiben Quellclip-/JawBone-Overlays und manueller Preview-Vorrang.
- `tests/v459-advanced-vocal-performance-regression.cjs`, `tests/tsconfig.v459-core.json` – zeitmarkenbasierte Wortübergänge, Lippenverschluss, Prioritäten, Pausen, Artist-Rollen und strukturierte Einbindung.

## Grenzen und ehrliche Darstellung

**Sonic Display analysiert hier nicht die tatsächlichen Phoneme oder den Audio-Gesang.** Geschriebene Vokale und Wortabstände steuern nur eine vorsichtige *visuelle Schätzung*. Feature-Künstler lassen sich aus Genius-Credits nicht zuverlässig mit Gesangs-Zeitstempeln identifizieren. Originalbewegungen der importierten `.glb`-Dateien werden nicht ersetzt. Die Veränderungen sind bewusst dezent; die reale optische Wirkung muss mit den jeweiligen GLB-Rigs und am Zielgerät geprüft werden.

## Prüfen (Windows)

```powershell
npm install
npm run test:v459
npm run verify:v459
npm run typecheck
npm run build
```

Einzelheiten zu durchgeführten und noch offenen Prüfungen: `V459-VERIFICATION.md`.
