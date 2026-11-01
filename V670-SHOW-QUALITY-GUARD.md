# V670 – Automatic Show Quality Guard

Automatischer, zustandsloser Sicherheitspuffer innerhalb der vorhandenen Show-Regie. Bei hochgeregelten automatischen Gains deckelt er Kamera (max. 1.055, mit Lyrics-Vorrang 1.012), Licht (max. 1.065, mit Lyrics 1.018) und Tanz (max. 1.095, bei verifiziert wiederholtem Act 1.065). Keine Veränderung manueller Spuren. Bei reduzierter Bewegung, Pause, fehlendem Track, Low-Tier oder deaktivierter Show bleiben Signale unverändert.

Diagnoseflags `camera-pressure`, `lighting-pressure`, `repeated-act`, `lyrics-priority` beschreiben Grenzen und vorhandene Metadaten, **keine** gemessenen tatsächlichen Kameraschnitte, Lichtblitze, Bildüberlagerungen oder monotone reale GLB-Posen. Es werden keine Songabschnitte erfunden und keine manuelle Regie überschrieben.

Die Bounded-Gain-Werte dienen der Prävention, nicht als Ersatz für einen echten GLB/Browser-Qualitätstest.
