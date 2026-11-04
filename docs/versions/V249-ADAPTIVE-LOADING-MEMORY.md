# Sonic Display V249 – Adaptive Loading & Memory Optimization

Basiert auf V248 und behält die bestehende adaptive Motion-Cache-Logik bei.

- Bei deaktiviertem Motion-Prefetch werden installierte GLB-Motions **höchstens zu zweit gleichzeitig** geladen und retargeted, statt alle parallel mit `Promise.allSettled` zu laden.
- Verarbeitete Clips bleiben in der bisherigen **Bibliotheksreihenfolge**; nicht ladbare Assets werden weiterhin übersprungen.
- Sobald Avatar/Modell wechselt oder die Komponente abgebaut wird, startet der Loader keine weiteren Anforderungen. Bei unmount werden per-Avatar Prefetch- und Motion-Referenzen freigegeben.
- LOD-Manifest- und Varianten-Probe-Anfragen erhalten `AbortController`-Abbruch bei URL-Wechsel/Unmount. Caches anderer Avatare werden nicht global gelöscht.
- Die bereits bestehenden adaptiven Caps (`adaptiveMotionMemory.ts`) und V248-Smart-Loading-Messungen bleiben erhalten.

Prüfung: `npm run test:v249`, `npm run check:syntax`, `npm run typecheck`, `npm run build`. Die letzten beiden erfordern installierte Dependencies. Peak-RAM-/FPS-Verbesserung muss am Zielgerät gemessen werden.
