# Sonic Display V920 – Genre Adaptive Light Intelligence

**Stand:** 4. November 2026. Ausgangsbasis: V919 (Verse Hook Drop Lighting Director).

## Zweck

V920 verfeinert die schon bestehende V919-Helligkeitsdramaturgie für vier Genregruppen.
Die Farben, pro Phase gespeicherten Light-Shows und V914-Fades bleiben unangetastet.
Die Standardkonfiguration ist **aus** und ändert ohne Nutzeraktivierung keine Lampen.

| Live-Genre in Sonic Display | V920-Profil | Wirkung |
|---|---|---|
| `deutschrap`, `hiphop`, `trap`, `drill`, `boombap` | Deutschrap | Zurückhaltende Verse; stärkere Hooks und Drop-Akzente |
| `hardtekk`, `uptempo` | Hardtekk | Hohe Grundenergie; progressive Build-ups |
| `hardstyle`, `rawstyle`, `hardcore` | Hardstyle | Starke Build-/Drop-Kontraste; ruhigere Breaks |
| `rock`, `metal`, `poprock`, `indierock`, `alternativerock`, `punkrock` | Deutschrock | Arena-Hooks und breite Spannungssteigerung |
| Andere Genres, z.B. Pop, Ambient, Techno | Neutral | Keine V920-Zusatzwirkung; vorhandene Show bleibt unverändert |

Die Einteilung ist eine konservative Zuordnung der **bereits im Player vorliegenden Genre-ID**,
keine neue Genrekategorisierung aus Audio und kein Ersatz für die vorhandene Genreerkennung.

## Steuerungsreihenfolge

1. V911 bzw. die aktive V912–V916-Show erzeugen bestehende Farbe und Helligkeit.
2. V919 passt bei ausreichend verlässlichen importierten Songmarkierungen die Helligkeit an.
3. V920 setzt zusätzlich **nur** einen beschränkten, genreabhängigen Helligkeitsunterschied.
4. V917 Bassreaktion, V918 Beatvorhersage, V915-Gruppenregelung und V911-Smoothing behalten ihre Wirkung.
5. Die bestehende Bridge versendet nur die ohnehin geplanten LAN-Befehle – **keine zusätzlichen**.

V920 besitzt keine Strobe-, Flash-, Power- oder RGBIC-Segmentbefehle. Die Farbkanäle bleiben
unverändert. Positive Änderungen bleiben innerhalb der Helligkeitsgrenzen, einschließlich
maximal 10 zusätzlichen Punkten über der aktuellen Haupthelligkeit, sofern die vorherige
Lichtshow nicht ohnehin höher lag. Beim Break bleibt die Lichtstimmung sanft gedimmt.

## Einrichtung nach Vercel-Deployment

1. Im Raspberry-Pi-Kiosk die Vercel-App öffnen und unter **Einstellungen → Govee LAN**
   die lokale Bridge, ausgewählten Leuchten und automatische Konzertsteuerung konfigurieren.
2. **V919 Verse Hook Drop Lighting Director** ausdrücklich aktivieren und verlässliche,
   zum aktuellen Track passende Verse-/Hook-/Build-/Drop-/Break-Markierungen importieren.
3. **V920 Genre Adaptive Light Intelligence** aktivieren, Stärke (0–100 %), maximale
   Helligkeitsänderung (0–12 Punkte) und Mindestvertrauen (50–95 %) einstellen.
4. Genre und Songphase in der **offline-Vorschau** auswählen und die vier Leuchten vergleichen.
   Das Vorschau-Genre verändert das live erkannte Genre **nicht**.
5. In der aktuellen Songanzeige prüfen, ob eine echte V920-Phase bestätigt wurde.

Standardwerte: Aktivierung **aus**, Stärke **65 %**, Änderung maximal **10 Punkte**,
Mindestvertrauen **70 %**. Die V910-Raspberry-Pi-Bridge bleibt kompatibel.

## Kompatibilität und Testen

- V920 nutzt ausschließlich die vorhandene V318-Trackanalyse sowie die V919-Bestätigung.
- Kein anderer Track und keine zu unsichere oder fehlende Phasenmarkierung kann V920 aktivieren.
- Einstellungen werden im lokalen Browser gespeichert, ohne Bridge-Token oder IP-Adressen.
- Das JSON-Showformat der V912-Bibliothek wird nicht verändert.

```bash
npm run test:v920
npm run test:v920:types
npm run test:v920:ui-types
npm run verify:v920:focused
```

Für eine reale Freigabe zusätzlich auf einer vollständig installierten CI-Umgebung:

```bash
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

**Offene Prüfungen:** Produktiver Next.js-Build, echte Govee-Geräte H6063/H610B/H61A2/H6051
und Raspberry-Pi-LAN-Latenz. Testwerte in der Vorschau sind berechnet, nicht gemessen.
