require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v474=load('components/visualizer/naturalRapGestureVarietyV474');
const v472=load('components/visualizer/vocalAwareChoreographyV472');
const v473=load('components/visualizer/rapFlowIntelligenceV473');
const lyrics={synced:true,lines:[
 {text:'Dies ist mein Rap auf dem Beat',startMs:1000,endMs:3400,words:[
  {text:'Dies',startMs:1100,endMs:1300},{text:'ist',startMs:1400,endMs:1600},
  {text:'mein',startMs:1750,endMs:1950},{text:'Rap',startMs:2200,endMs:2400}]},
 {text:'Die zweite Zeile',startMs:4000,endMs:6200,words:[
  {text:'Die',startMs:4100,endMs:4300},{text:'zweite',startMs:4800,endMs:5100},{text:'Zeile',startMs:5550,endMs:5800}]},
 {text:'Wir singen jetzt gemeinsam',startMs:7000,endMs:9200,words:[
  {text:'Wir',startMs:7200,endMs:7450},{text:'singen',startMs:7750,endMs:7900},{text:'gemeinsam',startMs:8200,endMs:8500}]},
]};
const trackId='spotify-rap-track-123';
const line=(progressMs,slot=0,section='verse',casting=null,authored=false)=>{
 const args={lyrics,progressMs,playing:true,reducedMotion:false,rap:true,section,slot,casting,authored};
 const base=v472.resolveVocalDanceAccentV472(args);
 const flow=v473.enhanceRapAccentV473(base,args);
 return {base,flow,variation:v474.resolveNaturalRapGestureV474(flow,{trackId,slot,playing:true,reducedMotion:false,section,authored})};
};
for(let slot=0;slot<4;slot++){
 const motifs=[0,1,2].map(idx=>v474.selectRapGestureMotifV474(trackId,idx,slot,'verse'));
 assert.notEqual(motifs[0],motifs[1],`neighboring lines repeat for slot ${slot}`);
 assert.notEqual(motifs[1],motifs[2],`neighboring lines repeat for slot ${slot}`);
 assert.deepEqual(motifs,[0,1,2].map(idx=>v474.selectRapGestureMotifV474(trackId,idx,slot,'verse')),'deterministic seeks');
}
const simultaneous=[0,1,2,3].map(slot=>v474.selectRapGestureMotifV474(trackId,0,slot,'verse'));
 assert.equal(new Set(simultaneous).size,4,'four visible performers should have different verse motifs');
const shared=[0,1,2,3].map(slot=>v474.selectRapGestureMotifV474(trackId,2,slot,'hook'));
assert.equal(new Set(shared).size,1,'one hook choreography motif');
const sample=line(1500);
assert(sample.base.active&&sample.flow.active&&sample.variation.active);
assert.equal(sample.variation.accent.lineIndex,sample.flow.lineIndex);
assert.equal(sample.variation.accent.wordIndex,sample.flow.wordIndex,'no invented timestamps');
assert.equal(sample.variation.accent.role,sample.flow.role,'never infer singer');
assert.equal(sample.variation.accent.confidence,sample.flow.confidence,'no increased evidence');
assert.equal(sample.variation.accent.source,sample.flow.source);
assert.notStrictEqual(sample.variation.accent,sample.flow,'vary active gesture immutably');
assert.deepEqual(line(1500).variation,line(1500).variation,'frame render/seek stable');
const v1=line(1500).variation;
const v2=line(4300).variation;
assert.notEqual(v1.motif,v2.motif,'natural variety between adjacent lines');
for(const progressMs of [0,3500,6500,9300]){
 const invalid=line(progressMs);
 assert.equal(invalid.variation.active,false,'inactive lyrics must remain inactive');
 assert.strictEqual(invalid.variation.accent,invalid.flow,'no dormant cue recreation');
}
const authored=line(1500,0,'verse',null,true);
assert.equal(authored.variation.active,false,'manual performance has priority');
assert.strictEqual(authored.variation.accent,authored.flow);
const cast={active:true,lineIndex:0,singingSlots:[1],handoffFrom:null,phase:0};
const bg=line(1500,0,'verse',cast);
assert.equal(bg.flow.role,'background');
assert.equal(bg.variation.active,false,'do not create a background vocalist');
assert.strictEqual(bg.variation.accent,bg.flow);
const lead=line(1500,1,'verse',cast);
assert.equal(lead.flow.role,'lead');
assert.equal(lead.variation.accent.role,'lead');
const flow=sample.flow;
for(const override of [{playing:false},{reducedMotion:true},{trackId:''},{authored:true}]){
 const r=v474.resolveNaturalRapGestureV474(flow,{trackId,slot:0,playing:true,reducedMotion:false,...override});
 assert.equal(r.active,false);
 assert.strictEqual(r.accent,flow);
}
for(let i=0;i<5;i++)for(let slot=0;slot<4;slot++){
 const src=line(i===0?1500:i===1?4300:7500,slot,i>=2?'hook':'verse').flow;
 const dst=v474.resolveNaturalRapGestureV474(src,{trackId,slot,playing:true,reducedMotion:false,section:i>=2?'hook':'verse'});
 assert(dst.accent.arms>=0&&dst.accent.arms<=.11);
 assert(dst.accent.head>=0&&dst.accent.head<=.055);
 assert(dst.accent.chest>=0&&dst.accent.chest<=.09);
 assert(Math.abs(dst.headTurn)<=.018&&Math.abs(dst.headTilt)<=.012&&Math.abs(dst.torsoSway)<=.016);
}
assert.equal(v474.selectRapGestureMotifV474('',0,0,'verse'),'none');
assert.equal(v474.selectRapGestureMotifV474(trackId,-1,0,'verse'),'none');
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(/import\s*\{\s*resolveNaturalRapGestureV474\s*\}/.test(renderer));
assert(renderer.includes('const variationV474=resolveNaturalRapGestureV474(enhanceRapAccentV473('));
assert(renderer.includes('const vocalV472=variationV474.accent;'));
assert(renderer.includes('const vocalV472=resolveNaturalRapGestureV474(enhanceRapAccentV473('));
assert(renderer.includes('musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,vocalV472)'));
assert(renderer.includes('variationV474.headTurn'));
assert(renderer.includes('variationV474.headTilt'));
assert(renderer.includes('variationV474.torsoSway'));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=474);
assert(pkg.scripts['build:preflight'].includes('npm run test:v474 && npm run test:v474:types'));
console.log('PASS V474: stable nonrepeating verse motifs, synchronized asymmetric hooks, 4 dancers, casting/manual priority, pause/silence/reduced motion, bounded GLB/procedural integration');
