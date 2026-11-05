# V993 – AI Choreography Director

**Stand:** Lokale Regressionen geprüft; vollständiger TypeScript-/Next.js-Produktionsbuild muss mit Node 24 in GitHub Actions/Vercel bestätigt werden.

## Neues Verhalten

- Im Live-FX-/Concert Studio ist ein neuer, standardmäßig **deaktivierter** Bereich „AI Choreography Director“ verfügbar.
- Wählbare Profile: Automatisch nach erkanntem Genre, Deutschrap, Hardtekk, Hardstyle, Rock, Pop. Die Inszenierung verstärkt nur bereits vorhandene Schulter-, Kopf-, Brust- und Arm-Overlays auf importierten Avataren. Keine neuen Clips oder künstlichen Beatzeitpunkte.
- Gemeinsame, zeitlich konsistente Ensemble-Akzente und sanfte Übergänge für **bestätigte** V604/V895-Szenen. V896 kann eine belegte Live-Energie liefern; ohne sie wird kein Beat behauptet.
- Manuelle Clips, selbst erstellte Timelines, V665 Grounding, V492 Foot-IK, Lyrics, Pausen, Seeks, Blackouts, reduzierte Bewegung und schwache Grafikprofile haben Vorrang.
- Kein zusätzlicher WebGL-Canvas, kein neuer Timer, keine neue Analysekette und keine Live-Anfrage an eine externe KI. „AI“ bezeichnet hier die regelbasierte, datenabhängige Choreografieregie, keine generierte 3D-Animation.

## Prüfen

`npm run test:v993` und `npm run test:v993:types` für die neue V993, `npm run verify:v993:focused` für die Regressionen. Im Vercel-Gate und GitHub V832 ist eine V993-Prüfung vorgesehen. Die GitHub-Workflow-Datei muss nach einem ZIP-Import separat abgeglichen werden, weil der Importer `.github` schützt.

**Release:** `releases/SonicDisplay-V993.zip`, `sonicRoadmapRelease=v993`.
