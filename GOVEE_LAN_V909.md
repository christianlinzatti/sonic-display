# V909 · Govee LAN in Sonic Display

## Was die Integration kann

- **Komplett lokal:** UDP-Scan, Gerätestatus, Power, Helligkeit, RGB und Farbtemperatur; kein Govee-Cloud-API-Key und kein Govee-Login in Sonic Display.
- **Geräteerkennung:** Multicast `239.255.255.250:4001`, optional Broadcast und manuelle private Geräte-IP; Antworten auf UDP `4002`, Steuerung an UDP `4003`.
- **Einstellungen → Govee LAN:** Bridge-Verbindung, Geräteliste, Mehrfachauswahl, Ein/Aus, Farbe, Helligkeit, Gerätestatus und opt-in-Musikautomatik.
- **Musikautomatik:** Genrebasierte Farbwelt und sanfte Bass-Helligkeit. Ohne Mikrofon ist der Beat **geschätzt**, keine echten Spotify-Audiobänder. Maximal ein Sync-Durchlauf alle 550 ms; kein schneller Strobo. Wird bei Pausen, versteckten Tabs oder ausgeschalteter Automatik nicht weiter gesendet. Manuelle Befehle deaktivieren die Automatik, bis sie wieder eingeschaltet wird.
- Aktuelle LAN-API steuert die **gesamte** Leuchte. Segment- und Szenenfunktionen benötigen modellabhängige/proprietäre Erweiterungen und gehören noch **nicht** zu V909.

## Voraussetzungen

1. Prüfen, ob deine Govee-Modelle die offizielle LAN-Steuerung unterstützen: https://app-h5.govee.com/user-manual/wlan-guide
2. Govee Home → Gerät → Einstellungen → **LAN Control aktivieren**. Gerät muss über WLAN mit demselben lokalen Netzwerk wie die Bridge verbunden sein.
3. Auf dem **Computer, der den Sonic-Display-Browser ausführt**, Node.js 22+ und Projektdateien bereitstellen. Für Windows-Terminal im Projektverzeichnis:

   ```powershell
   npm run govee:bridge
   ```

   Diese Bridge verwendet nur eingebaute Node.js-Module und benötigt **kein** `npm install`. Das Terminal geöffnet lassen. Der Token wird beim ersten Start erzeugt, privat in `~/.sonic-display/govee-bridge-token` gespeichert und bei weiteren Starts wiederverwendet.
4. In Sonic Display **Settings → Govee LAN** öffnen, Bridge-Adresse `http://127.0.0.1:8765` und Token aus dem Terminal eintragen, **Verbindung prüfen** wählen.
5. **Leuchten im LAN suchen** → Geräte auswählen → **Lichter EIN** → **Farbe senden**. Erst danach bei Bedarf die zwei Opt-in-Schalter für die Musikautomatik aktivieren.

## Wenn Sonic Display auf Vercel gehostet wird

Vercel kann Geräte in einem privaten WLAN nicht direkt via UDP erreichen. Deshalb läuft die Bridge **lokal** (nicht als Vercel-Serverless-Funktion). Für eine Sonic-Display-Seite auf `https://meinprojekt.vercel.app` den tatsächlichen Origin explizit freigeben:

```powershell
npm run govee:bridge -- --origin https://meinprojekt.vercel.app
```

Der Browser, der die Seite öffnet, muss denselben Host wie die Bridge verwenden, weil die Bridge aus Sicherheitsgründen nur auf `127.0.0.1:8765` lauscht. Der Loopback-Bezug `127.0.0.1` meint immer **das Gerät, auf dem der Browser läuft**, nicht den Vercel-Server und auch nicht deinen Windows-PC, wenn du von einem anderen Handy aus zugreifst.

Aktuelle Browser können bei HTTPS→localhost-Verbindungen eine Berechtigung für Zugriffe auf das lokale Netzwerk verlangen. Diese Berechtigung musst du ggf. erteilen. Nicht alle Browser/Umgebungen erlauben den Zugriff; für fremde Geräte wäre später eine bewusst abgesicherte HTTPS-Bridge oder ein lokaler Proxy nötig. **Port 8765 nicht am Router ins Internet weiterleiten.**

## Netzwerk & Sicherheitsgrenzen

- Local Bridge HTTP-Port: `127.0.0.1:8765` (nur auf dem lokalen Host); Govee UDP-Ziel 4001/4003, lokale Antworten 4002.
- Im Router **Client Isolation / Gastnetz-Isolierung** deaktivieren bzw. Bridge und Lichter im gleichen WLAN/Subnetz zulassen. Firewall: UDP eingehend 4002, ausgehend 4001 und 4003.
- Die Bridge akzeptiert ausschließlich RFC1918-private IPv4-Adressen, prüft jedes Kommando, erfordert bei jedem API-Aufruf einen Token und verwendet eine Web-Origin-Allowlist. Standardmäßig sind nur `http://localhost:3000` und `http://127.0.0.1:3000` freigegeben; Vercel-Origin ausschließlich per `--origin ...`/`GOVEE_BRIDGE_ORIGINS=...`.
- Konfiguration einschließlich Bridge-Token wird für den Komfort **lokal im Browser** gespeichert. Browser und lokale Bridge deshalb nur auf vertrauenswürdigen Geräten verwenden. Der Bridge-Token ist **nicht** der Govee-Cloud-API-Key.
- UDP-Steuerbefehle besitzen keine zuverlässige Bestätigung. „Befehl gesendet“ bedeutet nicht „Lampe hat umgeschaltet“. „Gerätestatus lesen“ kann eine Statusantwort anzeigen.
- **Sicherheitsgrenze:** Govees dokumentiertes LAN-Protokoll authentifiziert die UDP-Pakete selbst nicht. Personen im selben Netzwerk können kompatible Leuchten potenziell auch mit eigenen UDP-Paketen steuern; vertrauenswürdiges WLAN/VLAN verwenden.

## Diagnose

- Scan leer → LAN Control am Gerät prüfen, gleiches Subnetz, UDP 4002, IGMP/multicast-Filter des Routers. Andernfalls IP manuell eintragen; bei Bedarf eine DHCP-IP-Reservierung im Router einrichten.
- „Origin nicht freigegeben“ → mit `--origin https://deine-domain` neu starten (Schema/Host exakt).
- „Bridge antwortet nicht“ → `npm run govee:bridge` läuft? URL und Browser-Local-Network-Berechtigung prüfen.
- `EADDRINUSE` UDP 4002 → andere Software nutzt bereits den Govee-Antwortport. Konkurrierendes Programm beenden, keine zweite Bridge parallel starten.
- Manuelle Steuerung funktioniert, Automatik nicht → beide Govee-Opt-in-Schalter an, Leuchten ausgewählt, Spotify-Titel läuft, Seite im Vordergrund. Mit Mikrofon können echte lokale Audioimpulse verwendet werden.

## Tests

```bash
npm run test:v909
npm run test:v909:types
npm run check:syntax
npm run typecheck
npm run build
```

Die V909-Tests prüfen Protokollpakete, IP-Validierung, Kommando-Validierung, TypeScript/TSX-Syntax, Genreplanung sowie einen echten lokalen HTTP-Bridge-Start mit Token/CORS/Private Network Access. Die eigentliche Govee-Lampe kann nur in deinem eigenen WLAN geprüft werden.

## V910 – Erweiterung für Raspberry Pi + Vercel

Der Bridge-Dienst kann jetzt mit dem idempotenten Installer `node scripts/pi/install-v910.cjs --url https://DEINE-VERCEL-DOMAIN` als systemd-Benutzerdienst und labwc-Chromium-Kiosk eingerichtet werden. Unter V910 wird der Token bei systemd-Starts nicht in das Journal geschrieben; mit `npm run pi:token` wird er einmalig im privaten Terminal angezeigt. Mehr unter [V910-RASPBERRY-PI-VERCEL-GOVEE-README.md](V910-RASPBERRY-PI-VERCEL-GOVEE-README.md).
