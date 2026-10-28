'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {nextDanceCombination:selectMotion,emptyDanceSequence:emptyMotion}=load('components/visualizer/intelligentDanceCombinationV242');
const {sanitizeCharacterMotionStore:sanitize}=load('components/visualizer/characterMotionLibrary');
const {planAutomaticRapPerformanceV437:plan,sampleAutomaticRapPerformanceV437:sample,applyAutomaticRapPerformanceV437:apply}=load('components/visualizer/automaticRapPerformanceV437');
const lines=Array.from({length:16},(_,i)=>({startMs:i*1500,endMs:(i+1)*1500,
  text:i<4||i>=12?`Wiederkehrende hook passage ${i%4}`:`Verse mit eigenem Text und Inhalt Nummer ${i}`,
  words:[{text:'Wiederkehrende',startMs:i*1500+100,endMs:i*1500+400},{text:'Text',startMs:i*1500+700,endMs:i*1500+900}]}));
const lyrics={provider:'spotify',synced:true,lines,plainText:null};
const input={trackId:'rap1',lyrics};
const saved=JSON.stringify(input);
const p=plan(input);
assert.equal(p.available,true);
assert.equal(p.lines.length,16);
assert(p.hookLines>=8,'detect separated repeated lines as hooks');
assert.equal(JSON.stringify(input),saved,'planning must be side-effect free');
const playback={trackId:'rap1',progressMs:600,playing:true,reducedMotion:false,enabled:true,strength:80,audioEnergy:.45,beat:.6};
const cue=sample(p,playback);
assert(cue.active&&cue.scene==='hook');
assert(cue.advancedRapLip,'timed words are usable');
assert(cue.danceMultiplier>1);
assert(cue.gestureBoost>0&&cue.faceBoost>0);
assert.equal(sample(p,{...playback,trackId:'another'}).active,false,'track isolation');
assert.equal(sample(p,{...playback,reducedMotion:true}).active,false);
assert.equal(sample(p,{...playback,playing:false}).active,false);
assert.equal(sample(p,{...playback,enabled:false}).active,false);
assert.equal(sample(p,{...playback,strength:0}).active,false);
assert.equal(sample(p,{...playback,progressMs:199999}).active,false);
assert.equal(sample(p,{...playback,progressMs:NaN}).active,false);
assert.equal(sample(p,{...playback,progressMs:0}).active,true);
const verse=sample(p,{...playback,progressMs:10*1500+600});
assert.equal(verse.scene,'verse');
assert(verse.energy<cue.energy,'hook stronger than verse at same audio input');
assert.equal(plan({trackId:'',lyrics}).available,false);
assert.equal(plan({trackId:'__proto__',lyrics}).available,false);
assert.equal(plan({trackId:'rap1',lyrics:{...lyrics,synced:false}}).available,false);
assert.equal(plan({trackId:'rap1',lyrics:null}).available,false);
const authored=[{fromLine:0,toLine:15,leadSlot:1,partnerSlot:0,style:'reply',strength:90}];
const manual=plan({...input,authored});
assert(manual.authored&&manual.hookLines===0);
assert.equal(sample(manual,playback).scene,'reply','authored roles take precedence over inferred hooks');
const big=plan({trackId:'rap1',lyrics:{...lyrics,lines:Array.from({length:5300},(_,i)=>({startMs:i*1200,endMs:i*1200+1100,text:'line number '+i}))}});
assert.equal(big.lines.length,5000,'bounded large-track analysis');
const base={cue,danceAllowed:true,vocalAllowed:true,intensity:1,aggression:.5,variation:.5,style:'balanced',face:55,gesture:60,rapLip:false,lipEnabled:true};
const active=apply(base);
assert(active.intensity>1&&active.aggression>.5&&active.variation>.5);
assert(active.face>55&&active.gesture>60&&active.rapLip);
assert.equal(active.style,'sharp','automatic hook presentation');
const danceProtected=apply({...base,danceAllowed:false});
assert.equal(danceProtected.intensity,1);assert.equal(danceProtected.aggression,.5);
assert.equal(danceProtected.variation,.5);assert.equal(danceProtected.style,'balanced');
assert(danceProtected.face>55,'dance override does not disable vocals');
const vocalProtected=apply({...base,vocalAllowed:false});
assert.equal(vocalProtected.face,55);assert.equal(vocalProtected.gesture,60);assert.equal(vocalProtected.rapLip,false);
assert(active.intensity<=2&&active.face<=100&&active.gesture<=100);
assert.equal(apply({...base,lipEnabled:false}).rapLip,false,'do not turn lips back on if globally disabled');
assert.equal(apply({...base,style:'smooth'}).style,'smooth','explicit dance style unchanged');
assert.equal(apply({...base,rapLip:true,vocalAllowed:false}).rapLip,true,'manually activated rap lips preserved');
const motion=(id,section)=>({id,avatarId:'model',name:id,url:'/motions/'+id+'.glb',genre:'deutschrap',bpmMin:85,bpmMax:200,section,addedAt:1});
const store=sanitize({version:1,automatic:true,motions:[motion('verse','verse'),motion('hook','hook')]});
assert.equal(store.motions.find(x=>x.id==='hook')?.section,'hook','hook classification persists');
const intro=selectMotion(emptyMotion(),store,{trackId:'rap1',avatarId:'model',genre:'deutschrap',bpm:110,progressMs:15000,durationMs:120000,energy:.5,detectedSection:'verse',eventSlot:'verse'});
const refrain=selectMotion(intro.state,store,{trackId:'rap1',avatarId:'model',genre:'deutschrap',bpm:110,progressMs:15000,durationMs:120000,energy:.5,detectedSection:'hook',eventSlot:'verse:rap-hook'});
assert.equal(intro.state.motionId,'verse');
assert.equal(refrain.state.motionId,'hook','hook transition can switch a compatible installed motion');
const noMotion=selectMotion(emptyMotion(),{version:1,automatic:false,motions:store.motions},{trackId:'rap1',avatarId:'model',genre:'deutschrap',progressMs:0,durationMs:120000,energy:.5,fallback:'/manual.glb',detectedSection:'hook'});
assert.equal(noMotion.url,'/manual.glb','manual/nonautomatic selection still wins');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/AutoRapPerformancePanelV437.tsx','utf8');
const root=fs.readFileSync('components/visualizer/ExpressiveRapDirectorPanelV425.tsx','utf8');
const preferences=fs.readFileSync('context/UiPreferencesContext.tsx','utf8');
const types=fs.readFileSync('types/music.ts','utf8');
for(const [source,required] of [
  [stage,'planAutomaticRapPerformanceV437'],[stage,'sampleAutomaticRapPerformanceV437'],
  [stage,'applyAutomaticRapPerformanceV437'],[stage,'danceAggression={rapPerformanceValuesV437.aggression}'],
  [stage,'avatarAnimationIntensity={concertDynamicsPercentV502(rapPerformanceValuesV437.intensity,directedDynamicsV604.dance)'],
  [stage,'rapLipEnabledV415:rapPerformanceValuesV437.rapLip'],
  [stage,'!preferences.avatarTimelineEnabled'],[stage,'!preferences.avatarManualVocalEnabledV385'],
  [stage,'detectedSection:rapMotionHookV437?"hook":directedSection'],[stage,'eventSlot:rapMotionHookV437'],
  [root,'<AutoRapPerformancePanelV437'],[panel,'Rap-Performance für jeden Song automatisch steuern'],
  [types,'rapAutoPerformanceEnabledV437?:boolean'],[preferences,'rapAutoPerformanceEnabledV437:true'],
]) assert(source.includes(required),`missing V437 integration ${required}`);
assert(!panel.includes('seekTo(')&&!panel.includes('setProgressMs('));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=437);
require('./helpers/release-coverage-v651.cjs').assertIncluded('test:v437');
assert(pkg.scripts['verify:offline:fast'].includes('npm run test:v437'));
console.log('PASS V437: automatic song planning, verse/hook/role and karaoke cues, dance/face/gesture/lip orchestration, disabled/manual priority, bounded scan');
