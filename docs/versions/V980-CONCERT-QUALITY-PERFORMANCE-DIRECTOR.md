# V980 – Concert Quality & Performance Director

## Ziel

Eine messbasierte, optionale Konzertqualitätsregie, die längere Shows weniger
sprunghaft regelt und anschließend dekorative Effektqualität langsam zurückgibt.
Keine Prognose oder Garantie von FPS, GPU-Auslastung oder visueller Qualität.

## Integration

- **V826:** Vorhandene 0,5-Sekunden-Rendererfenster für FPS, mittlere Framezeit,
  P95 und langsame Frames; keine zusätzliche Render-Schleife, kein Timer.
- **V980:** Neue reine, deterministische Zustandsmaschine in
  `components/visualizer/concertQualityDirectorV980.ts`. Mindestens zwei bis
  vier aufeinanderfolgende schlechte Fenster je nach Regieprofil. Hysterese,
  Druckobergrenze 85 %, kontrollierter Wiederaufbau nach fünf bis acht
  stabilen Fenstern; optionale Sperre automatischer Wiederherstellung.
- **V825:** Bleibt alleiniger Executor. Günstigere Dekoration (Schaum, Partikel,
  Crowd) wird zuerst reduziert. LED/Vocal und autorisierte Timeline-Spuren
  behalten ihre vorhandenen Untergrenzen. V980 aktiviert keine Effekte.
- **V827:** Bei aktiviertem V980 übernimmt *nur* V980 die zusätzliche
  Qualitätsrückkopplung; V827 ist dann passiv. Bei deaktiviertem V980 gilt das
  bisherige V827-Verhalten.
- **Dashboard:** V826 zeigt V980-Drosselung, Regiezustand, Messfenster, das
  Performance-Profil und den FPS-Zielwert. Angezeigte Daten sind echte
  Renderer-Frameabstände, keine GPU-Messungen.

## Bedienung

Anzeige → Concert FX Studio → **V980 Concert Quality & Performance Director**.
Standardmäßig **aus**. Profile: visuelle Qualität, ausgewogen, Performance;
schrittweise Erholung und Pi-Diagnose sind separat schaltbar.
Der V825-Optimizer und die V826-Messung müssen ebenfalls aktiviert bleiben.

**Raspberry Pi:** Die neue Diagnose ist explizit aktivierbar und bewertet
30-FPS-Rendererfenster. Das bestehende Low-Tier-Sicherheitsgatter V810 bleibt
unverändert: bereits gesperrte schwere Effekte werden nicht reaktiviert. Da
V825 nur aktive V810-Musikeffekte reduzieren kann, bedeutet Pi-Opt-in nicht,
dass das Sparprofil automatisch zusätzliche FPS gewinnt. Für echte Gerätewerte
ist ein Benchmark auf dem Ziel-Raspberry-Pi erforderlich.

## Sicherheitsvorrang

- Nur laufende, verifizierte Musik-FX in der echten Bühne.
- Kein Update im Preview; keine Anpassung aus ungültigen, zu kurzen oder
  veralteten V826-Fenstern.
- Druck wird beim Ausschalten, bei fehlender Telemetrie, beim Songwechsel,
  in Pausen und bei deaktiviertem V825-Optimizer verworfen.
- Keine Änderungen an Avatar-Skelett, Kamera, Lyrics, Strobe, Govee, Alexa,
  Netzwerk, gespeicherten Timelines oder Raspberry-Pi-Diensten.
- Keine Browser-Speicherung, zusätzliche React-Renders oder WebGL-Assets.

## Regressionen

`npm run test:v980` und `npm run test:v980:types`; Node-24-CI-Prüfung in
`scripts/v931-production-gate.cjs` und `scripts/vercel-production-build.cjs`.
Für den gesamten Next.js-Build müssen zuerst die Paketabhängigkeiten mit
`npm ci` vorhanden sein.
