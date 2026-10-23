# Sonic Display V327 – Intelligent Group Dance Synchronization

V327 ergänzt den optionalen V326-Bühnenmodus mit **musikreaktiven, unabhängigen Akzentprofilen für drei bis vier Avatare**. Basis ist der vollständige V326-Quellstand.

## Bedienung

**Settings → Avatar → Multi-Avatar Choreography → Advanced Multi-Avatar Stage Director V326 → Intelligent Group Dance Synchronization V327**.

1. Gruppenmodus V326 für drei oder vier Tänzer aktivieren. Die neue Funktion hat einen eigenen, zunächst **deaktivierten** Schalter.
2. Muster wählen: **Unison** (alle zusammen), **Stagger** (differenzierte, nachlaufende Beat-Akzente), **Call & Response** (Lead-Fokus über mehrere Takte) oder **Alternating** (Avatar-Wechsel auf aufeinanderfolgenden Beats).
3. Akzentstärke, Versatz in Beats, Hintergrundbewegung, Taktzahl pro Call-&-Response-Wechsel und gemeinsame Drop-Akzente einstellen.
4. In der V326-3D-Vorschau die Gruppenakzente anhand der pulsierten Leuchtringe beobachten; die darunterliegenden GLB-Clips werden wie vorher auf ihrem Originalzeitstrahl abgespielt.
5. Beat-Marker aus V318 können in der Song-gebundenen Live-Bühne genutzt werden. Ohne V326-Songbindung wird der eigene Formations-Timer und das BPM-Raster verwendet. Bei fehlenden gültigen Markern wird auf BPM zurückgegriffen.

## Architektur

- `components/visualizer/groupDanceSynchronizationV327.ts`: Reine Evaluierung der zeitabhängigen Gruppen-Akzente, mit Track-unabhängiger lokaler Speicherung, geprüften Beats, Taktwechseln und begrenzten Einstellungswerten.
- `components/visualizer/GroupDanceSyncControlsV327.tsx`: Steuerung und pro-Slot-Akzentmonitor; die Vorschau ist an die Uhr von V326 gebunden.
- `components/visualizer/ThreeAvatar.tsx`: Pro Dancer wird **eine Kopie des AudioFeatures-Objekts** geführt. Die Musikakzente (Beat, Kick, Snare, Phrasenakzent) werden pro Frame abhängig vom Slot gewichtet. Die Eingangs-Audiodaten werden nicht verändert. Ein kleiner verzögerter Echo-Akzent wird ausschließlich bei gleichzeitig gemessenem Onset erzeugt, nicht aus bloßer BPM-Schätzung.
- `components/visualizer/MultiAvatarPreviewV326.tsx`: Die Bühnen-Leuchtringe visualisieren den V327-Gruppenbeat; die Vorschau-Mixer behalten ihre bisherigen Animationen.
- `components/visualizer/MultiAvatarStageStudioV326.tsx`: Neue V327-Steuerung in der bestehenden V326-Oberfläche, ohne parallele Choreografie-Verwaltung.

## Sicherheit, Grenzen und Kompatibilität

- V327 ist **standardmäßig deaktiviert**. Ein deaktiviertes V327 gibt die bisherigen AudioFeatures unverändert an die Tänzer weiter.
- **Keine Änderung importierter GLB-Animationsclips, Retargeting-Daten, Clip-Geschwindigkeit oder Mixer-Zeitpositionen.** V327 synchronisiert die *musikreaktiven Zusatzakzente*, nicht die Keyframe-Zeit beliebiger GLB-Motions. Die Clips müssen separat kompatibel und passend konfiguriert sein, wenn genau identische Tanzschritte verlangt werden.
- V322-Foot-Lock, V323-Balance, V324-Abstandsschutz, V325-Cues und V326-Gruppenformationen bleiben erhalten. Standbein- und Bodenkorrekturen werden nicht überschrieben.
- Reduced Motion und Pause unterdrücken die Gruppenzusatzakzente, indem die Engine dann neutrale Werte zurückgibt. Die Originalanimationen folgen wie zuvor ihren bestehenden Spielregeln.
- V318-Marker enthalten keine amtlichen Drop-/Hook-Klassifikationen. V327 nutzt das im V326-Formationscue ausdrücklich gesetzte Drop-Flag, es behauptet nicht, einen musikalischen Drop automatisch erkannt zu haben.
- Songanalyse wird nur über die V318-Local-Provider-Schnittstelle gelesen; keine internen Spotify-Endpunkte, keine Privattokens.
- Eine neue Stage-Position auf Root-Ebene kann wie in V326 Foot-Sliding verursachen; V327 erzeugt keinen neuen Bühnenpositions-Offset.

## Prüfung

- `npm run test:v327`: 3/4 Tänzer, Modi, Solo- und Drop-Prioritäten, Beat-Positionen, Fallback, Seek-/Replay-Determinismus, Validierung, Storage und Quellcode-Integration.
- `npm run verify:offline`: sämtliche bisherigen Regressionstests V265–V326 und V327 einschließlich TS/TSX-Syntax.
- `tsc --noEmit --strict --target ES2022 --module esnext --lib ES2022,DOM --skipLibCheck components/visualizer/groupDanceSynchronizationV327.ts`: isolierte Typprüfung ohne externe Pakete.
- Der vollständige `npm run verify` inklusive Next.js-Produktionsbuild und Browser-GPU-Test muss auf einem Rechner mit npm-Abhängigkeiten ausgeführt werden. Diese Umgebung hat nur 1/14 direkte Abhängigkeiten; `npm run build:preflight` ist blockiert.
