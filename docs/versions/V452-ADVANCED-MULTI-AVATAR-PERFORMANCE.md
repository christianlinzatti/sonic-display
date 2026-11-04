# Sonic Display V452 – Advanced Multi-Avatar Performance

V452 erweitert die **bereits vorhandene automatische Multi-Avatar-Bühne** um dezente,
miteinander abgestimmte Performance-Akzente. Keine weiteren Einstellungen, Dienste,
API-Schlüssel oder Audio-Dateien sind notwendig.

## Neu

- **Zwei Avatare:** Die bestehende Duo-Bühne erhält bei aktivierten Künstler-Namensblasen
  sparsame Call-and-Response-Gesten und dezente Blickhinweise. Bestehende
  Partner-Kontakt-, Hand-IK-, Kollisions- und GLB-Mixer bleiben unverändert.
- **Drei oder vier Avatare:** Die automatische V442-Gruppe erhält eine gemeinsame
  Hook-Bewegungsphase. Die Mitglieder bewegen sich dabei mit derselben seitlichen
  Mini-Verschiebung, damit die Abstände erhalten bleiben.
- **Verse:** Der visuell hervorgehobene Avatar erhält einen kleinen Rap-Akzent,
  die anderen gestaffelte Antwortgesten und einen zurückhaltenden Blickhinweis.
- **Weiche Übergänge:** Neue Akzente folgen der vorhandenen V326-Formation-Blendphase
  und verwenden die vorhandene weiche Interpolation der Bühnen-Roots.
- **Bestehende Kontrolle:** Deaktivieren von `rapArtistInteractionEnabledV444`,
  Pausieren, Reduced Motion, manuelle Formationen und dokumentierte Vocal-Rollen
  verhindern zusätzliche automatische V452-Gesten. Der vorhandene V444-Stärkeregler
  bestimmt auch die Intensität von V452.

## Quellen und Grenzen

Die Rollen stammen ausschließlich aus der **visuellen Bühnenregie**. Die Automatik
kennt nicht den tatsächlichen Sänger einer Aufnahme. Manuell zugeordnete Sänger
(V385/V416) haben Vorrang. Klangereignisse steuern nur die **Stärke** von Gesten,
keine Sprecherzuordnungen. V452 verändert weder importierte GLB-Clips noch
Persistent-Storage-Keys.

Der reine Planer liegt in `components/visualizer/advancedMultiAvatarPerformanceV452.ts`.
Das Live-Wiring ist in `components/visualizer/ThreeAvatar.tsx` für die Zwei-Personen-
und die Drei-/Vier-Personen-Bühne implementiert.

## Lokale Prüfung

```powershell
npm install
npm run verify:v452
npm run typecheck
npm run build
```

Siehe `V452-VERIFICATION.md` für tatsächlich ausgeführte Prüfungen.
