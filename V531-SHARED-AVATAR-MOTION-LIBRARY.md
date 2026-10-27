# Sonic Display V531 – Shared Avatar Motion Library (visuell konservativ)

## Ziel

Fünf GLB-Avatare enthalten jeweils **20 exakt identische Animationen** (100 gespeicherte Kopien, aber nur 20 einzigartige Bewegungen). Der V531-Importer kann die wiederholten Keyframe-Daten einmal in der ersten vollständigen GLB aufbewahren und in weiteren GLBs auf diese Quelle verweisen.

## Vorschau zuerst: sichere Standardeinstellung

- **Die Speicheroptimierung ist anfangs deaktiviert.** Ohne aktives Häkchen werden die vollständigen GLBs unverändert hochgeladen, wie in V529/V530.
- Das Häkchen „Speicheroptimierung aktivieren“ gilt nur für den aktuellen Importvorgang. Kein bestehendes Modell wird rückwirkend verändert, keine lokale Originaldatei umgeschrieben.
- V531 vergleicht SHA-256 über **Animationskanäle, Interpolation, Keyframe-Binärdaten und Skelett-Ruhepose/-Hierarchie**. Nur bei einer vollständigen Übereinstimmung werden redundant gespeicherte Animationen aus den neu hochgeladenen Folgemodellen entfernt. Sparse- oder interleaved **Animationsaccessors**, unbekannte glTF-Extensions und nicht unterstützte Container lösen einen vollständigen Upload aus.
- Die **erste** passende GLB wird mit allen 20 Clips auf dem Server gespeichert. Alle weiteren behalten ihre Meshes, Morph-Targets, Materialien, Skelette und Original-Ruheposen; lediglich Kopien der Animationen entfallen.
- Die installierte 3D-Vorschau (inklusive Umschalter „Original-GLB zum Vergleich zeigen“ und Settings-Viewer) holt die 20 Clips aus der gemeinsamen GLB. Das gilt auch für die Bühne. Bei exakt übereinstimmenden GLBs werden die Original-Clips **direkt** auf das gleichnamige Skelett gebunden; ein zusätzliches heuristisches Retargeting ist nicht nötig und würde die Bewegung unnötig verändern.
- Explizit installierte externe Motions haben weiterhin Vorrang. Sänger, IK, Lippensynchronisierung, Lyrics und Kameraregie sind nicht verändert. V530 wählt auch aus gemeinsam geladenen Clips passende Genre-/Abschnittsanimationen.

## Tatsächlich geprüfte GLBs

| Avatar | Original | Kompakt (falls zweiter Avatar) |
|---|---:|---:|
| Performer V3 | 1.863.344 B | 516.940 B |
| Pulsebot V1 | 2.016.084 B | 671.860 B |
| Nova V1 | 2.014.348 B | 667.008 B |
| Rae V1 | 2.343.300 B | 994.496 B |
| Jax V1 | 2.056.344 B | 708.868 B |

Beispiel: Performer bleibt vollständig; die anderen vier Dateien werden kompakt. Das reduziert in diesem Import die Gesamtgröße von **10.293.420 B auf 4.905.576 B** (5.387.844 B Ersparnis). Die optimierte GLB enthält **keine eigenen eingebetteten Clips**; die 20 Animationen werden aus der dauerhaft registrierten Quelle hinzugezogen.

## Sichtprüfung und Grenzen

In `tests/v531-shared-embedded-motion-regression.cjs` werden alle fünf Original-GLBs überprüft. Tests vergleichen nach dem Kompaktieren die **Binärinhalte sämtlicher Mesh-Attribute, Morph-Target-Attribute, Skins, Bilder und Materialien** mit den ursprünglichen Dateien. Die Motion-Signatur muss bei allen fünf Dateien exakt gleich sein. Ein Code-Regressionstest prüft, dass **sowohl der Bühnen- als auch der 3D-Vorschaupfad** die gemeinsame GLB verwenden, Settings-Edits Verknüpfungen behalten und die Animationen nicht neu retargeten.

**Einschränkung:** Dieser Test ist **keine gerenderte WebGL-Bildvergleichsprüfung** und kein Raspberry-Pi-Sichttest. Nach dem Import sollten mindestens `Idle_Groove`, `Dance_RapTwoStep`, `Dance_ClubGroove`, Gesicht/Morph-Targets und Fußkontakt in der installierten 3D-Vorschau angeschaut werden, bevor die Optimierung für weitere Avatare aktiviert wird. Im Zweifel Häkchen ausgeschaltet lassen und Original-GLB importieren.

Die Quelle muss erhalten bleiben: Ein manueller Server-/Blob-Delete der Quell-GLB würde die referenzierenden Avatare ohne ihre Motions zurücklassen. Das Projekt bietet für die hier verwendeten Quellen **keine automatische Rehydration**. Vor dem Löschen zuerst wieder die vollständige GLB installieren und die Zuordnung ändern. Die Vercel-Blob-Upload-Metadaten müssen erfolgreich gespeichert sein. Fehlgeschlagene lokale Metadaten-Schreibvorgänge rollen die erzeugte kompakte Datei zurück.

## Prüfkommandos

```bash
npm run test:v531
npm run test:v531:types
npm run check:syntax
npm run check:architecture
npm run test:v530
```

Der vollständige Next.js-Produktionsbuild erfordert im eigenen Projekt `npm install && npm run build`. Die hochgeladenen privaten Test-GLBs werden **nicht** ins ausgelieferte Projekt-ZIP aufgenommen und nicht öffentlich veröffentlicht.
