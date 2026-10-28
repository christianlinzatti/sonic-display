# Sonic Display V614 – Verifikation (27.10.2026)

| Prüfung | Ergebnis |
|---|---|
| `npm run test:v614` | **PASS** – 36 Regressionstest-Gruppen, 10.310 deterministische Songzeit-/Section-/Tempo-Samples |
| `npm run test:v614:types` | **PASS** – isolierter TypeScript-Typcheck der V614-Planer |
| `npm run test:smoke:v614` | **PASS** – V614 → V613 → V612 sowie V611/V610/V605 und V565/V537, Syntax, Architektur |
| `npm run verify:v614` | **PASS** – zusätzlich V536, V530, V524 und V597 |
| `npm run check:syntax` | **PASS** – 838 TS-/TSX-Quellcodedateien geprüft |
| `npm run check:architecture` | **PASS** – 473 dokumentierte Referenzen und 10 Architekturabschnitte |
| `npx tsc --noEmit` | **Hier nicht vollständig ausführbar** – React/Three/Next-Abhängigkeiten (`node_modules`) sind in dieser isolierten Umgebung nicht installiert |
| `npm run build` | **Hier nicht ausgeführt** – lokal auf Windows mit installierten Paketen prüfen |
| `npm run test:all` | Optionaler bestehender V613-Befehl; **nicht** alle individuellen Testskripte ausgeführt |
| Echte GLB-Browser-Sichtprüfung, FPS und Lippenoptik | **Offen**, keine simulierte Prüfung als visuelle Freigabe bewertet |

## Teststrategie

Die Tests verifizieren reine Übergangsentscheidungen: veränderte Fadezeiten für Verse, Hook, Build, Break, gemessene Drop-Akzente, IK-Fußkontakt, Pose-Mismatch, schnell aufeinanderfolgende Wechsel, Trackwechsel und rückwärts gerichtete Seeks. Die V537-Matching- und V565-Fade-Reihenfolge wird strukturell geprüft. Regie-, Lyrics- und Lipsync-Cues werden nicht neu erkannt oder modifiziert.

## Auf Windows ausführen

```powershell
npm run test:smoke:v614
npx tsc --noEmit
npm run build
# optional: alle individuell registrierten Tests
npm run test:all
```

**Empfohlene Sichtkontrolle:** je ein vollständiger Deutschrap- und Hardstyle-/Hardtekk-Song mit einem, zwei und vier echten GLB-Avataren. Beobachten, ob Fußkontakte bei schnellen Clips stabil bleiben, ob die Tänzer in Breaks ruhig wechseln und ob Liedabschnittswechsel nicht hektisch wirken. Realistische FPS/Frametimes über `/benchmark/v590` und `/benchmark/v591` bestimmen; ein Raspberry-Pi-Test findet erst nach Hardwareentscheidung statt.
