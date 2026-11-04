# Sonic Display V349 – Intelligent Photo Selection

## Überblick

V349 ergänzt die vorhandene Bildauswahl aus V340 um eine **layoutabhängige Zuordnung von Bildern zu einzelnen Foto-Karten**. Diese Option betrifft sowohl die 2D-Mehrbildlayouts (V345) als auch die räumlichen Drei/Three.js-Karten (V348), einschließlich der Live-Vorschau aus V343. Alle Funktionen der Versionen V338–V348 bleiben erhalten. Das V349-Feature ist zunächst ausgeschaltet.

## Funktionsumfang

- **Bildformat/geringer Zuschnitt:** Für jede Bildfläche wird das tatsächliche Verhältnis von Breite zu Höhe ermittelt. Ein Querformat wird z. B. auf einer breiten Hauptfläche bevorzugt, ein Hochformat in einer schmalen Karte. V344/V345-Zoom- und Pan-Werte bleiben unverändert; die Auswahl verschiebt keine manuell eingestellten Bildmittelpunkte.
- **Bildauflösung:** Bilder werden im Browser über `Image.naturalWidth` und `Image.naturalHeight` ausgelesen. Die Bewertung berücksichtigt die Fläche und eine zu starke Hochskalierung relativ zur erwarteten Anzeigegröße. Sehr niedrige Auflösungen werden herabgestuft, nicht automatisch gesperrt.
- **Wiederholungen:** Provider-Varianten derselben Originaldatei (z. B. URL mit unterschiedlichen Größenparametern, Wikimedia-Thumbnails) werden anhand der URL normalisiert und bei aktivierter Duplikatvermeidung zusammengeführt. Beim Füllen einer Collage werden zunächst unterschiedliche Kandidaten genutzt. Gibt es weniger Fotos als Karten, dürfen Fotos erneut verwendet werden, damit kein Feld leer bleibt.
- **Musikdiashow:** Mit dem vorhandenen V341/V346-Ablauf kann die bevorzugte Auswahl rotieren. V347-Überblendungen und die V348-Bewegungen bleiben unverändert.
- **Informationsvorschau:** Ein Bewertungsbereich zeigt die sechs führenden geladenen Fotos mit Bildabmessungen, geschätztem Eignungswert und einer kurzen Erklärung.
- **Leistung/Privatsphäre:** Höchstens 24 Metadatenproben, maximal vier gleichzeitig; kleiner In-Memory-Cache (max. 120 Einträge). Kein serverseitiger Analyseaufruf, keine Gesichtserkennung, keine Cloud-Bilderkennung. `localStorage` enthält nur Einstellungen und keine Foto-URLs. Fehlende Bildinformationen verhindern die Darstellung nicht.

## Einstellungen

**Settings → Dynamic Stage → Stage Content Plugins → Gallery Preview Editor → V349 – Intelligent Photo Selection**

- „Intelligente Bildauswahl aktivieren“: Standard **aus** (verändert bisherige Fotosortierung bis zur Aktivierung nicht).
- Auswahlprofil: **Ausgewogen**, **Hohe Auflösung**, **Wenig Bildzuschnitt**.
- Duplikate vermeiden (Standard: an).
- Gewichtung des Bildzuschnitts (0–100 %).
- Minimale kurze Bildkante (0–2000 px) und zulässige Vergrößerung (1–4×).
- Vorschauformate: aktuelle Leinwand, Quadrat, Hochformat.

**Transparenz:** Das System nutzt keine echte Bildinhaltserkennung und kann deshalb weder Gesichter automatisch zentrieren noch Bildunschärfe fotografisch messen. Es schätzt nur, wie gut Bildauflösung und Seitenverhältnis zu einem Rahmen passen. Herkunfts-/Copyright-Hinweise werden unverändert übernommen.

## Technische Integration

- `services/stageContent/photoSelectionV349.ts`: deterministische, rein funktionale Bewertung, Kanonisierung der URLs und Zuordnung zu bis zu acht Frames.
- `services/stageContent/usePhotoDimensionsV349.ts`: clientseitige, abbruchfähige Metadatenproben und begrenzter Cache.
- `components/visualizer/PhotoSelectionSettingsV349.tsx`: Steuerung und Vorschau.
- `StageImageGalleryV338.tsx`: intelligente Reihenfolge und eigene optimale Fotowahl für die 2D-Karten, Collage und Einzelbild/Diashow.
- `StagePhotoGallery3DV348.tsx`: dieselbe Methode pro räumlicher Karte.
- `GalleryPreviewEditorV343.tsx`: V349-Steuerung im bestehenden Editor integriert.

## Testbefehle

```sh
npm run test:v349
npm run verify:offline
npm install
npm run verify
```

Der volle Produktionsbuild setzt installierte npm-Pakete voraus. In der aktuellen isolierten Erstellungsumgebung fehlen 14 Pakete sowie `package-lock.json`; die V349-Servicefunktionen wurden separat mit TypeScript `--strict` getestet und die komplette Offline-Regressionstestreihe besteht.

## Bekannte Grenzen

- Verfügbare Browser-Abmessungen können je nach Drittanbieter-Ressource oder Verbindungsstatus fehlen; entsprechende Bilder erhalten eine neutrale Bewertung.
- URL-basierte Duplikaterkennung kann optisch identische Bilder auf völlig verschiedenen URLs nicht erkennen.
- Es findet keine Analyse von Gesichtsposition, Motiv, tatsächlicher Schärfe oder visuellen Bildinhalten statt.
- Mobile/WebGL-Darstellung und der vollständige Next.js-Build sollten auf einem System mit installierten Dependencies geprüft werden.
