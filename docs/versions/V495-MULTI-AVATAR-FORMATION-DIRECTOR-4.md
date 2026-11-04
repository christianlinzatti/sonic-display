# Sonic Display V495 — Multi-Avatar Formation Director 4.0

## Funktion

- Für die bestehende **automatische V442-Gruppenbühne** mit drei oder vier Avataren werden Lead-, Support- und Background-*Bühnenrollen* bestimmt. Eine Rolle ist **keine Identifikation des Sängers**.
- In Verse, Hook und Drop wechseln sehr kleine Gesten, Blickakzente und Tiefenpositionen. Bei Drops reagieren die Tänzer koordiniert.
- Vorhandene V326-Formationen, Mindestabstände und X-Lanes werden nicht verändert. Das Bühnen-Z-Offset ist maximal 11 cm im Plan und wird vor der Anwendung über V494 auf noch kleinere Werte begrenzt.
- **Keine Änderung an GLB-Clips, Animationsmixer, Bone-Retargeting, Foot-IK und bestehenden V493-Presets.**
- Manuelle Cues, manuelle Gesangs-Zuordnung, Choreografie, Pausen, `reducedMotion`, niedrige Performance-Tiers und fehlende Track-IDs deaktivieren den Director.
- Die bereits vorhandene automatische Song-`trackId` wird ausdrücklich **nicht** als manueller Track-Cue interpretiert; dies korrigiert zugleich die V494-Automatikpriorität.
- Seek, Songwechsel und große Zeitsprünge setzen den Zustand zurück. Der neue Track beginnt ohne gespeicherte Bewegungsreste.

## Technische Architektur

`components/visualizer/multiAvatarFormationDirectorV495.ts`: deterministischer Zustandsplaner ohne Three.js/React.

`GroupDancersV326SceneV492.tsx`: **ein** bestehender `useFrame`-Callback; injiziert winzige Rollenakzente in den bestehenden V452-Gesten-Overlay und optionale root-Z-Offsets nur nach dem V494-Fußkontakt-Gate. Kein zusätzlicher Mixer, kein neuer Frame-Callback.

## Tests

`npm run test:v495` prüft Rollen, Musikphasen, Seek, Prioritäten, Root-Bewegungsgrenzen, Fußkontakte und längere deterministische Sequenzen.

`npm run test:v495:types` prüft den reinen Planer isoliert.

`npm run typecheck && npm run build` muss auf einem System mit vollständigen Projekt-Abhängigkeiten ausgeführt werden.
