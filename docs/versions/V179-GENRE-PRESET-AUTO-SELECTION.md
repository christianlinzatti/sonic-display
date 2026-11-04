# Sonic Display V179 – Smart Preset Auto-Selection & Genre Profiles

V179 builds on V178 without replacing song timelines, manually saved presets, or the lighting library.

## How it works

Open **Lichtstudio → Genre-Profile & automatische Preset-Auswahl**. Assign an existing preset-library entry to each genre and enable automatic selection. Assignments point to library IDs; the latest saved revision is used. No preset is implicitly chosen on the basis of its name. Missing mappings and disabled auto mode fall back to the manually saved preset. Mapping and enablement are stored locally under `sonic-display:lighting-genre-profiles-v179`.

When a music genre changes, the 3D stage resolves the selected library entry. Parameter changes are interpolated inside the existing R3F render loop (time constant roughly 0.5 seconds) without adding lights, draw calls, or React state updates per frame. Reduced-motion mode applies values immediately. The manual override button turns off automation without deleting the mappings. The standard `Preset speichern` button remains separate and does not silently overwrite the library.

Library revisions and settings changes update the stage through custom browser events. The stage does not write auto-selected values back to the user's manual fallback preset.

## Genre caveat

The available genre input reports the existing broad classification. A Hardtekk-specific profile can be selected only if the upstream genre value specifically equals `hardtekk`. A song classified merely as `techno` uses the techno profile instead. This version does not invent a new music genre detector.

## Validation

`npm run test:genre-profiles`, `npm run verify:offline`, `npm run check:syntax`. A complete Next.js build requires locally installed npm dependencies; actual Raspberry Pi GPU performance is not measured by these checks.
