# V245 Motion Matching Build Hotfix

Fixes TypeScript error in `components/visualizer/smartMotionMatching.ts` by locally expressing the Three.js runtime `createInterpolant()` method with a structural type. No animation behavior is changed. Previous lighting and CSS hotfixes remain included.

Run `npm install` and `npm run build`.
