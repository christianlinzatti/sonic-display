# V1108 – AI Music Emotion Intelligence

**Freigabeumfang:** mehrsekündige, lokal gemessene *Energie-Heuristik*; keine semantische Emotionserkennung,
keine automatische Song-/Drop-Erkennung und keine automatische Bühnen- oder Govee-Steuerung.

## Neu

- **Opt-in-Live-Messung** im V1107-Show-Designer: Audioanalyse muss bereits aktiv sein und ein Spotify-Song laufen.
- **Zeitfenster:** höchstens 20 Sekunden, maximal 81 normalisierte Messpunkte, maximal vier neue Messpunkte pro Sekunde.
  Volumen, Bässe, Mitten, Höhen, Impulsenergie und Attacken werden ausschließlich in RAM reduziert.
- **Signalqualität:** ein plausibler Vorschlag braucht mindestens 16 Messpunkte über 4,5 Sekunden,
  ausreichend Vertrauen und echte aktuelle Mikrofon-Daten; einzelne Kickspitzen sind kein Beleg.
- **Verlauf:** steigende, fallende oder konstante Energie plus geschätzte Impulsklarheit, Stabilität und Messsicherheit.
- **Bewusste Übernahme:** nur nach Klick wird ein begrenzter Vorschlag für Regiestil, Kontraste,
  Überraschungsgrad und Stimmungshinweis in das V1107-Formular übertragen. Ein vorhandener Showplan
  bleibt unangetastet, bis der Benutzer ausdrücklich eine neue Vorschau erzeugt und bestätigt.
- **Datenschutz:** keine Rohaufnahme, keine Speicherung, kein Audio-Upload oder automatische OpenAI-Abfrage.
  Bei Pausieren, Songwechsel, Mikrofonverlust, Stille und aktivierter Bewegungsreduktion werden Puffer verworfen.
- **Tests:** synthetische mehrsekündige Live-Signale mit steigender/fallender/gleichmäßiger Dynamik,
  ungültige Daten, stilles Mikrofon, Session-Switch, Speicherbegrenzung, UI/Datenschutz und unveränderte Cloud-Grenze.

## Bedienung

**Einstellungen → Bühne → 360° Arena → AI Show Designer → V1108 Musik-Energie & Dramaturgie**.
Mikrofon manuell aktivieren; während der Wiedergabe **Lokale Musikanalyse starten**,
mehrere Sekunden beobachten, **Analyse beenden und Vorschlag prüfen** und optional
**Regievorschlag bewusst übernehmen**. Anschließend kann wie gewohnt ein Offline- oder OpenAI-Showplan
vorgeschlagen werden; Änderungen werden erst nach eigener Bestätigung gespeichert.

**Wichtig:** Die dargestellte „Messsicherheit“ ist keine statistisch kalibrierte Wahrscheinlichkeit,
und die Klang-Stimmung ist keine gesicherte Emotionsdiagnose. Es werden weder Lyrics noch Musik
aufgenommen. Die bereits vorhandenen Sicherheitslimits für virtuelle Effekte bleiben aktiv.
