# V536 – Genre-Aware Dance Intelligence 3.0

## Ziel und Grenzen

V536 ergänzt die bereits automatische Bühnenauswahl aus V530 um die **bereits geladenen, zum aktiven Avatar gehörenden Motion-Library-Clips** aus V535. Eingebettete Avatar-GLBs, passende V531-Shared-Source-Animationen und separate geladene Motion-GLBs dürfen gemeinsam bewertet werden. Dazu werden die **vom Benutzer gespeicherten** Kategorien und Favoriten aus V535 verwendet. Animationen, die nicht geladen oder nicht als Three.js-Aktion vorhanden sind, dürfen nicht ausgewählt werden.

Die Umsetzung verändert keine GLB-Datei, AnimationClip-Kurven, Retarget-Kalibrierung, Lip-Sync oder Kamera. Es wird kein neues `AnimationMixer`-Objekt erzeugt, keine zweite Render-Schleife eingeführt und nichts im Hintergrund hochgeladen. Die vorhandene V492-Crossfade-Pipeline verarbeitet weiterhin die Auswahl. Zwischen automatischen Wechseln vergehen mindestens acht Sekunden; gewechselt wird frühestens in einer neuen Vier-Takt-Phrase. Aus den fünf am besten bewerteten, eng beieinander liegenden Clips wird eine wiederholungsarme Auswahl gebildet. Diese Auswahl ist deterministisch und für einen Avatar-Slot sowie eine Songposition stabil.

## Szenen- und Genre-Heuristiken

- **Deutschrap / Hip-Hop / Trap / Drill:** Grooves, Rap-Gesten und Two-Step-Motions während Verses, lebhaftere Tänze zu Hooks.
- **Hardstyle / Rawstyle:** stärkere, rhythmische Bewegungen bei Drops und Hooks; keine bevorzugten Idle-Clips bei energiereichen Szenen.
- **Hardtekk / Tekk:** vorhandene Shuffles, Bounce- und Schrittbewegungen bei hochenergetischen Abschnitten; nur tatsächlich geladene, rig-kompatible Clips.
- **Intro / Outro / Break:** ruhigere Bewegungen (`Idle`, `Groove`); energieintensive Sprünge nach Möglichkeit vermeiden.

Namen und V535-Kategorien sind **Hinweise**, keine echte Audio-Klassifikation oder garantierte Bewegungsqualität. V535-Favoriten erhalten einen kleinen Bonus. Nicht sicher erkennbare Clips bleiben zulässig und fallen unter `other`. Bei Songwechsel, Modellwechsel und Suchsprung werden die Entscheidung und Kurzzeithistorie zurückgesetzt.

## Priorität und Kompatibilität

**Manuelle und ausdrückliche Kontrolle gewinnt:** externe bewusst gewählte Avatar-Motion-GLBs, Choreografie-/Timeline-/Loop-/Blend-Editoren, Rap-Live, explizite Smart-Dance-Overrides, V328/V329-Gruppenregie, V481-Low-Pose, V356-Autonomous Show, gespeicherte V212-/V213-Evolution- bzw. adaptive Pläne und explizite V440-Motion-Zuordnung. V536 arbeitet nur bei laufender Musik, ohne Reduced Motion und im `hybrid`-Modus. Die vorherige V530-Automatik und der alte Bibliothek-Auswahlpfad bleiben als Fallback erhalten.

**Performance-Grenze:** Der vorhandene V191-Loader berücksichtigt derzeit maximal 24 separate Motion-Einträge des aktiven Avatars; V536 erweitert diese Ladegrenze nicht und verwendet ausschließlich Clips, die der bisherige Loader bereits dekodiert/retargetet hat. Die Bibliothek darf weiterhin 250 Einträge speichern, doch nicht alle stehen sofort gleichzeitig zur Bühnen-Auswahl bereit. V536 fügt keine weitere GLB-Download-Warteschlange hinzu.

## Implementierung / Tests

- `components/visualizer/genreAwareMotionDirectorV536.ts`: Pure-TS-Scoring, Genre-/Szenen-Heuristik, 8-Sekunden-Hold, 4-Takt-Entscheidungen, Kurzzeit-Repetition-Control und konservative Crossfade-Untergrenzen.
- `components/visualizer/useGenreAwareMotionDirectorV536.ts`: React-Adapter ohne `useFrame`, mit Track-/Model-Stale-Guards.
- `components/visualizer/GltfDancerAvatarV492.tsx`: baut memoisiert die verfügbare Candidate-Liste aus Embedded-/V531-/V535-Aktionen; verwendet V536 vor V530 und dem Legacy-Fallback; behält alte Prioritäten bei.
- `tests/v536-genre-aware-dance-intelligence-regression.cjs`: fünf hochgeladene GLB-Beispiele (sofern verfügbar), mehrere Genres/Abschnitte, Wiederholungsdämpfung, Favoriten, 24 Zusatzclips, deterministische Auswahl, Hold, Seek, Stop, Reduced Motion und manuelle Priorität.
- `tests/tsconfig.v536-core.json`: isolierter TypeScript-Kern.

**Verifikation:** `npm run test:v536 && npm run test:v536:types && npm run check:syntax && npm run check:architecture`, plus ältere Regressionen. Auf dem Entwicklerrechner mit installierten Abhängigkeiten `npm install && npm run build` und in der **echten 3D-Vorschau** Genre-Vergleich plus Foot-IK und Crossfade-Optik prüfen. Kein automatischer WebGL-Test oder garantierter Raspberry-Pi-FPS-Wert.
