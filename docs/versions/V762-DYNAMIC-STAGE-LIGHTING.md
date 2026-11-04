# Sonic Display V762 – Dynamic Stage & Lighting 4.0

## Ziel

Optionales, genreabhängiges Konzertbild für vorhandene 3D-Bühnen ohne neue Schattenkarten, Postprocessing-Pässe oder eine zweite Lichtregie. V762 basiert auf V761 und arbeitet nur mit **bestätigten V604-Songabschnitten**.

## Umsetzung

- `cinematicScenicLightingV762.ts`: deterministischer, aus Song-Zeitstempel und V761-Szene abgeleiteter Regieplan. Konservativer Bypass bei Pause, Seek-Lücken, ungültigen Playback-Daten, fehlender Bestätigung, Reduced Motion, Low-Tier, manueller Beleuchtung oder Blackout.
- `DynamicStage.tsx`: ein kleiner Boden-Gobo-Shader (`scenicGoboShaderV762.ts`), der bei Inaktivität **keinen Draw Call** benötigt (`visible=false`), und begrenzte Akzente in bereits vorhandenen Spotlights und der bestehenden LED-Wand. Keine neuen Echtzeit-Schatten.
- `ConcertAtmosphereRendererV308.tsx`: Nebelakzent über den **bereits vorhandenen** Haze-Shader; kein zweiter Fog-Eigentümer.
- `VisualizerStage.tsx` → `ThreeAvatar.tsx` → `DynamicStage.tsx`: Live-Konfiguration plus V761-Cue/aus V604 verifizierter Narrative.
- Einstellungen in Dynamic Stage: An/Aus, Intensität, Gobo, LED-Wand, Spotlight, Bodennebel, Lyrics-Schutz. V762 ist **standardmäßig ausgeschaltet**; vorhandene Bühnen-Effekte bleiben unabhängig davon nutzbar.
- Genre-Looks: Deutschrap, Hardstyle/Hardtekk, Rock und Pop mit unterschiedlicher Intensitätskurve und geometrischen Lichtmustern. Keine akustische Genre-Erkennung zusätzlich zur bestehenden Genrequelle.
- Die automatische Dekoration verwendet keine künstlichen Beat-Zeitmarken, neuen Performer oder neue Sängerrollen. Bei geschützten Lyrics werden die Akzente gedämpft und die automatische Beam-Ablenkung unterbunden.

## Technische Grenzen

- Das zusätzliche Gobo ist eine **flache, prozedurale Bodenprojektion**, keine physisch korrekte Projektion eines echten Scheinwerfers.
- Zusätzliche Beam-, LED- und Haze-Modulationen bleiben innerhalb kleiner Grenzen; sie überschreiben nicht die bestehenden V542-/V640-/V602-Limits oder manuelle Timelines.
- Reale Helligkeit, Lesbarkeit, Footprint auf unterschiedlichen GLB-Modellen, FPS-/GPU-Mehrkosten und thermisches Verhalten müssen im Browser auf dem Zielgerät geprüft werden.
- V761-Storyboard basiert auf importierten/verifizierten Abschnitten. Bei fehlenden Songabschnitten bleibt V762 aus und erzeugt **keine** künstliche Showstruktur.
