# V1061 – Natural Avatar Motion 3.0

- Reiner, deterministischer Planer für **sanfte** Hüftrotation, Schulterbewegung, Wirbelsäulen- und Brustakzente aus beobachtetem Tempo und Songfortschritt.
- GLB-Rig: additive Rotation via vorhandene `AvatarRigMotion`-Kanäle, vor V839 und dem finalen Foot IK. Keine neuen Clips oder Bone-Traversals.
- Hüftbewegungen **nicht** bei beiden gepflanzten Füßen oder unbekanntem Fußkontakt. Keine Translationalbewegungen von Becken, Root oder Füßen.
- Prozeduraler Avatar: Schultern/Oberkörper ohne separate Hüft- oder Beinkorrekturen.
- Manueller Choreografie- und GLB-Clip-Vorrang; Pausen, Reduced Motion, Low-GPU, ungültige Zeit-/BPM-Werte schalten den Zusatz aus.
- Opt-in, Stärkeregler im AI Show Designer, beim Löschen des Showplans deaktiviert.
- Keine neuen Ticker, API-Aufrufe, Renderobjekte oder Govee-Befehle.
