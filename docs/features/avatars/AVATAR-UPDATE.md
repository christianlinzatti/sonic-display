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
