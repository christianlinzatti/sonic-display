# Sonic Display V204 – Advanced Footwork & Balance 2.0

Basis: V203. Neuer, deterministischer Anker pro Fuß in `advancedFootworkBalance.ts`, integriert in den vorhandenen IK-Solver `avatarFootIK.ts`.

- Anker wird beim Wechsel auf `planted` übernommen und nicht mehr pro Frame überschrieben.
- Gewichtete, gedämpfte Fußbindung während Kontakt und graduelles Lösen beim Abheben.
- Weltkoordinaten-Zielkorrektur ist nach Beinlänge begrenzt.
- Support-Balance und Landing-Smoothing werden beobachtet, ohne die Root-Position zu überschreiben.
- Beim Stoppen der Wiedergabe wird der Kontaktzustand zurückgesetzt.
- Fallback für GLBs ohne vollständige Knieketten bleibt erhalten.

**Grenzen:** Dies ist heuristische Zwei-Knochen-IK, keine physikalische Echtzeit-Simulation. Nicht alle GLB-Rigs haben gültige Knie-/Fußknochen. Kein samplegenauer Audiobeat. Eine vollständige Produktion-Build-Prüfung benötigt die npm-Abhängigkeiten.

Test: `npm run test:footwork-v204`.
