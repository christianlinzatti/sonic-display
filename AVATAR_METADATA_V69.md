# V69: Avatar-Metadaten

`data/avatars.local.json` unterstützt zusätzlich `genre` (Liste von Strings), `tags` (Liste von Strings), `category` (String), `favorite` (Boolean) und `defaultDancePreset` (`auto`, `hardstyle`, `techno`, `rock-metal`, `robot`, `ambient`, `freestyle`).

Die Avatar-Bibliothek bietet eine Suchfilterung über Name, Genre, Tags und Kategorie sowie einen Favoritenfilter. Favoriten werden zuerst angezeigt. Bei Auswahl eines Modells mit `defaultDancePreset` wird das Preset übernommen; es findet **kein** automatischer Genre-Wechsel während der Wiedergabe statt. Bestehende lokale JSON-Dateien bleiben kompatibel und werden nicht überschrieben.
