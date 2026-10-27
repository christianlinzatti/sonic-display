# Sonic Display V505 – Intelligent Stage Interaction 2.0

## Ziel

Die Zusatzanimationen von V504 werden auf die **tatsächlich im Render-Frame vorhandenen** Bühnenpositionen bezogen statt auf starre hypothetische Sängerabstände. Keine neue Sängeridentifikation: V416-/V496-Rollen sind weiterhin für jede Vocal-Reaktion erforderlich. Automatische Gruppenkollisionen werden mit einer sehr kleinen, verifizierten Tiefenstaffelung abgemildert.

## Neu implementiert

1. **Räumliche Blickrichtung:** 2–4 Avatare richten ihre kurzen Blicke relativ zur aktuellen Position aus. Bei sehr engem Abstand, Personen weit hinten oder in großer Entfernung werden Blicke gedämpft. Hook-Sänger bleiben publikumsorientiert.
2. **Raumabhängige Gestik:** Unter engem Abstand werden Arm-/Schulterakzente und die zusätzlichen automatischen Formationsdrehungen reduziert; kein Ruck bei 0 Distanz und keine Werte außerhalb der V452-Kanäle.
3. **Bühnentiefe bei automatischen Gruppen:** Bei weniger als ~1,0–2,0 Einheiten Abstand (abhängig von Gruppen-Minimalabstand) wird für die am nächsten gelegenen Paare nur eine minimale entgegengesetzte Z-Staffelung *vorgeschlagen*, bis zu 0,16 Stage Units vor Kontaktbegrenzung. In die Root-Zielposition gelangt dieser Offset erst, wenn die bestehende V494-Fußdiagnose ausreichende Bewegung erlaubt (bis zu 0,105 Stage Units). X-Lanes werden nicht verändert.
4. **Sicherheit und Vorrang:** Die V505-Stufe greift ausschließlich im bestehenden Frame-Pfad; keine neue Schleife, keine Verlagerung manueller V326-Bühnenpositionen, kein KI-Sängerwechsel, kein Einfluss auf GLB-Clipdaten, Root-IK, Lip-Sync, Morphs oder V503-Mimik. Bei Pause, Reduced Motion, manuellem Override und Low-Tier ist die physische Zusatzstaffelung deaktiviert.

## Quellcode

- `components/visualizer/stageSpatialInteractionV505.ts` – reiner geometrischer Algorithmus, Adressatenwahl, Blick-/Gesten-Refiner und V494-Ground-Guard.
- `components/visualizer/DanceFormationActorsV492.tsx` – V504-Gesten nur durch positionsbewusst verfeinerte Cues ersetzen, keine Root-Verschiebung.
- `components/visualizer/GroupDancersV326SceneV492.tsx` – tatsächliche Bühnenpositionen lesen und sichere Z-Korrektur beim bestehenden V326-/V494-Root-Update anwenden.
- `tests/v505-stage-spatial-interaction-regression.cjs` – 26.000 zeitbasierte Durchläufe, 2–4 Avatare, Duett/Solo/Reply/Hook, tatsächliche Blickrichtung und Sicherheitsfälle.

## Bewusste Grenzen

Diese lokalen Abstands- und Bühnen-Schutzmaßnahmen verhindern keine vollständigen Ganzkörper-/GLB-Mesh-Kollisionen. Physikalische Kollisionsvolumen, Ganzkörper-IK und animierte Armkontakte fehlen; große Überschneidungen müssen durch die V326-Lane-/Spacing-Planung und geeignete Avatar-Geometrien verhindert werden. Ohne vorhandene V494-Ground-Freigabe gibt es **keine** zusätzliche Körperverschiebung. Die Qualität sollte auf dem Ziel-Raspberry-Pi mit echten GLB-Motion-Clips geprüft werden.

## Checks

`npm run test:v505 && npm run test:v505:types && npm run check:syntax && npm run check:architecture`; lokaler kompletter Build nach `npm install` über `npm run build`.
