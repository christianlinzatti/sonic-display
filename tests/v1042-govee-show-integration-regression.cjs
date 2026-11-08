#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planGoveeShowV1042,applyGoveeShowV1042}=load('lib/goveeShowSyncV1042');
const {DEFAULT_GOVEE_SYNC_V1027}=load('lib/goveeConcertSyncV1027');
const ips=['192.168.1.11','192.168.1.12','192.168.1.13','192.168.1.14'];
const settings={...DEFAULT_GOVEE_SYNC_V1027,fixtureIps:{wall:ips[0],rhythm:ips[1],neon:ips[2],ambient:ips[3]}};
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:240000});
const at=(fraction,section='verse')=>sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
 progressMs:fraction*240000,durationMs:240000,observedSection:section});
const phase={phase:'verse',previous:'verse',transition:1,verified:true};
const base={enabled:true,strength:50,show:at(.2),genre:'hard',phase,settings,
 ip:ips[0],selectedIps:ips,bridgeEnabled:true,autoSync:true,directorEnabled:true,
 playing:true,visible:true,stageIsArena:true};
for(let i=0;i<4;i++){
 const d=planGoveeShowV1042({...base,ip:ips[i]});
 assert(d.active,`zone ${i}`);assert(d.mix>=0&&d.mix<=.08);
 assert(d.brightnessFactor>=.88&&d.brightnessFactor<=1);
 assert(['wall','rhythm','neon','ambient'].includes(d.zone));
 const original={brightness:42,color:{r:100,g:90,b:130}};
 const previous={brightness:39,color:{r:60,g:65,b:110}};
 const applied=applyGoveeShowV1042(original,previous,d,40);
 assert(applied.brightness<=40&&applied.brightness<=original.brightness);
 for(const c of ['r','g','b'])assert(Math.abs(applied.color[c]-previous.color[c])<=12,c);
}
assert.equal(planGoveeShowV1042({...base,show:at(.95),phase}).active,true);
assert(planGoveeShowV1042({...base,show:at(.95),phase}).mix <=
 planGoveeShowV1042({...base,show:at(.95,'drop'),phase:{...phase,phase:'drop'}}).mix,
 'An authored finale is never a verified drop');
for(const denied of [{enabled:false},{strength:0},{playing:false},{visible:false},{stageIsArena:false},
 {bridgeEnabled:false},{autoSync:false},{directorEnabled:false},{reducedMotion:true},
 {manualOverride:true},{savedShowActive:true},{authoredStageActive:true},{groupUnisonActive:true},
 {recovering:true},{voiceActive:true},{roomAtmosphereActive:true},{higherPrioritySyncActive:true},
 {show:null},{show:{...base.show,active:false}},{phase:{...phase,verified:false}},
 {phase:{...phase,phase:'ambient'}},{selectedIps:[]},{selectedIps:[...ips,...ips]},
 {ip:'8.8.8.8'}, {settings:DEFAULT_GOVEE_SYNC_V1027}]){
 assert.equal(planGoveeShowV1042({...base,...denied}).active,false,JSON.stringify(denied));
}
for(const value of [NaN,Infinity,-1,250,undefined]){
 const d=planGoveeShowV1042({...base,strength:value});
 assert(Number.isFinite(d.mix)&&Number.isFinite(d.brightnessFactor));
}
const unchanged={brightness:70,color:{r:100,g:120,b:150}};
assert.deepEqual(applyGoveeShowV1042(unchanged,undefined,{...planGoveeShowV1042(base),active:false},80),unchanged);
assert.deepEqual(applyGoveeShowV1042(unchanged,undefined,{...planGoveeShowV1042(base),mix:999},80),unchanged);
const govee=read('components/GoveeMusicSyncV909.tsx');
for(const term of ['sampleArenaShowPlanV1040','planGoveeShowV1042','applyGoveeShowV1042',
 'syncDecisionV1027.active','roomDecisionV987.active','recoveringDevices.has(ip)',
 'goveeBridgeRequestV909','Math.min(config.masterBrightness,festivalDeliveredLook.brightness)',
] )assert(govee.includes(term),'existing LAN integration: '+term);
assert(govee.includes('governConcertLookV961(previous,showLookV1042,')||
 (govee.includes('applyGoveeRoomV1096(showLookV1042,previous,')&&
 govee.includes('governConcertLookV961(previous,roomLookV1096,')),
 'existing V1042 look must still reach the final V961 safety governor');
assert.equal((govee.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1,
 'V1042 never introduces a second LAN send');
for(const term of ['goveeShowSyncEnabledV1042:false','goveeShowSyncStrengthV1042:45'])
 assert(read('context/UiPreferencesContext.tsx').includes(term),'opt-in defaults '+term);
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
for(const term of ['V1042 · Intelligent Govee','goveeShowSyncEnabledV1042','goveeShowSyncStrengthV1042','zugeordneten Zonen'])
 assert(panel.includes(term),'UI missing '+term);
assert(!read('.github/workflows/v1042-intelligent-govee-show-validation.yml').includes('  push:'),
 'No duplicate CI push workflow');
assert(read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'), 'keep V1038 palette fix');
console.log('V1042 Intelligent Govee Concert Integration PASS: four zones, verified phase, user priority, safe brightness/color, exact one existing LAN sender');
