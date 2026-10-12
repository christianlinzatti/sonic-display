# Sonic Display architecture

## Boundaries
- `app/api/**`: server-side routes; OAuth, encrypted session and Spotify tokens remain server-only.
- `services/spotify`: browser-facing API adapter. It calls our own Next.js routes and never handles credentials.
- `services/lyrics`: server-side provider orchestration and adapters. LRCLIB is preferred; lyrics.ovh is a plain-text fallback. Both normalize to `Lyrics`, and the UI does not depend on external response formats.
- `hooks/usePlaybackPolling`: polling, retry/backoff, visibility handling, last-known-state retention and lyrics refresh.
- `context/MusicContext`: shared application state and commands; components consume `useMusic()` only.
- `components`: presentation only. Keep data fetching out of visual components.
- `types`: stable app-level contracts, independent from external API response types.

## Extension points
1. Add further lyrics providers under `services/lyrics/providers/`, then register them in `services/lyrics/server.ts`; normalize each result to `Lyrics`. Current chain: LRCLIB first, lyrics.ovh fallback.
2. Add visualizer implementations under `components/visualizer`; pass normalized playback/track props rather than fetching data.
3. Add a `MusicSource` interface if another player/source is introduced; map it into `MusicState` before it reaches the context.
4. Persist UI preferences separately from playback state.

## Runtime flow
Spotify OAuth and token refresh run in server routes. The client polls `/api/spotify/current`, stores the latest normalized response in the context, and fetches lyrics only when track identity changes. Transient failures retain the last known track and set `connectionStatus` to `reconnecting`; authentication failures set it to `disconnected`.

### Optional audio analysis
`AudioAnalysisProvider` owns the opt-in microphone lifecycle and `useMicrophoneAnalysis` performs local Web Audio frequency analysis. It publishes normalized `bass`, `mids`, `highs`, `volume`, and heuristic `beat` metrics. UI/visualizer components consume metrics through context or can receive the metrics as props from a host. Audio capture is never required for Spotify metadata/lyrics and is stopped when disabled/unmounted.


## Genre detection
`MusicContext` requests `/api/genre` when the current track changes and exposes the detected genre, lookup status/source/tag, and an optional manual override through `useMusic()`. The server-only route queries Last.fm `track.getTopTags`, falling back to `artist.getTopTags`, then maps known tags to supported avatar genre IDs. Last.fm credentials stay server-side; unknown tags or lookup failures do not block playback or avatar rendering. Responses are cached for 24 hours. The animation controller is presentation-only and does not fetch genre data.


## Music source and UI preferences
`MusicSource` defines the source adapter boundary. Provider responses are mapped into normalized app playback data before entering `MusicContext`. The current adapter is `services/musicSource.ts` (Spotify). UI-only choices live in `UiPreferencesContext`, persisted independently from playback state in localStorage. `MusicProvider` composes playback polling and `useGenreDetection`; add future features as focused hooks/contexts rather than expanding this provider with unrelated concerns.

## Genius lyrics
The lyrics chain is LRCLIB → lyrics.ovh → Genius. The Genius adapter is server-only and normalizes plain text into `Lyrics` lines with `synced: false`. Configure `GENIUS_ACCESS_TOKEN`; without it Genius is skipped.

## Visualizer composition
`VisualizerProvider` composes normalized playback/genre state, microphone audio metrics, and persisted UI preferences into one `useVisualizer()` interface for visual components. It is nested inside the music and audio providers; visual components should consume this interface rather than coupling directly to those underlying contexts.

## Visualizer registry
`components/visualizer/registry.tsx` maps stable mode IDs to metadata and components. `VisualizerStage` selects the registered mode from persisted UI preferences and passes normalized audio, track, playback, and reduced-motion props. Add new visualizers by implementing `VisualizerProps` and registering a definition; keep source/provider concerns outside visualizer components.

## 3D Avatar
The `avatar` registry entry renders `ThreeAvatar`, a client-side React Three Fiber scene. It consumes the same normalized `VisualizerProps` as other visualizers, keeping Three.js out of the playback and audio-analysis contexts.

### Avatar model adapter
`ThreeAvatar` selects a custom GLTF scene when `NEXT_PUBLIC_AVATAR_MODEL_URL` is configured; otherwise it renders the procedural fallback. The model is loaded client-side through `@react-three/drei`/`useGLTF`. The adapter applies subtle whole-model motion from normalized audio features. Animation-clip selection and rig-specific bone mapping remain future work.

### Rigged GLTF animation clips
The GLTF avatar reads embedded animation clips. Clip names containing `dance`, `move`, or `groove` are preferred during playback; names containing `idle`, `stand`, or `rest` are preferred while paused. Clips cross-fade on playback state changes. If no matching clips exist, the existing procedural motion remains active. `reducedMotion` suppresses authored dance clips.

## Avatar library
`avatarModels.ts` is the registry for avatar metadata, optional preview assets, and configured GLTF URLs. `SettingsPanel` presents selectable cards and disables unavailable external models. `VisualizerStage` resolves the selected model through `getAvatarModel`, keeping model selection separate from playback state.

### Avatar customization
Avatar presentation settings (scale, vertical offset, animation intensity, and optional genre-based model selection) live in `UiPreferences`, separate from playback state. `VisualizerStage` resolves the selected model and passes presentation values through `VisualizerProps`; the 3D component applies transforms and motion intensity.

## Avatar Editor

`components/visualizer/AvatarEditor.tsx` is an isolated preview/editor surface. It consumes `VisualizerContext`, loads the selected avatar model, discovers GLTF animation clips, and lets the user test a clip without changing playback state. Persistent avatar preferences remain in `UiPreferencesContext`; temporary editor state (selected clip, play state, test beat) is intentionally local to the editor.

## Audio feature extraction (V23)
`useMicrophoneAnalysis` computes normalized frequency bands, transient attack/decay, a smoothed energy envelope, and a rolling BPM estimate from detected bass onsets. The estimate is intentionally approximate and remains `null` until enough plausible beat intervals are observed.

### Live audio debug (v24)
`AudioDebugPanel` reads the normalized `AudioFeatures` from `AudioAnalysisContext` and renders live meters for kick, snare, hi-hat, frequency bands, energy envelope, attack, and decay, plus beat/BPM estimates. It is displayed in Settings when microphone analysis is enabled. Frequency bands are heuristic and overlap; they should not be interpreted as reliable instrument classification.

### Beat calibration assistant
`BeatCalibrationAssistant` samples normalized kick-band values during an explicit eight-second user session and proposes (but does not automatically apply) a sensitivity value. The user confirms whether to persist it through `UiPreferencesContext`.


## Version 27: Beat timeline
The audio debug panel shows recent detected beat impulses over a rolling five-second window, with marker height representing beat strength. Events are generated by microphone beat detection and cleared when analysis is disabled.

## BPM / beat grid

`BeatGridVisualizer` renders a short rolling view of detected beat events together with an extrapolated beat grid based on the current BPM estimate. It is diagnostic only: the grid is derived from the microphone beat detector and should not be treated as a phase-accurate music clock.

### Avatar animation engine (v29)

`components/visualizer/avatarAnimationEngine.ts` is a pure mapping layer from audio/playback inputs to body bounce, head nod, sway, and beat impulse targets. It is deliberately independent of React Three Fiber so its behavior can be unit-tested and reused by future bone/node animation adapters. The avatar components apply frame-based smoothing when consuming the targets.


## V30 avatar rig layer

`components/visualizer/avatarRigController.ts` is the GLTF-specific motion layer. It discovers common bone/node names, then applies small additive local rotation overlays for head, neck, spine/chest and arms. `avatarAnimationEngine.ts` remains the source of music-reactive targets. Authored GLTF clips remain responsible for the main pose/dance.


## V32 – Avatar Rig Profiles

V32 adds configurable GLTF rig profiles (`auto`, generic humanoid, Mixamo, Ready Player Me, robot). Profiles control node/bone aliases and per-part music-reaction multipliers. The selected profile is persisted with UI preferences and applied additively on top of authored GLTF animation clips.


## V32 – Avatar Dance Presets

V32 separates the avatar rig profile from the dance style. Dance presets can be selected independently and combine with Auto/Generic/Mixamo/Ready Player Me/Robot rig profiles. Presets affect kick response, head movement, sway, body bounce, chest pulse and arm swing. Auto selects a style from the detected genre. Preferences are persisted locally.


## V33 Dance Intelligence

V33 adds a stateful dance-intelligence layer that detects beat accents, energy build-ups and drops, then introduces controlled phrase variation. The layer sits above the audio animation engine and below rig/preset application, so existing profiles remain reusable.


## V35 – Full-Body Music Performance

Adds lower-body music-reactive dance: leg groove, alternating weight shift and foot-step impulses. These targets are applied through the existing GLTF rig overlay and remain independent from authored animation clips, dance presets and rig profiles.

## V36 – Avatar Expression Engine

`avatarExpressionEngine.ts` is an independent face/mood layer. It derives a coarse expression mood and subtle jaw/eye/head targets from genre and normalized energy/beat data. Missing facial nodes are safe because the rig controller treats every target as optional.

## V37 – Performance Director

`performanceDirector.ts` is the orchestration layer above Dance Intelligence, dance presets and the Expression Engine. It infers coarse performance sections (`intro`, `verse`, `chorus`, `drop`, `break`, `outro`) from the normalized energy envelope, attack and beat accents. Because section timing is not guaranteed by the current Spotify-facing model, these are intentionally heuristic rather than claims about the song's actual arrangement.

The director selects phrase-aware performance patterns, keeps minimum section/pattern durations to prevent flicker, and exposes smooth transition blending, performance intensity, drop pose impulses and expression intensity. It does not replace the lower-level dance, full-body or expression systems; it coordinates their strength and timing.

Runtime flow:
`Spotify audio features → Dance Intelligence → Performance Director → Dance Pattern / intensity → Animation + Full Body Dance`
`                                                   ↘ Expression intensity → Expression Engine → Rig`

## V38 – Musical Structure & Dramaturgy

`musicalStructureEngine.ts` adds a lightweight state machine for musical dramaturgy. It tracks smoothed energy, energy trend, phrase position, build-up strength, drop impulses and post-drop release. It infers coarse phases (`intro`, `verse`, `build-up`, `drop`, `break`, `outro`) from the normalized audio model rather than claiming access to exact song-section metadata.

The Performance Director now consumes this structure layer. Build-ups increase the eventual performance target, drops receive a stronger pose impulse, and phrase progress drives deterministic pattern variation. The structure engine is presentation logic only: it does not access Spotify, microphone devices, or network services.

Runtime flow:
`Normalized audio → Musical Structure → Performance Director → Dance Pattern / Expression → Animation Engine → Rig Profile → GLTF`

## V39 – Natural Motion & Personality

`naturalMotionEngine.ts` adds a stateful motion-shaping layer for anticipation, follow-through, hip sway, shoulder roll, head lag and weight shift. Motion profiles are selected from genre/dance-preset hints (`hardstyle`, `hardcore`, `techno`, `rock`, `metal`, `ambient`, `robot`, `default`). Inputs are smoothed with frame-rate-independent exponential easing; variation is phase-based and deterministic rather than random on every frame.

The GLTF rig controller applies these values as small additive overlays to available hips, spine, arms and head nodes. Missing nodes remain optional, and authored GLTF clips continue to provide the main choreography. The natural-motion layer shapes timing and secondary motion; it does not replace Dance Intelligence, Musical Structure, Performance Director, Dance Presets or Rig Profiles. Reduced-motion and paused states fade its targets back toward neutral.

Runtime flow:
`Audio + genre/preset → Natural Motion (anticipation/follow-through/personality) → GLTF rig overlays`


## V40: Advanced Dance Choreography

The `Advanced Dance Choreography` layer runs after the Performance Director. It selects a deterministic, genre-family movement sequence per 8-beat phrase and smoothly blends its accents into the existing natural-motion and full-body targets. The layer does not replace the Dance Preset, Rig Profile, Expression Engine, or authored GLTF clips; it adds small coordinated accents to arms, legs, hips and head. Section-specific move pools emphasize drop hits during drops and flow during breaks.


## V41 – Avatar Personality & Signature Moves

`avatarPersonalityEngine.ts` selects a stable avatar personality from model ID, genre, and dance preset, then chooses a signature move per musical phrase. Signature accents are blended into the existing full-body choreography; no per-frame randomization is used. These are heuristic movements derived from the available audio features, not authored Spotify song-section metadata.


## V42 – Adaptive Dance Intelligence

The advanced choreography selector now tracks recent movement history and a smoothed energy trend. At each 8-beat phrase boundary it scores eligible genre/section moves, discourages recent repetition, and biases selection toward energetic or flowing moves as the trend rises or falls. Output includes adaptive intensity and a novelty signal. This is deterministic, stateful heuristic logic; it does not train a model or claim exact Spotify song-section access.


## V43 – Dance Memory & Long-Term Variety

`advancedDanceChoreography.ts` maintains two memory horizons: a short recent-move queue and song-session move counts/history. The selector penalizes both immediate repetition and moves overused earlier in the session. Drop entries are counted so repeated high-energy sections can vary without losing their signature. The history list is capped at 96 entries; aggregate counts remain small and bounded by the finite move set.


## V44 – Live Dance Tuning

Dance intensity (existing 0–2× control), aggression (0–100%), variation (0–100%) and Smooth/Balanced/Sharp motion style are editable live in Settings. They are persisted in the existing local UI preferences and passed to the avatar renderer without replacing dance presets or rig profiles. Aggression biases choreography selection and boosts rig accents; variation changes repeat avoidance and phrase tie-breaks; style adjusts transition/interpolation responsiveness. Procedural fallback supports intensity, aggression and style, while detailed phrase variation requires a GLTF rig. No microphone input is required.


## V45 — Dance Preset Studio

Create, save, select, apply and delete custom dance profiles in Settings → Dance Preset Studio. A profile snapshots the selected built-in dance preset, rig profile, animation intensity, aggression, variation and motion style. Four built-in starter profiles cover Hardstyle, Hardtekk, Metal and Smooth Flow. Custom profiles persist in browser localStorage (up to 40); starter profiles cannot be deleted. Applying a profile updates existing UI preferences and therefore the active avatar without replacing the underlying dance engine. No microphone is required for this feature.


## V46 – Optional microphone / estimated rhythm

The microphone analyzer is still available as an explicit opt-in in Settings and the audio panel. When it is off, a synthetic visual rhythm is derived from the current Spotify playback position and a genre-based *assumed* BPM. This is not genuine Spotify beat detection and cannot identify real kicks, tempo changes, or drops. When microphone capture is active, the measured frequency bands and beat events drive the visualizers instead. If capture is denied or still starting, estimated data is shown with beat impulses suppressed. Microphone processing stays local and stops when disabled.


## V47 — Microphone / playback phase alignment

Optional synchronization settings: Off, Auto (phase estimate against synthetic genre BPM), and Manual. Manual positive offsets delay microphone-driven animation by up to 500 ms using a local sample history. Negative offsets are shown but cannot predict incoming audio. Auto measures circular phase consistency of recent microphone kick transients against the estimated track grid; it reports a phase estimate and confidence, **without automatically applying it**, since the genre BPM is not authoritative Spotify beat data and incorrect alignment would degrade live responsiveness. No microphone audio is uploaded.


## V48 – Automatic microphone BPM detection

Microphone kick onset timestamps feed `BeatTempoTracker`, which evaluates 70–200 BPM candidates, beat subdivisions and skipped beats, temporal phase coherence and confidence. A confidence of at least 0.55 is required before exposing live BPM to the animation engine; otherwise BPM is `null` (the existing synthetic mode remains available when the microphone is off). The Audio Debug Panel displays BPM confidence. Microphone permission remains opt-in. Tempo estimates are heuristic and can be ambiguous at half/double time.


## V49 — Microphone Beat Phase Lock

An optional microphone-derived phase-locked beat clock (`hooks/beatPhaseTracker.ts`) anchors to detected kicks, accepts only onsets close to the predicted grid, and gently corrects drift. When BPM confidence is at least 55% and phase lock is stable, predicted beat pulses supplement real onset pulses in the existing dance engine. Phase and lock confidence appear in the audio debug panel. Loss of tempo confidence or long silence disables phase lock; no Spotify audio analysis is claimed. Manual sync offset remains available.


## V50 — Kick Prediction Engine

`hooks/kickPrediction.ts` creates a confidence-gated, smooth pre-kick envelope from the microphone phase-locked beat grid. When the phase lock is reliable, the avatar prepares for the next predicted beat by slightly lowering its body/head and shifting its weight; on the beat the existing accent logic takes over. The Audio Debug Panel displays time until the next predicted kick and pre-kick intensity. Predictions are disabled without microphone phase lock, during silence or at low confidence; they do not detect or forecast actual song drops.


## V51 – Adaptive Kick Choreography
Optional microphone-onset classifier tracks a moving baseline of detected bass transients and labels measured accents soft/normal/strong. A decaying accent envelope drives stronger avatar head, arm and chest motion on comparatively strong kicks. Predicted phase pulses are not classified as real microphone kicks. Audio Debug shows accent class and envelope. This is relative transient detection, not instrument identification; it depends on microphone quality and loudspeaker placement.

## V52 – Kick Pattern Recognition

`hooks/kickPatternTracker.ts` classifies **measured microphone kick-onset intervals** as `steady`, `double`, `syncopated` or `unknown` relative to the microphone-derived BPM. Classification is confidence-gated and expires after silence; predicted beats are excluded. The Audio Debug Panel shows pattern and confidence. In the 3D avatar, double kicks add a short leg/beat accent and syncopated patterns add a small lateral accent; these effects are disabled without reliable microphone data or when reduced motion is enabled. This is a heuristic rhythmic classifier, not instrument separation, reliable genre recognition or full song structure detection.


## V53 – Rhythm Learning Engine
`hooks/rhythmLearningEngine.ts` groups **measured microphone kick onsets** into four-beat phrases using the microphone-derived BPM. It compares up to six completed phrases, estimates repeatability, and classifies four-on-floor, double-accent, offbeat-accent or variable patterns. Confidence gates a subtle additional beat accent in both 3D avatar paths; the debug panel shows learned rhythm, confidence and phrase count. State is session-only, expires on silence and is reset when microphone capture stops. No microphone permission is requested when microphone mode is off. This is a heuristic classifier, not audio transcription, predictive knowledge of future song sections, or verified kick separation.


## V54 – Rhythm-Aware Choreography

The GLTF avatar now chooses a choreography move vocabulary based on the microphone-derived learned rhythm: four-on-floor, double-accent, offbeat-accent or variable. Switching happens at eight-beat phrase boundaries, with confidence (>= 0.62) and repeated-phrase (>= 2) gating and a three-second dropout grace period. Break/drop dramaturgy still takes precedence. Without reliable microphone learning, existing genre and dance-preset choreography remains in control. The detector is heuristic; it does not transcribe individual instruments.


## V55 – Dance Performance Preview

The microphone Audio Debug Panel includes a read-only Dance Performance Preview. It reports the currently active GLTF choreography sequence and move, estimated song section, learned rhythm/confidence, transition progress and the next *possible* eight-beat switch boundary. The preview reads telemetry from the existing R3F animation loop through a throttled external store (about 6.7 updates/s); it does not independently choose dances. For the procedural avatar it explicitly reports baseline/procedural groove. The switch countdown is a BPM-based estimate, **not** a prediction that a change will occur. The preview appears when microphone analysis is enabled, including when the mic is inactive.


## V56 – Dance Engine Diagnostics & Render Sampling
- Added a lightweight `danceDiagnosticsStore` sampled approximately once per second from the R3F `useFrame` loop (no per-frame React state updates).
- The Audio Debug Panel now shows sampled canvas FPS, mean frame interval, frames slower than 33 ms, active avatar renderer, microphone/estimated source, phase lock and choreography sequence. Diagnostics remain visible when the microphone is off.
- Beat age is shown explicitly as an event-age indicator; it is **not** end-to-end beat/audio/display latency.
- Existing rhythm learning, beat prediction and dance modules retain their previous behavior. This release adds instrumentation, not an unverified claim of better FPS or automatic engine conflict resolution.


## V57 – Adaptive Performance Mode

The 3D avatar Canvas now has an adaptive pixel-ratio controller with Auto, High, Balanced and Low modes. Auto drops one quality tier after three consecutive slow one-second windows (<42 FPS or >30% slow frames), waits eight seconds after a change, and raises quality after twelve consecutive healthy windows (>56 FPS and <8% slow frames). Quality settings persist locally and appear in Dance Engine Diagnostics, even with the microphone off. Only the render pixel ratio changes; animation and audio processing stay intact. FPS is measured from frame intervals and may be limited by browser throttling or device refresh rate.


## V58 — Adaptive Animation Quality

The V57 quality tier now also controls the update cadence of costly GLTF choreography, personality and full-body pattern calculations: High evaluates each frame, Balanced up to 30 Hz, Low up to 20 Hz. Cached motion is reused between evaluations; beat accents, microphone processing, rig interpolation and rendering continue on every frame. The diagnostics panel shows the active cadence and cumulative evaluation/reuse counts. This is a targeted CPU optimization, not a measured Raspberry Pi performance guarantee.


## V59 – GLTF render-path optimization

- Memoizes the loaded GLTF scene instance so ordinary React rerenders no longer clone the model.
- Uses SkeletonUtils.clone for correct skinned-mesh / bone bindings. The cloned hierarchy shares cached geometry and materials; it does not dispose shared GLTF resources.
- Disables shadow-map rendering explicitly for the music stage and its avatar meshes. The stage previously did not enable shadows, so this is a safeguard, **not** a measured FPS improvement.
- Retains V57 adaptive device pixel ratio and V58 animation cadence without changing beat timing.
- No automatic polygon reduction, material simplification or hardware benchmark is claimed.
