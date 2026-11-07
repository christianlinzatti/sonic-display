# V1044 – Audience Light Orchestra

- New optional virtual-audience light orchestration for the 360° concert stage, driven by the **existing V1040 editable 7-scene show template**.
- Intro breathes, verse sweeps, build forms a double wave, hooks glow together, interlude twinkles, finale forms a light crown. Genre-aware cyan, violet, amber and rose colors.
- Works inside the **existing V1032 single instanced phone-light batch**: zero additional objects, render passes, animation timers, network calls or smart-light commands.
- New opt-in toggle and 0–75% effect strength in the Show Designer. Requires the Show Designer itself to be enabled, a 360° stage, active playback, visible audience phones, valid track progress, non-low performance tier and no Reduced Motion. Explicit pulse / chase modes override it.
- Changes colors and movement only for virtual audience phone screens; no Govee / external devices. Existing V1035 crowd reactions and V1033 wave physics remain in charge. Effect is smooth, bounded and never triggers strobe, pyro or an invented audio event.
- Pure regression and TypeScript tests, Vercel and production validation wiring.

## Installation

Import full project and run `npm ci && npm run test:v1044 && npm run test:v1044:types`. Under **Settings → AI Show Designer**, generate/enable a show, select **360°-Bühne**, enable **Audience Light Orchestra** and start playback.

## Package size

The distribution ZIP is complete project source but intentionally excludes old nested ZIPs in `releases/`, generated build artifacts, caches, and machine-specific files.
