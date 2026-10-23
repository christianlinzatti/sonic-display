# Sonic Display V341 – Music-Synced Photo Gallery

V341 adds an optional **music-reactive slideshow** to the existing V338–V340 galleries. It reuses the `cameraDirectorSection` (intro/verse/hook/build/drop/break/outro) and the existing `audio.kickAccentIntensity` signal; it does not request microphone access on its own.

## How it works

- Verse/break: longer, calmer intervals; hook/drop: shorter intervals; build: normal interval with optional beat advance.
- Optional rising-edge kick advances are throttled by configurable `minGapSeconds` to avoid strobes. Only hook/build/drop can cause beat-triggered advancement.
- Fade/slide/zoom CSS transitions; reduced-motion settings turn animation off. A single photo or collage is not auto-advanced.
- Disabled by default to preserve V340 behavior and saved preferences. Settings are saved locally in `sonic-music-gallery-v341`.

Open **Settings → Dynamic Stage → Stage Content Plugins → V341 – Musiksynchrone Bildergalerie**. Configure enable, intensity, kick threshold, minimum gap and transition style.

## Limitations

Music-section detection depends on existing song structure analysis; some songs fall back to an unknown section. Kick intensity varies by audio source. No new AI classification has been added. No real WebGL browser or production-build verification is claimed without dependencies.
