# Sonic Display V530 – Intelligent Embedded Motion Director

## Was sich gegenüber V529 verbessert

V529 installiert eine Avatar-GLB mitsamt allen eingebetteten Animationen, zeigt diese vor dem Import an und kann sie im Vorschau-Viewer einzeln testen. **V530 schaltet die Auswahl der bereits in dieser Avatar-GLB enthaltenen Clips erstmals in der Live-Bühne dynamisch um**, ohne dass 20 einzelne Motion-Dateien installiert werden müssen.

- **Genre und musikalische Szene:** `components/visualizer/embeddedMotionDirectorV530.ts` bewertet echte Clip-Namen und deren Laufzeiten/Kanäle für Deutschrap-Verses, gemeinschaftliche Hooks, energievolle Hardstyle-/Hardtekk-Drops und ruhigere Intro-/Break-Teile. Diese Einordnung ist eine Heuristik anhand von Clip-Namen; sie erzeugt weder neue Animationen noch erkennt sie Sänger aus dem Audiosignal.
- **Sanfte, kontrollierte Abwechslung:** Eine deterministische, track-/avatar-/slotgebundene Auswahl gilt mindestens acht Sekunden und ändert sich frühestens an einer neuen Vier-Takt-Phrase. Es gibt keine zufälligen Wechsel pro Frame; bei Track-, Avatar- oder Seek-Wechsel wird die Auswahl zurückgesetzt.
- **Vorhandene Crossfade-Pipeline:** `GltfDancerAvatarV492.tsx` führt die Clip-Auswahl der **einen bestehenden** `useGltfClipTransitionsV492`-Pipeline zu und nutzt für V530 mindestens 0,55 Sekunden als Übergangs-Basis. Die bestehende Pose-Matching-, Low-Pose- und Foot-IK-Behandlung bleibt zuständig. V530 erstellt keine neuen AnimationMixer, GLB-Kopien oder zusätzlichen `useFrame`-Loops.
- **Klare manuelle Vorrangregeln:** Opt-in-Gruppenuhr (V328), Gruppenphrase (V329), V481-Low-Pose, V356-Auto-Regie, manuell ausgewählte Library-Motions, externe Motion-GLBs, Loop-Presets, Sequenzen, Timelines, Blend-Editor, Rap-Live-Modus und explizite Smart-Dance-Overrides haben Vorrang. V530 läuft ausschließlich im **Hybridmodus**, bei laufender Musik mit gültiger Track-ID, gültigen eingebetteten Clips und ohne Reduced Motion.
- **Raspberry-Pi-freundlich:** Bereits geladene AnimationClip-Metadaten werden memoisiert. Die React-Entscheidung aktualisiert sich bei vorhandenen Track-Zeit-/Szenenänderungen, nicht über einen weiteren Render-Loop; der bestehende Mixer übernimmt sämtliche Clips. Keine zusätzlichen Abhängigkeiten.

## Beispiele aus den fünf Testdateien

Alle fünf Originalbeispiele (`sonic-performer-v3`, `sonic-pulsebot-v1`, `sonic-nova-v1`, `sonic-rae-v1`, `sonic-jax-v1`) haben 20 Clips. Mit den jeweils vorhandenen Namen werden je nach Kontext etwa `Dance_RapTwoStep` für Deutschrap-Verses, `Dance_ClubGroove` für Rap-Hooks, `Hip_Bounce`/`Dance_ArmWave` für harte Drops und `Idle_Groove` für ruhigere Abschnitte priorisiert. Die tatsächliche Wahl variiert deterministisch mit Track, Zeitphrase und Bühnen-Slot.

**Es werden keine Animationen generiert.** Der Director nutzt ausschließlich tatsächlich in der jeweiligen GLB eingebettete, gültige Clips. Unbekannte GLB-Namen sind zulässig, aber möglicherweise nicht optimal zugeordnet. Eine explizite Sängerrolle aus V385/V416/V496 steuert weiterhin die vorhandene Vocal-/Kamera-Regie, **nicht** automatisch die V530-Clip-Klassifikation. Die ursprünglichen Clip-Dateien, Morph-Targets, Lip-Sync, Lyrics-Timestamps und manuelle Kamera bleiben unverändert.

## Test- und Abnahmehinweise

- `npm run test:v530` testet alle fünf tatsächlich hochgeladenen GLBs (sofern im Testsystem verfügbar), je 20 Clips, Genre- und Abschnittswechsel, 180-Sekunden-Playback, deterministische Auswahl, min. 8 Sekunden Verweildauer, Seek-/Track-/Model-Reset, manuelle Prioritäten und die Integration in den bestehenden Mixer.
- `npm run test:v530:types` prüft die neue TypeScript-Kernlogik isoliert und ohne Browser-/Three-Abhängigkeiten.
- `npm run check:syntax`, `npm run check:architecture`, `npm run test:v529` sowie V522–V528 und V493 prüfen verwandte Import-, Lyrics-, Kamera-, Tanz- und Choreografie-Pfade.
- **Im Browser testen:** Nach Installation einer Beispiel-GLB den Avatar im Hybridmodus ohne aktive manuelle Loop-/Timeline-/Choreografie-Auswahl starten; einen Rap-Track mit Vers/Hook-Cues und einen Hardstyle-Track mit Drop-Cues testen. Clips und Übergänge in der 3D-Bühne prüfen, dann Timeline, manuelle Motion, Pause und Reduced Motion aktivieren. Auf einem 10-Zoll-Raspberry-Pi FPS/P99 mit V522 prüfen.

Ein echter WebGL-Sichttest und vollständiger Next.js-Produktionsbuild benötigen die Projekt-Abhängigkeiten und die Zielhardware und wurden in dieser Umgebung nicht durchgeführt. Die fünf Original-GLBs sind Testfixtures außerhalb des ausgelieferten ZIP und werden **nicht** automatisch veröffentlicht.
