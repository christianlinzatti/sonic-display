require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const flow=load('components/visualizer/rapFlowIntelligenceV473');
const {resolveVocalDanceAccentV472}=load('components/visualizer/vocalAwareChoreographyV472');
const lyrics={synced:true,lines:[
  {startMs:1000,endMs:3900,text:'Langsamer langsamer Verse',words:[
    {text:'Langsamer',startMs:1050,endMs:1400},
    {text:'langsamer',startMs:2050,endMs:2400},
    {text:'Verse',startMs:3050,endMs:3400}]},
  {startMs:4200,endMs:6300,text:'Jetzt laufen die Worte rasant im Takt',words:[
    {text:'Jetzt',startMs:4230,endMs:4420},
    {text:'laufen',startMs:4460,endMs:4620},
    {text:'die',startMs:4680,endMs:4840},
    {text:'Worte',startMs:4900,endMs:5080},
    {text:'rasant',startMs:5120,endMs:5300},
    {text:'Takt',startMs:5340,endMs:5520}]},
  {startMs:6900,endMs:7500,text:'(Yeah)',words:[{text:'Yeah',startMs:6940,endMs:7140}]},
  {startMs:8000,endMs:9300,text:'[Instrumental]',words:[]},
  {startMs:10000,endMs:11900,text:'Ein Text ohne Wortzeiten',words:[]},
]};
const args={lyrics,progressMs:4250,playing:true,rap:true,reducedMotion:false,section:'verse'};
const start=flow.resolveRapFlowHintV473(args);
assert.equal(start.kind,'flow-change');
assert.equal(start.change,'faster');
assert.equal(start.evidence,'word-timestamps');
assert(start.wordsPerSecond>3.5,'genuine word spans reveal higher delivery density');
assert(start.phrasePulse>0.8);
assert.equal(flow.resolveRapFlowHintV473({...args,progressMs:5900}).kind,'dense','after switch the dense verse remains dense');
const slow=flow.resolveRapFlowHintV473({...args,progressMs:1150});
assert.equal(slow.kind,'relaxed');
assert.equal(slow.change,'none','no invented prior sample');
const adlib=flow.resolveRapFlowHintV473({...args,progressMs:7000});
assert.equal(adlib.kind,'adlib-hint');
assert.equal(adlib.adlibCandidate,true,'only lyric typography is a candidate, not voice separation');
for(const notAdlib of ['Yeah!','[Instrumental]','(Whole complicated sung sentence here)', '(Bridge)', '(Guitar solo)']){
  assert.equal(flow.isPossibleAdlibTextV473(notAdlib),false);
}
assert(flow.isPossibleAdlibTextV473('(Skrr)'));
const lineOnly=flow.resolveRapFlowHintV473({...args,progressMs:10200});
assert.equal(lineOnly.kind,'phrase');
assert.equal(lineOnly.evidence,'line-timestamp');
assert.equal(lineOnly.wordsPerSecond,null,'do not manufacture word-level density');
for(const time of [0,3950,6450,7600,8190,12500]){
 const r=flow.resolveRapFlowHintV473({...args,progressMs:time});
 assert.equal(r.active,false,`silent or uncovered region ${time}`);
}
for(const changes of [{playing:false},{rap:false},{reducedMotion:true},{lyrics:{...lyrics,synced:false}},{lyrics:null}]){
 assert.equal(flow.resolveRapFlowHintV473({...args,...changes}).active,false);
}
const vocalArgs={lyrics,progressMs:4250,playing:true,rap:true,reducedMotion:false,section:'verse',slot:0};
const base=resolveVocalDanceAccentV472(vocalArgs);
const updated=flow.enhanceRapAccentV473(base,args);
assert(base.active&&updated.arms>=base.arms&&updated.arms<=.11);
assert(updated.head<=.055&&updated.chest<=.09);
assert.equal(updated.role,base.role);
assert.equal(updated.confidence,base.confidence);
const disabled=resolveVocalDanceAccentV472({...vocalArgs,playing:false});
assert.strictEqual(flow.enhanceRapAccentV473(disabled,args),disabled,'no resurrecting muted gesture');
const bg=resolveVocalDanceAccentV472({...vocalArgs,casting:{
 active:true,lineIndex:1,singingSlots:[1],handoffFrom:null,phase:0
}});
const bgApplied=flow.enhanceRapAccentV473(bg,args);
assert(bgApplied.arms<=bg.arms*1.22 && bgApplied.role==='background','never invents lead role');
const authored=resolveVocalDanceAccentV472({...vocalArgs,authored:true});
const authoredApplied=flow.enhanceRapAccentV473(authored,args);
assert(authoredApplied.arms < updated.arms*.38,'user-authored motion has priority');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(avatar.includes('import {enhanceRapAccentV473}'));
assert.equal((avatar.match(/enhanceRapAccentV473\(resolveVocalDanceAccentV472\(/g)||[]).length,2);
assert(fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8').includes('enhanceRapAccentV473(resolveVocalDanceAccentV472('));
assert(fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8').includes('musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,correctedVocalV515,'));
assert(fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8').includes('wordDanceV567.arms*Math.max(0,wordDanceV567.side)'));
console.log('PASS V473: synced flow-density and switch hints, modest adlib candidates, silent gaps, manual cast priority, pause/reduced-motion, GLB + procedural paths');
