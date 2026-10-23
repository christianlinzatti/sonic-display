# Sonic Display V200 – AI Dance Choreographer 2.0

Basiert auf V199. Der **regelbasierte, deterministische** Choreografie-Generator nutzt installierte GLB-Motions, Genre, BPM-Bereich, Songphase und einstellbare Audioenergie, um bis zu fünf rhythmisch gruppierte Schritte vorzuschlagen. Es wird **kein externes generatives KI-Modell** aufgerufen.

Unter Character & Motion Library → Smart Choreography Evolution: Genre/BPM/Energie/Variante einstellen und pro Phase „V200 Vorschau generieren“ oder „Alle Phasen vorschlagen“ anklicken. Ergebnis überprüfen und mit „Vorschlag übernehmen“ in die lokale Sequenzbibliothek übernehmen. Die Live-Bühne verwendet weiterhin den V199-Beat-Transport und V191-Crossfades. Bestehende Sequenzen bleiben unverändert, sofern nicht ausdrücklich übernommen; nach Übernahme muss die Sequenzautomatik aktiviert sein.

Grenzen: Die Bewertung basiert auf Motion-Tags und Namensheuristiken, nicht auf echtem Audio-ML. Keine neuen Animationen oder garantierte Sample-genaue Spotify-Synchronisation. Test mit echten GLB-Rigs sowie kompletter npm/Next.js-Build in Zielumgebung weiterhin erforderlich.
