# Sonic Display V791 – Seamless Scene Transitions

V791 glättet vorhandene Kamera- und Lichtinterpolation an den bestätigten Szenengrenzen der V790-Konzertregie. Das gilt auch für unterschiedliche Kameraeinstellungen innerhalb eines Verse oder Hooks.

Der gemeinsame V791-Cue verwendet genau dieselbe Songposition und den verifizierten Storyboard-Abschnitt. Ein bis zu 2,2 Sekunden breites Fenster vor und nach einer lückenlosen Szenengrenze moduliert die existierende Kamera-, Bühnenlicht- und Atmosphären-Interpolation. V609 bleibt als Akt-Grenzen-Fallback erhalten; die langsamere Rate gewinnt. Kein neues WebGL-Objekt, keine neue Render-Schleife und keine synthetischen Beats oder Zeitstempel.

Manuelle Kamera- und Lichteinstellungen, harte Cuts, Blackouts sowie pausierte Songs oder deaktivierte Automatik bleiben unverändert. `reducedMotion` und `low`-Tier deaktivieren V791. Geschützte Lyrics verringern den zusätzlichen Lichteingriff.

Prüfen: `npm run test:v791`, `npm run test:v791:types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`. Für den vollen Build: `npm ci`, `npm run typecheck`, `npm run build`. Die Stage-Attribute `data-v791-edge`, `data-v791-kind` und `data-v791-scene` unterstützen die Laufzeitkontrolle.
