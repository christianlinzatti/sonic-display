# V969 – Smart Concert Presets

V969 adds a **virtual-only, opt-in concert-look director** to Sonic Display. It does not replace V958's verified song-phase analysis, existing authored shows, Spotify playback, Govee light controls or V968's per-zone overrides.

## New concert worlds

- **Smart Automatik**: determines the virtual world from the recognized genre (Deutschrap → Cinematic Night; Hardtekk/Hardstyle → Hardtekk Reactor; Deutschrock/NDH → Rock Arena; unknown → Arena Live).
- **Arena Live**: wide LED styles, warm/cool stage lights and large beams.
- **Festival Peak**: vivid LED motifs and carefully bounded drop accents.
- **Neon Club**: compact purple/teal look with quiet verses and more active hooks.
- **Cinematic Night**: filmic dark palette, calmer verses, atmospheric fog.
- **Hardtekk Reactor**: cool/cyan and pink geometry with virtual bass impacts.
- **Rock Arena**: warm amber/red concert lights.
- **Kein zusätzliches Preset**: disables only the V969 preset projection, leaving the prior concert mode as it was.

## How to test without Alexa

Open **Ultimate Concert Experience Studio → V969 Smart Concert Presets → Virtuelle Konzertwelt** and choose a preset. Activate virtual concert effects in the existing settings if necessary. During playback, *verified* V318 sections alter LED wall style, colors, virtual effects and intensity. Manually authored show timelines and explicit V968 lighting/effect overrides remain higher priority. Low-performance mode does not apply the V969 scene projection. Reduced-motion mode avoids additional moving effects.

No track-analysis confirmation means no new virtual preset scene. This is intentional and must not be mistaken for a broken preset.

## Alexa setup

Existing V967/V968 Alexa owners must update both the AWS Lambda code **and** the German interaction model in the Alexa Developer Console, then build the skill model. This release adds:

| Intent | Example utterance | Signed command |
| --- | --- | --- |
| RapPresetIntent | „Starte Deutschrap Konzert“ | `preset-rap` |
| HardtekkPresetIntent | „Starte Hardtekk Reaktor“ | `preset-hardtekk` |
| RockPresetIntent | „Starte Rock Arena“ | `preset-rock` |
| CinemaPresetIntent | „Starte Cinematic Night“ | `preset-cinema` |
| AutoPresetIntent | „Aktiviere Smart Konzert Automatik“ | `preset-auto` |

Previous **Arena**, **Festival**, **Club** and **Calm** Alexa commands now also select matching complete virtual worlds. Spotify playback, physical Govee lamps and external effects cannot be controlled by these commands. No Alexa credentials are shipped in the ZIP.

## Release quality

Use `node tests/v969-smart-concert-presets-regression.cjs`, `node tests/v969-alexa-lambda-regression.cjs`, `tsc -p tests/tsconfig.v969-core.json --noEmit`, `npm run typecheck`, and `npm run build`. The release gates `scripts/vercel-production-build.cjs` and `scripts/v931-production-gate.cjs` include V969 checks. Full Next.js build and a real Alexa/Echo must still be verified in the target environment.

Upload the full-project ZIP as **`releases/SonicDisplay-V969.zip`**. The version-independent GitHub importer validates `sonicRoadmapRelease: "v969"` in `package.json` against the ZIP filename. The new package does not require a manually edited importer.
