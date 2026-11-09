# V1146 – Govee per Alexa dimmen und umfärben

Neue Sprachbefehle:
- „Alexa, sage Sonic Display, stelle Govee Helligkeit auf 40 Prozent“
- „Alexa, sage Sonic Display, stelle Govee auf Blau“
- „Alexa, sage Sonic Display, mache Govee Licht Warmweiß“

Die Helligkeit ist auf ganze Zahlen **1–100** begrenzt; Farben sind nur Rot, Blau, Grün, Violett, Türkis, Orange, Weiß und Warmweiß. Unbekannte Farben oder Zahlen werden bereits in Lambda abgewiesen und nochmals im signierten Relay und Browser geprüft.

## Sicherheit und Bedienung

Separate, standardmäßig **ausgeschaltete** V1146-Freigabe unter **Einstellungen → Alexa → V1146**. Die vorhandene globale Alexa-Freigabe bleibt nötig. Ohne Spotify unterstützt der eng begrenzte V1139 Govee-Empfänger auch diese Befehle – nur mit dem separaten Receiver-Token. Nur aktuell ausgewählte Govee-LAN-Leuchten (maximal 32) werden angesprochen; keine beliebigen IPs, freie RGB-Eingaben oder Hardware-Ein/Aus-Befehle. Die ausgehenden Änderungen laufen ausschließlich über die bestehende LAN-Bridge und werden nicht automatisch wiederholt.

Eine manuelle Farb- oder Helligkeitsänderung stoppt Musik-Sync bis zur expliziten Reaktivierung. Ein vom UDP-Socket gesendeter Befehl ist keine bestätigte Hardware-Zustandsänderung; echte Bestätigung über die manuelle Statusabfrage V1140/V1144.

Alexa-Sprachmodell und Lambda müssen nach dem GitHub-Deployment separat im Alexa Developer/AWS-Konto veröffentlicht werden.
