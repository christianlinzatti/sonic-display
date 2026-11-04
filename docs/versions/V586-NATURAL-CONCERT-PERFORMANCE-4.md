# Sonic Display V586 – Natural Concert Performance 4.0

Stand: 26.10.2026. Basis V585, vollständiges Projekt. Ziel: Deutschrap- und Feature-Songs natürlicher zwischen wortbetonter Oberkörperperformance und den bestehenden Tanzbewegungen verbinden.

## Integration

- `components/visualizer/naturalConcertPerformanceV586.ts`: deterministischer, an echte Wort- und Zeilenmarken gebundener Zusatz für sanftes Einschwingen und Rücknahme an Phrasengrenzen. Für schnelle Passagen leichte Dämpfung übermäßiger Armspitzen; für bestätigte Hooks vorsichtige Unterstützung. Gegenläufige Arm-/Brustkorbbewegungen sind sehr klein (≤ 0,019/0,024 rad inklusive vorhandener V564-Pose) und werden zusammen mit bereits vorhandenen Bewegungs-Zielen geglättet.
- `components/visualizer/useGltfVocalMotionV492.ts`: V586 liegt **nach** V564 und **vor** V567/V515; es nutzt deren erlaubten Voice-Accent und die V564-Kopf-/Rumpf-Pose, ohne GLB-AnimationClips, Blendtrees oder IK zu überschreiben. Die bestehende Animation-/Audio-Bewegungsengine glättet die Rückkehr zur Nullpose.
- `components/visualizer/ProceduralDancerAvatarV492.tsx`: dieselbe wortgebundene Zusatzplanung, an die vorhandenen Kopf-, Arm- und Rumpf-Zielpositionen gehängt. Keine separate zeitbasierte Bewegungsengine und keine Eingriffe in Fuß-/Knie-/Root-Berechnung.
- Mehrere Sänger: Kein zusätzlicher Vocal-Accent für `background` oder nicht zugewiesene `general`-Rollen bei zwei bis vier Avataren; die vorhandenen manuellen V385/V416-Cues bleiben maßgeblich. Keine automatische Stimmerkennung, kein erfundener Adlib-Sänger.
- Bei Pausen, fehlenden verifizierten Wort-Zeitstempeln, reduziertem Bewegungsmodus, manuell choreografierter Performance, abgeschaltetem Körperkanal oder Low-Tier bleibt die ursprüngliche Pose unverändert.

## Entwicklung

```powershell
npm install --no-audit --no-fund
npm run test:smoke:v586
npm run verify:v586
npm run typecheck
npm run build
```

## Sichtprüfung und Grenzen

Für eine echte Qualitätseinschätzung bitte auf dem PC die 3D-Preview mit einem Rap-/Feature-Song mit Wortzeitmarken testen. Bei mindestens zwei Figuren müssen die manuell bestätigten Rollen wirklich zum Track passen. Anschließend bei ruhigen Verses, schnellen Wortfolgen und Hooks nach wiederholten Seeks das Zusammenspiel von Armen, Schultern, Kopf und Füßen kontrollieren. Die bestehenden `npm run benchmark:v580:pi`-Messungen auf einem echten Raspberry Pi separat durchführen. Offline-Tests/Typprüfungen sind keine Hardware-, Sound-, WebGL- oder Produktionsbuild-Freigabe.
