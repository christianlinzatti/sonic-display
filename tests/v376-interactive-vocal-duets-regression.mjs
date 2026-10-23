import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolveDuetInteractionV376,overlayDuetV376} from '../components/visualizer/interactiveVocalDuetsV376.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8');
const lines=Array.from({length:12},(_,i)=>({startMs:1000+i*2000,endMs:2900+i*2000,text:`Rap Zeile ${i}`,
 words:[{text:'Rap',startMs:1000+i*2000,endMs:1300+i*2000}]}));
const lyrics={provider:'spotify',synced:true,plainText:null,lines};
const base={lyrics,playing:true,progressMs:9050,count:3,mode:'dialogue',strength:80};
const cue=(patch={})=>resolveDuetInteractionV376({...base,...patch});
assert.equal(cue({progressMs:950}).enabled,false);
assert.equal(cue({progressMs:1100}).leadSlot,0);
assert.equal(cue({progressMs:3120}).leadSlot,1);
assert.equal(cue({progressMs:3120}).fromSlot,0);
assert.equal(cue({progressMs:3120}).event,'reply');
assert.equal(cue({progressMs:3700}).event,'none');
assert.equal(cue({progressMs:5100}).leadSlot,2);
assert.equal(cue({progressMs:7100}).leadSlot,0);
assert.equal(cue({progressMs:9100}).leadSlot,1);
assert.equal(cue({progressMs:9100,mode:'handoff'}).event,'handoff');
assert.equal(cue({progressMs:11100,mode:'handoff'}).event,'none','handoff only on 4-line boundary');
assert.equal(cue({progressMs:9100,mode:'handoff'}).leadSlot,1);
assert.equal(cue({progressMs:9100,mode:'off'}).enabled,false);
assert.equal(cue({progressMs:9100,mode:'dialogue',count:1}).enabled,false);
assert.equal(cue({playing:false}).enabled,false);
assert.equal(cue({reducedMotion:true}).enabled,false);
assert.equal(cue({manualPriority:true}).enabled,false);
assert.equal(cue({lyrics:null}).enabled,false);
assert.equal(cue({lyrics:{...lyrics,synced:false}}).enabled,false);
assert.equal(cue({progressMs:30900}).enabled,false);
assert.equal(cue({progressMs:0}).enabled,false);
assert.deepEqual(cue(),cue(),'pure/seek safe');
assert.equal(cue({progressMs:3200,lyrics:{...lyrics,lines:lines.map(x=>({...x,words:[]}))}}).source,'line-timed');
// V375 cast stays capped; one outgoing performer may be briefly visible for the handoff.
const performance={enabled:true,formation:'solo',activeCount:1,leadSlot:1,activeSlots:[1],weights:[0,1,0],section:'verse',source:'lyrics',phraseIndex:1,phraseMs:9000,emphasis:.5};
const passing=cue({mode:'handoff',progressMs:9150,performance});
assert.deepEqual(passing.activeSlots,[1,0]);
assert.equal(cue({mode:'handoff',progressMs:9900,performance}).activeSlots.length,1);
assert.equal(cue({mode:'off',performance}).activeSlots.length,1);
for(const i of [2,3,4,10,1e12]){
 const c=cue({count:i,progressMs:9300});
 assert.ok(c.count>=1&&c.count<=4);
 assert.equal(c.activeSlots.length,new Set(c.activeSlots).size);
 assert.ok(c.activeSlots.every(s=>s>=0&&s<c.count));
}
const body={headPitch:0,headYaw:0,headTilt:0,eyeYaw:0,chestLean:0,leftArm:0,rightArm:0};
const on=cue({progressMs:3350});
const applied=overlayDuetV376(body,on,1,true);
assert.ok(Math.abs(applied.headYaw)>0,'incoming dancer turns head');
assert.ok(Math.abs(applied.leftArm)+Math.abs(applied.rightArm)>0,'incoming gesture');
assert.deepEqual(body,{headPitch:0,headYaw:0,headTilt:0,eyeYaw:0,chestLean:0,leftArm:0,rightArm:0},'input body not mutated');
assert.deepEqual(overlayDuetV376(body,on,1,false),body,'paused pose neutral');
assert.deepEqual(overlayDuetV376(body,on,1,true,false,false),{...body,headPitch:applied.headPitch,headTilt:applied.headTilt,chestLean:applied.chestLean},'look and gestures can be disabled');
assert.ok(Math.abs(overlayDuetV376(body,on,1,true,true,true,true).headYaw)<Math.abs(applied.headYaw),'authored priority attenuates');
for(let i=0;i<4;i++){
 const result=overlayDuetV376(body,cue({count:4,progressMs:3300}),i,true);
 for(const n of Object.values(result))assert.ok(Number.isFinite(n));
}
const three=read('components/visualizer/ThreeAvatar.tsx');
assert.match(three,/resolveDuetInteractionV376/);
assert.match(three,/const duetV376=/);
assert.match(three,/const duetBodyV376=overlayDuetV376/);
assert.match(three,/const bodyCueV371=overlayDuetV376/);
assert.match(three,/manualPriority:!!manualPose\|\|!!choreography/);
assert.match(three,/manualPriority:!!settings\.trackId/);
assert.match(three,/const interactionCueRefV376=/);
assert.match(read('components/visualizer/VocalRigV368.tsx'),/interactionCueRefV376/);
for(const p of ['types/music.ts','components/SettingsPanel.tsx','context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx']){
 assert.match(read(p),/V376/,'wire '+p);
}
assert.match(read('components/visualizer/VocalSyncInspectorV373.tsx'),/v376-duet-preview/);
assert.match(read('context/UiPreferencesContext.tsx'),/avatarVocalDuetModeV376:"off"/);
const pkg=JSON.parse(read('package.json'));
assert.ok(Number(pkg.version.match(/v(\d+)$/)?.[1])>=376, "version newer than v376");
assert.match(pkg.scripts['verify:offline'],/test:v376/);
console.log('PASS V376 interactive vocal duets: line responses, handoffs, manual priority, safe pose overlays, settings and integration');
