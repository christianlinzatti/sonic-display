# Sonic Display V518 – Raspberry Pi Concert Performance Studio

## Ziel

Ein nachvollziehbarer **messbasierter** Vergleich einer laufenden realen 3D-Konzertshow mit **zwei bis vier Avataren** – insbesondere Deutschrap-/Hardstyle-Shows mit Lip-Sync, Lyrics, reaktivem Bühnenlicht und der V517-Gruppenregie. Keine erfundenen FPS oder GPU-/Pi-Messwerte.

## Integration

- `components/visualizer/adaptivePerformance.tsx`: nutzt **dieselbe existierende** etwa einsekündige `V218/V479`-Renderprobe. Nach `samplePiConcertV479` wird einmal `recordPiStudioV518` mit FPS, P95, langsamen Frames, WebGL-Zählern, realem Avatar-Count, aktuellem Tier, DPR, Pi-Profil und Budget aufgerufen. Optional liest dieser Pfad `performance.memory.usedJSHeapSize` nur in Browsern mit Chromium-API. **Keine** zusätzlichen `requestAnimationFrame`, Intervalle, Renderer oder GPU-Abfragen.
- `components/visualizer/ThreeAvatar.tsx`: gibt die **aktuellen Bühnenzustände** (`lyricsActiveV356`, Lip-Sync aktiviert, `stageReactive`) aus den tatsächlich angezeigten Stage-Props an den separaten read-only Runtime-Store. Ein `useEffect` wird nur bei Konfigurationsänderung ausgeführt. Reaktives Bühnenlicht „aus“ bedeutet nicht, dass alle statischen Lichtquellen deaktiviert sind.
- `services/monitoring/piConcertPerformanceStudioV518.ts`: reine, deterministische Validierung, Beschränkung auf 120 Fenster, Fingerprint der Render-Konfiguration, Capture nur aus **mindestens sechs ununterbrochenen** kompatiblen Sekundenfenstern (höchstens 20) innerhalb 3,5 s. Bei Wechsel von Avataranzahl, DPR, Qualität, Budget, Lyrics-, Lip-Sync- oder Reaktivlicht-Status beginnt die Aufnahme neu. Unplausible, veraltete, pausierte, versteckte oder fehlende Daten werden nicht als Messung ausgegeben.
- `components/visualizer/piConcertPerformanceRuntimeV518.tsx`: im Browser-Speicher gehaltene bounded Messreihe, die direkt aus der bestehenden Probe bedient wird. Pausierte/unsichtbare Shows werden nicht aufgezeichnet.
- `components/visualizer/PiConcertPerformanceStudioV518.tsx`: unter **Einstellungen → 3D-Renderdiagnose** sichtbarer Verlauf mit bis zu acht vom Nutzer übernommenen Captures. Vergleiche zwei gewählte Captures: FPS-Differenz und Unterschied des schlechtesten Fenster-P95, Hinweise zu abweichenden Rahmenbedingungen. Liest und berichtet nur, ändert keine Grafik- oder Choreografieeinstellung. JSON-Export **nur auf expliziten Klick**, keine Uploads oder dauerhafte Browser-Speicherung.

## Wichtige Grenzen

- FPS, Zeit, langsame Frames, Draw Calls, Dreiecke sind **Browser-Render-Messfenster**; sie repräsentieren keine GPU-Messungen. Ein „schlechtestes Fenster-P95“ ist **nicht** die P95-Zeit über alle Einzelbilder.
- JS-Heap ist **optional**, ein Browserwert, **nicht** Raspberry-Pi-Prozess-RAM. Bei Nichtverfügbarkeit wird „nicht verfügbar“ angezeigt; GPU-Auslastung, VRAM, Temperatur, Spannungsversorgung und tatsächlicher Pi-Speicher sind ohne native Telemetrie nicht erfassbar.
- Zwei nacheinander aufgenommene Zustände können sich durch Songs, Szenen, Geräteerwärmung oder externe Last unterscheiden. Gleiches Qualitäts- und Effektprofil erlaubt einen begrenzten Vergleich, beweist aber keine Kausalität.
- Bestehende V480-Diagnose, V511–V514-Vorschau und V517-Choreografie werden nicht verändert. Kein Eingriff in importierte GLB-Clips, Foot IK, Rap-Vocals, Lip-Sync, manuelle Einstellungen oder Performance-Policy.

## Prüfen

- `npm run test:v518`: 35.000 deterministische Render-Messfenster, 136 gültige Capture-Snapshots, Sonderfälle wie Pausen/Staleness, bad FPS, nicht vorhandener Heap, 2→4-Avatar-Wechsel, wechselnde Qualität/Budget/Lyrics/Licht; Verbindungen zu Runtime und tatsächlicher Bühne.
- `npm run test:v518:types`: isolierte TypeScript-Kernprüfung.
- `npm run build`: vollständige Next.js-Prüfung auf dem Zielgerät mit installierten npm-Abhängigkeiten.
- Für echte A/B-Tests denselben Songabschnitt und identische Showbedingungen vergleichen; erst mit zwei, danach mit vier Avataren messen. Auf dem Raspberry Pi zusätzlich längerfristig auf thermische Drosselung achten.
