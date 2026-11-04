# V400 – Cinematic Camera Timeline

## Ziel

V400 ergänzt Sonic Display V399 um einen *songbezogenen* Kamera-Timeline-Editor. Er ist unter **Einstellungen → Avatar tuning → V400 · Cinematic Camera Timeline** zugänglich und öffnet seine 3D-Probebühne erst bei Bedarf. Kamera-Marken können auf einer Zeitachse platziert, ausgewählt, mit einem Zeitwert in Sekunden korrigiert, bearbeitet und gelöscht werden. Die Vorschau kann ohne die Spotify-Wiedergabe zu beeinflussen abgespielt oder gescrubbt werden.

## Daten und Live-Regie

Die Daten liegen in `UiPreferences.avatarCameraTimelineV400` im bestehenden lokalen Einstellungsspeicher. Der Schlüssel ist die Spotify-Track-ID. Ohne laufenden Track steht ein ausdrücklich gekennzeichneter `demo`-Track zum Ausprobieren bereit. Die Demo wird niemals auf einen Spotify-Song angewendet. Pro Song sind höchstens 48 Marken und insgesamt 24 Song-Einträge möglich; alte oder beschädigte Daten werden begrenzt normalisiert.

Jede Marke enthält `atMs`, den gewünschten Shot (`lead`, `two-shot`, `group`), Lead- und Partner-Slot (0–3), Zoom, seitliche Ausrichtung sowie `cut` oder `smooth` mit Übergangsdauer (150–3000 ms). Die Marken sind nach Startzeit sortiert; an einem Zeitpunkt gilt die jüngste begonnene Marke. Beim Hinzufügen wird eine Marke nicht automatisch aktiviert, bevor die Option **Gespeicherte Kameramarken verwenden** eingeschaltet wird.

Der vorhandene `StageCameraDirectorV289` liest nur die Timeline des derzeitigen Songs. Er wendet eine Marke ausschließlich bei Wiedergabe, aktivierter Timeline, gültiger Songposition und sichtbaren Avataren an. Solo-Bilder benötigen einen sichtbaren Lead, Duettaufnahmen zwei verschiedene sichtbare Performer, Gruppenbilder mindestens zwei sichtbare Performer. Die V400-Kamera arbeitet nur mit den bereits vorhandenen Kameraankern und übernimmt keine hypothetischen Gesangsrollen. Eine manuell zugewiesene Bühnenkamera, das bestehende Kamera-Preset, Live-Editing, die V354-Show-Timeline, manuelle Stage-Kamerapriorität und eine aktive V377-Duett-Kameraregie haben Vorrang. Die Lyrics-Komposition und deren Schutzzonen werden weiter berücksichtigt. Bei Pause und `Reduced Motion` ist die V400-Live-Regie deaktiviert.

Die Vorschau verwendet den V399-Canvas und eine gekennzeichnete Demo-Aufstellung mit bis zu vier Charakteren. Orbit-Bewegungen in der Vorschau sind nicht Teil der gespeicherten Timeline. Modelle werden nur in dieser geöffneten Vorschau geladen, nicht zusätzlich bei Spotify-Wiedergabe.

## Prüfung

`npm run test:v400` enthält Verhaltenstests für Sortierung, Zeitfenster, Trackwechsel, ungültige Daten, unsichtbare Tänzer, Lyrics-Schutz sowie die reale Einbindung in Editor und Stage-Kamera. `npm run verify:offline` enthält sämtliche bisherigen Versionsregressionen und V400. `npm run verify` umfasst zusätzlich `build:preflight`, `typecheck` und den Next.js-Produktionsbuild; dafür müssen die npm-Abhängigkeiten lokal vorhanden sein.

## Bekannte Grenzen

Die Zeitachse ist ein manuell erstellter Ablauf und erkennt weder neue Songabschnitte noch reale Sprecher. Der Demo-Renderer verwendet keine vollständige Live-Choreografie. Der Live-Betrieb respektiert die aktuell vorhandenen Charakter-Slots und schaltet eine Shot-Marke aus, wenn ihre Performer fehlen. Für einen geprüften Produktionsbuild und einen Langzeittest ist ein vollständiges `npm install` auf dem Zielgerät notwendig.
