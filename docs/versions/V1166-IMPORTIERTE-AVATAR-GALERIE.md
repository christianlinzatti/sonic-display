# 13 importierte Avatare in der Galerie

Unter **Einstellungen → Avatar → Avatar-Bibliothek** sind die hochgeladenen Modelle als Kategorie **Importierte Avatare** verfügbar. Nach diesem Begriff oder dem Namen filtern, eine Karte auswählen und die eingebetteten Clips im bestehenden Dance Studio testen. Die Auswahl wird wie bei den anderen Galerie-Modellen gespeichert.

| Modell | Eingebettete Animationen |
| --- | ---: |
| Nova V1 | 20 |
| Jax V1 | 20 |
| Rae V1 | 20 |
| Nika V1 | 20 |
| Kayo V1 | 20 |
| Chrome V1 | 26 |
| Luma V1 | 23 |
| Orbit V1 | 23 |
| Sol V1 | 23 |
| Performer V2 | 12 |
| Vexa V1 | 23 |
| Performer V3 | 20 |
| Pulsebot V1 | 20 |

`public/avatars/imported/` enthält die unveränderten Original-GLBs sowie lokale PNG-Vorschaubilder der tatsächlichen Modelle. Das Manifest dokumentiert Namen, stabile IDs, originale Dateinamen, SHA-256 und enthaltene Clip-Namen. Die Clip-Anzahlen stammen direkt aus den GLBs.

`config/avatarModels.imported.ts` ergänzt die bestehende Standardgalerie. Die Dateien liegen in einem eigenen Unterordner, damit die automatische Suche nach lokalen Root-Dateien keine zweiten Karten erzeugt. Der vorhandene `/api/avatars`-Katalog liefert die Einträge auch bei aktiviertem Blob-Speicher aus. Bereits vorhandene Avatare und ihre IDs bleiben erhalten. Die vorhandene Auswahl für das Hauptmodell, die Vorschau und die eingebetteten Animationen wird verwendet; die neue Galerie erweitert nicht automatisch die fest kuratierte Musikregie der Sonic Stage Crew.

Die Vorschaubilder können mit Blender reproduziert werden:

```sh
blender -b -t 2 -P scripts/render-imported-avatar-previews.py
```

Der Renderer importiert die GLBs nur zum Rendern und schreibt PNGs. Er exportiert oder verändert keine Modelle. Blender wird für das Ausführen der App oder den Build nicht benötigt.

`node tests/imported-avatar-gallery.mjs` prüft alle 13 Original-Prüfsummen, die Galerie-Metadaten, eigenständige Dateien, echte Three.js-Ladevorgänge, endliche Skelettwerte und tatsächliche Bewegung für jeden eingebetteten Clip sowie die PNGs. `tests/e2e/imported-avatar-gallery.spec.cjs` prüft Katalog und Dateien, sämtliche Galerie-Karten und Bilder, drei unterschiedliche Modelle im echten 3D-Dance-Studio sowie das Speichern der Auswahl. Beide Tests gehören zur aktiven Release-Suite. Projekt-ZIPs enthalten die Modelle und Testquellen, aber keine Playwright-Testberichte.
