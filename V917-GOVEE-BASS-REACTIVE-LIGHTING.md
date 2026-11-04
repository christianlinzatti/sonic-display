# Sonic Display V917 – Bass Reactive Lighting 3.0

V917 erweitert die V916-Preset-Bibliothek, die V915-Lichtgruppen und den V912–V914-Show-Editor um eine **optionale, mikrofonbasierte Bassreaktion** für die Govee-LAN-Bridge. Die Webanwendung bleibt auf **Vercel**; auf dem Raspberry Pi laufen Chromium und die bestehende V910-Govee-Bridge. **Kein Bridge-Update nötig.**

## Neu

- **Mikrofon-Gate:** Bassakzente werden nur berechnet, wenn die V917-Einstellung aktiv ist **und** die reale Mikrofonanalyse ein aktives Signal liefert. Aus Spotify-Zeitposition, Genres oder geschätzten Beats werden keine V917-Kicks erfunden.
- **Bass/Kick-Onset-Erkennung:** gewichtete Kombination aus `bass`, `kick` und `beatStrength`, adaptive Rauschuntergrenze und eine Mindestpause zwischen erkannten Impulsen. Gleichbleibender Dauerton erzeugt keine fortlaufenden Fake-Kicks.
- **Anstieg und Ausklang:** eine begrenzte, exponentiell fallende Helligkeitshüllkurve (500–2.200 ms). Kein Blitzen, keine automatischen Power-Kommandos.
- **Rollenabhängige Intensität:** H610B/Rhythmus reagiert am stärksten; H61A2/Neon und H6063/Bühne moderat; H6051/Ambient zurückhaltend. Manuell geänderte V911-Rollen gelten weiterhin.
- **Voreinstellungen:** getrennte Regler für Stärke (0–100 %), Erkennungsschwelle (20–85 %), Mindestabstand (250–1.200 ms) und Ausklang (500–2.200 ms). Standardmäßig ausgeschaltet.
- **Rücksicht auf Govee-LAN:** Mikrofonwerte werden im Browser lokal ungefähr alle 120 ms abgetastet. Netzwerkbefehle werden auch bei aktivierter V917-Basssteuerung höchstens einmal pro ~900 ms *pro globalem Tick* geplant; langsame Geräte/Anfragen und mehrere Leuchten können weitere Verzögerungen erzeugen. Ein Hardtekk-Song mit schnellen Kicks lässt sich damit **nicht kickgenau 1:1** als Hardware-Lichtshow reproduzieren.
- **Sichere Vorschau:** 4 Rollen mit Beispielleuchtstärke. Vorschau sendet **keine** Befehle.
- **Rückwärtskompatibilität:** V912-Showformat, V913-Farbpaletten, V914-Übergänge, V915-Gruppen und alle V916-Presets bleiben unverändert. Das Basslicht wird über den berechneten Lichtlook gelegt, **bevor** die V915-Gruppenhelligkeit angewandt wird. Die bestehende Power-Steuerung bleibt eine gesonderte manuelle Funktion.

## Einrichtung

1. Vollständige V917-Projekt-ZIP deployen, z. B. über Vercel. Keine neuen Bridge-Endpunkte oder API-Schlüssel nötig.
2. Auf dem Raspberry Pi die V910-Govee-Bridge ausführen und die App in Chromium öffnen. Vorhandene gespeicherte Leuchten H6063, H610B, H61A2, H6051 weiterverwenden.
3. **Einstellungen → Audio**: Mikrofon aktivieren und Browser-Mikrofonberechtigung erteilen. Das Mikrofon muss vom Raspberry Pi bzw. Browser tatsächlich geöffnet sein und die Musik hörbar erfassen.
4. **Einstellungen → Govee LAN**: Bridge verbinden, Leuchten auswählen, **Govee-Lichtintegration** und **automatische Musik-Synchronisierung** aktivieren.
5. **V917 Bass Reactive Lighting 3.0** aktivieren. Mit ca. 55 % Stärke, 40 % Schwelle, 420 ms Mindestabstand und 900 ms Ausklang starten.
6. Im Editor die reine Vorschau und später den echten Betrieb vergleichen. Bei zu vielen Akzenten den Schwellenwert erhöhen; bei zu wenig sichtbarer Reaktion leicht erhöhen, ohne den maximalen Helligkeitsschutz aufzuheben.

**Hinweis zur Browser-Sicherheit:** Das lokale Bridge-Endpoint `http://127.0.0.1:8765` funktioniert für Chromium auf *demselben* Pi. Bei Vercel → localhost ist eine Browserberechtigung für lokale Netzwerke bzw. Loopback nötig. Die Bridge ist nicht öffentlich erreichbar und darf nicht ungeschützt freigegeben werden.

## Datenschutz und Sicherheit

- Einstellungen liegen im lokalen Browser unter `sonic-display:govee-bass-v917`. Es werden nur fünf Zahlen/Schalter gespeichert – **kein Mikrofonmitschnitt**, kein Bridge-Token und keine Track-IDs.
- Der V917-Kern nutzt keine Web-/Netzwerkzugriffe; nur die bestehende V909-Bridge sendet Look-Befehle. Bei Pause, verborgenem Tab, deaktiviertem Mikrofon oder deaktivierter V917-Funktion wird die Hüllkurve zurückgesetzt.
- Farbberechnungen aus V911/V914 und Gruppenhelligkeit aus V915 bleiben erhalten. Die Veränderung ist auf maximal 16 zusätzliche Helligkeitspunkte je nach Rolle/Stärke begrenzt; der globale Deckel `masterBrightness+12` gilt weiterhin.
- Der offiziell dokumentierte LAN-Transport unterstützt ganze Leuchten, insbesondere **RGB und Helligkeit**. Diese Version implementiert weder einzeln adressierbare RGBIC-Segmente noch native Govee-Szenen.
- Das Paketversionsfeld in `package.json` ist aus Kompatibilitätsgründen weiterhin `0.1.0-v908`; V917 bezeichnet den Funktionsstand.

## Tests

```bash
npm run test:v917
npm run test:v917:types
npm run test:v917:ui-types
npm run verify:v917:focused
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

Die V917-Prüfungen umfassen 24 Testgruppen und 4.000 deterministische Berechnungen. Die fokussierte Kette umfasst ältere Govee-Versionen sowie V907/V908 und Syntax-/Architekturregressionen.

**Offene Prüfungen:** Der vollständige `npm run typecheck` wurde ausgeführt, scheitert aber an fehlenden React-/Next- und weiteren Projektabhängigkeiten. `npm run build` wurde angestoßen, blieb im langen Prebuild-Regressionslauf hängen und wurde nicht erfolgreich abgeschlossen. Der Offline-Cache dieser Ausführungsumgebung ist unvollständig. Keine Govee-Hardware- und Raspberry-Pi-Latenzmessung durchgeführt. Der isolierte UI-Typecheck arbeitet mit einem **ausschließlich in der V917-Testkonfiguration** verwendeten React-/Audio-Stubs und ersetzt keinen Next.js-Produktionsbuild.
