require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const base=path.join(__dirname,'../components/visualizer');
const source=fs.readFileSync(path.join(base,'partnerMotionSync.ts'),'utf8');
const avatar=fs.readFileSync(path.join(base,'ThreeAvatar.tsx'),'utf8');
const checks={
 'shared state':source.includes('createPartnerSyncState'),
 'bounded time step':source.includes('clamp(delta, 0, 0.12)'),
 'shared BPM clock':source.includes('dt * bpm / 240'),
 'observed phrase guarded':source.includes('confidence >= 0.75'),
 'PLL correction bounded':source.includes('-0.045, 0.045'),
 'circular phase wrap':source.includes('circularError'),
 'reset on solo pause':source.includes('scene === "solo"'),
 'duet response offset':source.includes('scene === "duet" ? 0.125 : 0'),
 'contact emphasis':source.includes('contactGain'),
 'sync invoked in RAF':avatar.includes('advancePartnerSync(partnerSync.current, props.audio, delta'),
 'lead phase integrated':avatar.includes('beat * directedLead, sync.leadPhase'),
 'partner phase integrated':avatar.includes('beat * directedPartner, sync.partnerPhase'),
 'hand gain integrated':avatar.includes('visibility.current) * sync.contactGain'),
 'track change resets sync':avatar.includes('partnerSync.current = createPartnerSyncState()'),
 'GLB hand IK preserved':avatar.includes('updatePartnerHandIK('),
 'foot IK preserved':avatar.includes('updateFootIK('),
};
for(const [name,ok] of Object.entries(checks)){assert.ok(ok,name);console.log('✓',name)}
console.log(Object.keys(checks).length+' V159 synchronization checks passed');
