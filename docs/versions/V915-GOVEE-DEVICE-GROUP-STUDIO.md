# Sonic Display V915 – Govee Device Group Studio

V915 erweitert die Govee-Konzertbeleuchtung aus V909–V914 um **eigene Gruppen**. Die Weboberfläche läuft wie bisher auf **Vercel**, Chromium und die lokale V910-Bridge auf demselben **Raspberry Pi**. Auf dem Pi wird **keine neue Bridge** benötigt.

## Neue Funktionen

- **V915 Govee Device Group Studio** unter **Einstellungen → Govee LAN**, oberhalb des bestehenden V912 Show Editors. Maximal zwölf Gruppen, bis zu 32 Govee-LAN-Adressen; jede Leuchte darf höchstens einer Gruppe angehören.
- Gruppen erstellen, umbenennen und löschen; ausgewählte Geräte über Touchscreen-freundliche Checkboxen zuordnen. Wird ein Gerät einer anderen Gruppe zugeordnet, entfernt der Editor es aus der bisherigen Gruppe.
- **Synchron (gemeinsame Farbe/Cue):** Alle aktuell ausgewählten Gruppenmitglieder benutzen denselben V911-Konzertcue oder den V914-Cue des *ersten ausgewählten Gruppenmitglieds* aus einer aktivierten V912-Show. Für Synchron-Gruppen ist die gemeinsam verwendete Rolle einstellbar. Überblendungen, Songphasen und Beat-Regeln bleiben erhalten.
- **Individuell (eigene Farben/Rollen):** Alle Leuchten behalten die jeweilige V911-Geräterolle und die eigenen V912/V914-Cues. Der Gruppenregler senkt ihre Helligkeit gemeinsam ab.
- **Gruppenhelligkeit 10–100 %** des geplanten Lampenwerts (begrenzt durch den allgemeinen Master). Die Gruppenfunktion verstärkt nie über den Masterregler hinaus, sendet von sich aus keine Ein-/Ausschaltbefehle und startet keine Strobe-/Full-Flash-Effekte.
- **Vorschau pro Gruppe und Songphase** (Ambient, Verse, Hook, Build-up, Drop, Break) mit den aktuellen Farben und Helligkeiten. Diese Anzeige ist rein lokal und sendet keine Netzwerkbefehle.
- **Manuelle Gruppenbefehle** Farbe, Helligkeit sowie ausdrücklich angefordertes Ein-/Ausschalten an die gespeicherten, ausgewählten Gruppenmitglieder. Jede manuelle Aktion **deaktiviert die laufende automatische Musiksynchronisierung**, bevor sie gesendet wird. Die Bridge gibt nicht an, ob ein UDP-Paket vom Gerät umgesetzt wurde.
- **Gruppen speichern / Verwerfen**, JSON-Export und -Import. Entwürfe ändern die Live-Show erst nach dem Speichern. Ein Import bleibt zur Sicherheit zunächst deaktiviert, damit du geänderte IP-Adressen prüfen kannst.

## Einrichtung und Verwendung

1. Die vollständige V915-Projektdatei auf Vercel deployen; die V910-Govee-Bridge auf dem Raspberry Pi unverändert lassen.
2. Auf dem Pi in Chromium Sonic Display öffnen. Unter **Einstellungen → Govee LAN** die vier Geräte H6063, H610B, H61A2 und H6051 suchen, auswählen und den Bridge-Token konfigurieren.
3. In **V915 Govee Device Group Studio** eine Gruppe erstellen, Mitglieder zuweisen, **Individuell** oder **Synchron** auswählen und die Gruppenhelligkeit festlegen.
4. **Gruppen speichern** wählen. Für die automatische Gruppensteuerung zusätzlich **Gruppen bei aktiver Musik-Synchronisierung verwenden** aktivieren und wieder **Gruppen speichern** wählen. Auch die bestehenden Schalter **Govee-Lichtintegration aktivieren** sowie **Zur Musik synchronisieren** müssen eingeschaltet sein.
5. Optional: **V911 Lichtregie** und eine gespeicherte **V912/V914-Lichtshow** aktivieren. V915 verwendet deren Cue-Planung ohne eigene Songphasen zu erfinden.
6. Für manuelle Gruppenbefehle die Bridge verbinden und eine bereits **gespeicherte Gruppe** verwenden. Bei ungespeicherten Änderungen sind diese Aktionen deaktiviert.

**Beispiele für deine Leuchten:** „Bühne“ mit H6063 und H61A2 im Modus **Synchron**; „Rhythmus“ mit H610B und „Ambient“ mit H6051 im Modus **Individuell**. Das sind Vorschläge, keine automatisch angelegten Zuordnungen. Mit nur einem Gerät pro Gruppe gibt es zwischen Synchron und Individuell keinen Unterschied.

## Sicherheit, Migration und Grenzen

- Gruppendaten werden ausschließlich im `localStorage` des verwendeten Chromium-Browsers gespeichert: `sonic-display:govee-device-groups-v915`; Standard **deaktiviert**. Kein Govee-Token im Gruppen-Export.
- Die importierten Mitglieder sind private IPv4-Adressen. Beim Gerätewechsel und bei DHCP-IP-Änderungen müssen sie geprüft bzw. aktualisiert werden. Geräte ohne gespeicherte Gruppe bleiben unverändert.
- Nur das offizielle Govee-LAN-Protokoll mit *gesamter Leuchte* und RGB/Helligkeit. **Keine RGBIC-Segmentsteuerung**, keine Synchronisation auf Frame-Ebene und keine Garantie für eine hardwaregenaue Lichtausführung.
- V910-Bridge bleibt auf `127.0.0.1:8765` gebunden, Chromium und Bridge laufen auf demselben Pi. Vercel selbst hat keinen Zugriff auf dein privates Govee-WLAN.
- Gruppenbefehle werden weiterhin höchstens mit dem vorhandenen Live-Takt (ca. 1700 ms pro Sequenz) aktualisiert; pro Gerät folgen mehrere UDP-Befehle. Für technische Genauigkeit und echte Latenz ist ein Test auf der tatsächlichen Pi-Hardware nötig.
- Die durch alte V908-Regressionen erwartete `package.json`-Versionszeichenfolge `0.1.0-v908` bleibt unverändert; V915 ist der Feature-Stand.

## Testbefehle

```bash
npm run test:v915
npm run test:v915:types
npm run verify:v915:focused
npm ci --no-audit --no-fund
npm run typecheck
npm run build
```

V915 testet Eingabevalidierung, private IPv4, exklusive Mitgliedschaft, gerätebezogene Opt-in-Regeln, Gruppen-Dimmer, Synchron-/Individual-Cues, Import/Export ohne Geheimnisse, manuelle Befehle und deren Vorrang sowie 3.000 genre-/phasenbezogene Beleuchtungskombinationen. In GitHub Actions gibt es einen zusätzlichen isolierten Test-/Typecheck-Schritt; der vollständige `prebuild` startet weiterhin mit den bestehenden V908-Prüfungen und anschließend V915.

**Bekannte Validierungslücke:** In der Ausführungsumgebung sind die React-/Next.js-Pakete nicht installiert. Der vollständige Projekt-Typecheck und Next.js-Produktionsbuild sind deshalb noch nicht erfolgreich nachgewiesen; nach Installation in CI erneut prüfen. Ein physischer Raspberry Pi und echte Govee-LAN-Leuchten standen für die Prüfung nicht zur Verfügung.
