# Sonic Display V329 — Intelligent Motion Phrase Matching

## Überblick

V329 erweitert die vorhandene Bühne mit drei bis vier GLB-Avataren um eine **abschaltbare, heuristische Auswahl passender Animationsclips**. Anders als V328, das die Abspielphasen bereits gewählter Clips mit einer gemeinsamen musikalischen Uhr synchronisiert, vergleicht V329 die **Bewegungsinhalte vorhandener Clips anhand lokaler Keyframe-Tracks** und empfiehlt für die Gruppe möglichst ähnliche Tanzphrasen.

### Funktionsweise

1. Erst beim Laden/Ändern einer GLB- oder Motion-Library wird je Clip eine Signatur erstellt. Es findet **keine vollständige Clip-Analyse in jedem Renderframe** statt.
2. Untersucht werden `position`- und `quaternion`-Tracks mit Schlüsselbegriffen zu Füßen/Beinen, Hüfte/Wirbelsäule und Root. Aus jeweils acht zeitlichen Fenstern werden normierte Änderungsintensitäten abgeleitet.
3. Der Lead-Avatar wählt eine brauchbare Referenzphrase (präferiert einen nach Tanz benannten Clip). Für andere Tänzer wird die beste Signatur gesucht. Ein Schwellenwert verhindert sehr schwache Zuordnungen.
4. Der vorhandene `useAnimations`-Mixer übernimmt die gewählte **bestehende** Clip-Animation mit den gewohnten Crossfades. V329 schreibt keine Keyframes um.
5. Optional wird ein gemessener, quantisierter zeitlicher Versatz zur V328-Zyklus-Phase addiert. Diese Option wirkt **nur, wenn V328 aktiv ist**. Die tatsächlichen Bewegungen müssen deshalb nicht identisch sein.

### Einstellungen

`Settings → Avatar → Multi-Avatar Choreography → Advanced Multi-Avatar Stage Director → Intelligent Motion Phrase Matching V329`

- **Aktiviert:** Standardmäßig `false`.
- **Gewichtung:** Beine/Füße 35 %, Oberkörper 25 %, Richtung/Root 15 %, Rhythmus 25 % (relativ normalisiert).
- **Minimale Übereinstimmung:** 52 %.
- **Max. analysierte Clips pro Avatar:** 24, oberes Limit 64.
- **Phasenanpassung:** Standardmäßig `false`; nur zusammen mit aktiviertem V328 wirksam.
- **3D-Vorschau:** Zeigt beim Laden passender Clip-Daten die Empfehlung als Index und die geschätzte Ähnlichkeit an.

### Vorrang und Schutz

- V328 explizite Clip-Auswahl bei aktiviertem V328, manuelle Motion-Timelines, vorhandene Loops, Animation-Layer und Choreografie-Sequenzen haben Vorrang.
- Bei fehlenden erkennbaren Bewegungs-Keyframes, niedriger Übereinstimmung oder fehlendem GLB-Clip wird die bestehende Auswahl verwendet.
- Eingebettete und nachträglich installierte Clips werden anhand derselben Signatur-Regeln bewertet. Die 3D-Vorschau kann nur eingebettete Modellclips darstellen; externe installierte Library-Clips erscheinen nicht automatisch in der Vorschau.
- Die Matching-Signatur ist **keine** Weltkoordinaten-Pose-Erkennung, keine präzise Fußkontaktanalyse und keine biomechanische Kollisionsprüfung. Unterschiedliche Rigs oder Animationen können trotz hoher Ähnlichkeit verschieden aussehen. `confidence` ist ein heuristischer Score und keine statistisch kalibrierte Wahrscheinlichkeit.
- V329 koordiniert aktuell maximal vier Avatar-Slots der bestehenden V326-Bühne. Das Zwei-Avatar-Legacy-Verhalten ist unverändert.

### Technische Dateien

- `components/visualizer/intelligentMotionPhraseV329.ts`: Signatur, Ähnlichkeitswertung, Auswahl, persistierte Einstellungen.
- `components/visualizer/GroupMotionPhraseControlsV329.tsx`: UI und Regler.
- `components/visualizer/ThreeAvatar.tsx`: Registrierung von Clip-Signaturen und sichere Auswahl; nutzt bestehenden Mixer.
- `components/visualizer/MultiAvatarPreviewV326.tsx`: heuristische Auswahl und Anzeige der Empfehlung in der 3D-Vorschau.
- `components/visualizer/MultiAvatarStageStudioV326.tsx`: Einbindung des Panels.
- `tests/v329-motion-phrase-regression.cjs`: zielgerichtete Offline-Regression.

### Tests

- `npm run test:v329` bestanden.
- `npm run verify:offline` bestanden (einschließlich V265–V329).
- `npm run check:syntax` bestanden (388 TS/TSX).
- Isolierte `tsc --noEmit --strict`-Prüfung der V329-Berechnungsengine mit minimaler Three-Typdefinition bestanden.
- `npm run build:preflight` blockiert: `node_modules` und `package-lock.json` fehlen. Daher **kein** verifizierter vollständiger Next.js-Produktionsbuild und **kein** Browsertest.

Auf einem Rechner mit Netzwerkzugang: `npm install && npm run verify`.
