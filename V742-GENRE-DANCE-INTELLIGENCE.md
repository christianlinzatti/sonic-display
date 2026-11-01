# Sonic Display V742 – Genre Dance Intelligence

## Funktion

Genre Dance Intelligence erweitert die seit V735 vorhandenen prozeduralen Hüftbewegungen,
**nicht** die in GLBs gebackenen Animationen. Fünf Stilprofile stehen bereit:

| Genre | Verse | Hook | Drop |
|---|---|---|---|
| Deutschrap | Hüftschwingen, einzelne Kreise | Kreisen und Schwingen | Bounce-Akzente |
| Hardtekk | Kreise und Bounce | Bounce mit Kreisvarianten | Bounce und Kreise |
| Hardstyle | Bounce mit zurückhaltendem Sway | überwiegend Bounce | Bounce |
| Rock | Gewichtsschwingen, gelegentlicher Bounce | Sway und Bounce | rhythmischer Bounce |
| Pop | Sway und Kreise | wechselnde fließende Kombinationen | Bounce und Kreise |

Intro, Break und Outro verwenden ein zurückhaltendes `Hip_Sway`-Profil. Die Auswahl erfolgt
**deterministisch** in acht Beats langen Phrasen. Weiche Übergänge kommen
vom vorhandenen V738-Hip-Motion-Studio.

## Bedienen

Unter **Einstellungen → Dance Studio → Hüftbewegungen → Genre Dance Intelligence · V742**
kannst du Aktivierung, Stil (Auto oder manuell) und Genre-Einfluss (0–100 %) wählen.
Die Funktion greift ausschließlich bei **Hüftbewegung = Auto**. Ein unbekanntes Genre
wird nicht geraten: Die bisherige V735-Automatik bleibt aktiv.
In der Vorschau stehen nun auch Rock und Songabschnitte zur Auswahl.

## Grenzen

- Keine neuen Knochen, Morph-Targets, GLB-Clips oder Hautgewichte.
- Kein eigener IK-Solver: vorhandene IK und Bewegungsgrenzen gelten weiterhin.
- Keine separate Bass-/Kick-Erkennung (V743 vorgesehen).
- Browser-/echtes-Avatar-GLB-Rendering muss mit installierten Abhängigkeiten erfolgen.

## Prüfen

```bash
npm ci
npm run test:v742
npm run test:v742:types
npm run verify:v742
```

Der `verify:v742`-Befehl umfasst frühere Motion-Regressionen, den vollständigen
TypeScript-Gesamtcheck und Next.js-Produktionsbuild.
