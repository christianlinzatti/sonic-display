# V799 – Natural Dance Continuity (31.10.2026)

## Motivation

Vor V799 schützen V537 die Posenwahl beim Clipwechsel, V614 den musikalischen
Überblendverlauf, V630 die Bein- und Fußkontinuität und V135 die realen Fußanker.
Schnelle Wechsel zwischen Rap-Gesten und Hook-Bewegungen können trotzdem
ruckartig aussehen, wenn Oberkörper oder Arme im eingehenden Clip sprunghaft
anders stehen oder sich in die entgegengesetzte Richtung bewegen.

## Umsetzung

- Der neue pure Planner `naturalDanceContinuityV799.ts` liest echte
  `.quaternion`-Keyframes für Torso und beide Arme aus den bereits geladenen
  GLB-Animationsclips; er verändert weder die Tracks noch die Szene.
- Er prüft sowohl Körperhaltungen als auch näherungsweise die Richtung der
  aktuellen Arm-/Oberkörperbewegung. Unzureichende, defekte oder nur einseitig
  vorhandene Tracks gelten **nicht** als Qualitätsnachweis.
- Bei ausreichend starken, belegten Unterschieden verlängert er eine zuvor
  erlaubte automatische Überblendung begrenzt. Die Maximaldauer bleibt abhängig
  vom Songtempo und von der verfügbaren Länge beider Clips.
- Bestehende Fußkontakt-Evidenz unterstützt eine vorsichtigere Überblendung,
  setzt aber **keine** IK-Fußanker zurück und löst keine neue Fußbewegung aus.
- Im Hook `useGltfClipTransitionsV492` folgt V799 auf V537, V565, V614 und
  V630 und arbeitet vor `nextAction.fadeIn`. Die bisherige Startpose, der
  tatsächliche Clip, seine Playback-Zeit und alle Prioritäten bleiben erhalten.
- Die Regie wird bei manuellen Choreografien, reduzierter Animation, Low Tier,
  pausierter Wiedergabe und nicht freigegebenen automatischen Clipwechseln
  deaktiviert. Bei identischen Bewegungen wird kein zusätzliches Blending
  erzeugt.

## Grenzen

V799 erzeugt keine neuen Animationen, repariert fehlende Skin-Weights und
synchronisiert nicht automatisch alle Performance-Timelines. Für GLB-Rigs ohne
vergleichbare Arm- und Torso-Keyframes bleibt die vorherige V630-Überblendung
aktiv. Reale Sichttests auf mehreren GLB-Avataren und ein Next.js-Produktionsbuild
bleiben als Abnahme nach Installation der Abhängigkeiten ausständig.

## Relevante Dateien

- `components/visualizer/naturalDanceContinuityV799.ts` – Pure Policy
- `components/visualizer/useGltfClipTransitionsV492.ts` – Integration in den vorhandenen Mixer
- `tests/v799-natural-dance-continuity-regression.cjs` – Regressionen
- `V799-VERIFICATION.md` – Test- und Build-Status
