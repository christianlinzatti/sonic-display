# V257 · Avatar Performance Comparison

Erweitert V251 CPU-Profiling: gruppierter Sitzungsvergleich nach Avatar-Label (GLTF-Dateiname bzw. Modell-ID, Procedural gemeinsam). Das Vergleichsfenster behält Stichproben nach Avatarwechsel, höchstens 32 Labels und 240 Messwerte je Label. Jeder vierte Frame wird erfasst. Durchschnitt, P95 und Maximum werden nach P95 aufsteigend sortiert. Aktive Instanzen sind sichtbar. Separate Reset-Taste im Diagnosepanel. Zurücksetzen der bestehenden Avatar-Messungen leert auch den Vergleich.

**Grenzen:** Nur synchrone `useFrame`-Callback-Zeit, nicht GPU/Drawcalls/React-Render oder die gesamte Avatar-CPU-Kosten. Unterschiedliche Animationsarten, Qualitätseinstellungen und Musik sind nicht direkt vergleichbar. Keine persistente Speicherung und keine automatische Avatar-Auswahl.

Tests: `npm run test:v257` sowie `npm run check:syntax`. Der produktive Next.js-Build benötigt `npm install`.
