# Sonic Display V443 – Automatic Artist Spotlight & Stage Interaction

V443 erweitert V442 um **automatische, zurückhaltende Bühneninteraktion für 3–4 Feature-Avatare**. Der Schwerpunkt ist die visuelle Bühnenregie: Ein Rap-Part tritt nach vorn, die übrigen Avatare wenden ihre Bühnenwurzeln geringfügig zum hervorgehobenen Kollegen, und auf einer gemeinsamen Hook treten alle nach vorn. Die Namensblasen aus V441 werden zu neuen Szenen-/Fokus-Cues kurz animiert.

## Funktionsweise

- `artistSpotlightV443.ts` berechnet eine reine, begrenzte Richtungsanweisung pro Slot aus dem **aktuellen V326-Gruppen-Pose-Cue**. Das Ergebnis enthält `offsetZ`, `turnY` und die Hervorhebung pro Avatar. Horizontale X-Positionen bleiben unverändert; die bestehende Kollisionsabstandsprüfung von V326 bleibt maßgeblich.
- `VisualizerStage.tsx` berechnet im Musik-Zeitverlauf eine Spotlight-Vorschau der automatisch generierten V442-Gruppe und übergibt sie an die Live-Bühne.
- In `ThreeAvatar.tsx` verwendet `GroupDancersV326` den Plan direkt im bestehenden `useFrame`-Loop und nähert neue Zielwerte weich mit der schon vorhandenen `formationApproach`-Funktion an. Es werden **nur Bühnenwurzeln**, keine Bone-Daten, importierten Animation-Clips, Phoneme oder GLB-Dateien verändert.
- `ArtistNameBubbleV441.tsx` animiert bestehende 3D-verankerte Namenslabels beim Cue-Wechsel kurz über CSS; die bisherige Comic-/Neon-/Minimal-Gestaltung bleibt erhalten. Für `prefers-reduced-motion` bzw. reduzierte Bewegung wird keine zusätzliche Label-Animation ausgelöst.
- `AutoMotionIntelligencePanelV438.tsx` enthält den Schalter und die Intensität für V443. **Standard: eingeschaltet, 65 %.** Intensität 0 deaktiviert die Bewegungsanweisungen.

## Schutz vorhandener Einstellungen

- Die Regie greift **nur bei tatsächlich aktiver automatisch erzeugter V442-Gruppenbühne** (3–4 Avatare). Gespeicherte V326-Formationen, manuelle V325-Timelines, explizite Clip-Auswahl und manuelle Gruppen bleiben unberührt. Für normale Solo- und Duo-Anzeige bleiben die bisherigen Funktionen unverändert.
- Bestehende V416-Rapper-Zuordnungen und explizite Vocal-Inszenierung haben Vorrang. Die neue Bühneninteraktion wird bei anliegender manueller V416-/V385-/V375-/V376-Steuerung konservativ abgeschaltet, statt zu konkurrieren.
- Bei Pausen, deaktivierter Automatik, `reducedMotion` oder 0 % Stärke keine zusätzlichen Bühnenbewegungen.
- Keine automatische Zuordnung von Spotify-Künstlernamen zu echten Rapper-Stimmen: Die visuelle Rollenverteilung basiert nur auf V442-Musik-/Lyrics-Abschnitten und Spotify-Credits.

## Sicherheit, Verhalten, Grenzen

Die maximale Zusatzrotation beträgt 0,42 rad mal Intensität, die maximale Bühnen-Z-Verschiebung 0,30 Einheiten mal Intensität. Keine Positionsänderung in X; keine neuen WebGL-Szenen/Renderer; keine zusätzlichen APIs oder Netzwerkzugriffe. Die Gruppenformation und automatische Kamera bleiben V442-gesteuert. Eine "Blickwendung" bedeutet eine dezente Drehung der Avatar-Wurzel, **kein echtes Augen-/Kopf-Tracking oder Gesichts-Retargeting**. Wiederkehrende Lyrics werden heuristisch als Hook behandelt, echte Stimmen/Sänger werden nicht analysiert. Browser-Sichttests mit importierten GLB-Rigs bleiben notwendig.

## Prüfung

`npm run verify:v443` führt V443, V442, V441, V440, V439, TypeScript-Kernprüfungen, Syntax-, Import-, Modulnamen- und V190-Motion-Library-Prüfung aus. Zusätzlich wurden V423–V426 und V429–V438 einzeln geprüft. Der vollständige Next.js-Produktionsbuild ist **nicht** bestätigt; in dieser Entwicklungsumgebung sind die npm-Abhängigkeiten (`node_modules`) nicht installiert.
