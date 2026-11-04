# Sonic Display V898 – Intelligent Dance & Camera Coordination

V898 führt die V897-Kamera und die reale Position sichtbarer V377-Bühnenavatare zusammen.
Es kommt **keine zweite Kamera, kein neues Mesh, keine neue WebGL-Renderpassage**
hinzu. Die Regie verändert keine animierten Knochen, Tanzsequenzen oder gespeicherte
Kamera-Keyframes.

## Neu

- **Solo-Fokus:** eine real sichtbare Bühnefigur oder ein explizit bestätigter,
  songgebundener V528-Leadsänger-Slot. Solo-Identität wird nicht erfunden.
- **Zwei-Personen-Bild:** zwei real sichtbare Avatare (oder zwei explizit
  bestätigte Gesangsslots), mit optionaler zusätzlicher Duett-Dämpfung.
- **Ensemble:** bei mindestens drei sichtbaren Bühnenavatare. Die tatsächliche
  Bühnenbreite beeinflusst den äußerst kleinen zusätzlichen Bildausschnitt.
- **Positionsänderungen:** vergleicht aufeinanderfolgende echte Stage-Root-Samples
  (ca. 180 ms). Positionswechsel über 1,4 m sowie Pausen, Spulen und
  Trackwechsel erzeugen **keine** fiktiven Bewegungssignale. Es handelt sich
  nicht um eine Tanzschritt-, Beat-, Sänger- oder Fußkontakt-Erkennung.
- **Drei Bewegungsstile:** Subtil, Cinematic, Dynamisch; Auto, Solo,
  Zwei-Personen oder Ensemble als gewünschter Bildtyp. Nicht belegte Modi
  bleiben aus. Separate Schalter, Intensität, Lyrics-/Duett-Schutz, JSON-Export.

V898 ist eine **nachgelagerte, physisch begrenzte Ergänzung**:
V848 -> V897 -> V898 -> V351. V550/V540 vergleichen die geplante Perspektive
gegen die ursprüngliche für **jeden sichtbaren Performer**. Kopf-, Fuß- und
Lyrics-Bildausschnitt dürfen sich nicht verschlechtern. Geschützte Kamera-
Timelines, Live-Editor, manuelle Presets, reduzierte Bewegung und Low-Tier
behalten Vorrang. Bei fehlender bestätigter V604-Songstruktur, sichtbaren
Bühnen-Roots oder pausierter Musik bleibt die Regie inaktiv.

**Bedienung:** `✦ LIVE FX → V898 Intelligent Dance & Camera Coordination`.
Die Einstellungen liegen unter `sonic-dance-camera-coordination-v898` im
Browser; über den JSON-Export werden nur **bestätigte Szenenzeiten** und
Konfigurationen exportiert, niemals geschätzte Tänzeridentitäten.

## Prüfen unter Windows

```powershell
npm ci
npm run verify:v898:focused
npm run typecheck
npm run build
npm run dev
```

`npm run test:v898` prüft die deterministische Kamera-/Besetzungslogik,
Sicherheitsgrenzen, den Bridge-Pfad und 30.000 Kamera-Samples.
`npm run test:v898:types` und `npm run test:v898:ui-types` prüfen
Core/Bridge und UI im isolierten Modus; sie **ersetzen nicht** den vollen
App-Typecheck und den Next.js-Produktionsbuild.
