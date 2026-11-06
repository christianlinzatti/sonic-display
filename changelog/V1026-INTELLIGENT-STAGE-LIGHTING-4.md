# V1026 – Intelligent Stage Lighting 4.0

## Produktive Änderung

- `components/visualizer/intelligentStageLightingV1026.ts` bildet einen deterministischen, render-sicheren Planer für die vier **bestehenden** virtuellen Lichter (Key, Fill, Spot/Beam, Bodenlicht).
- V604-Songakte und V761-Kamera-Intents müssen beide **für denselben aktuellen Track und Act bestätigt** sein; V749 stellt verifizierte Sänger-Fokusslots bereit. Die Kamera steuert keine neuen Sänger oder Songabschnitte herbei.
- Bei Versen wird der Sänger behutsam lesbar hervorgehoben; bei Duett-/Ensemble-Cues wächst der Fill-Anteil; Hooks/Drop-Szenen öffnen nur unter bestätigten Akten die Bühne und nutzen ausschließlich den tatsächlich gelieferten Kick-/Energy-Wert. Build und Break bleiben zurückhaltend. Sehr dezente genrebewusste Farbakzente werden wiederverwendeten `Color`-Objekten aufgedrückt (kein Allocieren neuer Lights im Frame-Loop).
- Harte Sicherheitsvorränge: gespeicherte Licht-Timelines, explizite Lichtsteuerung, Blackout, Strobing, manueller FX-Modus, Seek-Block, Pause, deaktivierte Reaktivität, reduzierte Bewegung und Low Tier. Sichtbare Lyrics behalten Face-Lighting, reduzieren Spot/Boden und unterbinden zusätzliche Tönung.
- Übergänge blenden innerhalb bestätigter Songakte weich ein/aus, kein harter Cut, kein neuer Render-Pass, keine Govee-/Matter-/Alexa-Aktion und keine externe AI-Abfrage.

## Absicherung

- `tests/v1026-intelligent-stage-lighting-regression.cjs` prüft bestätigte Akte, Sängerbindung, Genre-Farbwahl, Boundaries, ungültige/alte Timelines, manuelle Prioritäten und Kanalbudget.
- Strikter isolierter TS-Check, `prebuild`, Vercel-Gate, GitHub-Produktions-Gate, V959-Preflight, historischer V1025-Test und manuelle Node-24-CI-Workflow-Prüfung eingebunden.
- Full CI-Build/Playwright weiterhin erst nach dem Projekt-ZIP-Import auf GitHub autoritativ.
