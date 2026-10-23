# V262 · Performance Session Analyzer

- Nutzt ausschließlich die vorhandenen V250-Messpunkte alle 5 Sekunden während der Wiedergabe.
- Erfasst pro Stichprobe FPS, P95-Framezeit, langsam gerenderte Frames, Draw Calls, Anzahl frischer Avatar-Callbacks, Summe ihrer mittleren CPU-Kosten und erkannte Qualitätswechsel.
- Begrenzter In-Memory-Puffer: 720 Stichproben, keine Übertragung, keine lokale Persistenz.
- Heuristische Warnungen auf Basis der letzten 12 Punkte und mindestens 6 validen Werten: FPS < 35, P95 > 35 ms, Avatar-Callbacks > 8 ms, 3+ Qualitätswechsel.
- Tabelle der jüngsten Punkte und manueller CSV-Export unter Einstellungen → Diagnose.
- Zurücksetzen der vorhandenen V250-Sitzung löscht auch V262-Messungen.
- Keine Änderung an Beat-Timing, Animator, Auswahl oder Rendering.
- Die Avatar-Callback-Zeiten sind nicht die gesamte CPU-/GPU-Last; Qualitätswechsel können durch den begrenzten V255-Verlauf unterzählt sein.
