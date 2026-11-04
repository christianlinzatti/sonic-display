# Sonic Display V306 — Ultimate Show Director

## Ziel

Die bestehenden V273-, V287-, V289–V305- und V206/V274-Systeme bleiben erhalten. V306 legt einen gemeinsamen, **opt-in** Show-Plan über die bereits vorhandenen Regisseure: eine bestätigte Songsektion steuert Bühne, Kameraführung, Lichtdynamik, beatbasierte Effekte und Solo-/Duo-Formationen. Die Anwendung verwendet weiterhin nur die vorhandene R3F-Canvas-Instanz.

## Starten

1. `npm install` und `npm run dev` im Projektverzeichnis ausführen.
2. In der App auf **Settings → Dynamic Stage → Smart Stage Director** gehen.
3. Unter **Ultimate Show Director · V306** „Automatische Tanzshow starten“ einschalten.
4. Stil wählen: **Automatisch nach Genre**, **Hardtekk / Hardstyle Rave**, **Deutschrap Spotlight** oder **Cinematic Concert**. Die Intensität anpassen und Kamera, Licht, Formationen, FX einzeln aktivieren oder deaktivieren.
5. Visualizer-Modus **3D Avatar** wählen und einen Song starten.

Die Show-Automatik ist ab Werk **aus**, sodass die V305-Einstellungen und Benutzerpresets nach dem Update unverändert bleiben. Ihre Konfiguration wird separat in `localStorage` unter `sonic-ultimate-show-v306` gespeichert.

## Musik → Show-Cues

| Abschnitt | Kamera | Formationen (Rave / Rap) | Licht / FX |
| --- | --- | --- | --- |
| Verse | subtiler Groove-Schwenk | Duet / Solo | ruhig |
| Build | ansteigende Kamerafahrt | Duet / Mirror | mehr Lichtspannung |
| Hook | dynamische Hero-Perspektive | Mirror / Duet | stärkerer Bühnenakzent |
| Drop | weite Bühnen-Totale | Sync / Sync | fokussierte Licht-/Beat-Highlights |
| Break | ruhiger, naher Fokus | Solo / Solo | reduziertes Licht und FX |

Die Quelle ist die bestehende V273-Musikabschnittserkennung. **Keine garantierte Spotify-Abschnittsanalyse**: ohne Audioeingang sind Audio- und Strukturinformationen heuristisch bzw. synthetisch. Für präzise Song-Höhepunkte sind Live-Audioanalysen und passende Motion-Assets nötig.

## Vorrang und Sicherheit

- **Eigene Kamera-Keyframes und zugewiesene Kamera-Presets** behalten Vorrang. Live-Kamera-Bearbeitung und manueller Camera Director funktionieren weiterhin. Die automatischen Show-Kameraoffsets sind begrenzt und skalieren mit der Showintensität.
- **Manuelle Motion-Auswahl** und gespeicherte Motion-Choreografien werden nicht geändert. V306 steuert die Gruppenanordnung, aber nicht die eigentlichen importierten GLB/FBX-Tanzbewegungen.
- **Multi-Avatar-Konfiguration und Duo Director** haben Vorrang. V306 greift nur in die automatische Formationswahl ein, wenn kein eigener Gruppenregisseur ausgewählt ist. Formationen können separat ausgeschaltet werden.
- **Manuelle Bühnenwahl** setzt den bestehenden V287-Override für den aktuellen Track; der nächste Track startet wieder automatisch.
- Bei **Pause, Seek, Titelsprung und Reduced Motion** werden keine künstlichen Drop-Flash-Impulse erzeugt. Beleuchtungskorrekturen bleiben begrenzt und berücksichtigen das bestehende Performance-Tiering.

## Architektur

- `components/visualizer/ultimateShowDirectorV306.ts`: Pure, playback-time-based Showplanung, Settings-Validation, Speicherung.
- `components/visualizer/showCameraV306.ts`: Optionale leichte Auto-Kamerafahrten; keine Änderungen an gespeicherten Pfaden.
- `components/visualizer/UltimateShowControlsV306.tsx`: Showstart, Stil und getrennte Feature-Schalter.
- `VisualizerStage.tsx`: Liefert den gemeinsamen Cue an die bestehende V287-Bühnenlogik und das Visualizer-Interface.
- `ThreeAvatar.tsx` / `StageCameraDirectorV289.tsx` / `DynamicStage.tsx`: Nutzen denselben Cue für Formation, Kamera, Effekte und Licht.

## Verifikation

- `npm run test:v306`
- `npm run verify:offline` (V265–V306-Regressionen inkl. Syntax)
- Mit installierten Abhängigkeiten: `npm run typecheck && npm run build`

Die Quellcode-/Offline-Tests können unabhängig von den vollständigen npm-Modulen laufen. Ein erfolgreicher Offline-Test allein garantiert **keinen** erfolgreichen Next.js-Browser-/Produktionsbuild.
