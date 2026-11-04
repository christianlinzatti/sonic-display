# V211 – Predictive Dance Transitions 2.0

Aufbauend auf V210. Opt-in unter **Smart Choreography Evolution → Predictive Dance Transitions**.

- Erkennt den nächsten **tatsächlichen** Motion-Wechsel in einer bestehenden, gespeicherten Taktsequenz innerhalb von 0,25–4 Beats vor dem Wechsel.
- Prüft, ob der retargetete GLB-Clip bereits im laufenden `libraryClips`-Cache geladen wurde. Die bestehende Bibliothek lädt installierte GLB-Motions ohnehin beim Mounten; kein zusätzlicher paralleler Download.
- Plant an Taktgrenzen und wechselt den bereits geladenen Clip, wobei das existierende Crossfade- und Foot-IK-System verwendet wird.
- Begrenzt den Mindestabstand zwischen prognostizierten Wechseln (0–8 Takte). Die bisherige Übergangslogik bleibt als Fallback erhalten.
- Bei Pause, deaktivierter Funktion oder fehlender Sequenz bleibt die aktuelle Wiedergabe unverändert.

**Grenzen:** Nur nutzerdefinierte Evolution-Timeline-Sequenzen sind vorhersagbar; der Generator und die automatische Songphasenerkennung liefern keine garantierten zukünftigen Cues. Die Anwendung hat keinen samplegenauen Spotify-Transport. Browser- und Produktions-Build müssen mit vollständigen npm-Abhängigkeiten verifiziert werden.
