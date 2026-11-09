# V1136 – Geplante Tanzdialoge und wiederkehrende Motive

Die lokale Regie gestaltet jetzt kleine Szenen: Eine Figur stellt ein Motiv
vor, ihre Partnerfigur übernimmt genau diesen Clip als Antwort, anschließend
kehrt das Motiv im gemeinsamen Tanz zurück. Ein zweiter, anderer Clip gibt
dem Dialog einen körperlichen Kontrast. Weitere Figuren begleiten dezent.

Ein begrenzter Planer bewertet alle zulässigen Motivpaare nach Genre,
Bewegungsenergie, Kontrast und einer reproduzierbaren Song-/Szenenvariation.
Die Auswahl ist eine lokale Planungsheuristik, kein trainiertes Modell und
keine neue Audioanalyse. Sie benötigt weder Modellzugang noch Netzwerkaufrufe.
Die Paare bleiben während einer Szene stabil. Ein Cache mit höchstens 64
unveränderlichen Einträgen spart wiederholte Bewertung; nach einer Verdrängung
wird exakt dasselbe Paar rekonstruiert.

Die Planabschnitte dauern jeweils acht Sekunden. Drei Abschnitte bilden
Vorstellen, Antworten und Zusammenfinden. Die vorhandene Clipsteuerung wartet
weiterhin auf echte musikalische Taktgrenzen und berücksichtigt ihre Haltezeit.
Bei anderen Tempi kann die tatsächliche Übergabe deshalb etwas später erfolgen.
Solist und Partner wechseln bei der Antwort die Rollen. Spätere Szenen verteilen
die Rollen auf andere Crew-Mitglieder. Derselbe Songabschnitt lässt sich nach
einem Seek ohne verborgenes Sitzungs-Gedächtnis wiederherstellen.

Dialoge gelten erst nach dem Auftakt, für zwei bis vier Figuren und nur in
geeigneten Strophen. Ruhige Passagen, dichte Lyrics, Aufbau, Refrains, Drops,
Finale, manuelle Bewegungen und Reduced Motion behalten ihre Regeln. Ambient
und Klassik verwenden weiterhin keine harten Roboter-/Frontmann-Motive.
Fehlende Clips führen zum vorhandenen sicheren Fallback. Die gemeinsame
Rückkehr bekommt einen leicht weiteren automatischen Ausschnitt und sanfte
Lichtverstärkung im bestehenden Regiesystem, ohne zusätzlichen Strobe.

## Bedienung und Prüfungen

Settings → Avatar → **Intelligente Show aktivieren**. Für die Live-Bühne
mindestens zwei Figuren verwenden, beispielsweise über **Trio auf der Bühne
einrichten**. Die bestehende Schaltfläche zum Zurücknehmen stellt die vorige
Trio-Einrichtung wieder her. Die Show-Simulation zeigt
mit derselben Regie die tatsächlich abgespielten Clips. Die Live-Regie benennt
Motiv, Antwort und gemeinsame Rückkehr.

`npm run test:v1136` enthält zusätzlich `tests/crew-dialogue.cjs`: Partner-
Übergabe, gemeinsamer Rückgriff, elf Genre-Gruppen, zwei bis vier Figuren,
Schutzregeln, fehlende Clips, Cache-Rekonstruktion und reale Taktplanung.

`tests/e2e/crew-dialogue.spec.cjs` prüft echte GLBs: Der Solisten-Clip wechselt
zur Partnerfigur und erscheint danach bei allen drei Tänzern. Hauptanzeige,
Seeks und Rollenwechsel werden mit Spotify-/Lyrics-Mocks geprüft. Der Fall
läuft in der vollständigen CI auf Desktop und Touch.

README und ARCHITECTURE verweisen auf dieses Update. Projekt-ZIPs enthalten
keine Playwright-Testberichte.
