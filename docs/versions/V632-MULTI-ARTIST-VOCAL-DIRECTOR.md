# V632 – Multi-Artist Vocal Director

## Inhalt

- Wiederverwendung V385 (manuelle Lyrics-Zuordnung), V416 (Verse/Duet/Reply/Hook), V496/V547 (zeitbasierter Lead, Duett, Hook, Adlib). Jede Zuordnung bleibt trackgebunden und redaktionell.
- Eine gemeinsame reine V632-Szenenentscheidung im bestehenden GroupDancers-Frame-Callback; Referenz wird in beide Avatar-Mundrenderer durchgereicht.
- Zielwert-Skalierung ausschließlich bei Jaw, Wide, Round des automatisch erzeugten Mund-Overlays: Lead 0,92–1,00 beim belegten Handoff, sonst 1, Duett 0,87, gemeinsamer Hook 0,82, ausdrücklich zugewiesenes Adlib 0,62, nicht zugewiesener Performer 0. Ein kleiner Wert verhindert kein von der GLB-Datei selbst animiertes Morph: dies ist bewusst keine Überschreibung des Quellmaterials.
- Existing artist choreography and voice/facial previews are protected. V420 manually authored syllable edits, V423 audio mouth documents, imported GLB animation channels, V384 lip seals, V562 facial calibration take priority.
- No separate singer inference, no voice fingerprinting, no stem extraction, no additional render loop or shader.

## Abnahme

- Test mit 2, 3 und 4 Avataren, jeweils Solo, A→B-Übergang, Duett, gemeinsamer Hook und explizitem Adlib.
- Tatsächliche Mundmorphs pro GLB und 10-Zoll-Lesbarkeit im Browser prüfen.
- Handarbeit im Vocal-Time-Editor ist erforderlich, um die tatsächlichen Sänger-Zeitpunkte im aufgenommenen Song korrekt zuzuordnen.
