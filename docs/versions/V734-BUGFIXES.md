# V734 – Korrekturen der Nachprüfung

Basis: vollständiges V733-Projekt.

- Spotify-Anfragen werden einschließlich Antwortauswertung nach 15 Sekunden abgebrochen. Die bestehende Polling-Fehlerbehandlung kann danach erneut versuchen; manuelles Abmelden bleibt sofort wirksam.
- Lyrics-Anfragen erhalten 20 Sekunden Gesamtfrist. Danach kann der bestehende Backoff erneut versuchen; Songwechsel und Unmount brechen weiter sofort ab.
- Bildgrößen-Ermittlung: acht Sekunden pro Bild, Freigabe des Warteschlangenplatzes bei Timeout; Timer und Bildquellen werden beim Unmount entfernt.
- Push: keine Abschneidung bei 100 Konten; sortierte IDs stabilisieren die Rotation trotz ungeordneter Redis-Set-Antwort. Zwei Konten je Aufruf bleiben das Budget. Änderungen der Kontomenge können die Reihenfolge verschieben; dies ist keine persistente Zustellwarteschlange.
- Animationen: abortierbarer Hauptdownload, 20 Sekunden Gesamtfrist, Abbruch des Three.js-LoadingManagers bei Timeout oder Effektwechsel. Private Konvertierungsmodelle werden nach Erfolg, Konvertierungsfehler und verspäteter Fertigstellung freigegeben. Retargetete Clips enthalten eigene Daten. Keine Freigabe gemeinsam genutzter useGLTF-Modelle.

## Grenzen

Die Frist beendet das Warten der Anwendung, unterbricht aber keine synchron laufende GLTF-Dekodierung. Abbrüche externer GLTF-Unterressourcen hängen vom jeweiligen Three.js-Loader und Browser ab; spät fertiggestellte Assets werden freigegeben. Ein dauerhaftes Speicherleck oder dessen vollständige Beseitigung wurde nicht durch eine Browser-Heap-Langzeitmessung nachgewiesen. Ein fehlgeschlagener Animationsdownload bleibt wie bisher bis zur Neuplanung/Invalidierung als fehlgeschlagen markiert, um Retry-Schleifen zu vermeiden.
