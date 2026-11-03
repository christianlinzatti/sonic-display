# Sonic Display V873 – Cinematic Lyrics 10.0

Basis: V872. `KineticLyrics.tsx`, `DynamicStage.tsx` und `ConcertFxStudioPanelV810.tsx`
verwenden eine neue **reine** Steuerung in `cinematicLyricsPolishV873.ts`.

- **Lesbarkeit:** Die bestehende aktive Lyrics-Zeile erhält bei Spielbetrieb einen
  konservativ höheren Hintergrundkontrast. Mehrere Darsteller und Porträts erhöhen
  die Textplatte; die Nutzerposition und Karaoke-Farbe bleiben unverändert.
- **Rap-Timing:** Kürzere CSS-Textschatten-Übergänge werden ausschließlich aus echten,
  vollständig gültigen Wortzeitintervallen berechnet. Ohne synchrone Wortzeiten
  wird kein Timing vorgetäuscht. Bei Reduced Motion sind neue Animationen aus.
- **Hook-Projektion:** Der V813-Plan liefert Worttext und Zeitstempel. V873 darf nur
  die vorhandene hintere Wand auf bis zu 1,3× skalieren (nicht den Boden);
  Textinhalt und Oberfläche bleiben gleich. Bei Nahaufnahmen, aktivem Lyrics-Schutz
  oder großem Ensemble wird die Projektion gedimmt. Eine manuelle Kamera verhindert
  die neue Skalierung vollständig.
- **Regler:** Im Concert FX Studio Ein/Aus, Akzentstärke, Hook-Größe und Kameraschutz.
  Der ursprüngliche Projektionsschalter V813 ist weiter erforderlich.
- **Rendering:** Eine bestehende CanvasTexture für beide Projektionsflächen,
  keine zusätzlichen Meshes, Hooks, Intervalle, Renderpasses oder WebGL-Ressourcen.
- **Musikquelle:** V810-Songabschnitte müssen als Musik-Cues verifiziert sein.
  Keine hypothetischen Drops, Reim-Phoneme, Adlibs oder Karaoke-Zeitwerte.

**Vor Freigabe:** vollständiger TypeScript-Check, Next.js-Produktionsbuild,
GitHub-CI unter Windows und Ubuntu sowie visuelle 10-Zoll-/GLB-Prüfung.
