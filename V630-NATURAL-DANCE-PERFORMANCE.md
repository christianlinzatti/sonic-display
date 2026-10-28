# V630 – Natural Dance Performance

## Ziel
Natürlichere automatische Übergänge zwischen GLB-Animationsclips, besonders bei Deutschrap, Duetten und 2–4 Avataren, ohne den bestehenden V492-Mixer, V537-Motion-Matching, V135/V494-Fuß-IK oder authored Motion zu ersetzen.

## Tatsächlich implementiert

- **Reale Keyframe-Stichprobe:** `naturalDancePerformanceV630.ts` liest an den bereits gewählten Clipzeiten die Quaternionen/Positionen gemeinsamer Hüft-, Oberschenkel-, Unterschenkel- und Fußtracks. Keine Klassifikation aus Cliptiteln; nur existierende Daten.
- **Konservatives Pose-Mismatch:** Mindestens vier passende Tracks und mindestens ein linker und rechter Beintrack nötig. Bei unzureichenden Tracks, Invalid/NaN und unsupported Rigs bleibt die bestehende Überblendung unverändert. Gemischte Tracks erhalten keine künstliche Poseerkennung.
- **Fußkontakt:** Nur tatsächliche `footIK.current.*.contact.phase === 'planted'`-Signale aus der vorhandenen IK-Pipeline verstärken bei einem nachgewiesenen Unterschied das weichere Crossfade. Es werden keine Anker zurückgesetzt oder IK-Positionen geschrieben.
- **Repetition:** Die vorhandene V536-Clip-Auswahl vermeidet bereits Wiederholungen über eine `recent`-Historie. V630 verbessert mit der V614-Rapid-Switch-Evidenz den Übergang bei schnellen automatischen Wechseln; **keine zusätzliche Zufallsauswahl oder neuen Clips**.
- **Bedingte Anpassung:** Ausschließlich im automatischen, aktiven, nicht reduzierten und nicht Low-Tier-Playback; manuelle Timelines, Choreografien, Library-Priorität und Low-Pose-V489 behalten Vorrang. V630 kann die finale V614-Fadezeit ausschließlich vergrößern. Fade-Limits hängen von tatsächlicher kürzerer GLB-Dauer und BPM ab.
- **Echte Integration:** Nach V537, V565 und V614, unmittelbar vor `nextAction.fadeIn(effectiveFadeDurationV311).play()` und dem bestehenden Ausblenden anderer Actions, ohne zusätzlichem Hook oder `useFrame`.

## Grenzen und realer Test

Eine mathematische Pose-Differenz ist **kein visueller Beweis** für natürliche Bewegungen. Nicht vorhandene/abweichende Skeleton-Track-Namen und nur Teilrigs werden nicht korrigiert. Die Animationen, Fuß-IK und Übergänge müssen im echten Browser mit GLB-Modellen, Echtzeitaudio sowie manuell gewählten und automatischen Choreografien betrachtet werden. Große Einschnitte an Clip-Loopgrenzen außerhalb eines Clipwechsels korrigiert V630 nicht.

## Windows-Checks

```powershell
npm install
npm run test:smoke:v630
npm run verify:v630
npx tsc --noEmit
npm run build
```
