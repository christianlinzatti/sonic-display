# V68 – Update-sichere Avatar-Konfiguration

- Mitgelieferte Avatare: `config/avatarModels.default.ts` (wird bei Updates ersetzt).
- Eigene Avatare: GLB/GLTF nach `public/avatars/` kopieren. Der Scanner findet sie automatisch.
- Eigene Anzeigenamen, Beschreibung und Vorschaubild: `data/avatars.local.json` (optional). Erstelle sie anhand von `data/avatars.local.example.json`. Schlüssel sind die **exakten Dateinamen**.
- FBX-Import ergänzt `data/avatars.local.json` automatisch und bewahrt bestehende Einträge.
- `data/avatars.local.json` und GLB/GLTF-Dateien sind in `.gitignore` ausgeschlossen. Diese Dateien bei Updates **nicht löschen oder überschreiben**.
- Die JSON-Datei wird serverseitig bei `/api/avatars` gelesen, sodass sie nicht ins Browser-Bundle eingebaut wird. In den Settings `Modelle neu laden` anklicken.
- Keine automatische Speicherung des gewählten Avatars in der JSON-Datei: die Auswahl bleibt weiterhin in den UI-Präferenzen des Browsers.
- Bereits von Git getrackte Dateien müssen ggf. mit `git rm --cached <datei>` aus dem Index genommen werden.
- `getAvatarModel` unterstützt lokale Dateinamen wie zuvor über `local:robot.glb`.
