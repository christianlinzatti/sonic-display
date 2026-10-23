# V245 Lighting Build Hotfix

- Korrigiert den TypeScript-Fehler `c.atMs` in `lightingTimelineAnalyzer.ts`: statt dessen `c.cue.atMs`.
- Ersetzt `align-items: end` durch `align-items: flex-end` in `app/globals.css` an beiden Stellen, um die Autoprefixer-Warnungen zu vermeiden.
- Enthält einen Offline-Regressionstest `npm run test:lighting-cue-hotfix`.
- Version 0.1.0-v245 bleibt für Kompatibilität erhalten.
- Vollständiger Next.js-Build muss mit installierten Dependencies lokal geprüft werden.
