'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {createLedWallPixelsV1059:createPixels,planLedWallV1059:plan,sampleLedWallPixelV1059:sample}=load('lib/arena360LedWallV1059');
const durationMs=210000,trackId='spotify:v1059-smoke';
const basePlan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs});
const create=(t=105000,p=basePlan)=>({enabled:true,stageIsArena:true,playing:true,
 reducedMotion:false,reactive:true,performanceTier:'high',trackId,progressMs:t,durationMs,
 strength:70,plan:p,pattern:'auto',show:sampleArenaShowPlanV1040(p,{enabled:true,playing:true,
 reducedMotion:false,progressMs:t,durationMs})});
for(const tier of ['low','balanced','high']){
 const pixels=createPixels(tier);
 assert.equal(pixels.length,tier==='low'?0:tier==='balanced'?144:256);
 for(const px of pixels){assert(Number.isFinite(px.x)&&Number.isFinite(px.y)&&Number.isFinite(px.z));
  assert(px.row>=0&&px.row<px.rows&&px.column>=0&&px.column<px.columns);
  assert(px.y>=-1.7&&px.y<=-.3);
 }
}
const cue=plan(create());assert(cue.active&&cue.reason==='planned');
assert.deepEqual(cue,plan(create()),'deterministic cue');
const chapters=[8000,27000,80000,105000,143000,175000,198000].map(t=>plan(create(t)));
assert(chapters.every(c=>c.active),'seven chapters');
assert.deepEqual(chapters.map(c=>c.chapter),[0,1,2,3,4,5,6]);
assert.deepEqual(chapters.map(c=>c.look),['orbit','equalizer','geometry','pulse','orbit','equalizer','pulse']);
for(const pattern of ['equalizer','geometry','orbit','pulse'])assert.equal(plan({...create(),pattern}).look,pattern,'manual pattern takes priority');
assert.equal(plan({...create(),pattern:'unknown'}).look,'pulse','invalid pattern must fall back to authored pattern');
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const p=generateArenaShowPlanV1040({genre,durationMs}),c=plan(create(105000,p));
 assert(c.active);
 for(const color of [c.colorA,c.colorB])assert.match(color,/^#[0-9a-f]{6}$/i);
}
const disabled=[{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{performanceTier:'low'},{trackId:''},{progressMs:NaN},
 {progressMs:-1},{progressMs:Infinity},{durationMs:Infinity},{durationMs:1000},
 {progressMs:durationMs+1},{plan:null},{show:null},{strength:0},
 {show:{...create().show,active:false}},{show:{...create().show,segmentIndex:99}},
 {show:{...create().show,scene:'finale'}},{show:{...create().show,fade:0}}];
for(const patch of disabled){const out=plan({...create(),...patch});assert.equal(out.active,false,JSON.stringify(patch));assert.equal(out.gain,0);}
assert.equal(plan({...create(),performanceTier:'low'}).reason,'quality');
assert.equal(plan({...create(),playing:false}).reason,'paused');
assert.equal(plan({...create(),reducedMotion:true}).reason,'motion');
assert(plan({...create(),performanceTier:'balanced'}).gain<cue.gain);
const pixels=createPixels('balanced');
const eq=plan({...create(),pattern:'equalizer'});
const audio={bass:.96,mids:.15,highs:.01,beat:false};
assert(sample(pixels[2],eq,audio,101)>sample(pixels[143],eq,audio,101),'equalizer brightness varies by sound and height');
const noMusic={bass:0,mids:0,highs:0,beat:false};
assert(sample(pixels[2],eq,audio,101)>sample(pixels[2],eq,noMusic,101),'equalizer uses observed bass energy');
assert.equal(sample(pixels[2],{...eq,active:false},audio,101),0);
assert.equal(sample(pixels[2],eq,audio,Infinity),0);
for(let i=0;i<7000;i++){
 const t=1+i*29.9,c=plan(create(t));assert(Number.isFinite(c.gain)&&c.gain>=0&&c.gain<=.55);
 if(!c.active)continue;
 const p=pixels[i%pixels.length];
 for(const look of ['equalizer','geometry','orbit','pulse']){
  const brightness=sample(p,{...c,look},{bass:i%13/12,mids:i%17/16,highs:i%19/18,beat:i%10===0,beatStrength:.8},t/1000);
  assert(Number.isFinite(brightness)&&brightness>=0&&brightness<=.55,look);
 }
}
const source=read('lib/arena360LedWallV1059.ts');
for(const token of ['fetch(','setInterval(','setTimeout(','Math.random(','WebSocket(',
 'localStorage','Date.now(','new SpotLight','navigator.'])assert(!source.includes(token),token);
const view=read('components/visualizer/stages/ArenaLedWallV1059.tsx');
assert.equal((view.match(/<instancedMesh\b/g)||[]).length,1,'one draw call');
assert.equal((view.match(/<spotLight\b|<pointLight\b|<directionalLight\b/g)||[]).length,0,'no new lights');
assert(view.includes("tier==='low'")&&view.includes('reducedMotion')&&view.includes('cue.active'));
assert(view.includes('instanceColor.needsUpdate')&&view.includes('timer.current'));
const files=['types/music.ts','context/UiPreferencesContext.tsx',
 'components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'];
for(const f of files)assert(read(f).includes('LedWallEnabledV1059')||read(f).includes('ledWallEnabledV1059'),f);
assert(read('context/UiPreferencesContext.tsx').includes('arenaLedWallEnabledV1059:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1059 · Advanced LED Wall 4.0'));
assert(/arenaLedWallEnabledV1059:false(?:,|})/.test(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx')));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1059-led-wall-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1059-led-wall-regression.cjs'));
console.log('PASS V1059 · seven chapters, four palettes, four manual patterns, reactive EQ, bounded 7000 samples, one instanced mesh, opt-in + low-tier and motion guards');
