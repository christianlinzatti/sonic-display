# Sonic Display V491 – GLB Motion Preview & Blending Studio

**Basis:** V490 · **Paketversion:** `0.1.0-v491` · **Datum:** 23.10.2026

## Bedienbare Vorschau

Unter **Einstellungen → Avatar → 3D-Studio** zeigt `AvatarPreview3D` den neuen Bereich **GLB Motion Preview & Blending Studio · V491**. Sobald das aktuell ausgewählte Modell mindestens zwei eingebettete oder importierte Animationen hat, können sie gemeinsam ausprobiert werden:

1. **Basisclip** wie gewohnt in der **Animation Timeline · V93** wählen (z. B. `Squat`).
2. Im V491-Bereich **Zweiten Clip einblenden** aktivieren und einen anderen installierten **Gestenclip** (z. B. `Rap Gesture`) auswählen.
3. Als Körperbereich **Arme & Schultern** oder **Arme, Schultern & Brust** auswählen.
4. **Mischgewicht 0–50 %** einstellen, abspielen, pausieren, scrubben oder in Zeitlupe prüfen.
5. Optional **Foot IK** oder den V93-**Vorher/Nachher**-Vergleich einschalten. Die Option **Mischung zurücksetzen** wirkt nur auf die Vorschau.

Die Oberfläche kennzeichnet Clips ohne geeignete Gelenkrotationen und meldet fehlende Modelle, fehlende zweite Clips oder aktivierte Bewegungsreduktion verständlich. Der aktuelle Vorschau-Mix wird bei einem Modell-/Animationswechsel zurückgesetzt. Die Mischung wird **nicht** als Live-Bühnenkonfiguration gespeichert, und sie überschreibt keine manuelle Choreografie.

## Technische Integration

- `components/visualizer/glbMotionBlendPreviewV491.ts`: Reine Validierung der Quellclipauswahl, erlaubte Bereiche und Begrenzung des Gewichts. Verwendet die konservative Sicherheitsliste aus V490 und schützt Root Motion, Hüfte, Beine, Füße, Hände/Finger, Kopf, Gesicht sowie sämtliche Positions- und Skalierungskanäle.
- `components/visualizer/AvatarPreview3D.tsx`: Erstellt aus den *geklonten* Rotations-Tracks eines zweiten GLB-Clips einen maskierten `AnimationClip` und legt ihn auf den bereits vorhandenen `AnimationMixer` des **geklonten** GLB-Rigs. Der Basisclip läuft weiter. Ein Schieberegler aktualisiert lediglich das effektive Overlay-Gewicht, **ohne** den Mixer oder Clip bei jeder Änderung neu zu erzeugen.
- Die vorhandene `mixer.setTime(...)`-Steuerung erhält eine aktive Basisklip-Aktion, damit die Timeline bei pausierter Wiedergabe an andere Zeitpunkte scrubben kann; automatische Zeitfortschreibung findet nur bei Play statt.
- Das Original-GLB sowie Live-Bühne, Lip-Sync, Foot-IK, automatische V490-Mischung und manuelle Clips bleiben unberührt. Kein zweiter Mixer, keine neue WebGL-Szene, keine Netzwerkanfrage aus der Vorschaufunktion, keine zusätzliche Frame-Schleife.

**Grenzen:** Bei einem GLB-Rig ohne passende standardisierte Gelenknamen wird kein künstlicher Oberkörperblend erzeugt. Das Studio unterstützt bewusst noch **keine** Mischung mit Hüft-, Fuß- oder Root-Animationstracks: Diese würden bestehende Fußkontakte und die Root Motion gefährden. Eine vollständige browserseitige Build- und Sichtprüfung mit echten GLB-Dateien bleibt erforderlich.

## Tests

```powershell
npm install
npm run test:v491
npm run test:v491:types
npm run check:syntax
npm run check:architecture
npm run build
```

Der gezielte Test prüft: Körperbereichsmasken, Schutz kritischer Bones, Mischgewichtsgrenzen und NaN, fehlende Animationen, identische Basis-/Gestenclips, reduzierte Bewegung, UI-Anbindung an den realen GLB-Mixer sowie Timeline-Scrubbing. Ältere V489/V490-Prioritäten bleiben separat in den Rückwärtstests abgedeckt.
