# Sonic Display V201 – Dance Variation Engine

Basiert auf V200. In **Character & Motion Library → Smart Choreography Evolution** kannst du die neue Option „Intelligente Variationen“ aktivieren, den Abwechslungsgrad und die Zieltaktlänge festlegen.

V201 wertet bereits installierte GLB-Motions nach Phase/Genre/BPM/Energie aus, vermeidet unmittelbare Wiederholungen und kurze Wiederholungsmuster, wählt Variationen deterministisch anhand eines Seeds und erstellt begrenzte, taktbasierte Sequenzen. Die Vorschau ist **nicht** live, bevor „Vorschlag übernehmen“ gedrückt wird. Der V199-Beat-Transport und das vorhandene Crossfade-System führen gespeicherte Sequenzen aus.

Grenzen: Es werden keine neuen Animationen synthetisiert, keine einzelnen Bone-Tracks verändert und keine garantierte sample-genaue Audiosynchronität erreicht. Die Intensität wirkt als **Auswahlgewichtung**, nicht als Änderung der realen Animationsgeschwindigkeit.

Tests: `npm run test:dance-variation`, `npm run test:ai-choreographer`, `npm run check:syntax`; kompletter Build erfordert npm-Abhängigkeiten.
