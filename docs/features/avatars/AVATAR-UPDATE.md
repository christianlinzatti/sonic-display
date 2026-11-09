## V1116 – AI Artist Interaction (Lead-Wechsel, Dialoge und Duos)

Der **V1116 AI Artist Interaction**-Bereich im AI Show Designer verbindet die bisherigen Character-, Dance- und Vocal-Regiepartituren zu sieben sichtbaren Interaktionsszenen. Vier Stile (Dialog, Duo, Rap-Battle und Festival) wechseln die Kameraführung zwischen den vorhandenen V1040-Modi. Die Regie nennt Lead-/Partnerrollen, Antwortgesten und gemeinsame Bühnenmomente, aber behauptet **keinen erkannten Gesang, physischen Blickkontakt oder neue GLB-Clips**. Die Original-Songgrenzen und die Govee- und Laserwerte bleiben bis zur expliziten Annahme unverändert.

Optional kann nach einer separaten Zustimmung der vorhandene **V1079 Live Artist Interaction**-Modus aktiviert werden. Dieser visualisiert Partnerakzente ausschließlich bei echten, synchronisierten Lyrics-Lücken. Es werden keine Audiodaten gesendet und keine individuellen Kopf- oder Blickanimationen erfunden. Die Regler lassen sich konfliktgeschützt rückgängig machen. Details: `changelog/V1116-AI-ARTIST-INTERACTION.md`, `docs/V1116-RELEASE-AND-TESTS.md`.

## V1115 – AI Vocal Acting & Lip-Sync Intelligence

Die optionale Vocal-Regiepartitur zeigt sieben Songphasen, drei Stage-Crew-Charaktere und wechselnde Rollen für Rap, Melodie und Festival-Hybrid. Ihre Sänger-/Adlib-Rollen sind **Inszenierungsvorschläge**, keine automatische Sprechererkennung. Ein zweiter Opt-in-Schritt aktiviert begrenzte, bereits bestehende V368/V371/V372-Parameter (Lip-Sync zu vorhandenen Lyrics, Gestik, Augen/Blick, Gesichtsintensität); Rückgängig ist konfliktgesichert. Manuell gesetzte Vocal-Cues und zeitlich ausgerichtete Viseme bleiben unangetastet. Die mitgelieferten GLBs haben keine Jaw-Bones oder Mund-Morph-Targets, deshalb ist ihre echte Gesichts-Lippensynchronisation damit noch nicht möglich. Keine neuen KI-, Audio-, Mikrofon- oder Geräteberechtigungen.

Siehe `changelog/V1115-AI-VOCAL-ACTING-LIP-SYNC.md` und `docs/V1115-RELEASE-AND-TESTS.md`.

## V1114 – AI Dance Choreographer 4.0 (Stage Crew mit echten GLB-Clips)

Der 360° AI Show Designer bietet eine lokale **Sieben-Szenen-Choreografie** für die mitgelieferten Performer Neon Pulse, Festival Nova und Chrome Beat. Vier wählbare Stile und eine Probenpartitur planen Solo, Duo, Kanon (zwei Beats Versatz), Gruppensynchronisation, Atempause und Finale. Die vorhandenen V1040-Zeitgrenzen, Intensitätsgrenzen sowie manuelle Kamera-/Tanzentscheidungen bleiben bis zur ausdrücklichen Übernahme unverändert. Die Darstellung ist eine dramaturgische Vorschau, **keine echte Echtzeit-Analyse der Musikstruktur**.

Neu ist außerdem der optionale Stage-Crew-Modus **„V1114 Auto-Choreografie · Abschnitte wechseln“**. Die bereits bestehende Live-GLB-Engine schaltet bei *vorhandenem Abschnittssignal* automatisch zwischen Ruhe-Animationen (Intro/Break), Spotlight-Solos (Verse), 2-Beat-Kanon (Hook) und Unisono (Drop). Sie wählt ausschließlich Clips, die tatsächlich im geladenen GLB vorkommen, und behält Fallbacks, 8-Sekunden-Haltezeiten, Pausen-, Reduced-Motion- und manuelle Prioritätsregeln bei. In der KI-Vorschau kann der Modus **gesondert und reversibel** eingeschaltet werden; auch eine Trio-Einrichtung ist wie bisher erforderlich. Die Partitur wird nicht als individuelle Clip-zu-Clip-Timeline persistiert: tatsächliche Live-Tänze orientieren sich an den zur Laufzeit verfügbaren Abschnittssignalen und Clips. Kamera-Tracking pro Künstler und neue Rig-Motion-Captures werden nicht erfunden. Kein dauerhafter KI-Aufruf, keine neuen Geräte- oder Audio-Rechte.

Tests: `npm run test:v1114`, `npm run test:v1114:types`, `node scripts/v959-source-preflight.cjs`. Desktop-/Touch-Browser-E2E: `tests/e2e/ai-dance-choreographer-v1114.spec.cjs`. Die lokalen Unit-Checks ersetzen keinen vollständigen GitHub-Actions-/Next.js-Produktionsbuild.


## V1113 – Charakter-Performance

V1113 bietet drei Regiestile und individuell lesbare Regiehinweise für die drei GLBs. Vorhandene Animationen bleiben unverändert; keine neuen Gesten-Clips wurden in GLB-Dateien eingebaut.

> Die neue Musik- und Gruppensteuerung aus Paket 4 wird in [SONIC-CREW-SHOW.md](SONIC-CREW-SHOW.md) beschrieben. Dieser Leitfaden dokumentiert die weiterhin enthaltenen GLB-Modelle aus Paket 3.

# Sonic Stage Crew – Charakter- und Detailpaket 3

Die drei Figuren stehen unter **Settings → Avatar** bereit. Diese Version ergänzt
bewegliche Finger, weichere Gelenkübergänge, eigene Gesichtsausdrücke und längere
Signature-Choreografien. Die Modell-IDs und alle zwölf Clip-Namen bleiben erhalten.

| Figur | Neue Details | Signature-Tänze |
| --- | --- | --- |
| Neon Pulse | Gerahmter Cyan-Visor mit animierten Linsen und Statusbalken, detailliertere Kopfhörer, Handschuhe mit beweglichen Fingern | Neon Circuit, Laser Step: je 12 s |
| Festival Nova | Blinzeln, Augenreflexe, bewegliche Brauen, gebogenes animiertes Lächeln, Wangenfarbe, leichte Bewegung des Haarknotens | Festival Flow, Disco Star: je 12 s |
| Chrome Beat | Animierte LED-Augen und fünf bewegliche Mund-Anzeigen, leicht schwingende Antenne, sichtbare Fingergelenke | Pop Lock: 12 s, Clockwork: 16 s |

## Hände und Gelenke

Jede Hand besitzt fünf Finger mit je zwei beweglichen Segmenten. Die Tanzclips
enthalten Fingerbeugung, Öffnen/Schließen und Zeigefinger-Akzente; beim Winken bleibt
die Hand überwiegend offen. Die Bewegung ist direkt in den GLBs gespeichert.
Es sind keine zusätzlichen Animationsdateien oder externen Dienste nötig.

Gelenkkappen an Schultern, Ellenbogen, Handgelenken, Hüften und Knien verwenden
gewichtete Übergänge zwischen benachbarten Knochen. Je Figur haben 940 Vertices
solche gemischten Gewichte. Die Figuren bleiben bewusst stilisierte Bühnen-Avatare.

## Längere Tänze und Ausdruck

Jede Figur behält **zehn Tänze, eine Ruheanimation und Winken**. Die acht gemeinsamen
Tänze sind Groove, Techno, House, Hip-Hop, Disco, Shuffle, Robot und Festival Bounce.
Die beiden Signature-Tänze pro Figur sind jetzt 12–16 Sekunden lang und enthalten
mehrere Phrasen mit unterschiedlichen Arm-, Hand- und Fingerbewegungen. Die Fußarbeit
behält ihren eigenen Rhythmus bei und wird durch die längere Dauer nicht verlangsamt.

Die Gesichts- und LED-Ausdrücke sind Knochenanimationen innerhalb der Clips.
Diese Version fügt keine automatische Lippen-Synchronisation oder manuellen
Gesichtsausdruck-Regler hinzu. Outfit-Auswahl und neue Kleidungssimulationen sind
nicht Teil dieses Pakets. Bestehende Choreografien können die bisherigen Clip-Namen
weiterverwenden. Gespeicherte Loop-Grenzen bleiben erhalten; für den vollständigen
längeren Signature-Tanz im Studio **Loop zurücksetzen** wählen.

## Im Studio ansehen

Unter **Dance Studio · Animation Timeline → Detailansicht** stehen drei Ansichten bereit:

- **Ganze Figur** für die vollständige Choreografie.
- **Gesicht** für Blinzeln, Lächeln und Visor-/LED-Ausdrücke.
- **Oberkörper & Hände** für Gelenke und Fingerbewegungen.

Der Ansichtswechsel pausiert die Wiedergabe zur Detailbetrachtung und übernimmt die
aktuelle Abspielposition. Maus und Touch können weiterhin drehen und zoomen.
**Ansicht zurücksetzen** kehrt zur ganzen Figur zurück. Beim IK-Vorher/Nachher-Vergleich
bleibt die Gesamtansicht aktiv, damit beide Figuren sichtbar sind.
Die 3D-Zeichenfläche füllt jetzt die vorgesehene Höhe der Vorschau aus.

Die weichen Clip-Wechsel aus Paket 2 bleiben im Studio erhalten, ebenso Fein-Scrubbing
mit 0,01 s und die bestehenden Reduced-Motion-Einstellungen. Die Fußarbeit bleibt mit
gebackener Zwei-Gelenk-IK in den GLBs verankert. Live-Overlays und individuelle
Einstellungen können die Pose zusätzlich verändern.

## Technische Dateien

- `public/avatars/sonic/`: GLBs (je ca. 2,1–2,3 MB), gerenderte PNGs, Manifest und CC0-Lizenz.
- Neon Pulse: 44 Gelenke, 13.060 Dreiecke.
- Festival Nova: 45 Gelenke, 14.048 Dreiecke.
- Chrome Beat: 47 Gelenke, 14.232 Dreiecke.
- `scripts/generate-sonic-avatars.py`: Geometrie, GLB-Export, Bilder und Manifest.
- `scripts/sonic_stage_detail.py`: Hände, Gesichter und Ausdrucksanimationen.
- `scripts/sonic_stage_motion.py`: Choreografien und gebackene Bein-IK.

Keine Fremdmodelle, Texturen oder heruntergeladenen Motion-Daten werden verwendet.
Zum Neugenerieren: `npm run avatars:generate` (Blender 4.3+ mit glTF-Exporter).
Für die normale Nutzung wird Blender nicht benötigt.

## Prüfen

```sh
npm ci
npm run test:avatars:assets
npm run test:avatars:motion
npm run test:avatars:personality
SONIC_LOW_MEMORY_BUILD=1 npx next build
npm run test:avatars:playwright
```

Playwright startet einen Produktionsserver auf Port 3215. Für vorhandenen Chromium
kann `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` gesetzt werden;
alternativ vorher `npx playwright install chromium` ausführen.
Prüfbericht: `reports/avatar-validation/VERIFICATION.md`.
Browserbericht mit Bildern: `reports/playwright-avatars/html/index.html`.

## V1124 – Crowd-Regie ohne Änderungen am Avatar-Rig

Neue Publikumswellen nutzen vorhandene V1032-Instanzen und Crowd-Renderer.
Die Stage-Crew-Modelle und ihre Animationsclips erhalten keine neuen Bones,
Morph-Targets oder Jubelgeräusche. Reduzierte Bewegung und GPU-Grenzen
bleiben verbindlich.

## V1125 – Stage-Crew-Fokus ohne neue Bones

Neon Pulse, Festival Nova und Chrome Beat erhalten symbolische Fokuspositionen
für die acht Sektoren des virtuellen Publikums. Keine neuen GLB-/FBX-Clips,
Bones oder Morph-Targets. Die echten V1074-Avatarantworten bleiben optional;
keine automatisch erkannte Sängerzuordnung.
