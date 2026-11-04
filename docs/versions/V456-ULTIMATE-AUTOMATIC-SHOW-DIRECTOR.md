# Sonic Display V456 – Ultimate Automatic Show Director

**Ziel:** Eine gemeinsame, schlanke Regie für Rap-Show, Kamerafokus, dezente Ensemble-Interaktionen, Bühnenlicht und zusätzliche Songinformationen – ohne neue Konfigurationspflicht.

## Umsetzung

- `services/show/ultimateAutomaticShowV456.ts` enthält eine **pure, deterministische** Planungsfunktion. Eingangsdaten sind das vorhandene V446-Szenen-Cue, V451-Lyrics-/Informationsbudget, Playbackstatus, Avatarzahl, Energie und die Schalter für manuelle Vorgaben.
- In einer **Verse** liegt der visuelle Fokus auf einem Bühnen-Slot; die übrigen Slots erhalten zurückhaltendere Bewegungsanweisungen. Bei **Hook** wird eine gemeinsame Gruppe geplant. Intro/Outro sind ruhiger. Der Slot ist **keine erkannte Stimme**.
- `VisualizerStage` nutzt denselben V456-Plan für V438-Motion-Ranking, V444-Interaktionsstärke (maximal +10 % bei Gruppenszenen), V454-Kameracue und einen kleinen, begrenzten Intensitätsfaktor für die schon vorhandene, reaktive Bühnenbeleuchtung (maximal +15 %).
- `SonicDisplay` nutzt dieselbe V456-Policy für V451-Genius-Informationspriorität. In einem automatisch erkannten **Gruppen-Hook** werden passive Genius-Karten vertagt, auch falls eine Synchronisationslücke vorhanden ist. Die **aufklappbare Musikentdeckung bleibt bedienbar**, andere V451-Sicherheitsregeln gelten weiterhin. Der gemeinsame Inhaltsplan verwendet dafür nur synchronisierte Lyrics; ohne diese greift das bisherige V451-Verhalten, statt einen unzuverlässigen Abschnitt zu behaupten.
- Die Camera-Engine V454 bleibt dieselbe React-Three-Fiber-Kamera. Automatisch geänderte Motion-URLs, ausgewählte Tanzclips und Gesichtsausdrücke werden nicht gespeichert oder umgeschrieben.
- Bei pausierter Wiedergabe, `reducedMotion`, manueller Choreografie, manuellen Vocal-Rollen oder nicht verfügbarer Show-Heuristik fällt V456 auf das vorherige Verhalten zurück. Manuell gesetzte Kamera-Keyframes sowie weitere bisherige Kamera-Prioritäten bleiben geschützt.
- Die bereits vorhandenen V446- und V451-Einstellungen reichen aus: **keine zusätzliche Konfigurationsseite**, keine weiteren Dienste/API-Schlüssel, kein Upload und keine Audiotrennung.

## Was bewusst nicht versprochen wird

Keine echte Erkennung von Songstruktur, Phonemen, Rapper-Stimmen oder Live-Gesang. V446 nutzt wiederholte synchronisierte Lyrics und Tempoheuristiken. Künstler-Credits legen die Sänger-Zeitpunkte nicht fest. Der Regieplan enthält keine Bildberechnung; der tatsächliche GLB-/Kamera-Eindruck benötigt einen Browser-/Raspberry-Pi-Test.

## Code und Tests

- `services/show/ultimateAutomaticShowV456.ts` – gemeinsame Regie, Bewegungs- und Beleuchtungs-Helfer.
- `components/visualizer/VisualizerStage.tsx` – Kameracue, Motion-Ranking, Interaktion und reaktives Bühnenlicht.
- `components/SonicDisplay.tsx` – gemeinsame Informationspriorität für Genius, Lyrics und 3D-Bühne.
- `services/show/visualBalanceV451.ts` – neue Diagnoseursache `group-show` für zurückgestellte automatische Karten.
- `tests/v456-ultimate-show-regression.cjs`, `tests/tsconfig.v456-core.json` – Tests für 1–4 Avatare, Hook, Solo/Interlude, Camera-Manual-Schutz, Pausen, Reduced Motion, Lichtbegrenzung und Inhaltsbudget.

## Lokal prüfen

```powershell
npm install
npm run verify:v456
npm run typecheck
npm run build
```

Siehe `V456-VERIFICATION.md` für die tatsächlich ausgeführten Prüfungen und offenen Integrationstests.
