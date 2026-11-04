# V724 – Smart Dashboard Presets

## Bedienung

Unter **Zuletzt gespielt → Last.fm History → Personal Music Insights** liegt oberhalb des V723-Kachel-Editors jetzt die Preset-Leiste. Fünf Grundansichten stehen bereit: **Mein Dashboard**, **Konzert**, **Musikgeschichte**, **Entdeckungen**, **Statistiken**. Diese Presets steuern ausschließlich vorhandene Dashboard-Kacheln; die Konzertansicht ist **keine** Bühnenshow-Steuerung.

- Auf ein Preset tippen: Sofort dessen eigene Kachelsichtbarkeit, -reihenfolge und Halb-/Vollbreite anzeigen. Das aktive Preset wird kontogebunden gespeichert.
- **Dashboard anpassen**: Weiterhin Drag & Drop sowie 44-Pixel-Tasten für Touch und Tastatur. Jede Änderung wird **nur** dem aktiven Preset zugewiesen.
- **Presets verwalten → Kopie speichern**: Aktuelles Preset als eigenes Preset mit frei benennbarem Namen klonen. Bis zu 16 Presets insgesamt, Namen bis 40 Zeichen, keine doppelten Namen (ohne Beachtung der Groß-/Kleinschreibung).
- Eigene Presets umbenennen oder löschen; die fünf Grundansichten sind nicht löschbar oder umbenennbar, ihre Layouts aber anpassbar. Löschen eines aktiven eigenen Presets aktiviert „Mein Dashboard“.
- **Standardlayout wiederherstellen** im bestehenden Editor setzt nur das aktive Preset zurück. Grundansichten erhalten ihre jeweilige Vorlage, eigene Presets das V723-Standardlayout.

## Datenmodell und Migration

`lib/lastfm-dashboard-presets-v724.ts` hält vollständig validierte, versionierte lokale Presets in `localStorage` unter `sonic-display:lastfm:insights-presets:v724:<kanonischer benutzername>`. Eingebaut sind nur die sechs vorhandenen Widget-IDs aus V723. Der Parser lehnt falsche Versionen, doppelte IDs/Namen, nicht vorhandene Grund-Presets, ungültige Layouts und Datensätze über 64.000 Zeichen ab. Maximal 16 Presets.

Bei **erstmaligem** Öffnen ohne V724-Datensatz liest V724 das V723-Layout aus `sonic-display:lastfm:insights-layout:v723:<konto>` und setzt es in das neue „Mein Dashboard“ ein. Der alte Schlüssel bleibt als Sicherung **unverändert** und wird nicht gelöscht oder überschrieben. Danach speichert V724 nur unter dem neuen Schlüssel. Speicherfehler werden sichtbar gemeldet; Änderungen können bei deaktiviertem Browserspeicher bis zum Neuladen in der Ansicht erhalten bleiben. Andere Tabs synchronisieren ihren Zustand über das native Storage-Event.

`components/LastFmDashboardPresetsV724.tsx` besitzt den Preset-Zustand. Der vorhandene `LastFmDashboardStudioV723` ist hierfür um einen kontrollierten `controlledLayout`-/`onLayoutChange`-Modus erweitert, der den bisherigen unkontrollierten V723-Speicherweg unverändert zugänglich lässt. V722 liefert weiterhin die sechs unveränderten, lesenden Last.fm-Widgets.

**Datenschutz:** Ausschließlich lokale Layout-Einstellungen; kein neuer Server-Endpunkt, kein Eingriff in die archivierten Scrobbles, keine Spotify→Last.fm-Doppelübertragung.

## Verifikation

`npm run test:v724`, `npm run test:v724:types`, `npm run test:v724:ui-types`, `npm run test:quick`. Der vollständige Produktionsbuild erfordert zuvor `npm install` und ein lokales Lockfile; siehe `V724-VERIFICATION.md`.
