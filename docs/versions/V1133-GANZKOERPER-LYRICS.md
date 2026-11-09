# V1133 – Ganzkörper, Charaktere und Lyrics-Bühne

## Start und Bedienung

Wie bisher `npm ci` ausführen, Konfiguration anhand `.env.example` übernehmen und `npm run dev` starten.

Unter **Settings → Avatar → Sonic Stage Crew → Intelligente Show aktivieren** die Regie einschalten. Für einen klaren Vergleich Chrome Beat, Luna Flow und Ember Rock in der Trio-Probe auswählen und einen Strophenabschnitt mit mittlerer Energie verwenden. Die Figuren zeigen Präzision/Stopps, fließende Gewichtswechsel und kraftvolle Kniearbeit. In gemeinsamen Refrains verwendet die Crew weiterhin kompatible gemeinsame Schritte und Antwortformen.

Für die Lyrics **Cinematic**, **Kinetic** oder **Neon** auswählen. Wiederkehrende synchronisierte Zeilen erhalten eine große Refrain-Darstellung. Dichte schnelle Passagen erhalten eine ruhigere Leseansicht. Die klassische Darstellung bleibt eine eigene Wahl.

## Körperliche Abwechslung

Alle elf GLBs enthalten sechs zusätzliche vollständige Bewegungsphrasen:

| Clip | Sichtbarer Schwerpunkt |
| --- | --- |
| Robot Groove | Mechanische Isolierungen, klare Stopps, wechselnde Knie-/Beckenpositionen |
| Fluid Arc | Fließende Gewichtsverlagerung, seitliche Bögen und diagonaler Fußweg |
| Frontman Drive | Tiefere Kniekompression, Vorwärtsschritte und energiegeladene Frontmann-Haltung |
| Jazz Rebound | Federnde Kniearbeit, synkopierte Vor-/Rückbewegungen und Swing-Haltung |
| Cross Step | Diagonale Schritte und gegenläufige Becken-/Brustbewegung |
| Turn Phrase | Kontrollierte Beckenrotation und Drehung des angehobenen Fußes |

Die Bewegungen verändern Becken, Knie, Beine und Füße. Die Körpermasse verschiebt sich in Richtung des Standfußes; der jeweils andere Fuß führt den Schritt aus. Die Figuren bleiben innerhalb ihres Bühnenplatzes. Es handelt sich um kontrollierte Drehphrasen, nicht um freie Laufwege oder vollständige Raumwechsel.

Die ursprüngliche Crew enthält jetzt je 22, die Encore-Crew je 28 und die Headliner je 32 Animationen – insgesamt **306 eingebettete Clips**. Die vorhandenen Bewegungsfolgen, Partnerblicke, Duelle und zeitversetzten Antworten bleiben erhalten. Bei dichter Textpassage, Aufbau oder Ruhe bekommt die bestehende Dramaturgie Vorrang vor zusätzlichen Ganzkörper-Phrasen.

## Herkunft der Bewegungen

Die neuen Clips sind **prozedural erstellt und mit Zweiknochen-IK gebacken**. Es sind keine Motion-Capture-Aufnahmen. Es liegt keine verwendbare lizenzierte Motion-Capture-Bibliothek vor; deshalb werden keine Fremdaufnahmen ohne nachvollziehbare Rechte mitgeliefert. Bestehende GLB-/FBX-Importfunktionen können weiterhin mit eigenen passenden und lizenzierten Bewegungen verwendet werden. Für fremde Rigs bleiben Retargeting, Skalierung, Fußkontakt und Herkunft/Lizenz zu prüfen.

Mixamo ist ein Beispiel für eine solche Quelle: Bewegungen werden mit einem Adobe-Konto ausgewählt und als FBX heruntergeladen. Für eigene Figuren braucht es anschließend Retargeting, also die Übertragung der Bewegung auf das Zielskelett. Vor einer Weitergabe des Projekts ist zu prüfen, ob die jeweils geltenden Anbieterbedingungen auch die konkrete Form der eingebetteten oder mitgelieferten Dateien erlauben. Kostenloser Download und freie Weiterverteilung sind unterschiedliche Rechte. Diese Version enthält keine Mixamo-Downloads.

Reproduzieren: `blender -b -t 2 --python scripts/generate-sonic-avatars.py -- --ensemble`.

## Lyrics als Show-Element

- **Refrain:** Größere Schrift, begrenzter Kontext und eine eigene, sichtbare Textfläche. Ein längeres Inhaltswort wird während seines tatsächlichen Wortzeitfensters hervorgehoben.
- **Schnelle Passage:** Ab ungefähr 3,5 Wörtern/s oder hoher Zeichendichte wird das Lesen priorisiert. Die Zeile bleibt vollständig, bricht um und verzichtet auf Sprünge/Zooms. Ein ruhiger Lesecursor folgt vorhandenen Wortzeitmarken.
- **Ohne Wortzeitmarken:** Keine erfundenen Wortzeiten und keine künstliche Wortmarkierung. Eine synchronisierte Zeile kann dennoch eine passende Zeilendarstellung erhalten.
- **Kamera und Licht:** Die Text-Priorität unterbindet zusätzliche automatische Kamerafahrten der Regie und reduziert zusätzliche Bühnenlicht-/Strahlintensität. Manuelle oder gespeicherte Einstellungen behalten ihre vorhandene Priorität. Kein zweiter Kamera-Schreiber wird eingeführt.
- **3D-Lyrics:** Dichte Passagen bevorzugen eine vollständige Textzeile statt vieler bewegter Wort-Meshes. Zusätzliche Wort-/Einblendbewegungen und Beat-Wippen werden reduziert.

Die Textdichte ist ein Lesbarkeitssignal und keine Audio- oder Sängererkennung. Die Show-Regie bleibt lokal und regelbasiert, ohne externes generatives KI-Modell.

## Prüfen

- `npm run test:v1133`
- `npm run typecheck`
- Produktionsbuild: `SONIC_LOW_MEMORY_BUILD=1 NEXT_TELEMETRY_DISABLED=1 node_modules/.bin/next build`
- Danach `npm run test:v1133:browser`. Lokal gegebenenfalls `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` voranstellen oder einen passenden Playwright-Browser installieren.

Spotify, Genre und Lyrics werden in Browser-Tests weiterhin gemockt. Testtexte sind eigens geschrieben und haben kontrollierte Zeitmarken. Produktive Provider-Routen bleiben unverändert.

## Projekt-ZIP

Die ZIP enthält Quellcode, Assets, Lockfile, Testquellen/-konfiguration und Dokumentation. Sie enthält keine Abhängigkeiten, Build-Caches, Zugangsdaten oder generierten Playwright-Testberichte. Ausgeschlossen sind insbesondere Reports-Verzeichnisse, Playwright-HTML-Berichte, Testergebnis-Ordner, Traces, Screenshot-/Video-Belege und entsprechende Artefaktordner. Die bestehenden Versionsanleitungen liegen unter `docs/versions/`; README und ARCHITECTURE bleiben die Einstiegspunkte im Projektstamm.
