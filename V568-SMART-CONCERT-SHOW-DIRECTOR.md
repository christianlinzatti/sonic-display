# V568 – Smart Concert Show Director

## Implementierung

- Neue pure, deterministische `coordinateSmartConcertV568()`-Entscheidung über vier bestehende Kanäle (Tanz, Kamera, Licht, dekorative Lyrics-Akzente). Kein zweites Show-Cue-System und keine neuen Renderobjekte.
- Die V318/V502-Songabschnitte bleiben maßgeblich; manuelle Abschnittslabels sind vertrauenswürdiger als nur live geschätzte Abschnitte. Unbelegte Sänger werden niemals aus Künstler-Credits oder Wortpositionen abgeleitet.
- `cinematicSceneV528` wird im Renderfluss früher ermittelt und derselbe geprüfte Cast steuert weiterhin die bestehende Kamera und Lyrics. V568 verwendet nur `leadSlot`/`singingSlots`, wenn Track-ID, Zeitfenster und Slots stimmen.
- Bei bestätigtem Sängerwechsel: ruhigerer Tanz, leicht priorisierte Kamera/Beleuchtung. Gemeinsame Hook: Gruppenbalance statt falsch zugeordnetem Solofokus. Ohne bestätigte Rollen: nur Abschnitts-Akzente und `focusSlot=null`.
- V451 schützt aktive Lyrics; automatisch erhöhte Kamera-/Lichtdynamik wird gedämpft, dekorative Lyrics-Akzente werden nicht verstärkt. Der vorhandene Karaoke-Fortschritt und die V567-Wortfenster bleiben unangetastet.
- Manuell gewählte Tanz- und Kamera-Timelines, Studio-Kamera, ausgeschaltetes Stage-Reactive und deaktivierte Lyrics-Reaktion behalten Vorrang. Pausen, Reduced Motion, Low Tier und deaktivierter Schalter ergeben exakt die bisherigen V502-Signale.
- UI: Konzert-Bühneneffekte mit An/Aus und Stärke 0–100 %; `data-v568-mode`, `-evidence`, `-focus`, `-lyrics-protected` sind reine Diagnostik.

## Grenzen

Die zusätzlichen Multiplikatoren sind klein; V568 erzeugt keine vollständige Choreografie, keine neue Kamera-Pose und keine stimmgetrennte Audioanalyse. Bestehende V528-Kamera, V566-Gesichtslicht und V567-Wortkoordination bleiben eigenständig zuständig. GPU-Auswirkungen und ästhetische Qualität sind mit echten GLBs/WebGL auf Zielhardware visuell zu prüfen.

## Tests

`npm run test:v568`, `npm run test:v568:types`, `npm run verify:v568`. Ein vollständiger `npm run build` benötigt installierte Abhängigkeiten.
