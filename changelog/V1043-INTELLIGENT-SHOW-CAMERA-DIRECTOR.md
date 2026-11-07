# V1043 – Intelligent Show Camera Director

- Opt-in show-camera cues from the existing V1040 edit timeline: wide, orbit, lead and group.
- Bounded continuous camera composition; existing R3F camera remains the single owner.
- Manual studio modes, artist closeups, rap/duet/vocal/lyrics scenes, camera presets and authored timelines retain priority.
- Uses track progress only; no new clock, beat inference, hardware call, render pass or external model/API.
- Strict reduced-motion, pause and invalid-track guards. Default disabled; strength 0–80%.
- New pure regression and isolated TypeScript tests wired into Ubuntu/Windows production and Vercel gates.
