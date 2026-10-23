# Sonic Display V99 – Bone-Masking

- Im Animation Blending Studio lässt sich für den zweiten Clip **Ganzer Körper**, **Arme**, **Oberkörper** oder **Beine** wählen.
- Der zweite Clip wird zur Laufzeit auf passende AnimationTracks reduziert; die GLB-Dateien bleiben unverändert.
- Bei Maskierung hat der Overlay-Clip einen eigenen Action-Namen und die Hauptanimation bleibt voll gewichtet.
- Keine passenden AnimationTracks: kein maskierter Overlay-Clip.
- Heuristische Bone-Namenerkennung, nicht anatomisches Retargeting. Manche Rigs benötigen Anpassungen.
- Gespeicherte Choreografien haben weiterhin Vorrang. Foot IK, Smart Dance Director und Lyrics Studio bleiben erhalten.
