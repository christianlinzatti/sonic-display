# V924 – Intelligent Light Energy Director

**Basis:** V923 Neon Pulse Experience · **Funktionsstand:** 04.11.2026

V924 bringt eine zusätzliche **opt-in-Lichtdramaturgie** in Sonic Display. Der Director verteilt die *zusätzliche* Raumlichtenergie über die vorhandenen, bestätigten Songabschnitte und vermeidet repetitiv gleich starke Hooks und Drops. Er verändert ausschließlich Helligkeitswerte – nicht die RGB-Werte, gespeicherten V912-Shows, die V916-Vorlagen oder die Definition von V915-Gerätegruppen.

## Bedienung

Unter **Einstellungen → Govee LAN → V924 Intelligent Light Energy Director**:

1. Bestehende Govee-LAN-Konfiguration und Musik-Synchronisierung einrichten.
2. Die V911-Konzertlichtregie und V919 Verse/Hook/Drop-Regie aktivieren. In V318 für den aktuellen Track echte Songphasen mit ausreichender Zuverlässigkeit importieren.
3. **V924** separat aktivieren. Sie ist standardmäßig **aus** und schaltet weder Mikrofon noch Leuchten eigenständig ein.
4. Den Regiestil auswählen: **Balanced**, **Cinematic** (ruhigere Verse) oder **Festival** (intensivere Hooks und Builds).
5. **Stärke** (0–100 %), **Kontrast** (0–100 %), **maximale Helligkeitsänderung** (0–12 Punkte), **Erholungsfenster** (15–90 s) und **Mindest-Konfidenz** (50–95 %) einstellen.
6. Die künstliche, eindeutig beschriftete **Offline-Vorschau** für Deutschrap, Hardtekk, Hardstyle und Deutschrock ausprobieren; sie sendet keine LAN-Befehle.

## Funktionsprinzip

- **Verlässlichkeit:** V924 verlangt einen passenden aktuellen `analysis.trackId`, endliche Songposition, aktive V919-Entscheidung, exakt passende aktuelle Songphase und deren Konfidenz. Fehlt etwas, geschieht nichts.
- **Songenergie:** Verse und Breaks dämpfen die zusätzliche Lichtenergie; Hooks und Drops heben sie begrenzt an. In bestätigten Builds steigt sie über den Abschnitt hinweg kontinuierlich.
- **Peak-Fatigue:** Je mehr bestätigte Hook-/Drop-Zeit innerhalb der letzten 15–90 Sekunden lag, desto geringer wird die zusätzliche Verstärkung bei unmittelbar folgenden Höhepunkten. Nach ruhigen Passagen wird das Energiebudget wieder frei. Die vorhandenen Show-Presets bleiben unabhängig davon aktiv.
- **Musikstil:** Die bekannten Genrefamilien werden mit einem *kleinen* Faktor berücksichtigt; ein unbekanntes Genre verwendet den sicheren Standard.
- **Sicherheit:** RGB wird niemals überschrieben, keine zusätzlichen LAN-Timer, keine Power-/Strobe-Befehle und keine RGBIC-Segmentkommandos. Die vorhandene V911-Glättung bleibt aktiv.
- **Reihenfolge:** V917–V923 erzeugen wie bisher einen kombinierten Licht-Look. V924 legt die reine Helligkeitsdynamik darüber. **V915-Gruppendimmung wird zuletzt angewendet**, danach V911-Glättung und der ursprüngliche V909-Kommandopfad.
- **Pause/Trackwechsel:** Die bestehende V909-Sendeschleife stoppt bei Pause/verstecktem Tab; V924 erzeugt keine eigenen Zustandstimer oder Netzwerkaufrufe.

## Code

- `lib/goveeLightEnergyV924.ts`: Normalisierung, Storage, deterministische Peak-Dämpfung, Anwendung und Offline-Vorschau.
- `components/GoveeLightEnergyStudioV924.tsx`: Einstellungen, aktuelle Statusinformation und Vorschau der Songdramaturgie.
- `components/GoveeMusicSyncV909.tsx`: V924 in den einen bestehenden LAN-Sendedurchlauf integriert.
- `components/GoveeLanPanelV909.tsx`: Editor eingebettet.
- `tests/v924-govee-light-energy-regression.cjs`: 40 Testgruppen und 5.000 deterministische Lichtzustände.
- `tests/tsconfig.v924-{core,ui}.json`: isolierte TypeScript-Prüfungen.
- CI: `.github/workflows/v832-continuous-validation.yml`, `package.json`-Scripts.

## Tests

```bash
npm run test:v924
npm run test:v924:types
npm run test:v924:ui-types
npm run verify:v924:focused
npm ci
npm run typecheck
npm run build
```

**Produktionshinweis:** Ein erfolgreicher vollständiger Next.js-Build ist in der Ausführungsumgebung **nicht verifiziert**; `npm ci --offline` scheitert hier am fehlenden Cache-Paket `zustand@5.0.16`. Vor Deployment müssen `npm ci`, vollständiger TypeScript-Check und Produktionsbuild in CI erfolgreich durchlaufen. Echte Reaktionszeiten und sichtbare Dynamik auf H6063/H610B/H61A2/H6051 müssen an der Govee-/Pi-Hardware geprüft werden. `package.json.version` verbleibt aus Kompatibilitätsgründen bei `0.1.0-v908`; V924 ist der Funktionsstand.
