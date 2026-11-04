# V344 – Visual Gallery Layout Editor

V343 wird um einen Editor für Fotoposition und Bildausschnitt erweitert.

## Bedienung
1. Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor öffnen.
2. Fotos von Spotify/Wikimedia laden oder eigene HTTPS-Bildadressen verwenden.
3. `Bildrahmen im Vorschaufenster bearbeiten` aktivieren. Rahmen ziehen, die gelbe rechte untere Ecke zur Größenänderung verwenden. Mit Pfeiltasten den fokussierten Rahmen bewegen (Shift: 5 %-Schritte).
4. Über die Schieberegler Breite/Höhe, Position, Bildzoom und horizontalen/vertikalen Ausschnitt anpassen.
5. Mit `Vorlage speichern` individuelle Vorlagen speichern und bei Bedarf wieder laden oder löschen.

Die drei Bildschirmformate 16:9, 1:1 und 3:4 haben separate Einstellungen. Frame-Layouts gelten auch für Bilder auf der eigentlichen 3D-Bühne. Änderungen werden in `localStorage` gespeichert; es werden **keine Bilder** oder geheimen API-Zugänge gespeichert. Standardlayout bedeckt die gesamte Leinwand. V341/V342 Animationen laufen weiterhin über dem Bildausschnitt und berücksichtigen Bewegungsreduktion. Die Vorlagen sind browserlokal und werden nicht geräteübergreifend synchronisiert.

## Source
- `services/stageContent/galleryLayoutV344.ts`: Typen, Begrenzungen, Speicherung und Vorlagenverwaltung
- `components/visualizer/GalleryLayoutEditorV344.tsx`: Drag/Resize, Schieberegler, Tastatur, Vorlagen
- `components/visualizer/StageImageGalleryV338.tsx`: Anwendung des Layouts auf Stage & Preview
- `app/globals.css`: Editor-Overlay und CSS-Variablen zum verlustfreien Zuschneiden

## Tests
`npm run test:v344`, `npm run verify:offline`, nach `npm install` zusätzlich `npm run verify`.
