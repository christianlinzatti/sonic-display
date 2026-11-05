# Sonic Display V119 — Dance Preset Studio

The existing V45 dance preset feature remains unchanged. V119 adds **Motion Layer presets** within the Dance Debugger.

- Six layer gains saved as presets in localStorage, up to 40 custom profiles.
- Genre-linked presets for Deutschrap, Trap, Hip-Hop, Hardstyle, Hardtekk, Techno.
- Optional automatic application when the live `genre` prop changes on the imported GLB avatar.
- Manual apply, deletion, JSON import/export, numeric clamping and schema validation.
- Unknown genre leaves settings unchanged; genre labels depend on upstream metadata and are not always available.
- No per-frame storage parsing; playlist/song metadata only triggers an update when the prop changes.

## Checks

`npm run check:syntax && npm run test:motion-presets && npm run verify`

Node modules must be installed before full typecheck/build.
