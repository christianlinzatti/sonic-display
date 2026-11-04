# V619 – Cinematic Lyrics Performance

Die zuvor getrennten dekorativen V598-/V606-Effekte werden durch den kleinen V619-Planer bei der tatsächlichen DOM-Lyrics-Ausgabe ergänzt. Bewusste Priorität hat die Lesbarkeit auf einem 10-Zoll-Display.

- **Wortbetonung:** Nur bei synchronisierten, `verifiedLyricWordsV477`-validierten Worten, aktuell spielendem Lied und aktivierter Wort-Hervorhebung. Maximal .17 zusätzliches relatives Glow-Signal, bei langen/raschen Zeilen höchstens .065. Keine Veränderung am `--word-fill` der Karaoke.
- **Hook/Duett:** V619 übernimmt ausschließlich den von V606 bestätigten V604-Hook bzw. die belegte Duettregie. Ein bloßer `sectionCue` oder Genre-/Worttext darf keine zusätzliche Hook-Dekoration erfinden. In der kurzen Eintritts-/Austrittsphase sanfte Unterstreichung; kein blinkender Zusatzeffekt.
- **Lesbarkeit:** Minimale sichere Breite aus V578, V598 und V606; stärkste bestehende Platte bleibt bestehen, auch bei Pause/Reduced Motion. 3–4 Performer dämpfen Akzente weiter. Keine Schriftgrößen- oder Positionsüberschreibung.
- **Grenzen:** Kein neuer Timer, Rendering-Loop, Lyrics-Provider, Phonem- oder Sänger-Detektor. WebGL-3D-Lyrics-Meshes bleiben auf V541/V549. Keine Wirkung ohne echte Wortzeitmarken außer statischer Lesbarkeit. Manuelle Fonts und Choreografien unangetastet.

## Lokale Prüfung

```powershell
npm run test:smoke:v619
npm run verify:v619
npx tsc --noEmit
npm run build
```

Die Regression ist synthetisch. Für eine echte Qualitätsfreigabe sollten mehrere Songs (dichter Deutschrap, langsame Hook, Hardstyle, ungezeitete Lyrics) mit echten Avataren und realer Bildschirmgröße im Browser geprüft werden.
