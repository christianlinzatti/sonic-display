# Sonic Display V311 — Advanced Dance Performance

## Ziel

V311 verbessert die vorhandene Tanzperformance, statt eine neue Animations-Engine oder bloße Bühnen-Effekte hinzuzufügen. Die neue **abschaltbare, deterministische Verfeinerungsschicht** liegt beim importierten GLB-Avatar nach V307 Dance Quality & Expression und vor der vorhandenen Debug-/Rigging-/IK-Pipeline. Sie ergänzt die prozedurale Avatar-Animation ebenfalls. V310 Smart Show Quality Director, V309 Presets und die gesamte bisherige Tanz-/Kamerapipeline bleiben vorhanden.

## Neue Funktionen

1. **Frame-rate-unabhängige Bewegungsglättung:** Reaktive Arm-, Schulter-, Gewichts- und Beinkanäle werden leicht gedämpft, um abrupte Wechsel abzumildern, ohne Beat-Akzente vollständig zu verlieren. Das echte Motion-Capture-Clipmaterial wird nicht umgeschrieben.
2. **Dezentes Gegenbalancieren:** Kleine zusätzliche Oberkörper-/Hüft- und Arm-Gegenbewegungen wirken der künstlich symmetrischen Darstellung entgegen. Die Offsets sind begrenzt und bei manuell ausgewählten Choreografien deutlich abgeschwächt.
3. **Kontaktbewusster Fuß-Schutz:** Wenn mindestens ein Fuß in der bestehenden V135-IK als „planted“ gilt, reduziert V311 die *zusätzlichen* symmetrischen Fuß-/Beinimpulse. V311 berechnet keine neue Fuß-IK, sperrt keine Animations-Clips und verspricht keine vollständige Lösung gegen Foot Sliding.
4. **Polierte automatische Clip-Überblendung:** Die vorhandene V136/V232-Transition-Pipeline bleibt verantwortlich für Phasenplanung und Pose-Matching. V311 justiert **nur bei automatischen Clipwechseln** die gemeinsame Fade-in/Fade-out-Dauer leicht nach Tempo, Bodenkontakt und Pose-Matching-Score. Manuelle Clipwahl und Motion-Timelines behalten ihre ursprünglichen Crossfade-Werte.
5. **Musikalischer Kontext:** Bei Breaks/Intros/Outros arbeitet die Gegenbewegung zurückhaltender, bei Drops/Hooks deutlicher. Deutschrap, Hardtekk/Hardstyle und Cinematic erhalten unterschiedliche Glättungscharakteristiken.
6. **Playback-Sicherheit:** Pause, reduzierte Bewegung, Titelsprung und Trackwechsel verursachen kein künstliches Zusatzzucken. Für dieselbe Musikzeit ist das Verhalten deterministisch.

## Einstellungen

Unter **Settings → Dynamic Stage → Smart Stage Director → Advanced Dance Performance · V311**:

| Einstellung | Default | Wirkung |
|---|---:|---|
| Intelligente Tanzverfeinerung | An | V311 aktivieren/deaktivieren |
| Bewegungsstil | Auto | Rave, Rap, Cinematic oder Genre-basiert |
| Geschmeidigkeit und Bewegungsübergänge | 62 % | Dämpfung reaktiver Bewegungswechsel |
| Körperbalance und Gegenbewegung | 55 % | Dezente gegengerichtete Oberkörper-/Arm-/Hüftbewegung |
| Fußkontakt-Schutz | 85 % | Zusatzbewegungen bei gesetzten Füßen reduzieren |
| Automatische Clip-Überblendung | 65 % | Bestehende Auto-Crossfades leicht harmonisieren |

Alle vier integrierten V309-Show-Presets enthalten dazu passende V311-Einstellungen und berücksichtigen bei Speichern, Aktivieren und Wiederherstellen die neue Kategorie. Ältere gespeicherte V309-Presets ohne V311-Einstellungen werden automatisch mit sicheren Standardwerten ergänzt. Importierte GLB-/FBX-Dateien, Choreografien, Kamera-Keyframes sowie Audio- und Zugänglichkeits-Einstellungen werden nicht verändert.

## Implementierung

- `components/visualizer/advancedDancePerformanceV311.ts` — reiner Bewegungspostprozessor und Tempo-/Pose-bewusste Crossfade-Regel; normalisierte, lokal persistierte Einstellungen.
- `components/visualizer/DancePerformanceControlsV311.tsx` — Einstellungen.
- `components/visualizer/ThreeAvatar.tsx` — integration in GLB/Prozedural-Avatar und Live-Crossfade, mit V135-IK als letzte Instanz.
- `components/visualizer/StageDirectorControlsV287.tsx` — neue Bedienelemente.
- `components/visualizer/showPresetsV309.ts` und `ShowPresetStudioV309.tsx` — integrierte Show-Presets, Migration und Restore.
- `tests/v311-advanced-dance-regression.cjs` — Grenzfälle und Integrationsprüfungen.

## Verifikation

- `npm run test:v311` — erfolgreich (Settings, Sanitizing, Glättung, Kontakt, manuelle Clip-Priorität, Genre, Seek/Pause, Presets, UI-Wiring).
- `npm run verify:offline` — erfolgreich bis einschließlich V311 (letzter Durchlauf siehe Release-Log).
- `npm run check:syntax` — 349 TS-/TSX-Dateien ohne Syntaxfehler.
- `npm run build:preflight` — keine vollständige Produktionsprüfung möglich, weil `node_modules` und `package-lock.json` im Archiv bewusst fehlen. Der vorhandene Next.js/React/Three.js-Stack muss zunächst installiert werden.

### Lokale Produktionsprüfung

```bash
npm install
npm run verify
```

Die Glättung verbessert vorrangig die bereits vorhandenen Zusatzbewegungen. Für sichtbar professionelle Tanz-Animationen bleiben hochwertige, zu Avatar und Genre passende Motion-Capture-Animationen, ein sauber kalibriertes Rig und verlässliche Audiodaten unerlässlich. Hier wurden keine neuen Motion-Capture-Daten erzeugt und keine echte 3D-Echtzeit-Rendering-Prüfung durchgeführt.
