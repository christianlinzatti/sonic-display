# V912 – Visual Govee Light Show Editor

## Neue Funktionen

V912 erweitert **V911 Govee Concert Light Director** um einen visuellen Editor in **Einstellungen → Govee LAN → V912 Visual Govee Light Show Editor**.

- Bis zu **12 eigene Lichtshows** erstellen, auswählen, duplizieren, umbenennen und löschen.
- Pro ausgewählter Leuchte (LAN-IP) und Songphase **RGB-Farbe (ganze Leuchte)**, **Helligkeit (20–100 %)** und **Übergangsdauer (1,2–12 Sekunden)** festlegen.
- Phasen: **Ambient, Verse, Hook, Build-up, Drop, Break**.
- **Berührungsfreundliche Vorschau** aller ausgewählten Leuchten und Regler zum Simulieren eines Phasenübergangs (0–100 %). Die Vorschau sendet *keine* LAN-Befehle.
- **JSON-Export und -Import** der gesamten Lichtshow-Bibliothek (ohne Bridge-Token). Importiert werden nur gültige, begrenzte Show-Daten. Import deaktiviert vorsichtshalber die Live-Nutzung, bis die Geräte-IP-Zuordnung kontrolliert wurde.
- Geänderte Shows wirken erst nach dem Klick auf **Änderungen speichern**. Die gespeicherten Shows liegen in der `localStorage`-Bibliothek des jeweiligen Browsers auf der jeweiligen Vercel-Domain.

### Vorgehensweise

1. **Vercel:** Vollständige V912-Version deployen. **Raspberry Pi:** die V910-Bridge weiterbetreiben; keine Änderung an der Bridge erforderlich.
2. Govee-App: LAN Control bei den kompatiblen H6063/H610B/H61A2/H6051 aktivieren; in Chromium auf dem Pi die Vercel-App öffnen. Den Bridge-Token und den localhost-Zugriff wie bei V909/V910 einrichten.
3. Unter **Einstellungen → Govee LAN** die Leuchten verbinden und auswählen.
4. Im V912-Bereich Name eingeben → **Neue Show erstellen**. Die Leuchte, die Songphase, Farbe, Helligkeit und Übergang einstellen.
5. Mit den Übergangsreglern die Farbverläufe visuell prüfen, anschließend **Änderungen speichern**.
6. Erst bei Bedarf **Govee-Lichtintegration**, **Musiksynchronisierung**, **V911 Lichtregie** sowie separat **Gespeicherte V912-Lichtshow verwenden** aktivieren.
7. Wechsel des Browsers/Geräts: JSON exportieren, auf dem Zielbrowser importieren und die dort gültigen Geräte-IPs nachkontrollieren. Der Bridge-Token muss dort separat eingegeben werden.

### Zuverlässigkeit und Grenzen

- Die neue Software verwendet weiterhin nur die **V909/V910 lokale Bridge** mit Token, lokaler Origin-Allowlist und einem erlaubten `127.0.0.1`-Endpunkt. Keine Cloud-API erforderlich.
- Keine RGBIC-Einzelsegmente, keine proprietären Govee-Szenen, kein Stroboskop und keine automatischen Ein-/Aus-Befehle. Die V911-Ratenbegrenzung auf ca. **1,7 Sekunden pro Poll** und die begrenzten Änderungen von RGB/Helligkeit bleiben aktiv.
- **Nur verifizierte Songabschnitte der aktuellen V318-Trackanalyse** aktivieren Verse/Hook/Build/Drop/Break; sonst wird ausschließlich ein Ambient-Look gespielt. Es werden keine Songabschnitte erfunden.
- Die selbst gewählte Helligkeit wird durch den globalen Master-Regler nach oben begrenzt. Für die automatische Lichtregie gilt weiterhin eine Schutz-Untergrenze von 20 %.
- Bei fehlenden Farben für einzelne Geräte/Phasen wird auf die V911-Lichtregie zurückgegriffen. Bei geänderter LAN-IP müssen die Cues für die neue IP in der Show ergänzt werden.
- Vorschau und Bearbeitung kommunizieren **niemals** mit der Bridge. Inaktiv, pausiert oder im versteckten Browser-Tab erfolgt keine automatisierte Lichtsteuerung. Manuelle Befehle unterbrechen den Musik-Automatikmodus.
- Der Pi rendert weiterhin Chromium/3D lokal, auch wenn die Web-App über Vercel geladen wird. Echte Hardware-Latenz, Bildrate und LAN-/Chromium-Berechtigungen müssen auf der Hardware geprüft werden.

### Tests

```bash
npm run test:v912
npm run test:v912:types
npm run verify:v912:focused
npm run typecheck        # braucht vollständige npm-Installation
npm run build            # braucht vollständige npm-Installation
```

Die V912-Regression umfasst **14 Testgruppen**, inklusive **2.500 deterministischer Lichtberechnungen**, Bibliothek/JSON-Sanitizing, Helligkeitsbegrenzungen, Übergängen, Track-Isolation und Bestätigung, dass der Editor keine Netzwerkkommandos verschickt. Der V912-Core wird unter strengem TypeScript separat geprüft. Die bestehende V909–V911-, V907- und V908-Regression bleibt als focused gate integriert. V912 wurde zusätzlich in die GitHub Actions CI und in `prebuild` aufgenommen; dort bleibt der V908-Test bewusst an erster Stelle.

**Release-Grenze:** Der vollständige `npm run typecheck`/Next.js-Produktionsbuild ist hier wegen nicht verfügbarer `next`, `react` und anderer `node_modules` **nicht erfolgreich nachweisbar**. Vor dem produktiven Deploy muss `npm ci && npm run typecheck && npm run build` in CI bzw. auf einer vollständigen Build-Umgebung fehlerfrei durchlaufen. Die Geräte selbst wurden in dieser Umgebung nicht angesprochen.

**Versionierung:** `package.json` bleibt aus Kompatibilitätsgründen `0.1.0-v908` (vorhandene Version-Guards). **V912** ist die neue Funktions- und Dokumentationsversion.
