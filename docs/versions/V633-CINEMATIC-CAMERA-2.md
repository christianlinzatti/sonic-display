# V633 – Cinematic Camera 2.0

## Umfang

- Ein einziger zusätzlicher reiner Kameraplaner und ein bounded 3D-Finisher im **bestehenden** `StageCameraDirectorV289` (ein R3F-Kameraobjekt, ein `useFrame`-Callback).
- **Lead-Portrait** nur bei gültiger bestätigter V528-Sängerrolle, passend zu bestehendem V632-Mund-Cast. **Sängerübergabe:** gleitender Fokus vom abgebenden auf den übernehmenden Slot (1,9 s), langsamerer Kamerainterpolator. **Duett:** zusammenhängender Zweierfokus. **Hook/Ensemble:** konservative Vollbühne mit allen eindeutig zugewiesenen Sängern.
- **Songdramaturgie:** Ohne tatsächlich zugewiesene Sänger ist nur eine dezente `stage`-Totale aus zeitlich zur V604-Story passenden verifizierten Abschnittscues erlaubt. Wiederholte Hooks können zurückhaltend andere Brennweitenakzente erhalten; kein geratenes Solo.
- **Sicherheit:** Vor und nach dem V633-Eingriff V351-Lyrics-Guard. V550 prüft Kopf-/Ganzkörper-Ränder des gesamten sichtbaren Casts und des aktiven Sängers; V540 prüft die Safe-Area. Das Ergebnis darf keine dieser Grenzen verschlechtern. Bei Bottom-Lyrics keine neue horizontale Verschiebung. Ohne valide Roots oder korrekte Song-ID keine Kamerakorrektur.
- **Prioritäten:** Live-Edit, manuelle V299-Kameramodi, V354/V400-Timelines, V430/V432-Overrides, voreingestellte Kamera, V605 Manual, V377 Manual Stage Priority, `reducedMotion` und geringe Qualitätsstufe gewinnen weiterhin. Die V633-Änderung betrifft nur Auto-Posen.
- **Performance:** Keine extra Camera-, GLB-, Three-, Shader- oder Audioressourcen. Pure per-frame Berechnung mit wenigen fixen Kandidaten und vorhandenen `measureConcertFrameV550`/`measureScreenFrameV540`-Methoden.

## Verifikation und Grenzen

- `npm run test:v633`, `npm run test:v633:types`, `npm run test:smoke:v633`, `npm run verify:v633`.
- Die geometrische Projektion nähert Kopf-/Fußbereiche an. Sie ist keine echte Pixel-Occlusion-Analyse und beweist weder künstlerisch angenehme Kamerafahrten noch tatsächlichen Lip-Sync.
- Test mit echten GLB-Avataren, 2/3/4 Personen, 10-Zoll-Layout, V400-Edits, schneller A→B-Vocal-Übergabe und Lyrics-Sidebar bleibt erforderlich. Vollständiger Next.js-Build muss nach `npm install` lokal bestätigt werden.
