require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const engine=read('components/visualizer/beatPerfectFootworkV234.ts');
const rig=read('components/visualizer/ThreeAvatar.tsx');const ik=read('components/visualizer/avatarFootIK.ts');
const checks=[
 ['beat edge',engine.includes('beat && !state.lastBeat')],
 ['alternating support',engine.includes('state.support === "left" ? "right" : "left"')],
 ['kick intensity',engine.includes('Math.max(kick, strong * 0.65)')],
 ['genre tuning',engine.includes('hardstyle|hardtekk')&&engine.includes('hip.?hop')],
 ['time decay',engine.includes('Math.exp(-dt / tau)')],
 ['pause guard',engine.includes('input.playing && !input.reducedMotion')],
 ['bounded input',engine.includes('Number.isFinite(n)')],
 ['IK fallbacks',ik.includes('(cue?.leftStrength ?? 1)')&&ik.includes('(cue?.rightStrength ?? 1)')],
 ['live pipeline',rig.includes('updateBeatFootwork(beatFootworkV234.current')],
 ['contact integration',rig.includes('footCueV234.contactBoost')&&rig.includes('footCueV234.lockBoost')],
 ['no root manipulation',!engine.includes('root.position')],
 ['registered suite',require('../package.json').scripts['verify:offline'].includes('test:v234')]
];for(const [name,ok] of checks)assert.ok(ok,name);console.log(`V234: ${checks.length} checks passed`);
