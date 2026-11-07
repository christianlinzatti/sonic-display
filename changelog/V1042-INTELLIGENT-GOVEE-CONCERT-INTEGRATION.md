# V1042 · Intelligent Govee Concert Integration

Die V1040-Konzert-Timeline steuert erstmals eine zusätzliche, bewusst begrenzte
Govee-Farbregie für bis zu vier explizit konfigurierte LAN-Leuchten.

- Separater Opt-in-Schalter und maximale Akzentstärke 65 % im V1040-Showdesigner.
- Wiederverwendung der V1027-Zonen Wand, Rhythmus, Neon und Ambient ohne zweite Steuer-/Netzwerkschleife.
- Genre-Palette (Deutschrap, Hardtekk/Hardstyle, Deutschrock/NDH, Pop) und sieben Showabschnitte.
- Songposition wird relativ zur tatsächlichen Spotify-Dauer abgetastet; keine behauptete Abschnittserkennung.
- Nur durch V318 bestätigte Songphasen erlauben Akzente; ein geplantes Finale ist kein verifizierter Drop.
- Bisherige Helligkeits- und Gruppenobergrenzen werden niemals erhöht; pro LAN-Tick max. 12 RGB-Punkte zusätzlich.
- Manuelle/gespeicherte Govee-Shows, V1027-Layer, Sprachbefehle, Gruppen-Unison,
  Authored Stage, Raum-Atmosphäre, Reconnect und reduzierte Bewegung haben Vorrang.
- Bei fehlender oder unbekannter IP-Zuordnung, Pause, verstecktem Tab, fehlender Bridge oder
  fehlender bestätigter Phase ist der Layer vollständig inaktiv.
- Ohne bestehende lokale Govee-LAN-Bridge werden keinerlei Hardware-Befehle ausgeführt.

Die standardmäßig deaktivierte Funktion lässt sich im Showdesigner testen. Ein echter
Hardware-Verifikationstest ist separat mit den Govee-Leuchten erforderlich.
