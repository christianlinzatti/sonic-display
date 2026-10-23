# Sonic Display V345 – Multi-Photo Layout Studio

## Funktionen

- Opt-in-Modus für **mehrere Bildflächen** auf derselben Bühnengalerie (maximal acht).
- Jede Bildfläche mit unabhängigem Rahmen (x/y/Breite/Höhe), Bildzoom, Fokus x/y und optionaler Animation: Keine, Schweben, Pulsieren, Einblenden.
- Direktmanipulation in der Live-Vorschau mit Touch/Maus; rechte untere Ecke skaliert; Pfeiltasten verschieben die aktive Ebene, Shift + Pfeiltaste in 5-%-Schritten.
- Benannte Kompositionen pro 16:9, 1:1 und 3:4, browserlokal persistent. Speichern, Laden, Löschen.
- Verwendet die **echte** `StageImageGalleryV338` für Preview und Bühne, CSS-basiert ohne weitere Three.js-Objekte.
- Bestehende V338–V344-Galerie bleibt unverändert, solange die Option deaktiviert ist. V344-Rahmen bleibt äußeres Layout.
- Maximal acht Bildflächen, URL-Sanitizing aus V330; Credits aus V339 bleiben sichtbar. Fotos selbst werden nicht gespeichert.
- Bei Bildknappheit rotieren vorhandene Fotos; Slideshow bewegt die Quelle aller Slots, Collage/Einzelbild bleibt stabil.
- Bei `prefers-reduced-motion` oder reduzierte Bewegung sind die Layer-Animationen deaktiviert.

## Verwendung

1. Settings → Stage Content Plugins → Gallery Preview Editor öffnen.
2. Künstlerfotos laden oder HTTPS-URLs einsetzen.
3. Im Multi-Photo Layout Studio den Modus aktivieren.
4. „Einzelne Bilder direkt in der Vorschau bearbeiten“ einschalten; Bilder mit Maus/Touch ziehen oder über den Eckgriff skalieren.
5. Jede Fotoebene wählen, Fokus, Zoom und Animation einstellen.
6. Benannte Komposition speichern. Die Bühne verwendet die gespeicherte Komposition für das passende Bildschirmformat.

## Prüfungen

`npm run test:v345`, `npm run verify:offline`. Für den gesamten Next.js-Build: `npm install && npm run verify`.
