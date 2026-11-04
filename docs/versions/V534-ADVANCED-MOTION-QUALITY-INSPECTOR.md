# V534 – Advanced Motion Quality Inspector

Aufbauend auf V533 – der zusätzliche Inspector ist **nur Anzeige und Diagnose**. Er führt keinen Import und keine Änderung einer GLB oder Choreografie aus.

## Anwendung

Unter **Einstellungen → Character & Motion Library** einen Avatar mit eingebetteten Animationen oder eine separate Motion-GLB auswählen. Den gewünschten Clip bestimmen und optional einen **Folgeclip für den Übergangsvergleich** wählen. Über **„Fußkontakt, Gelenke und Übergang analysieren“** wird der betreffende Clip mit Three.js `AnimationMixer` auf der isoliert geladenen GLB-Szene ausgewertet. Ein Hinweis lässt sich per Klick an seinem Zeitpunkt in der bestehenden 3D-Vorschau ansehen (pausiert).

Das gleiche funktioniert bei deinen fünf Referenz-Avataren mit jeweils 20 Animationen. Die Auswertung ist **on demand**, nicht pro Animationsframe im Live-Display, und bearbeitet immer nur einen Clip. Für externe Motion-GLBs prüft die Analyse **das Quell-Rig**, nicht die tatsächliche Qualität nach dem heuristischen Retargeting auf ein anderes Skelett.

## Geprüfte Signale und Interpretation

- Bis zu **81 tatsächliche Animationsposen** pro Clip. Nach Auswertung der Three.js-Transforms werden die Weltpositionen von Hüfte und linkem/rechtem Fuß erfasst, sofern passende Knochen gefunden werden.
- **Mögliche Fußverschiebung**: Ein Fuß bewegt sich seitlich nahe seiner niedrigsten *beobachteten* Position bei geringer Höhendifferenz. Ein Bodenkontakt-Signal gibt es hier nicht. Ein Tanzschritt oder Gleiten kann beabsichtigt sein.
- **Schnelle Hüft-/Root-Translation**: Geschwindigkeit relativ zur geschätzten Körperhöhe; ein Sprung ist nicht automatisch falsch.
- **Gelenkkurven**: die vorhandene konservative V321-Prüfung erkennt Zeitstempel-Lücken, Quaternion-Sprünge und auffällige lokale Übersetzungen. Technische V533-Keyframe-Reports werden als ergänzende Statistik gezeigt.
- **Clip-Übergang**: End-/Startpositionen von Füßen relativ zur Hüfte derselben geladenen GLB; zusätzlich mittlere Quaternion-Rotationsdifferenz auf benannten Joint-Tracks (V321). Vorschlag für eine passende Crossfade-Dauer zwischen 0,32 und 1,20 Sekunden ist lediglich ein Anhaltspunkt, *keine* automatische Übernahme.

## Bewusst geschützte Funktionen

1. Keine automatischen Reparaturen von GLB-Keyframes, Füßen, IK, Morph-Targets, Gesichtsanimation, Lip-Sync oder aktiven Choreografien.
2. Keine Änderung von V531-Shared-Motion-Speicheroptimierung oder V532-Original-/Installiert-A/B-Vergleich und dessen manueller Freigabe.
3. Kein Anschein echter KI-Bildqualitätsprüfung: Mesh-/Skin-Deformationen, Rutschen relativ zur echten Bühne, Beleuchtung und Ästhetik müssen in WebGL geprüft werden.
4. Begrenzte Stichproben, begrenzte Warnungslisten, Berechnung erst nach Tastendruck für Raspberry-Pi-Verträglichkeit. Keine neuen Abhängigkeiten.

## Validierung

`npm run test:v534 && npm run test:v534:types` prüft Stand/Flugbewegungen, erkannte Fußverschiebungen, Root-Sprünge, ungültige Messungen, Positionsvergleich, Grenzen sowie die fünf GLB-Referenzskelette und die Integration in die Import-Vorschau. Zusätzlich: `npm run check:syntax`, `npm run check:architecture`, V529–V533 Regressionen. Die Prüfungen sind keine echte WebGL-/Raspberry-Pi-Sichtprüfung; vollständiger Next.js-Build ist erst nach `npm install` lokal möglich.
