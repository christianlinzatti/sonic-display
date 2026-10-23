# V309 – One-Click Show Presets

Basierend auf **V308 Concert Lighting & Atmosphere**. In der bestehenden Settings-Oberfläche unter **Dynamic Stage → Smart Stage Director → One-Click Tanzshows V309** lassen sich ganze Shows mit einem Klick aktivieren.

## Fertige Shows

| Show | Bühne | Tanz und Duo | Show-Intensität | Besonderheit |
|---|---|---|---:|---|
| Hardtekk Mainstage | Festival | Rave / Sync | 90 % | Drops, Licht und FX |
| Deutschrap Spotlight | White Showroom | Rap / Solo | 55 % | Grooves und sanfte Kamerafahrten |
| Cinematic Festival | Neon Club | Cinematic / Duet | 73 % | Filmische Kamera und Nebel |
| Ambient Night | Cosmic Galaxy | Cinematic / Solo | 32 % | Weniger Bewegung und ruhige Stimmung |

Jede Show setzt **Visualizer-Modus, Stage Theme, Stage Reactivity, Beleuchtungsstärke, Duo-Steuerung, Tanzstil, Aggressivität/Variation, Dance FX**, sowie die V306-Show-Regie, V307-Dance-Quality, V308-Atmosphäre und V287-Smart-Stage-Director zusammen.

## Bedienung

1. In **Settings → Dynamic Stage → Smart Stage Director → One-Click Tanzshows V309** eine Karte wählen.
2. **Vorschau** zeigt die bereits vorhandene, ressourcenschonende CSS-Bühnenvorschau; sie verändert keine Einstellungen.
3. **Show starten** aktiviert die Kombination. Der jeweils erste Start sichert die bisherigen Show-Einstellungen für einen späteren Rücksprung. Danach können beliebig andere Show-Presets gewählt werden, ohne die ursprüngliche Sicherung zu ersetzen.
4. **Vorherige Show-Einstellungen wiederherstellen** setzt die beim ersten Start gesicherten Werte zurück. Die Sicherung liegt für dieselbe Browser-Sitzung in sessionStorage, sofern verfügbar.
5. **Aktuelle Show als Preset speichern** legt eine persönliche Kombination im Browser in localStorage ab (maximal zwölf). Sie kann anschließend wieder gewählt oder gelöscht werden.

## Was bewusst unverändert bleibt

- Avatar- und Zweitavatar-Auswahl, installierte GLB/FBX-/Motion-Dateien sowie deren Konfiguration.
- Eigene Kamera-Presets, Kamera-Keyframes und Kamerapfade. Die automatischen Regler können je nach Show aktiviert werden, löschen aber keine gespeicherten Kameradaten.
- Barrierefreiheit (`reducedMotion`), Mikrofon, Spotify-Anmeldung, Lyrics- und Animations-Timeline-Dateien.
- Vorhandene Light-Blackouts, GPU-Leistungsstufen und die entsprechenden Einschränkungen der V306-/V308-Regie.

Hinweis: Die Live-Show basiert auf der vorhandenen Musikanalyse. Ohne Mikrofon können Track-Energie und musikalische Abschnitte geschätzt sein. Die Vorschau zeigt das Bühnen-Thema, nicht eine gerenderte vollständige Tanz-Choreografie.

## Architektur

- `components/visualizer/showPresetsV309.ts`: vier Konfigurationen, Whitelist der veränderbaren UI-Felder, Capture/Restore, Eingabevalidierung, Speicherung eigener Presets.
- `components/visualizer/ShowPresetStudioV309.tsx`: ein Klick pro Show, CSS-Vorschau, benannte eigene Presets und Undo-Knopf.
- `components/visualizer/StageDirectorControlsV287.tsx`: Integration in bestehende Einstellungen.
- `components/visualizer/VisualizerStage.tsx`: Preset-bedingte Bühnenwechsel werden nicht als manuelle Track-Overrides behandelt; manuelle Eingriffe funktionieren weiterhin.
- `tests/v309-show-presets-regression.cjs`: Show-Mapping, Speichersicherheit, Formatvalidierung, Undo und Integrationsprüfungen.

## Verifikation

- `npm run test:v309` — PASS
- `npm run verify:offline` — PASS (alle konfigurierten Offline-Tests V265–V309)
- `npm run check:syntax` — PASS (345 TS/TSX-Dateien)
- `npm run build:preflight` — BLOCKED: npm-Abhängigkeiten (u. a. Next.js, React, Three.js) in der lokalen Prüfungsumgebung nicht installiert.

Für einen vollständigen Produktionsbuild auf deinem Rechner mit Internetverbindung im entpackten Ordner `npm install`, dann `npm run verify` ausführen. Die ZIP enthält nicht `node_modules` oder einen Build-Cache.
