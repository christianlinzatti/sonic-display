# Sonic Display V212 – Intelligent Motion Prefetch & Transition Planner

Basis: V211. Opt-in in **Smart Choreography Evolution → Predictive Dance Transitions → Intelligent Motion Prefetch**.

- Nur bei aktivierter V198-Timeline und aktivierter V211-Vorausplanung verwendet V212 selektives Streaming. Sonst bleibt das bisherige Laden aller bis zu 24 installierten Motions aktiv.
- Der geplante Clip plus bis zu vier weitere, unterschiedliche Clips werden nach tatsächlichem Bar-Cursor der gespeicherten Sequenz priorisiert. Kein URL-Raten.
- Ein browserseitiger Clip-Cache hält 3–12 Bewegungen, die in der unmittelbar geplanten Sequenz liegen sind angepinnt. 1–3 gleichzeitige GLTFLoader-Ladevorgänge. Fehlgeschlagene Clips werden übersprungen.
- Avatar-, Rig-, Calibration- und Style-Wechsel invalidieren den Clip-Pool. Bestehende V211-Taktgrenzen-, Readiness- und Fallback-Logik bleiben unverändert.
- Einschränkungen: Dies ist Clip-Streaming auf der laufenden Webseite, kein Service Worker oder Offline-Prefetch. Eine zwischengespeicherte GLTFLoader-Anfrage kann nach Phasenwechsel zu Ende laufen; ihre veralteten Ergebnisse werden ignoriert. Der Cache begrenzt retargetete Animationsclips, nicht den Browser-HTTP-Cache. Die tatsächliche Speicherersparnis hängt von Assetgröße, GC und drei.js-internen Ressourcen ab. Web-/Browser-Test und Next.js-Produktionsbuild sind separat nötig.
