# Sonic Display V479 – Raspberry Pi Concert Performance Optimization

**Ausgangspunkt:** V478 – Autonomous Concert Director 4.0. Keine Änderungen an Audio-/Spotify-Abfrage, Gesangszuordnung, Lipsync, Lyrics- oder Tanz-Zeitstempeln.

## Ziel und Verhalten

Die automatische Konzertbühne für den 10-Zoll-Kiosk und andere leistungsschwächere ARM-Browser um eine **optionale, adaptive Effekt-Budgetierung** erweitern. Bereits vorhanden waren DPR- und Canvas-Pixelbudget (`adaptivePerformance.tsx`, V388/V403) sowie der Pi-Geräteprofil-Schalter V165. V479 ist eine zusätzliche, kleine Schutzschicht für GPU-intensive **optionale automatische Effekte**, kein Ersatz der bestehenden Qualitätsregler.

- Die Funktion ist **opt-in**: Pi-Profil *Aus* verändert nichts. Das Profil *Auto* greift nur bei einem ARM/Linux- oder Raspberry-Pi-Browserhinweis; eine solche User-Agent-Heuristik ist **kein sicherer Hardware-Nachweis**. Explizite Profile *Pi Balanced* und *Pi Low* sind geräteunabhängig auswählbar.
- **Pi Balanced** beginnt im ausgewogenen Modus. Ab drei Avataren unterbleibt das optionale automatische Postprocessing bereits vorbeugend, damit Lyrics und Darsteller Priorität haben. Erst **fünf zusammenhängende schlechte Ein-Sekunden-Fenster** (FPS oder P95-Framezeit) senken auf Eco ab. **18 gute Fenster** mit mindestens 30 Sekunden Abstand zur letzten Änderung lassen Eco wieder in Balanced übergehen.
- **Pi Low** ist ausdrücklich auf Eco fixiert. Hochleistungseffekte werden dort nicht automatisch nach einer Verbesserung wieder eingeschaltet.
- Eco schaltet ausschließlich **nicht ausdrücklich angeforderte** automatische V468-Postprocessing-, DanceFX- und Shader-Effekte zurück. Explizit aktivierte Effekte (und ausdrücklich ausgewählte Shader-Stile), benutzerdefinierte Stage-Elemente, Animator-/Sänger-Keyframes, Mikrofondaten und Playback behalten Vorrang. Reaktive Bühnenbeleuchtung und die übrige Stage-Dramaturgie werden nicht umgeschrieben.
- Es werden die **bestehenden** Framefenster aus `components/visualizer/adaptivePerformance.tsx` wiederverwendet; keine zweite `requestAnimationFrame`-Schleife, keine GPU-Temperaturmessung, keine erfundenen Benchmarks. Versteckte Tabs, pausierte oder ungültige Messungen zählen nicht zu schlechtem Verlauf. Die React-Anzeige aktualisiert sich nur beim Wechsel der Stufe oder des Profils, nicht pro Frame.
- Das Profil wird weiterhin lokal im Browser verwaltet, ohne neue Netzwerkanforderungen. Die verfügbare Profilstufe wird in den vorhandenen Raspberry-Pi-Einstellungen angezeigt.

## Module und Schnittstellen

- `services/monitoring/piConcertBudgetV479.ts`: reine deterministische Zustandsmaschine, Hysterese, Cooldown und Manual-Priority-Policy.
- `components/visualizer/piConcertRuntimeV479.tsx`: lokale Store-Brücke mit `useSyncExternalStore`; nur seltene Stufenwechsel lösen Renderupdates aus.
- `components/visualizer/RaspberryPiEdition.tsx`: liest Profil und Browser-Hinweise, initialisiert Budgetierung, zeigt die aktuelle Stufe an.
- `components/visualizer/adaptivePerformance.tsx`: liefert einmal pro Sekunde *vorhandene* fps/P95-Metriken, berücksichtigt Pause und Tab-Sichtbarkeit.
- `components/visualizer/ThreeAvatar.tsx`: setzt die optionale Effektbudgetierung um. Vorhandener `AdaptivePerformanceController`, Avatar-Motion und Lyrics bleiben aktiv.

## Tests

```powershell
npm run test:v479
npm run test:v479:types
npm run check:architecture
npm run build
```

`tests/v479-pi-concert-budget-regression.cjs` deckt Opt-in, Windows- und Pi-Hinweise, 1–4 Avatare, anhaltende schlechte/gute Messwerte, Cooldown, Pause/Hidden/NaN, manuelle Priorität, Unveränderlichkeit des Desktop-Pfades und eine deterministische 30-Minuten-Simulation ab. Die TypeScript-Kernprüfung ist isoliert. Die bestehende Build-Vorprüfung startet die beiden V479-Tests vor den älteren Regressionen.

**Nicht behauptet:** eine feste 30-/60-FPS-Rate, eine echte Raspberry-Pi-Hardwaremessung, Thermal-/GPU-Auslastung oder ein vollständiger Next.js-Produktions-Build in einer Umgebung ohne npm-Abhängigkeiten. Optischer und langfristiger Realgeräte-Test bleibt nötig.
