# V251 – Avatar CPU Profiling

Basierend auf V250. Unter **Einstellungen → Diagnose** wird die CPU-Zeit der wichtigsten `useFrame`-Animationsfunktion für jeden Avatar getrennt angezeigt (Mittel, P95, Max, Anzahl). Der eingebaute Store enthält pro aktiver Avatar-Instanz maximal 120 Messwerte; die Liste wird höchstens einmal pro Sekunde aktualisiert. Beim Unmount wird die Instanz entfernt.

**Messgrenze:** Haupt-Animationscallback, nicht sämtliche Callback-Phasen, React-Rendern oder GPU-Zeiten. Daten werden nicht hochgeladen und nicht persistent gespeichert.

Prüfung: `npm run test:v251 && npm run check:syntax && npm run build`.
