# V981 – Concert Performance Intelligence 2.0

## Neues Dashboard

- Live-Trend über **12** tatsächlich gemessene V826-Fenster (je etwa 0,5 s).
- Vergleich der letzten vier mit den vier davor: stabil, besser, schlechter.
- Erst nach mehreren belasteten Fenstern erscheinen Verdachtshinweise auf
  unregelmäßige Frame-Abstände, komplexe Szenen oder hohes **geschätztes**
  FX-Budget; kein definitives CPU-/GPU-Flaschenhals-Label.
- Hinweise priorisieren vorsichtige Maßnahmen an Partikel/Schaum und sichtbaren
  Szenendetails. Sie verändern keine aktuellen Einstellungen automatisch.

## Integration und Grenzen

- Read-only in `concertPerformanceIntelligenceV981.ts`. Es werden weder Render-
  Schleifen noch Netzwerk- und Hardwarebefehle hinzugefügt.
- V980 bleibt für die **optionale automatische Effektdrosselung** zuständig.
- Ungültige oder unverifizierte Daten, Pausen und Track-/Seekwechsel verwerfen
  das jeweilige Kurzzeitfenster. Abgeschaltete V826-Telemetrie deaktiviert V981.
- Kein FPS-Versprechen für Raspberry Pi ohne Realgeräte-Benchmark.

## Installation

`releases/SonicDisplay-V981.zip` im GitHub-Repository hochladen. Der GitHub-
Importer importiert die Quelldateien und schützt die GitHub-eigenen Workflows.
Vor echter Produktionsfreigabe müssen TypeScript, Next.js, Linux-/Windows-CI
und Vercel grün sein. Ein HTTP-302 beim öffentlichen V965-Smoke muss gesondert
mit Vercel-Domain-/Protection-Konfiguration geklärt werden.
