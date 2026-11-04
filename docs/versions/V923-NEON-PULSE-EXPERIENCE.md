# Sonic Display V923 – Neon Pulse Experience

## Funktionsumfang

V923 erweitert die bestehende Govee-LAN-Konzertlichtregie (V909–V922) um **optionale, langsame Neon-Farbbewegungen für ganze Leuchten**. V923 ist keine RGBIC-Segmentanimation und enthält keine Stroboskop-, On/Off- oder zusätzlichen LAN-Befehle. Die vorhandene V910-Raspberry-Pi-Bridge bleibt unverändert.

### Modi

| Modus | Funktion | Quelle |
|---|---|---|
| **Neon Flow** | Farbton und Helligkeitsakzent wandern allmählich zwischen ausgewählten Leuchten | Tatsächlicher Musikfortschritt, nicht die Systemuhr |
| **Neon Breath** | Ruhige Helligkeitsbewegung mit langsamen Farbüberblendungen | Tatsächlicher Musikfortschritt |
| **Neon Bass** | Dezentes, mit dem gemessenen Bassimpuls abklingendes Neonlicht | Nur **frischer**, bestätigter Mikrofon-Kick aus V917 |

In den Modi Flow und Breath wird aus der Songposition lediglich eine langsame Lichtanimation berechnet. Das ist **keine behauptete musikalische Beat- oder Drop-Erkennung**. Der Bassmodus setzt dagegen laufende Mikrofonanalyse voraus. Ältere oder stehende Messwerte lösen keine neuen Impulse aus. Bei Pause, Tab im Hintergrund oder Songwechsel wird die automatische Steuerung gestoppt beziehungsweise die alte Bass-Hüllkurve verworfen.

### Farben und Gruppen

- **Zum Genre passend:** Deutschrap – Violett/Blau; Hardtekk – Cyan/Violett; Hardstyle – Blau/Violett; Deutschrock – Amber/Rot; unbekannt – Violett/Cyan.
- **Manuell:** Violett/Cyan, Pink/Blau und Amber/Rot.
- **Gerätebereich:** Standardmäßig nur Rolle `neon` (typischerweise H61A2). Optional alle im Govee-Panel ausgewählten Leuchten (H6063, H610B, H61A2, H6051). Die Positionen entsprechen der Reihenfolge dieser Geräteliste, **keine automatisch erkannte Raumgeometrie**.
- **Farbmischung:** 0–35 %, zusätzlich skaliert mit Stärke und aktueller Wellenphase. Die gespeicherten Show- und Gruppenfarben werden nicht überschrieben.
- **Helligkeit:** Maximal 0–8 zusätzliche Punkte, durch Master-Helligkeit begrenzt. Die **V915-Gruppendimmung erfolgt zuletzt**.
- **Glättung:** Bei aktivem V923 übernimmt V911 die sanfte schrittweise Begrenzung der Änderung, auch wenn der ältere V911-Director selbst nicht aktiv ist.

### Einstellungen

In **Einstellungen → Govee LAN → V923 Neon Pulse Experience**:

| Parameter | Standard | Zulässig |
|---|---:|---|
| Aktivierung | Aus | An/Aus |
| Modus | Neon Flow | Flow / Breath / Bass |
| Palette | Genreabhängig | Genre / drei feste Paletten |
| Leuchten | Nur Neon-Rolle | Neon / alle |
| Stärke | 60 % | 0–100 % |
| Maximale Farbmischung | 22 % | 0–35 % |
| Wellenperiode | 8.500 ms | 4.000–18.000 ms |
| Versatz zwischen Leuchten | 380 ms | 0–1.200 ms |
| Maximaler Helligkeitszuschlag | 6 Punkte | 0–8 Punkte |

Einstellungen werden im Browser (`localStorage`) gespeichert und zwischen geöffneten Tabs synchronisiert. Die Vorschau erzeugt rein lokale, synthetische Werte. **Nur „V923 aktivieren“ und eine bereits aktive Govee-Musikautomatik** lassen die Wirkung live einfließen. Zusätzliche Mikrofonrechte werden durch V923 selbst nicht angefordert.

## Integration und Prioritäten

1. V909/V911/V912/V914 berechnen das grundlegende Geräte-Look; V913/V916 liefern Farbkonzepte/Presets, sofern im Show-Editor gespeichert.
2. V919/V920 liefern optional verifizierte Songphasen- und Genre-Helligkeit.
3. V917/V918 ergänzen ausschließlich echte bzw. nachweisbar verlässliche Mikrofonakzente.
4. V921 gleicht an tatsächlich gerenderte Bühnen-Cues an, V922 ergänzt bei gemessenen neuen Bass-Hits eine Wellenfront.
5. V923 ergänzt auf dem **ungedimmten** resultierenden Look eine behutsame Neon-Mischung.
6. **V915 gruppiert/dimmt danach**. V911 glättet die fertige Farbe/Helligkeit. Der **einzige bestehende V909-LAN-Dispatcher** sendet nur bei sichtbarer Änderung.

Bei deaktiviertem V923 läuft der bisherige `roomLook` unverändert durch. Es werden keine bestehenden Lichtshows, Gerätegruppen oder Presets automatisch geändert. Das alte 1700-ms-Intervall bleibt für normale Beleuchtung; ein aktivierter, echter Neon-Bassmodus verwendet das bereits vorhandene **900-ms-Bassintervall**. V918 kann bei verlässlicher Beatphase kürzer lokal prüfen, die unabhängige Hardware-Befehlsbegrenzung bleibt bestehen.

## Technische Grenzen

- LAN-Geräte werden mit ganzen RGB-Werten und einer Helligkeit angesteuert. Weder pixelgenaue H61A2-Segmente noch verlässliche sub-sekündliche Hardwareanimationssynchronität werden versprochen.
- Keine zusätzlichen Datenquellen, Serverdienste oder Govee-Cloud-API nötig.
- Das Verhalten hängt vom Browser, der Audio-/Mikrofonberechtigung, der Pi-Bridge und der echten Reaktionszeit des Geräts ab.
- Ein **vollständiger Next.js-Produktionsbuild und Hardwaretests** sind in dieser Umgebung noch **nicht verifiziert**. Die fokussierten Prüfungen sind in `V923-VERIFICATION.md` dokumentiert.

## Dateien

- `lib/goveeNeonPulseV923.ts`: reine, getestete Einstellungs-, Farbwellen- und Helligkeitsfunktionen.
- `components/GoveeNeonPulseStudioV923.tsx`: Editor und lokale Vorschau.
- `components/GoveeMusicSyncV909.tsx`: eine zusätzliche opt-in Berechnung, keine neue Netzwerkschleife.
- `components/GoveeLanPanelV909.tsx`: UI-Einbindung.
- `tests/v923-govee-neon-pulse-regression.cjs`: 31 Testgruppen und 5.000 deterministische Fälle.
- `tests/tsconfig.v923-core.json`, `tests/tsconfig.v923-ui.json`: isolierte TypeScript-Prüfungen.

Zum Prüfen: `npm run test:v923`, `npm run test:v923:types`, `npm run test:v923:ui-types`.
