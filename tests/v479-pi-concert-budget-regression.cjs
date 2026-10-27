require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {detectPiHints}=load('components/visualizer/piDeviceProfile');
const {initialPiConcertBudgetV479:init,advancePiConcertBudgetV479:step,
 resolvePiConcertEffectsV479:effects,PI_CONCERT_COOLDOWN_MS_V479:cooldown}=load('services/monitoring/piConcertBudgetV479');
const no=detectPiHints('Mozilla/5.0 Windows NT 10.0',16,16);
const arm=detectPiHints('Mozilla/5.0 (X11; Linux aarch64)',4,4);
assert.equal(init('off',arm).enabled,false,'must remain opt-in');
assert.equal(init('auto',no).enabled,false,'not all 4-core browsers are Pi');
assert.equal(init('auto',arm).enabled,true,'Linux ARM hint only with opt-in auto');
assert.equal(init('pi-low',no).level,'eco','explicit Pi Low works on unknown browsers');
assert.equal(init('pi-balanced',arm).level,'balanced');
const input={avatarCount:4,playing:true,visible:true};
function run(prev,fps,p95,count,start){let p=prev;for(let i=0;i<count;i++)p=step(p,{...input,at:start+i*1000,fps,p95FrameMs:p95});return p;}
let b=init('pi-balanced',arm);
b=run(b,22,49,4,1000);assert.equal(b.level,'balanced','one hiccup insufficient');
b=run(b,22,49,1,5000);assert.equal(b.level,'eco','five consecutive windows reduce optional effects');
const eco=effects(b,{avatarCount:4,manualFx:false,manualPostProcess:false,manualShader:false});
assert.deepEqual(eco,{automaticFx:false,automaticPostProcess:false,automaticShader:false});
assert.deepEqual(effects(b,{avatarCount:4,manualFx:true,manualPostProcess:true,manualShader:true}),
 {automaticFx:true,automaticPostProcess:true,automaticShader:true},'manual controls always win');
assert.equal(effects(init('pi-balanced',arm),{avatarCount:4,manualFx:false,manualPostProcess:false,manualShader:false}).automaticPostProcess,false,'crowded stage disables optional pass proactively');
assert.equal(effects(init('off',arm),{avatarCount:4,manualFx:false,manualPostProcess:false,manualShader:false}).automaticPostProcess,true,'existing desktop behavior unchanged');
// Do not respond to paused, hidden, stale, invalid or out-of-order samples.
for(const sample of [
 {...input,at:6000,fps:2,p95FrameMs:90,playing:false},
 {...input,at:6000,fps:2,p95FrameMs:90,visible:false},
 {...input,at:6000,fps:NaN,p95FrameMs:90},
 {...input,at:5000,fps:2,p95FrameMs:90},
])assert.equal(step(b,sample).level,'eco');
let recovered=run(b,55,13,17,6000);
assert.equal(recovered.level,'eco','not enough sustained good samples');
recovered=run(recovered,55,13,1,23000);
assert.equal(recovered.level,'eco','cooldown must prevent early restoration');
// A long sampling gap re-arms the counter; it is not 12 seconds of healthy evidence.
const gap=step(recovered,{...input,at:50000,fps:55,p95FrameMs:13});
assert.equal(gap.goodWindows,0);
const after=run(gap,55,13,18,51000);
assert.equal(after.level,'balanced','sustained healthy frames restore optional effects');
assert(after.lastChangeAt-b.lastChangeAt>=cooldown);
assert.equal(run(init('pi-low',arm),60,12,60,1000).level,'eco','manual Pi Low never automatically overrides its choice');
// Deterministic long playback, no clocks in policy, finite values, bounded decisions.
let long=init('pi-balanced',arm);
for(let sec=1;sec<=1800;sec++){
 const fps=sec%23<9?23:sec%29<20?48:57;
 long=step(long,{...input,at:sec*1000,fps,p95FrameMs:fps<30?54:17});
 assert(['balanced','eco'].includes(long.level));
 assert(long.poorWindows<=5&&long.goodWindows<=18);
}
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const perf=fs.readFileSync('components/visualizer/adaptivePerformance.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/RaspberryPiEdition.tsx','utf8');
assert(avatar.includes('usePiConcertBudgetV479()'));
assert(avatar.includes('piConcertEffectsV479.automaticPostProcess'));
assert(avatar.includes('piConcertEffectsV479.automaticFx'));
assert(avatar.includes('piConcertEffectsV479.automaticShader'));
assert(avatar.includes('<AdaptivePerformanceController avatarCount=')&&avatar.includes('playing={props.isPlaying}'));
assert(perf.includes('samplePiConcertV479({at:nowV518,fps,p95FrameMs,avatarCount,playing,visible:true})'));
assert(ui.includes('configurePiConcertV479(profile,hints)'));
assert(!/Date\.now|performance\.now|Math\.random|localStorage|fetch\(|setTimeout|setInterval/.test(fs.readFileSync('services/monitoring/piConcertBudgetV479.ts','utf8')));
assert.match(require('../package.json').version,/^0\.1\.0-v(47[9]|4[89]\d|[5-9]\d{2,})$/,'V479 behavior remains tested in later releases');
console.log('PASS V479: Pi opt-in, 1–4 avatar budgets, 5 bad/18 good frames, cooldown, manual FX priority, pause/hidden/stale, 30-minute deterministic run');
