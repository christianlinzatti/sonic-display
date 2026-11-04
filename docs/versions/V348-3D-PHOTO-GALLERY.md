# Sonic Display V348 – 3D Photo Gallery

## Funktion

V348 zeigt bei aktivierter **Stage Content**-Leinwand und mit mehreren Fotos echte räumliche Bildkarten via `@react-three/drei` `Html transform` an. Die Karten sind separate Three.js-Gruppen mit eigener Position und Rotation im Bühnenraum (keine reine 2D-CSS-Simulation). Die eigentlichen Bilder bleiben DOM-Elemente, damit externe Fotodateien keine CORS-Probleme mit WebGL-Texturen verursachen.

- Bis zu acht räumlich getrennte Karten; Layoutposition und Ausschnitt aus V345.
- Einstellung für Tiefenstaffelung, perspektivische Neigung, Kamera-Parallaxe, Schweben, Beat-Reaktion, Glaskarten-/Minimal-/Neonrahmen, Eco/Balanced/Full.
- Die Parallaxe simuliert eine sanfte Kamerafahrt über Tiefenunterschiede, ohne die existierende Bühnenkamera zu übernehmen. Positionsänderungen werden in **einem** `useFrame`-Handler pro Galerie interpoliert; Eco reduziert Updates und deaktiviert Schweben. Keine weiteren Textur- oder Materialdownloads.
- Bildreihenfolge, Diashow, Musikintervall und Bildauswahl aus V338/V340/V341; V346 kann die Zahl sichtbarer Karten begrenzen; V347-Fotoüberblendung wird im 3D-Modus genutzt.
- `localStorage` speichert ausschließlich Parameter. Bild-URLs und Fotografennachweise bleiben im vorhandenen Content-Plugin-Fluss.
- V348 ist **standardmäßig deaktiviert**. Bei nur einem Foto, weniger als zwei Bildebenen oder deaktiviertem V345-Mehrbildlayout oder aktivierter Option „Bewegung reduzieren“ bleibt die bewährte flache Galerie.
- Der Editor bietet eine schnelle CSS-Perspektivvorschau, die keine zweite Three.js-Canvas lädt; auf der eigentlichen Bühne sind die Karten tatsächlich im Three.js-Raum positioniert.

## Aktivierung

1. **Settings → Dynamic Stage → Stage Content Plugins**: Content-Leinwand und Fotoquelle aktivieren.
2. Im **V343 Gallery Preview Editor** mehrere Künstlerfotos laden oder eigene HTTPS-Bildadressen angeben.
3. Im **V345 Multi-Photo Layout Studio** die Mehrbild-Komposition aktivieren und Bildflächen positionieren.
4. Im **V348 3D Photo Gallery** die räumliche Galerie einschalten. Tiefe, Perspektive, Animation und Qualität anpassen.
5. Optional V346 Layout Director / V347 Smart Transitions aktivieren.

Die bestehenden 2D-Modi bleiben zugänglich, indem man V348 ausschaltet. Bei über acht Layout-Layern erfolgt eine Begrenzung auf acht, ebenso ist das gesamte Bildsystem auf den bestehenden Einstellungen begrenzt.

## Tests

- `npm run test:v348`: Projektion, Begrenzung der Einstellungen, Fallback, Browserpersistenz und Integrationskontrolle.
- `npm run verify:offline`: alle vorhandenen Offline-Regressionsschritte.
- `npm install && npm run verify`: Next.js-Build und TypeScript auf dem Entwicklungsrechner mit vollständigen Dependencies.

**Hinweis:** Ein echter interaktiver WebGL-Browsertest ist weiterhin empfehlenswert, besonders für Überlappungen und unterschiedliche Bildschirmgrößen.
