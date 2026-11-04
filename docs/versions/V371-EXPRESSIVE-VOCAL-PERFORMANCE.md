# Sonic Display V371 – Expressive Vocal Performance

**Basis:** Vollständiges V370-Projekt · Version `0.1.0-v371`.

## Ziel

Die bestehenden V367–V370-Funktionen (Lyrics-Synchronisation, Mundformen, Facial Performance, Vocal-Kamera und Facial Animation Studio) werden um kleine, rhythmische Körpersignale ergänzt. Köpfe, Augen, Brustkorb und Arme reagieren auf getaktete Wörter, Textakzente und Phrasenenden, ohne den Haupttanz neu zu planen.

## Verwendung

Einstellungen → **Avatar & Tanz** → **V371 · Expressive Vocal Performance**:

- **Kopf, Blick und Gesten zur Stimme:** separat schaltbarer Zusatz-Layer; standardmäßig an.
- **Vocal-Präsenz:** 0–150 %, Standard 60 %.
- **Dezenten Blickkontakt nutzen:** Kopf-/Augenrichtung zu markanten Wörtern; ohne Augen-Bones bleibt allein die dezente Kopfneigung.
- **Oberkörper- und Armgesten nutzen:** kurze Akzente passend zu Rap und melodischen Passagen; abschaltbar.

Der vorhandene **Gesangsstil** aus V368 wird übernommen (`auto`/`rap`/`singing`): Rap nutzt kürzere und pointiertere Akzente, melodischer Gesang weichere Gesten. `auto` ist eine Heuristik aus Genre und Wortabständen, **keine Analyse isolierter Stimme**.

## Architektur

- `components/visualizer/vocalStageExpressionV371.ts`: reine, deterministische Berechnung aus Spotify-Songzeit, synchronisierten Lyrics und den V368-Vocal-Cues; gesonderte, begrenzte Ausgabekanäle für Kopf, Blick, Brust und Arme.
- `components/visualizer/ThreeAvatar.tsx`: prozeduraler Avatar blendet die Kanäle direkt in die ohnehin berechneten Kopf-/Arm-/Torso-Zielpositionen ein. GLB-Avatare verwenden einen eigenen additiven Bone-Layer nach dem vorhandenen Rig-Motion- und Partner-Overlay.
- `components/visualizer/VisualizerStage.tsx`, `registry.tsx`: geben V371-Einstellungen mit dem vorhandenen `lipSync`-Objekt durch; keine zweite Songzeit oder zusätzlichen Netzwerkanfragen.
- `context/UiPreferencesContext.tsx`, `types/music.ts`, `SettingsPanel.tsx`: getrennte, rückwärtskompatible Einstellungen.
- `tests/v371-expressive-vocal-regression.cjs`: Echtzeit-Grenzfälle, Gesten-Zeitfenster, Multi-Avatar, Partner-/Clip-Priorität und sanftes Freigeben des additiven Layers.

### Verhalten und Prioritäten

- **Pause, Seek in eine Lücke, Instrumental oder fehlende Sync-Daten:** sofort neutrales Ziel; die schon vorhandene Bone-Überlagerung fährt weich auf null.
- **Wort-Zeitstempel:** markante Einzelwörter und Phrasenenden aktivieren bounded, kurz an- und abschwellende Bewegungen.
- **Nur Zeilen-Zeitstempel:** ausschließlich sehr sanfte, zeitabhängige Kopfbewegung; keine erfundenen Wortakzente, Gesten oder fokussierter Blickkontakt.
- **Mehrere Tänzer:** dieselbe Songzeit, alternierende dezente Gestenrichtung pro Slot, keine zufälligen asynchronen Vocal-Ereignisse.
- **Autoren-Choreografien / Partnerinteraktion:** Dämpfung von Kopf-/Arm-Impulsen. Hand-IK, Partnerbewegungen und Fußkontakte werden nicht neu berechnet.
- **Reduced Motion:** deaktiviert diese neue Expressionsschicht vollständig.
- **Avatare ohne Bones:** benötigte Ausgänge werden still übersprungen, der restliche Tanz bleibt unverändert.

## Zusätzliche Stabilisierung

Beim Übernehmen von V370 wurden zwei bereits vorhandene, im TypeScript-Check erkennbare Zuordnungsfehler korrigiert: Die V323-Full-Body-Balance-Verarbeitung befindet sich jetzt in der GLB-Pipeline mit den benötigten Rig-/FootIK-Referenzen (statt im prozeduralen Avatar), und die Formation-Komponente greift nicht mehr auf `groupOnV326` außerhalb ihres Geltungsbereichs zu.

## Grenzen

Die Bewegung wird **geschätzt** aus getaktetem Text, nicht aus isoliertem Spotify-Audio oder echten Phonemdaten. Die Wirkung hängt davon ab, ob ein importiertes Modell Kopf-/Augen-/Arm-Bones besitzt und welche Animationen es selbst enthält. V370-Morph-Kalibrierungen und V369-Kameranahaufnahmen bleiben unverändert. Für ein realistisches Modell sind passende Bones/Morphs nötig.

## Prüfungen

- `npm run check:syntax`: 494 TypeScript-/TSX-Quelldateien erfolgreich analysiert.
- `npm run test:v371`: erfolgreich (Lyrics-Timing, Pausen/Lücken, reduzierte Bewegung, Rap/Gesang, Multi-Avatar, IK-/Partnerpriorität, Overlay-Rücknahme, Settings-Integration).
- `npm run test:v367`, `test:v368`, `test:v369`, `test:v370`, `test:v323` und zusätzlich 20 thematisch benachbarte Regressionstests: erfolgreich.
- `npm run build:preflight`: **BLOCKED**; es fehlen `node_modules` und `package-lock.json` im Ausgangsarchiv. Es gibt **keinen bestätigten TypeScript-Check und keinen bestätigten Next.js-Production-Build**. Ohne Abhängigkeiten meldet `tsc` zahlreiche nicht verwertbare Missing-Module-/Typfehler. Auf dem lokalen Rechner `npm install` und `npm run verify` ausführen.
