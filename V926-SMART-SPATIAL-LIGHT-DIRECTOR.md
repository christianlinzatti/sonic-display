# V926 – Smart Spatial Light Director

**Basis:** Sonic Display V925. **Feature-Status:** implementiert; reine Funktionsregressionen und isolierte TS-Prüfungen durchgeführt. Next.js-Produktionsbuild und echte Govee-/Pi-Hardware noch nicht verifiziert.

## Funktionen

V926 speichert die **relative Position** jeder für die LAN-Musiksynchronisierung ausgewählten Leuchte als X-/Y-Koordinate im Browser. Das ist kein GPS und keine automatische Raummessung: X=0 links, X=1 rechts; Y=0 an der Bühne, Y=1 beim Publikum. Positionen lassen sich über einen schematischen, per Tastatur auswählbaren Raumplan, Geräte-Dropdown und zwei Slider festlegen. Raumvorlagen: **Vier Ecken**, **Bühne → Publikum**, **Kreis im Raum**. Die Oberfläche verwendet die Geräte aus der vorhandenen V909-Bridgeliste; unbekannte gespeicherte IPs können ebenfalls ausgewählt werden.

Sechs Richtungen:
- Links → rechts
- Rechts → links
- Bühne → Publikum
- Publikum → Bühne
- Im Uhrzeigersinn (Beginn entlang der Bühnenachse oben)
- Gegen den Uhrzeigersinn (Beginn entlang der Bühnenachse oben)

Die neue, langsame V926-Raumwelle verwendet **tatsächliche relative X/Y-Werte** statt allein der Reihenfolge der Konfiguration. Farbnuancen und Intensitäten variieren mit **Deutschrap, Hardtekk, Hardstyle und Deutschrock**, während gespeicherte Showfarben als Basis erhalten bleiben. Einstellungen: Intensität (0–100%, Standard 55), Farbmischung (0–30%, Standard 14), zusätzliche Helligkeit (0–8 Punkte, Standard 5) und langsame Wellenperiode (3,5–16 s, Standard 7,8 s). Keine echten Strobe-, Blitz- oder Powerbefehle.

### Integration in bisherige Effekte

- **V922 Bass Shockwave Room FX:** Die bereits vorhandene Schockwelle verwendet bei aktivierter V926 den räumlichen Rang statt des bisherigen Listenindex. Ein Bassimpuls wird weiterhin ausschließlich von echter, frischer Mikrofonanalyse ausgelöst. V926 erzeugt selbst keine neuen Kicks.
- **V923 Neon Pulse:** Bewegung und Geräteversatz folgen bei aktivierter V926 der räumlichen Reihenfolge, ohne einen neuen Sende-Timer einzurichten.
- **V925 Festival FX:** Arena-Sweeps, symmetrische Lichtwellen und Farbfronten bekommen den räumlichen Rang. Eine bestätigte V919-Drop-Markierung bleibt für das Drop-Finale weiterhin erforderlich.
- **V915 Device Groups:** Bei Gruppentyp `unison` wird die räumliche Quelle der Gruppe für alle Mitglieder verwendet. Die Helligkeitsbegrenzung der Gerätegruppe wird **nach** allen V926-Effekten und **vor** der vorhandenen V911-Glättung angewendet.
- **V912–V924**: bisherige Showbibliotheken, Farben, Beam-Fades, Genre- und Konzertdirektoren bleiben unverändert gespeichert.

V926 nutzt **denselben** `/command`-Sendeaufruf in `components/GoveeMusicSyncV909.tsx` wie zuvor. Keine eigenen Netzwerkzugriffe, API-Endpunkte, Audio-Sampler oder schnelleren LAN-Befehlsintervalle. Die räumliche Darstellung wirkt über ganze Leuchten, **nicht** über einzelne LEDs oder RGBIC-Segmente.

## Bedienung

1. Raspberry Pi V910 Bridge wie bisher verbinden, Govee-Geräte suchen oder manuell hinzufügen und die gewünschten Leuchten auswählen.
2. **Einstellungen → Govee LAN → V926 Smart Spatial Light Director** öffnen.
3. Eine der drei Raumvorlagen wählen und die Positionen der tatsächlichen H6063, H610B, H61A2 und H6051 anpassen. Die oberen Bereiche des Raumplans stehen für die Bühne, die unteren für das Publikum.
4. Wellenrichtung wählen. Im Vorschaufenster die simulierte Songzeit und das Genre variieren; die Vorschau sendet **keine** LAN-Befehle.
5. V926 optional aktivieren und **Raumaufstellung speichern** wählen. Vorher beeinflussen Entwürfe **nicht** die Live-Beleuchtung.
6. Für echte Effekte: bereits bekannte Govee-LAN-Musiksynchronisierung (V909) aktivieren; bei Mikrofon-basierten Shockwaves muss die Mikrofonanalyse eingeschaltet und verlässlich sein. Die V926-Raumwelle selbst ist eine langsame, songzeitbasierte Bewegung und **keine Beatvorhersage**.

Falls die Geräte nicht umgestellt werden, bleibt die Funktion deaktiviert und die bisherige V925-Steuerung erhalten.

## Datensicherheit und Kompatibilität

Browser-localStorage Schlüssel `sonic-display:govee-spatial-director-v926` (Ereignis `sonic-display:govee-spatial-director-changed-v926`). Schema: `govee-spatial-director-v926`; bis zu 32 gültige private IPv4-Geräte, Positionen in 0–1 mit maximal drei Dezimalstellen. Gespeichert werden nur relative Positionen, Einstellungen und lokale Geräte-IPs: **kein Bridge-Token oder Passwort**. Fehlerhafte Daten führen zur sicher deaktivierten Standardkonfiguration. Daten liegen **pro Browserprofil**; bei Gerätewechsel die Positionen erneut einstellen. Es wird keine automatische externe Sicherung erzeugt.

Die Positionen liefern einen geometrisch plausiblen **Ablauf**, aber nicht automatisch eine physikalisch exakt kompensierte Ausbreitung: Netzwerkverzögerungen und unterschiedliche Ansprechzeiten der vier Govee-Modelle sind mit echter Hardware zu kalibrieren.

## Dateien

- `lib/goveeSpatialDirectorV926.ts` – reine Platzierungs-, Sortierungs-, Farb- und Helligkeitsberechnungen; Speicherung.
- `components/GoveeSpatialStudioV926.tsx` – Raumplan, Presets, manuelle Koordinaten, Vorschau, Entwurf speichern/verwerfen.
- `components/GoveeMusicSyncV909.tsx` – vorhandener V909-Sender mit optionalem V926-Routing und einem zusätzlichen, schwach begrenzten Raumlicht-Akzent.
- `components/GoveeLanPanelV909.tsx`, `app/globals.css` – UI-Integration.
- `tests/v926-govee-spatial-regression.cjs`, `tests/tsconfig.v926-core.json`, `tests/tsconfig.v926-ui.json` – Funktionstests und isolierte TS-Checks.
- `package.json`, `.github/workflows/v832-continuous-validation.yml` – CI- und Prebuild-Gates.
- Die schmalen älteren V920/V923/V924/V925-Textregressionen akzeptieren jetzt opt-in V926-Indizes und den zusätzlichen State-Eintrag; die eigentlichen Berechnungen laufen unverändert weiter.

## Prüf- und Deployment-Hinweis

`npm run test:v926` · `npm run test:v926:types` · `npm run test:v926:ui-types` · `npm run verify:v926:focused` (umfangreiche verschachtelte Kette). Vor produktivem Deployment **vollständige CI, `npm run typecheck` und `npm run build`** erfolgreich abschließen. Fehlende Abhängigkeiten im verwendeten Container, insbesondere nicht zwischengespeichertes `zustand@5.0.16`, verhindern eine entsprechende Bestätigung hier.
