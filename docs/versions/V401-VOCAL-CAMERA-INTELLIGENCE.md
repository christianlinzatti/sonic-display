# V401 – Vocal Camera Intelligence 4.0

## Umsetzung

Die optionale V401-Kameraregie verarbeitet vorhandene V368-Wort- und Gesichtscues, den gerade laufenden Track, Bühnen-Slots und optionale manuelle V385-Stimmenzuordnungen. Das Modell `vocalCameraIntelligenceV401.ts` enthält eine zustandsbehaftete Regie mit Seek- und Songwechsel-Reset und erstellt auf der bestehenden V377/V397-Kameraankerschnittstelle kleine Solo- bzw. Übergabe-Akzente. Rap-Wörter erhalten stärkere, Gesangsphrasen schwächere Zoom-Akzente. Consonant-Closures und Mundbewegung beeinflussen den Akzent. Alle Kamerabewegungen sind begrenzt, weich und werden durch Lyrics-Schutzzonen und Leistungsprofil abgeschwächt.

Die Funktion ist deaktiviert, bis `V401 · Vocal Camera Intelligence` in den Avatar-Einstellungen aktiviert wird. Modi: Aus, Dezent und Musikvideo mit Stärke 0–100. Sie wird nur bei aktiver Wiedergabe, gültigem Song, wortzeitmarkierten Lyrics und sichtbaren Avataren wirksam. Ohne manuelle Rollenangaben bezeichnet Slot 0 den Bühnen-Lead, **nicht** einen zuverlässig erkannten realen Sänger.

V400 gespeicherte, songbezogene Kamera-Cues, V377 Duett-Regie, V354 Show-Timeline, manuelle Kamera-Presets, V385 explizite Stage-Priorität sowie Live-Editing bleiben vorrangig. Bei aktiver V397 Solo-Aufnahme kann V401 nur die geringe Vocal-Zoom-Betonung ergänzen; andere V397-Bilder überschreibt sie nicht. Bei Pause, `Reduced Motion`, fehlendem Wort-Timing, Intro-/Instrumentalabschnitten oder fehlenden Avatarankern sind diese Effekte aus.

Es gibt **keine** Mikrofon-Spracherkennung, keine Source-Separation und keine echte Phonem-Timing-Analyse. V368 schätzt Artikulation aus Lyrics und Zeitmarken. Der volle Next.js-Produktionsbuild muss mit installierten npm-Abhängigkeiten verifiziert werden.
