# V689 – Professional Lighting Director

**Schwerpunkt:** Eine gemeinsame Lichtdramaturgie der bereits vorhandenen Effektquellen, ohne die Bühne mit weiteren Lampen oder Shader-Pässen zu belasten.

## Technische Umsetzung

- Die reine Funktion `planProfessionalLightingDirectorV689` verwendet ausschließlich die von V636/V604 bestätigte Song-Regie und denselben Playback-Stand. Bei ungesicherten oder widersprüchlichen Abschnitten bleibt die neue Stufe neutral.
- `ConcertAtmosphereRendererV308.tsx` nutzt den Score für seine zwei vorhandenen Moving Heads, zwei additive Beam-Shafts und zwei Haze-Flächen. Bestehender Sänger-Fokus bleibt unverändert, die neuen Aim-Abweichungen wirken ausschließlich bei nicht zugewiesenen Spots.
- `ConcertDetailStageV555.tsx` nutzt denselben Score **nach** V636/V621/V602 und **vor** V640 für die bereits existierenden Boden-Gobos, Pixel-LEDs, eine Nebelebene und einen preiswerten Sweep-Spot.
- Pixelwand-Shader: zwei dezente neue prozedurale LED-Muster (Säulen/Diagonalen) innerhalb desselben vorhandenen Materials; keine zusätzliche Geometrie, Textur oder Lichtquelle. Das kontrollierte Beat-Akzentmaß verringert nur die bestehende Deckkraft minimal und erzeugt kein Stroboskop.
- Verse: zurückhaltende Nebel-/Beam-/LED-Dekoration, Platz für Rap-Lyrics; Build: allmählicher Anstieg; Hook: wechselnde Gobo-/LED-Motive nach **bestätigtem** Refrain-Index; Drop: nur bei messbarer Kick-/Energie-Evidenz, sonst Ruhe; Break: sichtbarer Kontrast.
- Sämtliche V689-Licht- und Haze-Gewichte liegen zwischen 0 und 1, ohne Budget-Transfer von deaktivierten Quellen. Fade-In/-Out begrenzt die Akt-Grenzen; keine Netzwerkaufrufe, kein Zufall, keine neue Animationsschleife.
- Benutzer-Timeline, Blackout, deaktivierte Reaktivität, Low-Tier, reduzierte Bewegung und fehlende V604/V600-Abschnitte: kein Eingriff. Kein Rückschluss auf die Stimme aus Metadaten.

## Testen (Windows / PowerShell)

```powershell
npm install
npm run test:v689
npm run test:v689:types
npm run test:quick
npm run build
```

Zusätzlich manuell zu prüfen: eine schnelle Deutschrap-Strophe mit Lyrics, ein dreifacher Refrain, ein Hardtekk-Drop mit Beat-Signal, eine Pause/Seek, eine benutzerdefinierte Licht-Timeline und die Qualitätseinstellung „low“. Reale visuelle Wirkung am Zielgerät ist nicht allein durch Unit-Tests nachgewiesen.
