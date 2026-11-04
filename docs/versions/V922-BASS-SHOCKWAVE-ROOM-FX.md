# Sonic Display V922 – Bass Shockwave Room FX

## Funktionsweise

V922 ergänzt die vorhandene V909–V921-Govee-Kette um eine **optionale, wandernde Helligkeitswelle** für bereits ausgewählte Govee-LAN-Leuchten. Die Welle wird ausschließlich aus neu erkannten, tatsächlichen **Mikrofon-Bassimpulsen** der V917-Hüllkurve erzeugt. Der Mikrofon-Messwert muss aktuell sein (jünger als 1,5 s). Kein Mikrofon, keine Wiedergabe, unsichtbarer Browser-Tab, Trackwechsel oder fehlende Daten: kein zusätzlicher Impuls.

V922 benötigt keine Änderung des Raspberry-Pi-Bridgeskripts und kein weiteres Protokoll. Es gibt **keine RGBIC-Segmentsteuerung**, keine individuellen Lichtpixel, keine neuen On/Off-Kommandos und keine Stroboskopfolge. Der bestehende V909-Sender sendet weiter mit einem Mindestabstand von 900 ms (bzw. bei abgeschaltetem V917/V922 wieder mit 1700 ms). Deshalb ist die Welle eine langsame, sichtbare Rauminszenierung – keine pro Beat garantierte oder samplegenaue Lichtshow. Bei Hardtekk mit sehr schneller Kickfolge werden Kicks zusammengefasst oder ausgelassen.

### Geräte und Richtung

Die **Reihenfolge der ausgewählten Geräte** unter **Einstellungen → Govee LAN** definiert die räumliche Reihenfolge. Sie wird nicht automatisch aus GPS, Bluetooth oder einem Standort ermittelt. Für vier Geräte sind die Wellenfronten:

| Modus | Reihenfolge der aktivierten Lampen (Positionen 1–4) |
| --- | --- |
| Links → rechts | 1 → 2 → 3 → 4 |
| Rechts → links | 4 → 3 → 2 → 1 |
| Mitte → außen | 2 & 3 → 1 & 4 |
| Außen → Mitte | 1 & 4 → 2 & 3 |

### Einstellungen

Unter **Einstellungen → Govee LAN → V922 Bass Shockwave Room FX**:

- **Aktiviert:** ab Werk *aus*. Zusätzlich muss die Govee-Musiksynchronisierung aktiviert und die Mikrofonanalyse aktiv sein.
- **Intensität:** 0–100 %, Standard 60 %.
- **Auslöseschwelle:** 25–90 %, Standard 45 %, bezogen auf die ermittelte Kick-Hüllkurve.
- **Wellenrichtung:** vier Modi, Standard links → rechts.
- **Zeitabstand pro Geräteposition:** 180–750 ms, Standard 340 ms.
- **Ausklang einer Position:** 900–2600 ms, Standard 1500 ms.
- **Mindestabstand zwischen Wellen:** 1800–5000 ms, Standard 2200 ms.
- **Maximale Helligkeitsverstärkung:** 0–12 Punkte, Standard +9.
- **Vorschauzeit:** ein Regler simuliert die Welle ohne Netzwerkzugriff.

Die Berechnung nutzt den bestehenden V917-Basserkenner auch dann, wenn **nur V922** aktiviert wurde; die V917-Helligkeitsverstärkung bleibt dabei selbständig ausgeschaltet. Eine V922-Welle braucht *keine* selbst aktivierte V917-Einstellung. Die Bassquelle ist trotzdem ausschließlich die aktive Mikrofonanalyse.

### Integration und Prioritäten

V922 übernimmt die Ausgabe der V921-Kamera-/Lyrics-Lichtregie, ergänzt eine kleine Helligkeitswelle und führt **zuletzt die V915-Gruppendimmung** durch. So behalten deine eigenen V912–V916-Farben, V914-Übergänge, V919-/V920-Dramaturgie und Gruppenobergrenzen Vorrang. Die Helligkeit kann weder über 100 % noch über den bisherigen Master-Obergrenzen plus die ohnehin vorhandene Sicherheitsreserve liegen; kein Verdunkeln als Schockwellen-Effekt. Der vorhandene V911-Übergangsschutz begrenzt darüber hinaus Änderungen auf höchstens sieben Helligkeitspunkte pro LAN-Befehlsdurchlauf.

Eine synchronisierte dreidimensionale Schockwelle ist **nicht** zwingend dasselbe Ereignis wie die V922-Mikrofonerkennung: Die vorhandenen virtuellen V810-/V881-/DanceFX-Effekte haben eigene Trigger. Es gibt in V922 keine falsche Behauptung von framegenauem Synchronlauf oder Hardware-Latenzmessung. Die LAN-Verzögerung hängt von der tatsächlichen Hardware ab.

### Datenschutz und Rückwärtskompatibilität

Browserlokaler Schlüssel: `sonic-display:govee-shockwave-v922`. Es werden ausschließlich V922-Effektwerte gespeichert, **keine IP-Adressen, Tokens oder Spotify-Daten**. Die V910-Pi-Bridge und alle bisherigen V909–V921-Funktionen bleiben unverändert verfügbar. Die Implementierung ist stateless/pure bis auf den bestehenden Client-Hook und das lokale Setting-Speicherverfahren.

## Tests

```
npm run test:v922
npm run test:v922:types
npm run test:v922:ui-types
npm run verify:v922:focused
```

Die V922-Regressionssuite prüft 34 Gruppen und 5.000 deterministische Wellenzustände. Die vollständige CI muss nach `npm ci` zusätzlich den produktiven TypeScript-Check und `next build` ausführen. Ohne reale, angeschlossene Govee-Leuchten kann die Zeitverzögerung nicht kalibriert werden.
