# Sonic Display V866 – Genre-Aware Concert Show

## Gezielte Verbesserung

Der bereits integrierte V850-Festival-Show-Director bekommt je nach
**verifiziertem V810-Genre** einen musikalisch passenden Vordergrund:

- Deutschrap: Gesangsfokus in Verses, abwechselnd Gesang/LED bei Hooks.
- Hardtekk/Hardstyle: Abwechslung zwischen Laser, Partikel und LED bei Drops.
- Rock: Sänger und Bandbild in Verses/Hooks, wechselnde Finale-Akzente.
- Pop: LED-/Gesangsschwerpunkte mit variierenden Hook-Akzenten.
- Unbekannte Genres: bisherige V850-Logik unverändert.

Der Fokus rotiert ausschließlich auf Basis von Track-ID und **vorhandenem,
verifiziertem** Akt-Index. Die Abfolge ist reproduzierbar, auch bei Seeks.
V850 verändert nur die bereits geplanten automatischen FX-Gewichte (0–1),
aktiviert keine neuen Effekte und erzeugt keine neue Zeitquelle. Manuelle
V823-Effektspuren, Reduced Motion, Blackouts, unverifiziertes Audio und
manuelles Licht behalten Vorrang. Text/Avatare/Kamera werden nicht geändert.

## Tests und Grenzen

```powershell
npm ci
npm run test:v866
npm run test:v866:types
npm run test:v850
npm run test:v850:types
npm run test:smoke:v665:flat
npm run check:release:flat
npm run typecheck
npm run build:flat
```

Gezielte Funktionstests wurden in der Bearbeitungsumgebung ausgeführt.
Der gesamte TypeScript-Check und ein echter Next.js-Build müssen mit
installierten Abhängigkeiten noch bestätigt werden. Auch Windows-CI und
ein sichtbarer Browser/WebGL-Konzertdurchlauf sind offene Freigabegates.
