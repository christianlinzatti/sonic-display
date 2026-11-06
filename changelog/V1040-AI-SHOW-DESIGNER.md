# V1040 · AI Show Designer – lokale Konzertplanung

## Funktionen

- Neuer offline-fähiger Showdesigner in **Einstellungen → Display → 360° Arena**.
- Freitext-Beschreibung einer Showidee, Genres Deutschrap, Hardtekk/Hardstyle, Deutschrock/NDH, Pop.
- Erzeugung von sieben lückenlosen Szenen (Intro, Strophe, Build, Hook, Interlude, Strophe, Finale).
- Edits je Szene: Intensität, Bühnenformation, schwebende Plattformen, Laserformationen, Kamera- und Tanzvorschläge.
- Daueranzeige der Show als mm:ss; in Echtzeit wird der Plan relativ zur **tatsächlichen** Trackdauer gesampelt.
- Opt-in-Schalter für Live-Anwendung; nach Erstinstallation **deaktiviert**.
- Verknüpfung mit bestehenden V1037–V1039-Stages: Transformationsmodus, Floating-Stage-Modus und Hologramm-Look je Segment. Bereits deaktivierte Effekte bleiben aus und die manuellen Modi behalten Vorrang.
- Kein neuer Effektshader, keine externen KI-APIs, keine zusätzlichen 3D-Partikel und kein zusätzliches Rendering.

## Grenzen / Schutzvorkehrungen

- „AI“ bezeichnet in V1040 einen **lokalen, deterministischen, regelbasierten** Assistenten. Es erfolgt **keine echte LLM-Anfrage** oder Musikanalyse im Hintergrund.
- Die sieben Szenen sind ein editierbares dramaturgisches **Template** und keine Behauptung über erkannte Hooks/Drops. Reale Pyro-Cues bleiben von vorhandenen bestätigten Drop- und Beat-Erkennungen abhängig.
- Kamera- und Tanzfelder werden für die spätere Integration gespeichert und angezeigt, aber überschreiben **nicht** die bereits aktiven Kamera-/Choreografie-Engines.
- Keine Showsteuerung ohne gültige Trackdauer / Wiedergabeposition. Pause und reduzierte Bewegung unterbinden die neue Plansteuerung.
- Importierte Einstellungen werden typ- und bereichsgeprüft; Segmente sind zeitlich nicht überlappend. Ein einzelner Plan mit sieben Segmenten begrenzt den Speicherverbrauch.
- Alle GitHub-Actions-Workflows im ZIP sind nur Referenz: Der sichere Importer ersetzt `.github` bewusst nicht. Nach einem Release-Upload müssen geschützte Workflows bewusst synchronisiert werden.

## Tests

`npm run test:v1040` + `npm run test:v1040:types`; `node scripts/v1040-release-readiness.cjs`; Gesamtprüfung `node scripts/v959-source-preflight.cjs`.
Linux/Windows-Validierung über `.github/workflows/v1040-ai-show-designer-validation.yml` (manuell); zentrale Production-&-Playwright-Matrix bleibt in `v965-room-wave-production.yml`.
