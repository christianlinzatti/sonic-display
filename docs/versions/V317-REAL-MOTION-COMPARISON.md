# Sonic Display V317 – Real Motion Comparison Studio

## Neuerungen

V317 erweitert den optionalen Live-3D-A/B-Vergleich aus V316. Das Studio kann jetzt **wirkliche AnimationClips aus dem GLB des gewählten Avatars oder aus einer installierten externen GLB-Motion** in beiden Bühnen gleichzeitig abspielen. Die originale Animation ist dieselbe: Jeder Avatar wird separat geklont, die Wiedergabe folgt derselben Uhr und derselben Clipposition. Der Assistant zeigt links die aktuellen und rechts die ausgewählten, nur probeweise angewendeten V307/V311/V310-Regler.

- **Animationsquellen:** eingebettete GLB-Clips, die Standardanimation des ausgewählten Avatars oder bereits in der Character Motion Library V190 für ihn installierte Bewegungsdateien.
- **Clipwahl:** bei mehreren Clips in der gewählten Quelle frei wählbar. Ohne passendes Rig bzw. ohne verwertbare Animations-Tracks erscheint der Hinweis, dass keine originale Motion abgespielt werden kann; die synthetische Demo bleibt als eigene Alternative erhalten.
- **Humanoid-Retargeting:** externe GLB-Animationen benutzen den vorhandenen konservativen `retargetHumanoidClips`-Pfad und dessen Kalibrierung. Bewegungen werden nicht automatisch auf inkompatible Rigs erzwungen.
- **Identische Source-Timeline:** separate AnimationMixer pro Avatar mit identischen Quell-Keyframe-Zeiten und synchronisiertem Seek; unterschiedliche Transition-Polish-Werte verändern nur die Überblendgewichte, nicht die Quellposition.
- **Optionaler Übergang:** falls die GLB-Quelle mehrere kompatible Clips enthält, kann ein zweiter Clip gewählt und zwischen den beiden in einer wiederkehrenden A/B-Abfolge übergeblendet werden. Das ist eine Preview, kein Export neu zusammengesetzter Animationen.
- **Fußkontakt-Heuristik:** prüft die Höhen und vertikalen Geschwindigkeiten der Foot-Joints, bevor V311 die zusätzlichen Bein-/Fußbewegungen dämpft. Keine vollständige Fuß-IK und kein Garant gegen Foot Sliding innerhalb des importierten Quellclips.
- **Additive Effekte:** die bestehenden V307- und V311-Berechnungen werden als vorsichtige, begrenzte lokale Rotation auf die bereits gesampelte GLB-Pose gelegt und vor jedem neuen Clip-Sample wieder zurückgenommen; Originaltracks bleiben unverändert.
- **Ressourcen:** nur bei geöffnetem Dialog montiert. Jede Bühne hat eigene Model-Clones, Mixer, Motion-States, Bewegungs-Overlays und unabhängig gekapselte Show-Regie; Laden externer Clips ist abbrechbar. Keine neue Bibliothek.

## Bedienung

1. In Sonic Display einen Avatar und (optional) über die bestehende Character Motion Library eine GLB-Motion installieren.
2. Im **Dance Performance Review Studio V314** eine Analyse aufzeichnen.
3. Im **Visual Dance Improvement Assistant V315** die Messung auswerten und Empfehlungen auswählen.
4. **Real-Motion-Vergleich öffnen · V317** drücken.
5. **Modus → Echte GLB-Motion** wählen. Unter **Animationsquelle** eine Motion-Datei und dann den **Clip** auswählen; alternativ **Synthetische Demo** für den bisherigen V316-Vergleich.
6. Bei mehreren Clips ggf. **Optionaler Übergang** auswählen. Abspielen, pausieren, von vorn starten oder zur synthetischen Break-/Drop-Demoposition springen.
7. Die beiden 3D-Bühnen vergleichen. Erst anschließend, außerhalb der Vorschau, bewusst **Ausgewählte Änderungen übernehmen** betätigen. Die vorhandene konfliktbewusste Undo-Funktion bleibt erhalten.

## Technische Änderungen

- `components/visualizer/realMotionComparisonV317.ts`: Pure Helper für passende Motion-Quellen, Clipvalidierung, identischen Quell-Timing-Plan, A/B-Überblendgewichte und einfache Foot-Contact-Heuristik.
- `components/visualizer/DanceLiveComparisonV316.tsx`: bleibt als dynamischer Dialog-Entrypoint bestehen. Hinzu kommen `RealGLBMotionV317`, zwei unabhängige `AnimationMixer`, Clip-Auswahl, überlappende Original-Clips, gemeinsame Zeitsteuerung, sanftes additives Overlay und Statusinformationen.
- `components/visualizer/VisualDanceImprovementStudioV315.tsx`: aktualisierte Öffnen-Schaltfläche.
- `app/globals.css`: responsives Motion-Auswahlfeld.
- `tests/v317-real-motion-comparison-regression.cjs`: Quellwahl, Keyframe-Synchronität auch bei unterschiedlichen Überblendwerten, Loop-Kontinuität, Foot-Contact-Heuristik und Integrationschecks.

## Grenzen

Es läuft **weiterhin ein synthetischer Beat** als Rhythmus für die ergänzenden V307/V311- und V306/V310-Berechnungen; Spotify-Sound und Musik-Timestamps werden nicht kopiert. Originale GLB-Animationen werden hingegen in den zwei Bühnen tatsächlich ausgewertet. Der Vergleich bildet nicht die komplette Produktionsszene, volle IK-Kette oder alle Retargeting-Rigs zuverlässig ab. Effekte auf den Originalclip selbst, die nicht durch die vorhandenen Improvement-Regler beeinflussbar sind, bleiben auf beiden Seiten gleich. Die A/B-Überblendung zweier Clips setzt aktuell voraus, dass beide in derselben GLB-Quelle enthalten sind.

## Tests und Build

`npm run test:v317` führt die gezielten Regressionsprüfungen aus. `npm run verify:offline` deckt außerdem die bisherigen Offline-Prüfungen von V265 bis V317 und TypeScript/TSX-Syntax ab. `npm install && npm run verify` startet zusätzlich vollständigen TypeScript-Check und Next.js-Produktionsbuild, wenn alle npm-Abhängigkeiten verfügbar sind. In der Erstellungslaufzeit fehlen diese Abhängigkeiten, daher sind der echte Build und die browserbasierte visuelle End-to-End-Prüfung noch offen.
