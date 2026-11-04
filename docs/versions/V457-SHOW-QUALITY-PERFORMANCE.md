# Sonic Display V457 – Show Quality & Performance

## Schwerpunkt

V457 verbessert die **Übergänge und Leistungsanpassung** des bestehenden V456 Ultimate Automatic Show Director, ohne einen weiteren Regisseur oder neue Benutzereinstellungen einzuführen.

### Neu

- `services/show/showContinuityV457.ts` berechnet aus dem V446-Szenenplan ein **deterministisches, zeitbasiertes Übergangsfenster**. Ein Wechsel von Verse zu Hook, Hook zu Verse oder zwischen visuellen Solo-Slots wird über 1,25 / 1,6 / 1,9 Sekunden für High / Balanced / Low weich eingeblendet. Die Berechnung verwendet eine begrenzte Smoothstep-Funktion, **keine zusätzlichen Timer**.
- Die durch V456 automatisch ergänzten Licht- und Gruppeninteraktions-Akzente werden entlang dieser Kurve angepasst. Die bestehende Tanz- und Rap-Gesichts-Engine bleibt unverändert, die Kamera übernimmt weiterhin den V454-Hold samt manueller Priorität.
- Die aus V456 abgeleiteten automatischen Bewegungsenergie-Akzente wechseln im selben Übergangsfenster fließender. Beim Qualitätsmodus **Low** wird nur eine zusätzliche automatische Hook-Energieanhebung begrenzt; tatsächlich hohe Live-Audio-Energie wird nicht unterdrückt.
- Die vorhandene Qualitätsstufe (`getActivePerformanceTier`, High/Balanced/Low) liefert den Leistungsindikator. Im Low-Modus werden **nur zusätzliche V456-Licht- und Interaktionsverstärkungen** kleiner. Die vorhandene adaptive Renderauflösung/FPS-Steuerung bleibt eigenständig zuständig.
- Alle Zusatzfunktionen werden nur bei aktivem automatischem V456-Direktor angewendet. Bei `reducedMotion`, Pause, manuellem Vocal-Casting, eigener Choreografie oder nicht verfügbarer Szene gilt der bisherige Fallback. V451-Genius-/Lyrics-Budgets, manuelle Kamera-Keyframes und gespeicherte GLB-Motions werden nicht verändert.

### Technische Grenzen

Die Szenen stammen weiterhin aus den V446-Lyrics- und Tempoheuristiken. V457 erkennt keine Sprecher, keine Gesangsphoneme und keine garantierten Verse-/Hook-Grenzen. Die zeitbasierte Kurve wird auch bei einem Seek direkt auf eine Abschnittsgrenze gemäß der dortigen Position bewertet, aber es wird **kein alter Zustand aus einem anderen Song übernommen**.

Die Anpassung der automatischen Akzente garantiert **keine bestimmte Framerate auf dem Raspberry Pi**. Reale 3D-Frames, GLB-Kompatibilität, Kameraausschnitte und Langzeitlast erfordern Browser- und Gerätetests.

### Code

- `services/show/showContinuityV457.ts` – Szenengrenzen, Energierampe, Qualitätsbudget.
- `components/visualizer/VisualizerStage.tsx` – gemeinsame V456-Regie durch V457 verfeinern; V454-Kameraprioritäten bleiben unverändert.
- `tests/v457-show-continuity-regression.cjs` – Übergänge, 3–4 Avatare, manuelle Priorität, Pausen, Szenenwechsel, Qualitätsstufen und 30-minütige synthetische Wiedergabe.
- `tests/tsconfig.v457-core.json` – isolierte TypeScript-Kernprüfung.

### Lokale Prüfung

```powershell
npm install
npm run verify:v457
npm run typecheck
npm run build
npm run dev -- --hostname 127.0.0.1
```
