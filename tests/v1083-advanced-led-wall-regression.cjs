'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planLedWallExperienceV1083:plan,sampleLedWallExperienceV1083:sample,
 currentSyncedLedLyricV1083:lyric}=load('lib/arena360LedWallExperienceV1083');
const {createLedWallPixelsV1059}=load('lib/arena360LedWallV1059');
const input=(scene='hook',changes={})=>({enabled:true,stageIsArena:true,playing:true,
 reducedMotion:false,reactive:true,performanceTier:'high',manualPattern:'auto',
 progressMs:94000,durationMs:210000,strength:65,mode:'auto',observedSection:'hook',
 lyricText:'Wir singen zusammen',baseCue:{active:true,reason:'planned',chapter:3,
 look:'geometry',gain:.34,colorA:'#44ddff',colorB:'#ee77cc',fade:.85},
 show:{active:true,scene,segmentIndex:3,intensity:80,fade:.85},...changes});
const c=plan(input());assert(c.active&&c.gain>0&&c.gain<=.55);
assert.deepEqual(c,plan(input()),'stable deterministic planner');
for(const [scene,look] of Object.entries({intro:'tunnel',verse:'lyrics',build:'geometry3d',hook:'geometry3d',interlude:'lyrics',finale:'tunnel'}))
 assert.equal(plan(input(scene)).look,look,'chapter '+scene);
assert.equal(plan(input('verse',{lyricText:''})).look,'geometry3d','missing lyrics never fabricated');
assert.equal(plan(input('interlude',{lyricText:'\n'})).lyric,'');
for(const [mode,look] of [['tunnel','tunnel'],['geometry3d','geometry3d'],['lyrics','lyrics'],['drop','tunnel']])
 assert.equal(plan(input('hook',{mode})).look,look,'manual V1083 mode '+mode);
assert.equal(plan(input('hook',{mode:'drop',observedSection:'drop'})).look,'drop');
assert.equal(plan(input('hook',{mode:'auto',observedSection:'drop'})).look,'drop','automatic verified drop');
assert(!plan(input('hook',{manualPattern:'pulse'})).active,'V1059 manual override always wins');
const deny={enabled:false,stageIsArena:false,playing:false,reducedMotion:true,reactive:false,
 performanceTier:'low',strength:0,progressMs:-1,durationMs:29000,baseCue:null,show:null};
for(const [key,v] of Object.entries(deny))assert(!plan(input('hook',{[key]:v})).active,'guard '+key);
for(const [key,v] of Object.entries({progressMs:NaN,durationMs:Infinity,manualPattern:'equalizer',strength:NaN}))
 assert(!plan(input('hook',{[key]:v})).active,'invalid '+key);
const lines={synced:true,lines:[{startMs:1000,endMs:1500,text:'Original 1'},
 {startMs:2000,endMs:2500,text:'Original 2'}]};
assert.equal(lyric(lines,2000,true),'Original 2');
assert.equal(lyric(lines,1600,true),'');
assert.equal(lyric({...lines,synced:false},2000,true),'');
assert.equal(lyric(lines,3000,true),'');
assert.equal(lyric(lines,2000,false),'');
assert.equal(lyric(lines,NaN,true),'');
assert.equal(lyric({...lines,lines:[{startMs:2000,endMs:3000,text:'A\nB\tC'}]},2100,true),'A B C');
assert(Array.from(lyric({...lines,lines:[{startMs:2000,endMs:3000,text:'😀'.repeat(80)}]},2100,true)).length<=64);
const pixels=createLedWallPixelsV1059('high');assert(pixels.length===256);
assert.equal(createLedWallPixelsV1059('low').length,0);
const strong={bass:.98,mids:.74,highs:.61,beat:true,beatStrength:.91,energyEnvelope:.92};
const weak={...strong,beat:false,beatStrength:0};
let samples=0,dropDifference=0,max=0,min=1;
for(const mode of ['tunnel','geometry3d','lyrics','drop']){
 const cue=plan(input('hook',{mode,observedSection:'drop'}));
 for(let t=0;t<400;t++){
  for(let j=0;j<pixels.length;j++){
   const p=pixels[j],time=t*.19;
   const a=sample(p,cue,strong,time),b=sample(p,cue,weak,time);
   assert(Number.isFinite(a)&&Number.isFinite(b)&&a>=0&&a<=.55&&b>=0&&b<=.55);
   min=Math.min(min,a,b);max=Math.max(max,a,b);
   if(mode==='drop'&&a>b)dropDifference++;
   samples+=2;
  }
 }
}
assert.equal(samples,819200);
assert(dropDifference>0,'true observed beats brighten bounded drop pattern');
const noDrop=plan(input('hook',{mode:'drop',observedSection:'hook'}));
assert.equal(noDrop.look,'tunnel','authored hook alone is not a confirmed drop');
assert.equal(sample(pixels[0],{...c,active:false},strong,4),0);
assert.equal(sample(pixels[0],c,strong,Infinity),0);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.equal(pkg.version,'0.1.0-v1083');assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v1083 && npm run test:v1083:types'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planLedWallExperienceV1083({'));
assert(stage.includes('baseCue:flowLedV1071'));
assert(stage.includes('manualPattern:ledWallPatternV1059'));
assert(stage.includes('experienceCueV1083={ledExperienceV1083}'));
const render=read('components/visualizer/stages/ArenaLedWallV1059.tsx');
assert(render.includes('sampleLedWallExperienceV1083('));
assert.equal((render.match(/<instancedMesh\b/g)||[]).length,1,'one existing pixel draw batch');
const text=read('components/visualizer/stages/ArenaLedLyricsV1083.tsx');
assert(text.includes('tex.dispose()'),'canvas texture is disposed');
assert(text.includes("canvas.width=512;canvas.height=128"),'bounded raster memory');
assert(!text.includes('fetch('),'no font/CDN loads');
assert(text.includes('if(!text||!asset||asset.text!==text)return null;'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaAdvancedLedEnabledV1083:false'));
for(const file of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx'])
 assert(read(file).includes('AdvancedLed')||read(file).includes('advancedLed'),file);
assert(read('scripts/v931-production-gate.cjs').includes('v1083-advanced-led-wall-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('v1083-advanced-led-wall-regression.cjs'));
for(const ban of ['Math.random(','Date.now(','fetch(','navigator.','requestAnimationFrame(','setInterval('])
 assert(!read('lib/arena360LedWallExperienceV1083.ts').includes(ban),'forbidden in pure planner '+ban);
console.log(`PASS V1083: ${samples} bounded LED pixel samples; max=${max.toFixed(4)} min=${min.toFixed(4)}; verified lyric/drop guards; unchanged GPU pixel batches`);
