# V242 – Intelligent Dance Combination Engine

Built on V241. Installed character motions are sequenced on **16-beat (four-bar) boundaries** when the installed motion library is set to automatic and playback is active. A deterministic score prioritizes genre, BPM eligibility, section metadata and novelty (short bounded motion history). The existing automatic library toggle is the only switch; no migration or configuration file edits. Manually configured avatar animations remain the fallback when automation is disabled.

The stage estimates verse/hook/build/drop/break from **track-relative positions**; these are heuristics, **not genuine structural/audio segmentation**. The library supports only any/build/drop/verse tags; hook and break map preferentially to compatible existing entries. No original motion clips are modified; the existing live animation engine handles transitions. Profile/retargeting and beat-sync systems are preserved.

Test: `npm run verify:offline`; after dependencies are installed run `npm run verify` for a complete build.
