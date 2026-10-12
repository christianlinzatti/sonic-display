# Sonic Display V38

A Raspberry Pi-friendly Next.js/React starter for a Spotify now-playing display with album artwork and lyrics. It uses a central React `MusicContext` and normalized app types so later modules (e.g. Three.js/React Three Fiber visualization, clock, weather, or other metadata) can consume the same current context.

## Included

- Spotify OAuth Authorization Code flow with `state` validation
- Spotify Client Secret stays on the server
- Encrypted AES-256-GCM `HttpOnly` session cookie (access + refresh token)
- Access-token refresh when near expiry
- Current track, artist, album, cover, playback state and progress
- Lyrics provider chain: LRCLIB (synced when available), then lyrics.ovh, then optional Genius (plain text); all normalize to the app-owned `Lyrics` type
- Responsive fullscreen UI suitable for Chromium kiosk mode
- No database required

**Lyrics/policy:** Review Spotify's current Developer Terms/Policy and the lyrics provider's terms before using playback-synchronized lyrics or synchronizing Spotify recordings with visual media. This starter displays LRCLIB timestamps against playback position; disable/remove that behavior if your use case is not permitted or licensed. It does not stream audio.

## 1. Spotify Developer Dashboard

1. Visit https://developer.spotify.com/dashboard and create an app for the Spotify Web API.
2. Copy the **Client ID** and **Client Secret**.
3. In the app settings, add an exact Redirect URI:
   - Local: `http://localhost:3000/api/spotify/callback`
   - Vercel: `https://YOUR-PROJECT.vercel.app/api/spotify/callback`
   - Custom domain: `https://music.example.com/api/spotify/callback`
4. The redirect URI must exactly match `SPOTIFY_REDIRECT_URI` (scheme, host, path).
5. Scopes requested by the app: `user-read-currently-playing user-read-playback-state`.

Spotify references:
- Authorization: https://developer.spotify.com/documentation/web-api/concepts/authorization
- Authorization Code flow: https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- Currently playing: https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
- Scopes: https://developer.spotify.com/documentation/web-api/concepts/scopes
- Refreshing tokens: https://developer.spotify.com/documentation/web-api/tutorials/refreshing-tokens

## 2. Run locally

Requirements: Node.js 20.9+ and npm.

```bash
cp .env.example .env.local
```

Set values in `.env.local`:

```dotenv
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/spotify/callback
SESSION_SECRET=generate-a-long-random-secret
LRCLIB_USER_AGENT=SonicDisplay/0.1.0 (https://your-domain.example)
```

Generate a session secret, e.g.:

```bash
openssl rand -base64 32
```

Then:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and press **CONNECT SPOTIFY**.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository at https://vercel.com/new.
3. Add the environment variables from `.env.example` in **Project → Settings → Environment Variables**. Set `SPOTIFY_REDIRECT_URI` to your exact production callback URL.
4. Deploy (or redeploy after changing environment variables).
5. Add the production callback URL to the Spotify app's Redirect URIs.
6. Open the deployed site and connect Spotify.

Do not commit `.env.local` or expose `SPOTIFY_CLIENT_SECRET` in any `NEXT_PUBLIC_*` variable.

## 4. Raspberry Pi kiosk

Open the deployed URL in Chromium. Example kiosk launch:

```bash
chromium --kiosk --noerrdialogs --disable-infobars --start-fullscreen https://YOUR-PROJECT.vercel.app
```

The display polls the app API every few seconds. The browser receives only normalized playback data and never receives the Spotify client secret or refresh token as JavaScript-readable data.

## 5. Architecture and extension points

```text
Raspberry Pi / Chromium
        │ HTTPS
        ▼
Next.js on Vercel
  ├─ /api/spotify/login
  ├─ /api/spotify/callback
  ├─ /api/spotify/current
  ├─ /api/spotify/disconnect
  └─ /api/lyrics
        │
        ▼
MusicContext (normalized shared state)
  ├─ Track: title, artists, album, cover, duration
  ├─ Playback: playing, progress, fetchedAt
  └─ Lyrics: provider, synced, timestamped lines
        │
        ├─ Now Playing UI
        ├─ Lyrics UI
        └─ Future visualizer / other widgets
```

Key files:
- `context/MusicContext.tsx` — single client-side state provider and polling
- `types/music.ts` — extensible app-owned data model
- `lib/spotify.ts` — server-side token exchange/refresh
- `lib/session.ts` — encrypted cookie helpers
- `services/lyrics/server.ts` — provider orchestration and normalized `Lyrics` result
- `services/lyrics/providers/lrclib.ts` — LRCLIB adapter and LRC parser
- `services/lyrics/providers/lyricsOvh.ts` — plain-text fallback adapter
- `components/SonicDisplay.tsx` — presentation only

## Notes / troubleshooting

- **Invalid redirect URI:** exact mismatch between dashboard URI and `SPOTIFY_REDIRECT_URI`.
- **No current track:** start playback on Spotify and verify the account authorized the app.
- **No lyrics:** the app tries LRCLIB by title, artist, album and duration, then lyrics.ovh by title and artist. lyrics.ovh provides unsynchronized plain text; provider availability and catalog coverage can vary.
- **Session not retained:** verify HTTPS in production and that `SESSION_SECRET` is configured consistently across deployments.
- **Token refresh failure:** reconnect Spotify; the app clears the session on an API 401.

LRCLIB docs: https://www.lrclib.net/docs

## Robuste Spotify-Verbindung

Die aktuelle Version erneuert Tokens 90 Sekunden vor Ablauf. Bei einem Spotify-401 wird einmalig ein Refresh versucht und die API-Anfrage wiederholt. Ein ungültiger Refresh-Token führt zu einer erneuten Anmeldung; vorübergehende Netzwerk-/Spotify-Fehler lassen die Session bestehen. API-Aufrufe haben ein 12-Sekunden-Timeout. Bei HTTP 429 wird `Retry-After` berücksichtigt, bei anderen Fehlern steigt das Polling-Intervall schrittweise bis maximal 60 Sekunden. Nach erfolgreicher Antwort wird auf 4 Sekunden zurückgestellt. Der letzte bekannte Track bleibt bei temporären Fehlern sichtbar.

Hinweis: Auf Vercel sind einzelne Serverless-Aufrufe nicht garantiert seriell. Die Anwendung vermeidet parallele Refresh-Aufrufe innerhalb eines Browser-Tabs; mehrere gleichzeitig geöffnete Tabs/Geräte können weiterhin konkurrierende Refreshes auslösen. Für einen einzelnen Raspberry-Pi-Kiosk sollte daher nur ein Display-Tab laufen.


## Erweiterbare Architektur (v3)

Die Anwendung trennt API-Adapter (`services/`), Polling/Retry (`hooks/`), globalen Musikzustand (`context/`), Datenverträge (`types/`) und Darstellung (`components/`). Spotify-Tokens bleiben serverseitig. Details und Erweiterungspunkte stehen in `ARCHITECTURE.md`. Neue Lyrics-Anbieter sollen auf den app-eigenen `Lyrics`-Typ normalisieren; Visualizer erhalten Daten als Props und führen keine eigenen API-Aufrufe aus.

## Lyrics providers

Lyrics lookup is server-side and runs through `services/lyrics/server.ts`. LRCLIB is preferred because it can return timestamped lines. If it has no usable result or is temporarily unavailable, the app tries lyrics.ovh. Both adapters normalize results to the app-owned `Lyrics` shape (`provider`, `synced`, `lines`, `plainText`); lyrics.ovh results are marked `synced: false`. To add another source, implement an adapter under `services/lyrics/providers/` and return the normalized type. Review each provider's terms and usage limits before deployment.

## Optional microphone audio analysis

The display includes an opt-in browser microphone analyzer. Click **Mikrofon aktivieren** and grant microphone permission. The signal is analyzed locally with the Web Audio API; raw audio is not uploaded to Vercel. It exposes normalized bass, mids, highs, volume and a heuristic beat impulse through `AudioAnalysisContext`, ready to be passed as props to visualizer modules. Disable the microphone to stop the media tracks and close the AudioContext.

Microphone access requires a secure context (HTTPS; localhost is generally allowed). On a Raspberry Pi kiosk, grant/allow the site's microphone permission in Chromium. Room noise and speaker placement affect results; beat detection is heuristic, not guaranteed musical beat tracking. Use a USB microphone for a first setup. No microphone permission is requested until the user enables it.


### Automatic avatar genre detection (Last.fm)
Create a Last.fm API key at https://www.last.fm/api/account/create and set `LASTFM_API_KEY` in `.env.local` and Vercel Project Settings → Environment Variables. The key is used only by the server route `/api/genre`; it is never sent to the browser. The route checks Last.fm track top tags first, then artist top tags if the track has no tags, and maps recognized tags to the avatar genres. Results are cached for one day. Unknown tags leave the current/manual genre selection intact.


### Genre state in MusicContext
Last.fm genre lookup now runs in `MusicProvider` whenever the current track changes. Components can read `genre`, `detectedGenre`, `genreStatus`, `genreSource`, `genreMatchedTag`, `genreError`, and `genreOverride` through `useMusic()`. Use `setGenreOverride(genre)` to choose a genre manually, or `setGenreOverride(null)` to return to Last.fm detection. The animation controller only renders this context state and does not call the genre endpoint itself.


### Genius lyrics provider
Set `GENIUS_ACCESS_TOKEN` from your Genius developer account in `.env.local` and Vercel environment variables. It is only read server-side. Provider order is LRCLIB, lyrics.ovh, then Genius; Genius results are unsynchronized plain text. The `genius-lyrics-api` package searches Genius and extracts lyrics from the Genius page, so it depends on the site's markup and applicable terms; treat it as a best-effort fallback. Do not expose the token in `NEXT_PUBLIC_*` variables.

### Music source boundary and UI preferences
`MusicSource` is the adapter contract in `types/music.ts`. A source adapter fetches its provider-specific data and maps it into the app-owned `CurrentTrackResponse`/`MusicState` shape before React context sees it. `services/musicSource.ts` currently implements Spotify. UI preferences are kept separately in `UiPreferencesContext` and persisted to browser localStorage; playback/connection state remains transient in `MusicContext`.

### MusicProvider organization
`MusicProvider` composes playback polling with `useGenreDetection` and owns only cross-feature orchestration (manual genre override and disconnect). Keep future independent features in focused hooks/contexts rather than adding unrelated state/effects directly to the provider.

### Visualizer state
Visual components can consume `useVisualizer()` from `context/VisualizerContext.tsx`. It combines track/playback state, genre selection, audio metrics, and persisted UI preferences while keeping the underlying providers separate.

### Visualizer modes
Visual modes are registered in `components/visualizer/registry.tsx` (`wave`, `particles`, `album-glow`, `avatar`). The selected mode is read from persisted UI preferences by `VisualizerStage`. Add a mode by implementing `VisualizerProps` and adding a registry entry.

### 3D Avatar (v14)
The Avatar visualizer uses React Three Fiber and a procedural, stylized 3D character. Bass drives a gentle head pulse, volume affects torso width, and beat strength adds a subtle rotation impulse. This is a procedural placeholder character; replace its geometry/materials in `components/visualizer/ThreeAvatar.tsx` with a GLTF avatar when ready. Install dependencies with `npm install` before running the app.

### Optional custom GLTF avatar (v15)
You can use your own `.glb`/`.gltf` character without changing the visualizer registry. Put the model in a publicly reachable location (for example `public/models/avatar.glb`) and set `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` in `.env.local`. Restart Next.js after changing the variable. When no model URL is configured, Sonic Display uses the built-in procedural avatar. The GLTF scene receives subtle beat/bobbing motion; rigged skeletal dance animations are not yet mapped.

#### Rigged avatar animation clips
For animated `.glb`/`.gltf` avatars, include animation clips in the model. Sonic Display automatically prefers clip names containing `dance`, `move`, or `groove` during playback and `idle`, `stand`, or `rest` while paused. Clips cross-fade when playback changes. Models without matching clips continue to use procedural movement. Reduced Motion suppresses dance clips.

### Avatar animation mapping (v17)

Edit `components/visualizer/animationMapping.ts` to map your model's animation clip names to genre-specific playback and idle behavior. Matching is case-insensitive and uses regular expressions. For example, a Hardstyle model can expose clips named `Headbang_Loop` and `Idle`; the `hardstyle` mapping will select them automatically. If no genre-specific clip matches, generic dance/move/groove and idle/stand/rest names are used as fallback. Add a `default` mapping for other genres.

### Avatar-Auswahl
Unter Settings kannst du zwischen dem prozeduralen Avatar und einem konfigurierten GLTF-Modell wechseln. Für ein eigenes Modell setze `NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb` und lege die Datei unter `public/models/avatar.glb` ab. Weitere Modelle können in `components/visualizer/avatarModels.ts` ergänzt werden; dort jeweils eine eindeutige `id`, ein Label und eine URL eintragen. Die Auswahl wird als UI-Präferenz lokal gespeichert.

### Avatar library (v19)
Choose an avatar card in Settings. Register additional entries in `components/visualizer/avatarModels.ts`; set the corresponding model URL in environment variables. Optional preview images belong in `public/avatars/`.

```env
NEXT_PUBLIC_AVATAR_MODEL_URL=/models/avatar.glb
NEXT_PUBLIC_AVATAR_NEON_URL=/models/neon.glb
NEXT_PUBLIC_AVATAR_FESTIVAL_URL=/models/festival.glb
```
Models without a configured URL are disabled in the library. The built-in procedural avatar is always available.

## Version 20 – Avatar controls
The Settings panel now includes avatar scale, vertical offset, animation intensity, and optional genre-based model selection. Genre auto-selection uses a small editable mapping in `components/visualizer/VisualizerStage.tsx`; unavailable model URLs fall back through `getAvatarModel` to the procedural avatar. These preferences are persisted with the existing UI preferences.

## Version 21 – Avatar Editor

The Avatar settings now include a live React Three Fiber preview. For GLB/GLTF models, available animation clips are detected and can be selected and tested directly. The preview also reacts to live AudioFeatures and includes a temporary beat-test button. Procedural avatars use the same preview area and expose their audio reaction without authored clips.

### Audio analysis (V23)
Microphone analysis exposes normalized bass/mids/highs, kick/snare/hi-hat bands, attack/decay and an energy envelope. A lightweight onset-interval estimate reports BPM after repeated detected beats; it is an approximate live estimate, not Spotify track metadata or a guaranteed tempo detector. Microphone access requires user permission and a secure context (HTTPS/localhost).

### Live audio debug
Enable microphone analysis in Settings to inspect live kick/snare/hi-hat estimates, frequency-band levels, energy envelope, attack/decay, beat detection, and estimated BPM. These are heuristic microphone-derived signals; use headphones or route playback to the microphone input for testing.

### Beat calibration assistant (v26)
In Settings → Beat calibration, enable microphone analysis and play representative music. The assistant samples the kick-band level for eight seconds, estimates a starting sensitivity, and lets you apply it manually. This is a heuristic starting point; room acoustics, microphone gain, and music style affect the result.


## Version 27: Beat timeline
The audio debug panel shows recent detected beat impulses over a rolling five-second window, with marker height representing beat strength. Events are generated by microphone beat detection and cleared when analysis is disabled.

### BPM / Beat Grid

The audio debug panel includes a rolling beat grid. Detected microphone beats are shown against an extrapolated grid derived from the current BPM estimate, with an approximate timing-error indicator for tuning sensitivity and cooldown settings.

## Version 29 – Music-reactive avatar

The avatar now uses a pure `getAvatarAnimationState()` engine to map normalized audio features, playback state, genre, reduced-motion preference, and user intensity into animation targets. The procedural and GLTF avatar paths consume the same targets. Genre profiles are defined in `components/visualizer/avatarAnimationEngine.ts` and can be extended there.


## Version 30 – GLTF rig bone/node control

V30 adds a small additive rig controller for custom GLTF avatars. When a model exposes recognisable nodes/bones, Sonic Display automatically finds head, neck, spine/chest and left/right arm nodes and overlays music-reactive motion on top of authored dance/idle clips.

Supported node-name patterns are intentionally broad (for example `Head`, `Neck`, `Spine`, `Chest`, `LeftArm`, `RightArm` and common variants). The controller tracks its own overlay deltas, so it does not replace the rotations produced by the GLTF animation mixer. Models without matching rig nodes continue to work normally with the existing root-level motion.

The mapping implementation lives in `components/visualizer/avatarRigController.ts`. This is deliberately separate from the audio engine so future versions can add per-model rig profiles without coupling them to beat detection.


## V32 – Avatar Rig Profiles

V32 adds configurable GLTF rig profiles (`auto`, generic humanoid, Mixamo, Ready Player Me, robot). Profiles control node/bone aliases and per-part music-reaction multipliers. The selected profile is persisted with UI preferences and applied additively on top of authored GLTF animation clips.


## V32 – Avatar Dance Presets

V32 separates the avatar rig profile from the dance style. Dance presets can be selected independently and combine with Auto/Generic/Mixamo/Ready Player Me/Robot rig profiles. Presets affect kick response, head movement, sway, body bounce, chest pulse and arm swing. Auto selects a style from the detected genre. Preferences are persisted locally.


## V33 Dance Intelligence

V33 adds a stateful dance-intelligence layer that detects beat accents, energy build-ups and drops, then introduces controlled phrase variation. The layer sits above the audio animation engine and below rig/preset application, so existing profiles remain reusable.


## V35 – Full-Body Music Performance

Adds lower-body music-reactive dance: leg groove, alternating weight shift and foot-step impulses. These targets are applied through the existing GLTF rig overlay and remain independent from authored animation clips, dance presets and rig profiles.


## V36 – Emotion & Expression

V36 adds a separate avatar expression engine. It derives a stable expression from playback, audio energy and genre, with profiles such as neutral, cool, euphoric, aggressive and relaxed. GLTF avatars can use detected jaw and eye nodes plus subtle head tilt; avatars without facial rig nodes safely keep their existing dance motion. The expression layer is intentionally independent from dance presets and rig profiles.

### V37 – Performance Director

The avatar now has a lightweight performance director that acts like a choreographer above the existing dance systems. It infers coarse musical phases such as intro, verse, chorus, drop and break from normalized audio energy, then changes between phrase-aware movement patterns with smooth transitions.

The director is deliberately heuristic: it does not pretend to know exact Spotify song sections when those timings are not present in the normalized playback model. It coordinates existing Dance Intelligence, Dance Presets, Full Body Dance and the V36 Expression Engine rather than replacing them.

### V38 – Musical Structure & Dramaturgy

V38 adds `musicalStructureEngine.ts` above the Performance Director. It detects coarse musical phases from the existing normalized energy/attack/bass/BPM model, including build-ups, drops and post-drop release. Phrase position is deterministic and is used for controlled variation rather than per-frame randomness. This is intentionally heuristic; exact song arrangement metadata is not assumed.


## V40 – Advanced Dance Choreography

`components/visualizer/advancedDanceChoreography.ts` selects short, genre-aware movement combinations at stable 8-beat phrase boundaries. It blends between combinations and layers arm, leg, hip, head and pose accents onto the existing GLTF rig controller. Patterns adapt to the Performance Director section (for example, stronger kick/headbang combinations during a drop and softer flow combinations during a break). The engine uses the app's normalized audio features; it does not claim access to exact Spotify song-section timestamps.


## V41 – Avatar Personality & Signature Moves

`avatarPersonalityEngine.ts` selects a stable avatar personality from model ID, genre, and dance preset, then chooses a signature move per musical phrase. Signature accents are blended into the existing full-body choreography; no per-frame randomization is used. These are heuristic movements derived from the available audio features, not authored Spotify song-section metadata.


## V42 – Adaptive Dance Intelligence

V42 makes phrase-level choreography adaptive. The selector tracks a smoothed energy trend, prefers stronger moves during rising energy and calmer moves as energy falls, and penalizes combinations used in the recent phrase history. Choices are made at phrase boundaries rather than every animation frame, preserving stability. `adaptiveIntensity` and `novelty` are exposed in the choreography output for tuning/debugging. This remains a heuristic over normalized audio features, not machine learning or access to Spotify's unavailable arrangement labels.


## V43 – Dance Memory & Long-Term Variety

V43 extends phrase-level selection with playback-session memory. It tracks move frequency across the song session, applies a bounded long-term repetition penalty, and records recent choices separately for short-term avoidance. Re-entering a drop increments a section counter so recurring drops can retain an energetic character while selecting a different compatible accent when available. History is bounded to avoid unbounded growth during long playback. This is deterministic heuristic variation; it does not claim to identify official Spotify song sections.


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
