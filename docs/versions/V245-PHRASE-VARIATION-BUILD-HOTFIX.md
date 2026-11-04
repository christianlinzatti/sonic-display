# V245 – Phrase Motion Variation Build Hotfix

In `ThreeAvatar.tsx` the V241 phrase variation calculation incorrectly ran inside `ProceduralAvatar`, which had neither `phraseVariationV241` nor `danceVariation` defined. Meanwhile, `GltfAvatar` applied `varied.torso`, `varied.hip`, etc. without defining `varied` in its own scope.

The updater now runs inside the `GltfAvatar` frame loop immediately after emotion state is calculated. The existing GltfAvatar `useRef(createPhraseMotionVariation())` is reused. The unrelated ProceduralAvatar call was removed.

Run `npm run test:v245:phrase` or `npm run build` after installing dependencies. The complete Next.js build has not been verified in this environment.
