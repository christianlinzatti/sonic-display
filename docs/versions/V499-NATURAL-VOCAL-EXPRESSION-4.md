# Sonic Display V499 – Natural Vocal Expression 4.0

## Ziel und tatsächlicher Funktionsumfang

V499 verbessert die **optischen Übergänge der bestehenden Gesichtsmikroanimation** für ausdrücklich im V496-Editor zugewiesene Sängerinnen und Sänger. Der neue, reine Verfeinerer `refineNaturalVocalExpressionV499` verarbeitet die bereits erstellten V459-/V476-Lip-Sync-Frames und die zum aktiven Song gehörenden V496-Intervalle. Es erfolgt **keine Stimmenerkennung, Sprechertrennung, Phonemschätzung oder Erstellung neuer Wort-Zeitstempel**. Bei fehlenden echten Wort-Timestamps entsteht durch V499 keine neue Mundanimation.

### Was sich ändert

- **Neue Solo-, Duett- oder Hook-Rolle:** Der zusätzliche optische V476-Anteil an Kiefer, Lippenform, Wangen, Brauen und Squint wird bei einem tatsächlichen neuen Sängerstart während 240 ms mit `smoothstep` eingeblendet. Die ursprüngliche V453/V459-Mundform bleibt durchgehend erhalten.
- **Rollenende:** Nur der zusätzliche V476-Anteil wird in den letzten 205 ms des bereits markierten Zeitfensters ausgemischt. Kein vorzeitiger Silencer und keine künstliche Lip-Seal-Animation.
- **Durchgehende Rollen:** Bei einer Wiederholung desselben Sänger-Slots unmittelbar nach einem Segment oder nach einer Lücke bis 650 ms gibt es keinen unnötigen neuen Attack. Bei überlappenden Segmenten gilt wie im V496-Editor die zuletzt gespeicherte gültige Zuordnung.
- **Schnelle Rap-Wörter:** V476-Wortformen und die schnellen V453/V459-Attack-/Closure-Raten bleiben erhalten. V499 fügt weder künstliche Frequenzoszillationen noch neue Mundpositionen zu unmarkierten Silben hinzu.
- **Leichte Kopfakzente:** Bestehende ausschließlich automatische V459-Zusatzgesten werden mit derselben Rollen-Hüllkurve begrenzt. Autorisierte Choreografien bleiben vorrangig.

### Prioritäten

Nur dann aktiv, wenn der wirklich aktive Spotify-Track dem V496-Track entspricht, V496 eingeschaltet ist, Wiedergabe läuft, beide Zeit- und Sängerzuordnungen gültig sind, der aktuelle Avatar im aktiven V496-Segment singt und V476 bestätigte Lyrics-Wörter liefert. Handgepflegte V420-Mund-Edits, analysierte V423-Audio-Mundposes, manuelle V385-Sängerrollen, Pausen, `reducedMotion` und manuelle Choreografie werden nicht überschrieben. `lipsClosed`, `blink`, `smile`, Timing und Lip-Sync-Attack-Raten werden durch V499 nicht verändert. Ohne V496 bzw. ohne Lyrics-Wort-Timing gelten unverändert V453/V459/V476.

### Integration

- `components/visualizer/naturalVocalExpressionV499.ts`: pure, deterministische Hüllkurven und additive Pose-Verfeinerung
- `components/visualizer/VocalRigV368.tsx`: GLB-Morph-/Jaw-Overlay (bestehende V370-Profile und additive Deltas bleiben intakt)
- `components/visualizer/ProceduralDancerAvatarV492.tsx`: prozeduraler Mund- und Brauenpfad
- `components/visualizer/gltfVocalPerformanceV492.ts`: sanfte GLB-Kopfakzente vor bestehendem Stage-Overlay
- `components/visualizer/GltfDancerAvatarV492.tsx`: übergibt tatsächliche aktive Track-ID an beide GLB-Pfade
- `tests/v499-natural-vocal-expression-regression.cjs`, `tests/tsconfig.v499-core.json`: Grenzen, Prioritäten, Duett, Hook, 30-Minuten-Simulation sowie Quell-Integration

Es wurden keine Timer, AnimationMixer, neuen Frame-Hooks, WebGL-Objekte, neuen API-Zugriffe oder Benutzerkonfigurationen hinzugefügt. Das 30-Minuten-Regressionstest-Sampling prüft die reine Berechnung; realistische Lippen-Synchronizität, die optische Wirkung mit GLB-Dateien sowie Performance auf einem Raspberry Pi müssen auf echter Hardware getestet werden.

### Prüfen

`npm run test:v499 && npm run test:v499:types && npm run test:v498 && npm run test:v476 && npm run check:syntax && npm run check:architecture`

Ein vollständiger Typecheck und der Next.js-Produktionsbuild setzen installierte npm-Abhängigkeiten auf dem Zielsystem voraus: `npm install` und `npm run build`.
