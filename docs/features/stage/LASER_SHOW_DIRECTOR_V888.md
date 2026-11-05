# V888 – Laser Show Director

## Changes

- Four new, simulated motifs on the **existing V811 stage-backdrop shader**: laser fans, a tunnel, crossing beams and prism shapes. No physical lasers, strobe pulses, new meshes, lights, textures or render passes.
- Live FX Deck settings: automatic/selected pattern, calm/cinematic/festival motion, intensity, vocal/lyrics protection, verified-scene colors, exportable JSON scene list. Stored locally after hydration.
- The shape selector uses only **verified V604 song sections through the existing V885 storyboard** and the existing V810/823 laser authority. For example: build → cross, hook → prism, drop → tunnel, verse/break → fan.
- Manual lighting or V823 laser lane, blackout/strobe guard, pause, seek, song swap, reduced motion, missing verification, low performance tier and disabled laser or FX master all suppress the V888 creative layer. V811's original graphics remain available whenever V888 is disabled; existing V810 controls remain authoritative.
- Shader clamps alpha to the original V811 `.14` ceiling and limits the creative mix to `.90`. Color and intensity updates reuse the same Three.js ShaderMaterial uniforms. No extra allocations per frame.

## Check locally on Windows

```powershell
npm ci
npm run verify:v888:focused
npm run typecheck
npm run build
```

Or run `powershell -ExecutionPolicy Bypass -File scripts/verify-v888-windows.ps1` for all release gates with the Windows `node.exe` PATH fix.

## Verification caveat

Run full TypeScript, production Next.js build and actual WebGL shader compilation in an environment with installed npm dependencies and a real GPU-backed browser. Focused core/UI and regression tests do **not** replace these release gates.
