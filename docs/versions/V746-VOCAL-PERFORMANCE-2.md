# Sonic Display V746 – Vocal Performance 2.0

Basis: V745 – Multi-Avatar Dance Sync.

## Änderungen

- Zusätzliche, anatomisch begrenzte Kopf-, Brust- und Arm-Mikroakzente für
  Wort-Zeitmarken, die die bestehende Lippen- und Gesichtssteuerung verarbeitet.
- Deutschrap erhält stärkere, aber begrenzte Betonungen; Hooks und Drops
  eine leichte Zusatzintensität.
- Der Director arbeitet ohne eigene Timer oder Render-Loops, nutzt dieselbe
  Songzeit wie die Lippenanimation und wird vor Hand-/Fuß-IK in den vorhandenen
  Rig-Overlay-Prozess eingefügt.
- Bei mehreren Performern ist eine explizite, für den aktuellen Track gültige
  Gesangszuordnung erforderlich. Der V745-Lead ist keine Gesangszuordnung.
  Ohne sichere Zuordnung werden keine V746-Zusatzgesten gesetzt.
- Pause, Reduced Motion, nur zeilenbasierte oder fehlende Wort-Zeitmarken,
  ausgeschaltete Body-Performance sowie manuelle Animationen haben Vorrang.
- Einstellungen unter Avatar > Vocal Performance 2.0 V746:
  Aktivierung, Gesamtstärke, Kopf, Gesten und Deutschrap-Akzente.

## Fachliche Grenzen

Keine Sprecherdiarisierung, Stem-Separation oder phonemgenaue Audiodaten.
Wortzeitmarken sind Lyrics-Schätzungen, kein Nachweis der tatsächlichen
Stimmquelle. Avatar-v2-GLB und Hautgewichte werden nicht verändert. Die
Einzelavatar-Vorschau simuliert V746 noch nicht; ein realer Render-Test
muss im Live-Stage-Browser erfolgen.

## Nachprüfung

```powershell
npm ci
npm run test:v746
npm run test:v746:types
npm run verify:v746
```
