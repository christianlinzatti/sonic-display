# V623 – Ultimate Concert Dramaturgy

V623 ergänzt eine gemeinsame, evidenzgebundene Prioritätsregie für **existierende** automatische Tanzintensität, V620-Kameranachkomposition, V619-Lyrics und V621-Licht-/Bühneneffekte.

- Ein bestätigter V604/V600-Songabschnitt ist zwingend. Kein neuer Songabschnitts-, Sänger- oder Beat-Detektor.
- Hooks bekommen mit V604-Repetitionsindex unterschiedliche, zurückhaltende Akzente. Drops brauchen zusätzlich tatsächlich gemessene Kick- und Energiewerte. Ein Finale ist nur bei V604-verifiziertem Endbogen zulässig.
- Lyrics und Vocal-Portraits priorisieren ruhigere Kamera und weniger Dekoration, die Gesichter bleiben ausgeleuchtet.
- Manuelle Choreografien, Kamera-Keyframes, Lichtprogramme, Pausen, falsche Track-IDs, Seeks in Lücken, Low-Tier und Reduced Motion bleiben neutral.
- Keine neuen Spotlights, Szenen, Renderloops, GLB-Animationen oder Shader. Die bereits bestehenden V621/V602-Effektbudgets und V351-Kameragrenzen gelten weiterhin.

## Lokal verifizieren

```powershell
npm run test:smoke:v623
npm run verify:v623
npx tsc --noEmit
npm run build
```

Eine visuelle Prüfung mit echten GLB-Avataren und vollständigen Songs sowie der Next.js-Produktionsbuild stehen aus.
