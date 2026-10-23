# V338 – Multi-Image Galleries (ohne QR-Codes)

## Enthalten

- Diashow (Standard; 7 Sekunden pro Bild), 2×2-Collage oder Einzelbild.
- Einstellbare Intervalle (3–30 s) und maximal 1–12 Bilder, gemeinsam für Künstlerfotos und Konzertplakate.
- Benutzt bestehende 3D-Leinwände, die V333-Layouts, V334-Scheduling und V331/V332-Live-Push-Funktionen.
- Blendet Bilder aus, die nicht geladen werden können. HTTPS-Prüfung und URL-Deduplizierung im Client.
- Bei `prefers-reduced-motion` bzw. eingeschränkter Animation nur das erste Bild.
- Keine QR-Codes.

## Aktivierung

Unter `Settings → Dynamic Stage → Stage Content Plugins → V338 – Bildergalerien` aktivieren und Modus, Sekunden und Bildanzahl wählen. Für Künstlerfotos muss die Quelle `Fotos`, für Konzertplakate die Quelle `Konzerte` eingeschaltet sein.

## Antwortformat für eigene Fotos-API

```json
{
  "title": "Bilder des Künstlers",
  "images": [
    "https://example.org/artist-photo-1.jpg",
    "https://example.org/artist-photo-2.jpg"
  ]
}
```

Die API muss über eine lokale `/api/...`-Route im selben Next.js-Projekt eingebunden werden. Externe Bilder müssen HTTPS verwenden und vom Browser geladen werden können.

## Konzert-API

```json
{
  "title": "Nächste Konzerte",
  "events": [
    {
      "date": "2026-12-12",
      "title": "Musterkonzert",
      "venue": "Beispielhalle",
      "city": "Wien",
      "posterUrls": [
        "https://example.org/concert-1.jpg",
        "https://example.org/concert-2.jpg"
      ]
    }
  ]
}
```

Die eingebauten öTicket- und Ticketmaster-Adapter sammeln alle tatsächlich vorhandenen gültigen Bild-URLs. Gleiche URLs werden entfernt. Wenn nur ein Motiv vorhanden ist, bleibt die Ansicht bei diesem Bild. Spotify liefert für viele Künstler nur **ein Motiv in mehreren Auflösungen**. Für echte zusätzliche Künstlerfotografien ist ein weiterer lizenzierter Bildanbieter oder eine eigene Foto-API erforderlich.

## Teststatus

`npm run verify:offline` erfolgreich bis V338. Ein vollständiger Next.js-Produktionsbuild und visueller Browsertest waren ohne installierte npm-Abhängigkeiten nicht möglich; auf der lokalen Maschine `npm install && npm run verify` ausführen.
