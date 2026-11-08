## V1093 · Genre Show Intelligence

Die optionale Genre-Dramaturgie (`lib/arena360GenreShowIntelligenceV1093.ts`)
regelt die bestehenden virtuellen LED-, Laser- und Arena-Publikumslichter
je nach **Deutschrap, Hardtekk, Deutschrock oder Pop**. Das aktuelle Genre
wird konservativ aus vorhandenen Metadaten erkannt oder im Arena Show Designer
manuell gewählt. Sechs Showabschnitte (Intro, Strophe, Aufbau, Hook, Break,
Finale) definieren reine optische Look-Hinweise, keine erfundenen Beats/Drops.
Messbare starke Beat-Flanken können die Helligkeit lediglich bis zum ursprünglichen
Limit erholen lassen. Alle drei Instanced-Renderer werden weiterverwendet;
keine neuen Draw Calls, hardware commands, fullscreen flashes oder Timer.

Die Funktion ist Opt-in, standardmäßig deaktiviert, und setzt ihren State bei
Pause, Songwechsel, Seek, Low Tier oder Reduced Motion zurück. Manuelle LED-/Laser-
und Handy-Modi bleiben vorrangig. `npm run verify:v1093:focused` und
`node scripts/v1093-release-readiness.cjs` prüfen Implementierung und Übergaben.

