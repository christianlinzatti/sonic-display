# Sonic Display V463 – Raspberry Pi Performance & Stability

## Ziel

Lange Spotify-/Mikrofon-Sessions mit ein bis vier GLB-Avataren sollen nicht durch kurze Lade-, Hintergrund- oder Grafikunterbrechungen ihre Darstellungsqualität unnötig verlieren. **Die vorhandenen Renderer, adaptiven GPU-Regler, Kalibrierungen und Performance-Profile bleiben erhalten.**

## Änderungen

1. **Session Guard (`services/monitoring/piSessionStabilityV463.ts`).** Ein rein lokaler, deterministischer Zustandsautomat kennt Songwechsel, Wiedergabepausen, Browser-Visibility und WebGL-Wiederherstellung. Die bestehenden Qualitätssysteme erhalten temporäre Schonphasen: 12 Sekunden bei Songwechsel, 8 Sekunden nach Rückkehr/Wiedergabefortsetzung und 15 Sekunden nach WebGL-Recovery. Spätere Events verkürzen bestehende Schutzfenster nicht; ein tatsächlicher neuer Song beginnt ein neues Fenster.
2. **Dieselben echten Frame-Metriken weiterverwenden.** `AdaptivePerformanceController` meldet FPS, P95-Framezeit, Draw Calls, Geometrien und Texturen weiterhin etwa pro Sekunde. Nur die automatische Qualitätsentscheidung und Geräte-Kalibrierung werden während der Schutzphase ausgelassen. Die Qualität bleibt auf ihrem letzten Stand, statt bei kurzzeitig schlechten Frames sofort abgesenkt oder aufgrund einer Pause erhöht zu werden.
3. **Langzeitschutz nur mit frischen Daten.** `LongRunStabilityControllerV355` verwendet dieselbe Guard-Snapshot-Logik für seine 5-Sekunden-Überwachung; veraltete Frames oder Messwerte vor Song-/Grafikwechseln bewirken keine Verschiebung des Qualitäts-Caps. Der Timer wird nicht bei jeder Song- oder Mode-Änderung neu gestartet. Es entsteht **kein zusätzlicher Timer und keine zweite 3D-Canvas**.
4. **Manuelle Qualität respektieren.** V355-DPR-Caps greifen jetzt nur im Auto-Modus. Das bestehende Displayprofil V388 kann weiterhin unabhängig von V355 eine Obergrenze setzen.
5. **Mikrofonbetrieb berücksichtigt.** Für laufende Mikrofon-Sessions ohne Spotify-Track verwendet die Guard einen stabilen internen Quellschlüssel statt die automatische Renderregelung dauerhaft anzuhalten.
6. **Fehler-Sicherheit.** Der vorhandene V395-WebGL-Watch führt weiterhin die begrenzte Kontextwiederherstellung durch. V463 löst **keine zusätzlichen Canvas-Neustarts** aus. Reduzierte Bewegung, gespeicherte Choreografien, manuelle Rapperrollen, Fußkontakte und das Songsynchronisieren werden nicht verändert.

## Grenzen

Diese Änderung reduziert vor allem unnötige Qualitätsschwankungen. Sie verkleinert nicht automatisch GLB-Dateien, verbessert keine GPU-Treiber und garantiert keine höhere FPS. Die 30-Minuten-Simulation prüft die Zustandslogik, **nicht** einen echten Browser mit 4 GLB-Avataren. Ein vollständiger Next.js-Build auf einer Installation mit `node_modules` sowie eine FPS-/Speicherprüfung auf dem Ziel-Raspberry-Pi sind weiterhin nötig.

## Prüfen

```powershell
npm install
npm run verify:v463
npm run typecheck
npm run build
```
