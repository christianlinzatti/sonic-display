# V919 – Verse Hook Drop Lighting Director

**Basis:** Sonic Display V918 · Next.js auf Vercel, lokaler Raspberry-Pi-Govee-Bridge-Dienst aus V910.

## Ziel

V919 ergänzt die vorhandene V911-Konzertlichtregie um eine **optionale dramaturgische Helligkeitsebene** für fünf **importierte, eindeutig beschriftete und ausreichend sichere** Songabschnitte:

| Importierter Abschnitt | Lichtdynamik |
|---|---|
| Verse | Ruhiger, ca. 7,5 % schwächere Basis auf der stärksten Lichtrolle (vor Nutzerintensität) |
| Hook | Kräftigerer Raumeindruck, ca. 12 % mehr bei voller Stärke |
| Build-up | Sanft steigende Helligkeit über die dokumentierte Länge des Abschnitts |
| Drop | Einmaliger Helligkeitshöhepunkt am bestätigten Drop-Beginn, der über ca. sechs Sekunden moderat ausläuft |
| Break | Zurückhaltendere Raumbeleuchtung ohne automatische Abschalt- oder Blackout-Befehle |

H6063 (Bühne), H610B (Rhythmus), H61A2 (Neon) und H6051 (Ambient) erhalten unterschiedlich starke Modulation. Die Govee-LAN-Bridge beherrscht nur gewöhnliche RGB-/Helligkeitsbefehle für ganze Leuchten; V919 behauptet **keine segmentweisen RGBIC-Funktionen** oder internen Szenen.

## Sicherheits- und Vertrauensregeln

1. **Standardmäßig deaktiviert.** Zusätzlich müssen Govee, automatische Musiksynchronisierung und die V911-Konzertlichtregie eingeschaltet sein.
2. **Keine künstlichen Verse/Hook/Drop-Erkennungen.** Ohne passende V318-Abschnittsmarker, bei unsicheren Markierungen, bei Pausen, bei fremder Track-ID oder außerhalb der Trackdauer findet **keine V919-Modulation** statt.
3. Pre-Drop-Aufbau nur bei verifiziertem `build`, auf den direkt (Toleranz 100 ms) ein ebenfalls ausreichend sicherer `drop` folgt. Die beiden Konfidenzen müssen mindestens die eingestellte Schwelle erreichen. Ein Beat-/BPM-Signal allein gilt **niemals** als Drop-Marker.
4. Lichtfarben, V912-Show-Cues, V913-Farbharmonien, V914-Übergänge, V915-Gruppen, V916-Presets, V917-Bassimpulse und V918-Beat-Planung bleiben erhalten. Die Lichtmodulation wird **nach der Basis-Showberechnung und vor V917/V918** angewendet.
5. Nur Helligkeit, **keine** Power-, Blackout-, Stroboskop- oder Farbwechselbefehle. Maximale zusätzliche Helligkeit durch die V919-Ebene: `masterBrightness + maxExtraBrightness` (bisherige hellere Showwerte werden nicht nachträglich reduziert).
6. Die bisherige Netzwerkbegrenzung bleibt unverändert: bei aktiver V918-Vorhersage mindestens 900 ms zwischen LAN-Durchläufen; normale Fallback-Intervalle unverändert.
7. Keine Bridge-Zugangsdaten oder Spotify-Zugangsdaten in V919-Speicherwerten. Einstellungen bleiben browserlokal.

## Einstellungen

`Einstellungen → Govee LAN → V919 · Verse Hook Drop Lighting Director`

| Option | Vorgabe | Bereich |
|---|---:|---:|
| Aktiviert | Nein | Ein/Aus |
| Stärke | 65 % | 0–100 % |
| Mindestvertrauen | 70 % | 50–95 % |
| Pre-Drop-Fenster | 5.000 ms | 2.000–8.000 ms |
| Zusätzliche Helligkeit | +10 Punkte | +0 bis +15 Punkte |

Die Statuszeile zeigt, ob für den gerade laufenden Track eine ausreichende Abschnittsmarkierung existiert. Die visuelle Vorschau arbeitet ausschließlich **simuliert**, sendet keine Gerätebefehle und erweckt nicht den Eindruck, dass die angezeigte Phase live erkannt wurde.

## Integration / Dateien

- `lib/goveeSectionDirectorV919.ts`: sichere Einstellungen, Abschnittsfilter, deterministische Helligkeits-Planung und Offline-Vorschau.
- `components/GoveeSectionStudioV919.tsx`: Bedienoberfläche mit Ein-/Aus-Schalter, Slidern, Trackstatus und Rollenvorschau.
- `components/GoveeMusicSyncV909.tsx`: optionale V919-Überlagerung innerhalb der bereits bestehenden, gedrosselten LAN-Sendeplanung.
- `components/GoveeLanPanelV909.tsx`: Einstellungsintegration.
- `tests/v919-govee-section-director-regression.cjs`: 31 Testgruppen einschließlich 5.000 deterministischer Szenarien.
- `tests/tsconfig.v919-core.json`, `tests/tsconfig.v919-ui.json`: isolierte TypeScript-Prüfungen; die test-only Stub-Datei wird **nicht** ins produktive TS-Projekt geladen.
- `.github/workflows/v832-continuous-validation.yml`: V919-Checks vor dem Produktionsbuild für Linux und Windows.

## Tests

```bash
npm run test:v919
npm run test:v919:types
npm run test:v919:ui-types
npm run verify:v919:focused
npm ci
npx tsc --noEmit
npm run build
```

Die letzten drei Schritte erfordern alle npm-Pakete. In dieser Arbeitsumgebung fehlen vollständige React-/Next.js-Abhängigkeiten. Die isolierten TypeScript- und Funktionstests ersetzen **keinen** vollständigen Produktionsbuild.

## Vercel / Raspberry Pi

Das vollständige V919-Projekt auf Vercel deployen. Die bestehende V910-Bridge auf dem Raspberry Pi kann unverändert weiterlaufen. Aktuelle Hardware-Fähigkeit, reale LAN-Latenz und sichtbare Effekte müssen später mit den vier konkreten Govee-Leuchten geprüft werden.
