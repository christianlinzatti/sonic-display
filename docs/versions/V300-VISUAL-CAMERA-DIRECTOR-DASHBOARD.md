# Sonic Display V300 – Visual Camera Director Dashboard

V300 ergänzt das **Camera Director Studio V299** unter **Settings → Dynamic Stage → Smart Stage Director → Interactive Camera Director**.

## Neu

- Fünf getrennte grafische Spuren für `verse`, `break`, `build`, `hook`, `drop` mit dem zugeordneten Kamera-Preset, der Anzahl gespeicherter V295-Keyframes und ihrer relativen Abspielzeit.
- Echte Keyframe-Markierungen und eine Positionslinie für die **aktive Live-Keyframe-Fahrt**, aktualisiert durch das vorhandene V299-Live-Status-Ereignis (maximal zweimal pro Sekunde).
- Klick auf eine Songphase: Selektion im bestehenden Preset-Editor. Klick auf ein Keyframe: öffnet das zugewiesene Preset, die 3D-Kameravorschau und springt zum gewählten Zeitpunkt.
- Optionale leichte **3D-Orientierungsvorschau**: perspektivische Projektion einer schematischen Bühne aus der **tatsächlich publizierten** Kameraposition (X/Y/Z), Blickrichtung und FOV. Das Bild ist kein WebGL-/Videomitschnitt der echten Bühne und zeigt keine installierten Avatar-Modelle.
- Live-Verbindung wird als inaktiv angezeigt, wenn länger als drei Sekunden keine Statusmeldungen vom gemounteten 3D-Kamera-Director eintreffen; es werden keine Werte erfunden.
- Die Vorschau verwendet SVG und reine Projektionsmathematik, **keinen zusätzlichen WebGL-Kontext**. Sie wird erst beim Öffnen dargestellt.

## Wichtig zu Zeitachsen

Die Anwendung kennt die exakten Start- und Endzeitpunkte der fünf erkannten Songphasen nicht. Daher zeigt jede Spur die **lokalen Zeitpunkte innerhalb der jeweils zugeordneten Kamerafahrt** statt vorgetäuschter Abschnittsgrenzen auf einer absoluten Song-Timeline. Die Songposition wird separat angezeigt; die grüne Positionslinie ist nur sichtbar, wenn die Live-Keyframe-Fahrt tatsächlich die aktive Regiequelle ist.

## Kompatibilität

Die bestehenden Presets und Keyframes werden nicht umgeschrieben, die Regie aus V298/V297 bleibt unverändert. Die Preview ist ein zusätzliches Informations-/Navigationswerkzeug. Der bestehende animierte GLB/GLTF-Editor aus V291–V295 bleibt verfügbar.

## Verifikation

`npm run verify:offline` umfasst Quell-Syntaxprüfungen und V265–V300 Regressionstests. Der V300-Test überprüft Projektionsrichtung und -mittelpunkt, Loop-Cursor, Keyframe-Koordinaten, Lane-Zuordnung und die Integration ins Studio. Für einen echten Produktionsbuild sind nach Installation der npm-Abhängigkeiten `npm install && npm run build` notwendig.
