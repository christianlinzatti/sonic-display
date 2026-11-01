# V669 – Universal Automatic Concert Show Director

## Neu
- In die bestehende V502/V654-Konzertregie integrierte, deterministische Genreakzente für Tanz, Kamera und reaktives Licht. Kein weiterer Renderer oder Timer.
- Profile: Rap, Rock/Deutschrock, Metal/NDH, Pop, Hard-Dance, Electronic, ruhige Musik und neutraler Fallback.
- Von V600/V604 bestätigte Abschnitte erhalten einen phasenweise eingeblendeten Akzent; ohne bestätigte Zeitmarken nur sehr geringe kontinuierliche Musikenergie-Akzente. Keine behaupteten Hooks oder Sängeridentitäten.
- Manuelle Choreografie, Kameratimeline/-studio, Rap-Kamera-Keyframes und abgeschaltete reaktive Beleuchtung verhindern Eingriffe in ihre Kanäle. Reduced Motion, Low-Tier und Pausen deaktivieren V669.
- Lyrics und importierte Songabschnitte werden nicht verändert.
- Automatisch aktiv bei bestehender eingeschalteter Smart-Concert-Regie; keine zusätzliche Einrichtung pro Song.
- Prüffähige Attribute `data-v669-style`, `data-v669-evidence`, `data-v669-chapter` am Bühnencontainer.

## Grenzen
- Bestehende Kamerawahl und Stages werden **nicht** durch einen zweiten V669-Entscheider ersetzt. V669 moduliert ihre vorhandenen Stärken.
- Die genaue Songstruktur bleibt ohne importierte/belegte Zeitmarken unbekannt.
- Keine Audio-Rohdaten aus Spotify; keine neue Stimmenerkennung.
- Der endgültige Next.js-Build und reale Browser-/GLB-Qualitätsprüfungen sind separat erforderlich.
