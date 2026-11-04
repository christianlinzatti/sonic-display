# V697 – Concert Acceptance Dashboard (lokal und nutzergesteuert)

## In Sonic Display aufrufen

Während der Wiedergabe in der **QA-Ansicht** die Schaltfläche **V697 · Konzertabnahme-Dashboard** öffnen. Alternativ direkt `/acceptance` in derselben Next.js-Installation aufrufen. Der Weg funktioniert auch ohne Spotify-Login, weil die manuelle Prüfliste weder Login noch aktuelle Wiedergabe voraussetzt. Der separate Tab unterbricht die laufende Wiedergabe je nach Browser/App-Zustand; eine Aufnahme daher nie währenddessen unbedacht wechseln.

**Sechs Profile** gemäß V696: Deutschrap und Hardstyle/Hardtekk, jeweils 1, 2 und 4 GLB-Darsteller. Alle V696-Prüfkriterien sind identisch. Die UI zeigt pro Prüfpunkte `Offen` / `Manuell bestanden` / `Mangel beobachtet`. Für die beiden letzteren Einträge sind mindestens zwölf Zeichen Begründung sowie eine manuell beobachtete Song-Zeitmarke (Sekunden, 0–86400) nötig. Genre- und Reviewer-Bestätigung erfolgen ausdrücklich manuell.

## Workflow mit der bestehenden V696-Messpipeline

1. `npm install`, `npm run typecheck`, `npm run build`, `npm run start` lokal ausführen. Für reale Benchmarks den tatsächlichen, angemeldeten Chromium-Browser, echten Spotify-Titel, V592-Benchmarkmodus und echte GLB-Modelle verwenden. Ohne diese Voraussetzungen nicht von einer produktiven Konzertabnahme sprechen.
2. In `/acceptance` Profil wählen und Kriterien bei der *echten* Szene untersuchen. Änderungen explizit über **Lokal speichern** sichern. Nur das Prüfformular wird als JSON in `localStorage` unter `sonic.v697.acceptance.manual-review.v1` abgelegt. Kein Autospeichern; browser- und ursprungsgebunden, kein Cloud-Sync. Bei lokalem Speicherausfall vor dem Schließen unbedingt JSON exportieren.
3. Zum Betrachten einer vorhandenen Aufnahme das betreffende Profil wählen, dessen `artifacts/v696/captures/<id>/report.json` mit der lokalen Dateiauswahl importieren, danach optional die dazugehörigen `live-XX.png`-Bilddateien auswählen. Der Report muss zur Besetzung passen. **Das ist ausschließlich eine unbeglaubigte Vorschau**, kein validierter GLB-/PNG-/Lipsync-Nachweis; fehlende PNG-Bilder bleiben ausdrücklich leer. Die Bilder existieren nur in der aktuellen Browser-Sitzung als `blob:`-URLs und werden weder gespeichert noch hochgeladen.
4. Zeitmarken und mit PNGs belegte Bühnenmomente in der Oberfläche nachsehen. Vorläufige FPS-/P95-Werte werden je Genre nur bei gleicher Track-ID, Auflösung und Chromium-Aufnahmemodus für alle drei Besetzungen gegenübergestellt. Zusätzliche Faktoren wie GLB-Komplexität, GPU/Temperatur und Licht-Qualität sind nicht vergleichbar durch diese Prüfung allein.
5. Über **review.json exportieren** das vollständig formatkompatible manuelle V696-Blatt herunterladen und **selbst** in `artifacts/v696/review.json` ablegen. Für den tatsächlichen V696-Check bleiben die sechs unveränderten Originalverzeichnisse `artifacts/v696/captures/<id>` mit `report.json` und PNG-Dateien erforderlich. Die manuelle Prüfung muss an den echten Szenen durchgeführt worden sein.
6. `npm run audit:v696:collect` für den technischen JSON/HTML-Abnahmebericht, anschließend `npm run audit:v695:release` für das getrennte Produktions-/WebGL-/Browser-Gate. Auch bei vollständig ausgefüllter Checkliste und sechs echten Captures erfolgt **keine automatische Produktionsfreigabe** (`approved:false` im V696-Bericht). Screenshots beweisen weder echte Lippensynchronität noch natürliche Tanzbewegungen.

## Speicher- und Sicherheitsgrenzen

- `review.json`-Import wird in einem reinen, nach V696-Kriterien typisierten Codec validiert: maximal 160 kB, exakt sechs Profile, keine doppelten IDs, keine ungültigen Status-/Zahlenwerte, keine unbegrenzten Texte, keine Fremdfelder beim Export. Gespeicherte fehlerhafte Einträge werden nicht still überschrieben; explizites Speichern ersetzt sie bewusst.
- Dateiauswahl nutzt `File.text` und `File.arrayBuffer`; **keine Fetch-/API-Uploads**, kein Auslesen des lokalen Dateisystems ohne Auswahl und keine Spotify-Session-Übertragung. PNG-Vorschau prüft nur Dateiname, Größe, Signatur und IHDR-Pixelmaße. Die vollständige CRC-/IEND-/GLB-Nachweisprüfung bleibt ausschließlich in V696-CLI.
- Browser-`localStorage` ist **keine** garantierte dauerhafte oder geräteübergreifende Speicherung. Privater Modus, Browser-Löschung oder veränderte Origin kann Daten entfernen. Für Gerätewechsel die manuelle Review-JSON und originalen Capture-Ordner separat sichern. V694-QA-Historie wird nicht verändert.
- Die neue Seite erzeugt keine automatische Aufnahme, keinen neuen Renderpass, ändert weder Kamera, Tänze, Musik, Lyrics, Licht noch die Gerätequalität. Auf 10-Zoll-Display responsive, für QA-Bedienung größere Bildschirmbreite empfohlen.

## Tests

`npm run test:v697` (reiner V696-Datenvertrags- und Fail-Closed-Test), `npm run test:v697:types` (isolierte TypeScript-Prüfung des Datenkerns), `npm run test:v697:ui-types` (isolierter TSX-/React-Hook-Check mit ausdrücklich **test-only** JSX-Stub, keine echte Produktions-Typisierung), `npm run test:quick` (Versionsregressionen + TS/TSX-Syntax-/Architektur-/Dateinamen-/Security-Checks). Der vollständige Next.js-Build und Browser-/GLB-Test dürfen nur nach realer Ausführung als erfolgreich bezeichnet werden. Alle Einschränkungen siehe `V697-VERIFICATION.md`.
