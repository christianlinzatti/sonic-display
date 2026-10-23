# Sonic Display V190 – Multi-Motion Character Library

Auf Basis von V189. Über **Settings → Avatar → Character & Motion Library** installierte Motions werden zusätzlich in einer persistenten lokalen Liste gespeichert. Im Abschnitt **Multi-Motion Character Library** kannst du einen Charakter auswählen, seine Motions in 3D ansehen, manuell aktivieren, Genre-/BPM-/Abschnittsregeln ändern und Einträge entfernen. Die bisherige aktive Motion bleibt auf dem Server gespeichert; die Liste verwendet Browser-localStorage.

**Experimentelle Automatik:** Nur nach expliziter Aktivierung werden beim Genre- bzw. Songabschnitt-Wechsel passende Motions aus der Liste ausgewählt. Die Abschnitte (build/drop/verse) werden vereinfacht aus dem Songfortschritt geschätzt und sind keine echte Musikstrukturerkennung; BPM wird nicht automatisch aus Spotify geladen, deshalb steht ein BPM-Filter zunächst nur für vorhandene BPM-Werte bereit. Das Laden einer anderen GLB ist kein nahtloses Crossfade. Eine Motion-Installation setzt weiterhin Admin-Rechte voraus; das reine Entfernen eines Bibliothekseintrags löscht keine Server-Dateien. Browser-Daten werden nicht automatisch zwischen Geräten synchronisiert.

Tests: `npm run test:multi-motion`, `npm run check:syntax`, `npm run verify:offline`, `npm run typecheck`, `npm run build`.
