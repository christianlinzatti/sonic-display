# V564 – Natural Deutschrap Performance

- **Live-GLB:** Verwendet die vorhandene zeitgestempelte V472–V538-Rap-Kette. Nur bestätigte Wort-Zeitfenster erlauben V564-Zusatzbewegungen; bei mehreren Avataren ist eine trackgebundene Besetzungszuordnung Voraussetzung. Keine neue Stimmerkennung.
- **Mundbewegungen:** V562-Vokal-/Kieferkalibrierung bleibt Eigentümer der Mund-Morphs und Kieferknochen. Der neue Zusatzkanal bewegt ausschließlich Kopf-/Nacken- bzw. Oberkörper- und Oberarmknochen.
- **Dichte Rap-Parts:** Dämpfen kurze Gesten. Hook kann dezent stärker sein. Alle Winkel sind begrenzt; die vorhandene additive Engine glättet und entfernt eigene Rotationen und respektiert importierte Mixer-Clips sowie Foot-IK.
- **Vorschau:** Im GLB-Modus kann man eine **klar simulierte Rap-Körperdemo** mit einem Schalter und 0–100-%-Stärke vergleichen. Kein tatsächliches isoliertes Gesangssignal. In Gesangs- und Song-Modi bleibt diese Demo ausgeschaltet, um keine Gesangsbeats oder Sprecher zu erfinden.
- **Raspberry Pi:** Keine neuen Lichtquellen, Shadow Maps, Shader, Timer oder zusätzliche useFrame-Schleifen; im Low-Tier ist die GLB-Körperdemo aus.
- **Offen:** Vollständiger Next.js-Build, WebGL-Vergleich an realen GLBs und Messungen auf Raspberry Pi-Hardware.

Die V564-Demo verwendet dieselbe **simulierte** 4,1-Hz-Rap-Artikulationsphase wie V370 für einen minimalen Kopfakzent. Das ist kein echtes Tempo oder Vocal-Tracking.
