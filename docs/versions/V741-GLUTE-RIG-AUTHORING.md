# V741 – Avatar-v2-Modellerweiterung (Blender / GLB)

V741 liefert **nur die Laufzeitunterstuetzung**. Fuer sichtbare, unabhaengige Gesaessverformung musst du den Avatar-v2-Quellmesh selbst bearbeiten. Das V740-Projektzip enthaelt diesen Avatar nicht.

## Weg A: Morph-Targets (empfohlener Einstieg)

1. In Blender den **vorhandenen SkinnedMesh** oeffnen und auf jeder betroffenen Mesh-Geometrie eigene Shape Keys `Glute_L` und `Glute_R` anlegen.
2. Links/rechts nur die entsprechenden lokalen Vertices geringfuegig verschieben; neutrales `Basis`-Shape unveraendert lassen. Keine Beinlaengen, Hueftposition oder Fusskontakte veraendern.
3. Als **glTF Binary (.glb)** mit eingeschalteten Shape Keys / Morph Targets und Armature exportieren. In der 3D-Vorschau bestaetigen, dass beide `Glute_L`/`Glute_R` mit einem **Positions-Morph** vorhanden sind (nicht nur der Name).
4. In Sonic Display: Dance Studio → Advanced Hip & Glute Rig V741 → Aktivieren → `Morph` oder `Auto`; mit 20–35 % Staerke beginnen.

## Weg B: gewichtete Knochen

1. Je einen neuen Bone (`Glute_L`, `Glute_R`) unter dem Beckenknochen/Hips anlegen; restliche Rigg-Struktur unveraendert lassen.
2. Passende Vertex-Groups mit exakt dem Bone-Namen erzeugen. Gezielt Skin-Weights an den jeweiligen Gesäßhaelften malen, weich zu Hips/Oberschenkel hin auslaufen lassen.
3. Armature-Deform aktivieren und pruefen, dass die neuen Bone-Indizes im **SkinnedMesh** nach Export echte *positive* Skin-Weights haben. Ein leerer Bone wird von V741 zu Recht abgewiesen.
4. In Sonic Display `Bone` oder `Auto` waehlen. Die additive Bone-Rotation ist absichtlich klein und auf die Standard-Boneachsen ausgerichtet; bei anderen Bone-Orientierungen muss die Achsenanpassung vorab am konkreten Modell getestet werden.

## Hinweise

- Standardmaessig aus. Nur bei aktiver prozeduraler Hueftanimation, nicht als Ersatz fuer fehlende GLB-Knochen/Morphs.
- Ohne beidseitig vorhandene und validierte Kanaele wird keine teilweise Gesäßdeformation aktiviert (Warnung im Avatar Studio).
- GLB-Dateien, Skin-Weights, neue Shape Keys und Beat-synchrone Animationsclips werden **nicht** automatisch aus dem App-Code erzeugt.
- Fussstabilitaet und natuerliche Bewegungsqualitaet muessen im Browser am konkreten Avatar verifiziert werden.
