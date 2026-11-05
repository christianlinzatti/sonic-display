# V991 – Bass Impact Physics (2026-11-05)

**Ziel:** Ein opt-in, songgebundener Bassimpuls am Bühnenboden mit geordneter, virtueller Schockwelle und vorhandenen Partikelringen.

- Die V822-Bass-Transientenerkennung ist Voraussetzung. V810 muss eine **bestätigte** Musikphase melden. Eine vermutete BPM, AI-Song-Interpretation oder Metadaten allein lösen keinen Effekt aus.
- `bassImpactDirectorV991.ts` verwaltet ausschließlich pro Song gebundene letzte Impulszeit und Schockwellendauer anhand von `getLightingPlayback().positionMs`. Bei Seek, Songwechsel, Pause oder geschütztem Zustand wird zurückgesetzt.
- `bassImpactShaderV991.ts`: genau **eine** zusätzliche statische Bodenfläche mit transparenten, radialen Ringen und wenigen lokalen Glints. Das Mesh ist standardmäßig unsichtbar und benötigt weder neue Uhr noch Textur, Licht, Renderpass oder Animationsloop. Maximal `uPower = 0.16` und Alpha `0.14`, keine Vollbildblitze.
- `enhanceBassImpactParticlesV991` verwendet nur bereits aktive V816-Partikelringe; bestehende Maximalanzahl, Qualitäts- und manuelle FX-Vorgaben gelten weiterhin.
- Schalter, Stärke (0–100), Stil (Wellen, Schockwelle, subtil) und bestehende Partikelzusatzoption im Concert FX Studio, standardmäßig **AUS**.
- Unterdrückt bei manuellem Licht/FX, Blackout, fehlendem bestätigtem Song, ungültigen Timingdaten, pausierter Wiedergabe, Reduced Motion, Low-Tier oder geschützter Lyrics-Anzeige. V825-Leistungsbudget wird berücksichtigt.
- Tests: `npm run test:v991`; fokussiert `npm run verify:v991:focused`; isolierter Typcheck `npm run test:v991:types`; CI-Gates V832 und Vercel (Node 24 erforderlich).

**Grenze:** Ein Audio-Onset wird nur erkannt, wenn die bestehende Audioanalyse tatsächlich ein entsprechendes Signal liefert. Spotify-Metadaten allein bieten das nicht. Es handelt sich um einen optischen Effekt, nicht um physikalisch simulierte Wellen.
