'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planEnsembleChoreographyV1063:plan}=load('lib/arena360EnsembleChoreographyV1063');
const show={active:true,scene:'hook',segmentIndex:3,intensity:88,fade:1,deck:'fan',floating:'wave',lasers:'tunnel',camera:'group',dance:'group'};
const base={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,manualPriority:false,
 footLocked:false,collisionRisk:false,performanceTier:'high',reactive:true,count:4,trackId:'song-1063',
 progressMs:27000,durationMs:180000,strength:60,show};
const active=plan(base);
assert.equal(active.active,true);
assert.equal(active.shape,'fan');
assert.equal(active.slots.length,4);
assert.deepEqual(active,plan(base),'repeatable with same song clock');
assert(active.slots[0].spreadX<0&&active.slots[3].spreadX>0,'never change slot order');
assert(active.slots[1].depth<0&&active.slots[2].depth<0,'fan inner slots step visually forward');
assert(active.slots[0].spreadX+active.slots[3].spreadX===0);
for(const [scene,shape] of [['verse','line'],['build','diagonal'],['hook','fan'],['interlude','arc'],['finale','fan']]){
 assert.equal(plan({...base,show:{...show,scene}}).shape,shape,scene);
}
for(const change of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {manualPriority:true},{footLocked:true},{collisionRisk:true},{performanceTier:'low'},
 {reactive:false},{count:1},{count:5},{count:2.5},{trackId:''},{trackId:null},
 {progressMs:NaN},{progressMs:-1},{progressMs:190000},{durationMs:Infinity},
 {durationMs:29000},{strength:0},{strength:NaN},{show:null},
 {show:{...show,active:false}},{show:{...show,intensity:0}},{show:{...show,fade:0}}]){
 const cue=plan({...base,...change});
 assert.equal(cue.active,false,'fails closed for '+JSON.stringify(change));
 assert.equal(cue.slots.length,0);
}
assert.equal(plan({...base,count:2}).slots.length,2);
assert.equal(plan({...base,count:3}).slots.length,3);
assert.equal(plan({...base,progressMs:25000}).focusSlot,2);
assert.equal(plan({...base,progressMs:37000}).focusSlot,3);
assert(plan({...base,performanceTier:'balanced'}).slots[0].spreadX>active.slots[0].spreadX,'balanced only reduces effect');
for(let i=0;i<10000;i++){
 const count=2+(i%3),scene=['verse','build','hook','interlude','finale'][i%5];
 const result=plan({...base,count,progressMs:i*17%180000,strength:i%105-15,show:{...show,scene}});
 if(!result.active)continue;
 assert.equal(result.slots.length,count);
 for(let j=0;j<count;j++){
  const slot=result.slots[j];
  assert(Number.isFinite(slot.spreadX)&&Math.abs(slot.spreadX)<=.11);
  assert(Number.isFinite(slot.depth)&&Math.abs(slot.depth)<=.07);
  assert(Number.isFinite(slot.turnY)&&Math.abs(slot.turnY)<=.17);
  assert(Math.sign(slot.spreadX)===Math.sign(j-(count-1)/2)||slot.spreadX===0);
 }
 assert(result.focusSlot>=0&&result.focusSlot<count);
}
const source=read('lib/arena360EnsembleChoreographyV1063.ts');
for(const bad of ['fetch(','Math.random(','Date.now(','setInterval(','setTimeout(',
 'WebSocket(','requestAnimationFrame(','localStorage','navigator.','gl.position','g.position'])
 assert(!source.includes(bad),'pure planner '+bad);
const duo=read('components/visualizer/DanceFormationActorsV492.tsx');
const group=read('components/visualizer/GroupDancersV326SceneV492.tsx');
const stage=read('components/visualizer/ThreeAvatar.tsx');
assert(stage.includes('planEnsembleChoreographyV1063({'));
assert(duo.includes('v1063Active=ensembleV1063?.active===true&&!readFootLockV322().enabled'));
assert(group.includes('groundDecisionsV494.every((g,i)=>'));
assert(group.includes('canRepositionWithGroundV808(g,footLock)'));
assert(group.includes('collisionSlotsV508.some(s=>s?.risk>=.3)'));
assert(group.includes('settings===props.autoMultiArtistGroupV442'));
assert(group.includes('ensembleActiveV1063?ensembleV1063!.slots[i].spreadX:0'));
assert(group.includes('ensembleActiveV1063?ensembleV1063!.slots[i].turnY:0'));
for(const p of ['types/music.ts','context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/registry.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(p).includes('arenaEnsembleEnabledV1063'),p);
assert(read('context/UiPreferencesContext.tsx').includes('arenaEnsembleEnabledV1063:false'));
console.log('PASS V1063: bounded 2–4 performer formation and focus; 10,000 samples; manual, ground, collision, GPU and singer safeguards');
