# V790 — Cinematic Show Director 2.0

## Was umgesetzt wurde

V790 komponiert **einen zusammenhängenden Szenenplan** aus vier bereits vorhandenen, bestätigten Quellen:

1. **V604**: importierte und live bestätigte Songabschnitte (nur valide V600-Autor-Zeitmarken).
2. **V761**: wiederholungsbewusster, abwechslungsreicher Szenenplan inklusive Kamera-/Bühnen-Intent.
3. **V671**: bestätigtes Song-Pacing (kein geschätzter Beat-Zeitstempel).
4. **V679**: ein Haupt-Höhepunkt sowie maximal zwei Neben-Höhepunkte.

Das Ergebnis unterscheidet **Establish**, **Focus**, **Anticipate**, **Payoff**, **Breath** und **Resolve**. Ein bestätigter Build direkt vor einem qualifizierten Höhepunkt wird zum Spannungsaufbau; Breaks werden bewusst ruhiger. Der ausgewählte Haupt-Höhepunkt ist stärker als die Neben-Höhepunkte. Wiederholte Hooks erhalten leicht variierende Gewichtungen; die V761-Szene und ihre Kameraauswahl bleiben weiterhin maßgeblich.

Die Kamera-, Licht- und Tanzintensität wird **nur innerhalb der bestehenden automatischen Kanäle** subtil moduliert, mit weich auslaufenden Überblendungen an jeder tatsächlichen Szenengrenze. Danach greift weiterhin die **V670-Sicherheits-/Qualitätsbegrenzung** als letzte Instanz. V790 führt **keinen zweiten Kamera- oder Licht-Renderer** und keine zusätzliche Render-Schleife ein.

## Sicherheits- und Datenregeln

- Wenn einer der Pläne fehlt, eine Track-ID/Dauer abweicht, der bestätigte V604-Akt nicht mit V761/V671/V679 übereinstimmt oder eine Zeitlücke vorliegt: **neutraler Fallback**.
- `reducedMotion`, pausiert, `low`-Tier, ausgeschaltete Automatik oder 0 % Regiestärke: **neutraler Fallback**.
- Manuelles Tanzen, Kamera-Keyframes/Studio/Timeline und deaktivierte reaktive Beleuchtung haben Vorrang: **identische automatische Kanalwerte**.
- Bei geschützten Lyrics werden die zusätzlichen Show-Akzente reduziert. Lyrics-Zeitmarken und -Text, Sängerrollen, Gesicht/Lip-Sync, GLB-Motions und gespeicherte Einstellungen bleiben unverändert.
- Keine künstlichen Verse/Hook/Drop-Zeitmarken: Ohne verifizierte importierte Abschnittsdaten ist V790 bewusst inaktiv. Live-Schätzungen nutzen weiterhin das bestehende, vorsichtigere Basissystem.
- Pure Funktionen, kein State, keine Timer, keine APIs und keine neuen GPU-Objekte.

## Integration

`VisualizerStage.tsx`: V790 liest den bestehenden V761/V604/V671/V679-Plan, komponiert nach V681 die finalen zusätzlichen Akzente und reicht `directedDynamicsV790` an V670. Diagnostik über die `data-v790-*`-Attribute der Bühne (Moment, Szene, Haupt-Höhepunkt, Evidenz).

## Prüfung

`npm run test:v790`, `npm run test:v790:types`, `npm run check:syntax`, `npm run check:architecture`, `npm run test:module-case`. Alte Regressionstests V789 etc. bleiben Bestandteil der Release-Gates.

### Hinweis zur Abnahme

V790 wurde hier anfangs ohne installierte Next.js-/React-/Three.js-Abhängigkeiten getestet; ein vollständiger Next.js-Produktionsbuild oder ein echter WebGL/GLB-Test kann nicht als bestanden gelten, solange diese fehlen. Zur Abnahme bitte `npm ci && npm run typecheck && npm run build`, dann den Konzert-Benchmark mit realen GLBs und 2/4 Tänzern im Browser prüfen.
