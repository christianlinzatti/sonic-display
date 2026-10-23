# V164 – Intelligent Bottleneck Optimizer & Adaptive Animation Scheduler

## Änderungen
- CPU-P95-basierter Scheduling-Controller mit normal/constrained/critical, Hysterese und Messwert-Verfallsprüfung.
- Drosselt nur nichtkritische Nebenaufgaben: Smart-Dance-Choreografieranking, Performance-Preview-Veröffentlichung und Duo-Formation-Zielberechnung. Positionsinterpolation, AnimationMixer, IK und Beat-Synchronisation bleiben weiter pro Frame.
- Formation-Ziele werden zwischen den Scheduler-Ticks wiederverwendet; Moduswechsel erzwingt sofortige Neuberechnung.
- Unabhängige Scheduler-Instanzen für Avatar/Formation, um gegenseitige Sperren zu vermeiden.
- Schalter und Diagnose im Renderdiagnostik-Panel; deaktiviert entspricht den normalen Taktraten.
- Ohne frische CPU-Telemetrie bleibt die letzte Scheduler-Stufe erhalten (anfangs normal).

## Tests
`npm run test:animation-scheduler`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.

## Grenzen
CPU-Heuristik ist keine echte GPU-Messung. Bei dynamischem Performance-Tuning bitte mit zwei echten GLB-Avataren unter Last vergleichen. Ein vollständiger Next.js-Produktionsbuild erfordert installierte npm-Abhängigkeiten.
