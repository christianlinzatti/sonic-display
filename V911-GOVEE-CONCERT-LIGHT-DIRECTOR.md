# V911 – Govee Concert Light Director

## Was ist neu?

V911 ergänzt die bestehende V909/V910-Govee-Integration in Sonic Display. Die **Web-App bleibt auf Vercel**, die **Govee-LAN-Bridge V910 läuft auf dem Raspberry Pi** mit Chromium und Touchscreen. Es gibt **keinen neuen Netzwerkdienst und keine neue Cloud-Anbindung**.

Die Govee-Geräte bekommen unterschiedliche Rollen. Govee LAN steuert nur *ganze Leuchten* (Farbe, Helligkeit), keine einzelnen RGBIC-Pixel oder gerätespezifischen Szenen:

| Modell | Standardrolle | Beispiel in Deutschrap / Hardtekk |
| --- | --- | --- |
| H6063 | Bühnenwand (`wall`) | dunkle Bühne im Verse, stärkere Fläche in der Hook |
| H610B | Rhythmus (`rhythm`) | dezente Bassakzente bei aktivem Mikrofon |
| H61A2 | Neon (`neon`) | eigene Akzentfarben, ruhige Überblendungen |
| H6051 | Ambient (`ambient`) | stabile Raumstimmung, bewusst weniger Bassreaktion |

Die Zuordnung wird aus der in der Bridge erkannten Modellnummer vorgeschlagen. Unter **Einstellungen → Govee LAN → V911 Concert Light Director** kann pro ausgewählter IP eine andere Rolle gewählt werden. Für unbekannte Modelle wird zunächst Ambient verwendet. Die manuelle Rollenzuordnung bleibt im Browser gespeichert.

## Einrichtung / Nutzung

1. Auf dem Raspberry Pi die **V910 Bridge** nach deren separater Installationsanleitung einrichten; in Chromium deine echte HTTPS-Vercel-Seite öffnen und den einmaligen lokalen Netzwerkzugriff ausdrücklich zulassen.
2. In der Govee-App bei jeder Lampe prüfen, ob **LAN Control** angeboten und aktiviert ist. Alle Lampen und den Pi im selben erreichbaren Netz verwenden.
3. In Sonic Display auf dem Pi unter **Einstellungen → Govee LAN** den Bridge-Token eintragen, die Verbindung prüfen, Geräte suchen und deine H6063/H610B/H61A2/H6051 auswählen.
4. **Govee-Integration aktivieren** und **Zur Musik synchronisieren** einschalten. Danach separat **V911 Lichtregie aktivieren**. V911 ist bewusst standardmäßig aus.
5. Rollen und Stärke der Lichtregie festlegen. Die **Songphasen-Vorschau** ändert nur die Farbmuster im Browser, nicht die echten Lampen.
6. Für exakt benannte `verse`, `hook`, `build`, `drop`, `break`-Phasen bei einem bestimmten Song kannst du unter **Unified Track Analysis (V318)** eine passende Analyse-JSON importieren. Fehlen vertrauenswürdige Abschnittslabels, wird **keine erfundene Drop-Erkennung** durchgeführt: Die Leuchten spielen nur die dezente genreabhängige Ambient-Farbpalette.

## Lichtregie und Sicherheit

- **Verse:** gedämpfte Bühnenfarben, mehr Ruhe auf der H6051.
- **Hook:** mehr Helligkeit, getrennte Farbrollen.
- **Build-up:** zunehmende, aber begrenzte Dynamik; keine künstlichen Blitze.
- **Drop:** stärkere, aber nicht blitzartige Farbakzente, sanft begrenzte RGB- und Helligkeitsänderungen.
- **Break:** ruhiger und dunkler, ohne Leuchten auszuschalten.
- **Ohne verifizierte Songabschnitte:** gleichmäßige, nicht als Verse/Hook/Drop bezeichnete Ambient-Looks.

Bei neuen bestätigten Songabschnitten beginnt eine Überblendung von **3,2 s**. Leuchten werden maximal etwa alle **1,7 s** aktualisiert; Brightness und Farbkanäle ändern sich pro Telegramm nur begrenzt. **Keine automatische Power-Steuerung oder Stroboskope.** Ohne Mikrofon wird kein Basssignal vorgetäuscht. Automatische Steuerung pausiert bei gestopptem Titel oder ausgeblendetem Browser-Tab. Manuelle Eingriffe deaktivieren weiterhin Auto-Sync.

Unterschiedliche Leuchten sind unabhängig; eine nicht erreichbare Leuchte wird später erneut versucht. Der `127.0.0.1`-Token und die exakte Origin-Allowlist aus V910 gelten unverändert.

## Tests

```bash
npm run test:v911
npm run test:v911:types
npm run verify:v911:focused
npm run typecheck  # nur mit vollständigen npm-Abhängigkeiten
npm run build      # nur mit vollständigen npm-Abhängigkeiten
```

Die V911-Funktionstests prüfen Phasen- und Track-Isolation, die vier Geräteprofile, manuelle Rollen, Farbverläufe, manuelle Priorität und **1.500 deterministische Varianten**. Echtgeräte, Pi-GPU-Leistung und echter Chromium-Netzwerkzugriff sind erst vor Ort verifizierbar. Govee-UDP quittiert Farbkommandos nicht; „gesendet“ ist nicht gleich „an der Lampe bestätigt“.

**Versionierung:** Wegen bereits vorhandener V908-Regressionsguards bleibt das `package.json`-Versionsfeld bewusst `0.1.0-v908`. Die bereitgestellte Erweiterung ist der **Funktionsstand V911**, nicht eine bestätigte Hardwarefreigabe.
