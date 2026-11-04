# Sonic Display V399 – Live Multi-Avatar Camera Studio

## Changes

- A fully independent, on-demand React Three Fiber camera stage for **one to four performers**, accessible via Settings → Avatar tuning → **V399 · Live Multi-Avatar Camera Studio öffnen**. It uses one Canvas (only while the editor is open), lightweight demo figures, or clone-isolated GLB models from the existing model library; model loading failures degrade to a neutral figure.
- The editor can display **real saved V326 group cue coordinates** for three/four performers when the group stage is enabled; otherwise it explicitly labels its synthetic arrangement as a **demo**. V326 cues are read-only in the camera editor. The existing V326 formation editor remains responsible for authoring positions.
- Switch among Verse, Hook, and Drop, and preview solo, two-shot and group framing. Choose lead and duet partner manually for the *preview*, without implying automatic singer identity. Invalid duets fall back safely to a solo shot. Stage framing adapts to the actual group width. Existing V398 camera profiles for the chosen song section drive preview pan and zoom.
- Interactive orbit/zoom/pan in the preview. **Save shot, bounded radial zoom and lateral pan** into V398's existing per-section preferences. Arbitrary camera tilt/rotation is preview-only, because V398's live camera system does not persist these axes. A separate button cycles Verse → Hook → Drop with eased transitions; reduced-motion preference turns transitions off.
- Manually chosen 3D preview models, focus slot and camera trial shots have no effect on the real performance unless the user explicitly saves camera settings and enables V397 + V398. No additional automatic camera is installed in the live rendering loop; V398/V397 lyrics safety, authored camera override, visual casting and show priority remain intact.

## Limitations and provenance

The preview loads stored GLB models and V326 layout cues, **not** the full live audio-driven choreography or an inferred singer/duet role. When V326 is not active, positions are demonstration placeholders. Only section framing variables are saved. The preview is not a rendered video export or a camera timeline. No face tracking, motion inference, or speaker detection is added.

## Verification

Run `npm run test:v399`, `npm run check:syntax`, or `npm run verify:offline`. Full `npm run verify` needs the project’s npm dependencies and a browser/GPU runtime; offline validation alone cannot establish production build or visual behavior.
