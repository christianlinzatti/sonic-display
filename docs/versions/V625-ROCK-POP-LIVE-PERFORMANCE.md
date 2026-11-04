# V625 – Rock & Pop Live Performance

V625 erweitert die **bereits vorhandene** automatisch orchestrierte Konzertregie um **Rock und Pop**, ohne Deutschrap, Hardstyle oder Hardtekk umzuinterpretieren.

- **V502:** Rock/Pop jetzt als eigenständige Genres klassifiziert; abgestufte Intensität für Verse, Hook, Build, Drop, Break. Auch Synthpop wird als Pop behandelt.
- **V600/V604:** der vollständige, geprüfte Songbogen wird nun auch für Rock/Pop aufgebaut, aber ausschließlich aus *importierten, ausreichend sicheren Songabschnitten*. Keine erfundenen Drops, Vocal-Rollen oder Instrumente.
- **V610/V625:** exakt derselbe bereits gemeinsam verwendete automatische Pfad versorgt bestehende Dance-, Camera- und Lighting-Renderer. **Rock** nutzt etwas breitere Hook-Bilder, stärkere Beam-Akzente und geerdete Verse. **Pop** setzt auf Sängerporträts, sanfte Farb-/Spot-Akzente und zurückhaltende Tanzgesten.
- **Abwechslung:** Wiederholte Hooks wechseln zwischen weiten Ensemble-Bildern und engerem Spotlight-Fokus. Builds folgen dem tatsächlichen Verlauf eines bestätigten Abschnitts.
- **Schutz:** Unbestätigter Drop ohne gemessene Kick-/Energie-Akzente bekommt keine zusätzlichen Effekte. Manuelle Kamera, Tanz, Licht, reduzierte Bewegung, Pausen, niedrige Geräteklasse und Lyrics-Schutz behalten Vorrang.
- **Leistung:** Keine zusätzlichen Lichtquellen, GLB-Clips, Renderloops, Shader, Timer oder API-Requests.

Diese Erweiterung ist eine **Regie für bestehende Assets**, keine Garantie für live aufgenommene Rockinstrumente, einzelne Tänze oder eine neue Bühne. Optische Qualität mit echten GLB-Avataren und verschiedenen Tracks im Browser prüfen.

## Prüfung

```powershell
npm run test:v625
npm run test:v625:types
npm run test:smoke:v625
npm run verify:v625
npx tsc --noEmit
npm run build
```
