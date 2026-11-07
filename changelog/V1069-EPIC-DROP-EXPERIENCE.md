# V1069 – Epic Drop Experience

Opt-in synchronized 360° virtual drop visuals (bass wave + confetti + LED hue accents
+ optional virtual pyro tint), reusing **existing V1046/V1059/V1035 meshes**.
An **observed** V287 `drop` section AND a measured rising strong beat are required:
beatStrength >= .72, bass >= .58, energy >= .48; cooldown 2.8 seconds.
The V1040 authored score only selects style and bounded intensity; it does not
invent drops or beat hits. Existing V1035 virtual spark triggers retain their
own stricter 5.5-second cooldown and no real pyro/hardware API is called.

Limits: existing 96-cap confetti mesh (new drop <=72); existing ring opacity <=.28;
LED pixel colors shift gently for <.9s without increasing brightness; no flash.
When features are disabled the relevant channel is OFF. No extra GPU meshes,
frame loops, new music polling, device calls, API keys or realtime event sources.
Feature defaults off. Auto LED pattern required for LED hue accents.

Tests: npm run test:v1069 && npm run test:v1069:types
and npm run verify:v1069:focused, preflight, complete CI on GitHub after ZIP import.
