'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartFestivalShowV850:plan,dimFestivalLaneV850:dim,focusForActV850:focus}=load('components/visualizer/smartFestivalShowDirectorV850');
const {planConcertFxV810:planFx,normalizeConcertFxV810:normalize,DEFAULT_CONCERT_FX_V810:d}=load('components/visualizer/concertFxStudioV810');
let count=0;
const check=(name,fn)=>{try{fn();count++;}catch(e){e.message=`V850 ${name}: ${e.message}`;throw e;}};
const s=normalize({intensity:100,quality:'ultra',festivalDirectorV850:true,festivalDirectorStrengthV850:100,
 festivalDirectorStyleV850:'balanced'});
const fx=planFx({settings:s,genre:'hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',energy:.98,kick:.94,bass:.89,mids:.67,highs:.76,
 ledBudget:1,laserBudget:1});
const base={settings:s,fx,trackId:'spotify-trk-v850',actIndex:3,actStartMs:0,actEndMs:10000,
 progressMs:5000,playing:true,reactive:true,reducedMotion:false,manualLighting:false,
 blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',budget:1,authoredLanes:[]};
const active=plan(base);
check('gated by verified music cue',()=>assert.equal(fx.reason,'music'));
check('verified drop active',()=>assert(active.active));
check('music reason',()=>assert.equal(active.reason,'music'));
check('section preserved',()=>assert.equal(active.section,'drop'));
check('blend in [0,1]',()=>assert(active.blend>0&&active.blend<=1));
check('label states section',()=>assert(active.sceneLabel.includes('Drop')));
check('repeatable',()=>assert.deepEqual(plan(base),active));
check('no mutation',()=>{const copy=JSON.stringify(base);plan(base);assert.equal(JSON.stringify(base),copy)});
check('default director on',()=>assert.equal(d.festivalDirectorV850,true));
check('default strength',()=>assert.equal(d.festivalDirectorStrengthV850,65));
check('default style',()=>assert.equal(d.festivalDirectorStyleV850,'balanced'));
for(const k of ['laser','led','particles','foam','transition','festival','ambience']){
 check(`${k} never amplifies`,()=>assert(active.gains[k]>=0&&active.gains[k]<=1));
 check(`${k} finite`,()=>assert(Number.isFinite(active.gains[k])));
}
for(const [name,patch,reason] of [
 ['disabled in settings',{settings:{...s,festivalDirectorV850:false}},'disabled'],
 ['global FX disabled',{settings:{...s,enabled:false}},'disabled'],
 ['zero strength',{settings:{...s,festivalDirectorStrengthV850:0}},'disabled'],
 ['stopped',{playing:false},'protected'],['nonreactive',{reactive:false},'protected'],
 ['reduced motion',{reducedMotion:true},'protected'],['manual lighting',{manualLighting:true},'protected'],
 ['blackout',{blackout:true},'protected'],['low tier',{tier:'low'},'protected'],
 ['unverified FX',{fx:{...fx,reason:'unverified'}},'unverified'],
 ['inactive FX',{fx:{...fx,active:false}},'unverified'],
 ['no track',{trackId:''},'unverified'],['huge track ID',{trackId:'t'.repeat(181)},'unverified'],
 ['invalid act negative',{actIndex:-1},'unverified'],['invalid act huge',{actIndex:10000},'unverified'],
 ['fractional act',{actIndex:1.5},'unverified'],
 ['invalid start',{actStartMs:NaN},'unverified'],['negative start',{actStartMs:-1},'unverified'],
 ['invalid end',{actEndMs:Infinity},'unverified'],['short act',{actEndMs:1100},'unverified'],
 ['time before',{progressMs:-1},'unverified'],['time after',{progressMs:10000},'unverified'],
 ['progress infinity',{progressMs:Infinity},'unverified'],['no budget',{budget:0},'unverified'],
 ['budget over 1',{budget:2},'unverified'],['budget NaN',{budget:NaN},'unverified'],
 ['no cast',{groupCount:0},'unverified'],['excess cast',{groupCount:5},'unverified'],
 ['fractional cast',{groupCount:2.5},'unverified'],
])check(`fails closed ${name}`,()=>{const cue=plan({...base,...patch});assert.equal(cue.active,false);assert.equal(cue.reason,reason);assert(Object.values(cue.gains).every(v=>v===1));});
const sections=['intro','verse','hook','build','drop','break','finale'];
for(const section of sections){
 const r=plan({...base,fx:{...fx,section}});
 check(`section ${section} active`,()=>assert.equal(r.active,true));
 check(`section ${section} finite and capped`,()=>assert(Object.values(r.gains).every(n=>Number.isFinite(n)&&n>=0&&n<=1)));
 check(`section ${section} stable`,()=>assert.deepEqual(r,plan({...base,fx:{...fx,section}})));
}
check('break reserves space over drop',()=>assert(plan({...base,fx:{...fx,section:'break'}}).gains.festival<active.gains.festival));
check('verse calmer than hook',()=>assert(plan({...base,fx:{...fx,section:'verse'}}).gains.particles<plan({...base,fx:{...fx,section:'hook'}}).gains.particles));
check('drop stronger than build',()=>assert(active.gains.festival>plan({...base,fx:{...fx,section:'build'}}).gains.festival));
check('blend starts neutral at boundary',()=>assert.equal(plan({...base,progressMs:0}).active,false));
check('near act exit returns to neutral',()=>assert.equal(plan({...base,progressMs:9999}).active,false));
check('gain smoothly fades near entry',()=>assert(plan({...base,progressMs:200}).gains.festival>=plan({...base,progressMs:700}).gains.festival));
check('strength zero neutral',()=>assert.equal(plan({...base,settings:{...s,festivalDirectorStrengthV850:0}}).gains.festival,1));
check('stronger strength adds restraint',()=>assert(plan({...base,settings:{...s,festivalDirectorStrengthV850:40}}).gains.festival>=active.gains.festival));
check('lower budget adds less modulation',()=>assert(plan({...base,budget:.4}).gains.festival>=active.gains.festival));
check('balanced tier adds less modulation',()=>assert(plan({...base,tier:'balanced'}).gains.festival>=active.gains.festival));
check('larger ensemble adds less modulation',()=>assert(plan({...base,groupCount:4}).gains.festival>=active.gains.festival));
check('lyrics reduce festival noise',()=>assert(plan({...base,lyricsProtected:true}).gains.festival<=active.gains.festival));
check('vocal focus reduces laser',()=>assert(plan({...base,vocalFocus:true}).gains.laser<=active.gains.laser));
check('cinematic quiet stronger',()=>assert(plan({...base,settings:{...s,festivalDirectorStyleV850:'cinematic'}}).gains.festival<=active.gains.festival));
check('festival style freer',()=>assert(plan({...base,settings:{...s,festivalDirectorStyleV850:'festival'}}).gains.festival>=active.gains.festival));
check('variation always 0,1,2',()=>assert([0,1,2].includes(active.variation)));
check('consecutive acts vary',()=>assert.notEqual(focus('spotify-trk-v850',3,'drop').variation,focus('spotify-trk-v850',4,'drop').variation));
check('three successive acts rotate accents',()=>assert.equal(new Set([3,4,5].map(n=>focus('t',n,'drop').focus)).size,3));
check('track-dependent variation',()=>assert(new Set(['t1','t2','t3','t4','t5','t6'].map(t=>focus(t,3,'drop').variation)).size>=2));
check('no new rhythms on seeks',()=>assert.deepEqual(plan(base),plan({...base,progressMs:5000})));
for(const lane of ['laser','led','particles','foam','transition']){
 const p=plan({...base,fx:{...fx,section:'verse'},authoredLanes:[lane]});
 check(`manual ${lane} lane neutral`,()=>assert.equal(p.gains[lane],1));
 check(`manual ${lane} lane preserves other ambience`,()=>assert(p.gains.festival<=1));
}
check('manual V823 mute preserved',()=>assert.equal(dim(0,.3,true),0));
check('manual V823 boost preserved',()=>assert.equal(dim(1.2,.4,true),1.2));
check('automatic modulation only reduces',()=>assert.equal(dim(.8,.5,false),.4));
check('nonfinite input rejected',()=>assert.equal(dim(NaN,.5,false),0));
check('invalid gain rejected',()=>assert.equal(dim(.5,2,false),0));
check('zero stays zero',()=>assert.equal(dim(0,.5,false),0));
check('normalization false',()=>assert.equal(normalize({festivalDirectorV850:false}).festivalDirectorV850,false));
check('normalization style cinematic',()=>assert.equal(normalize({festivalDirectorStyleV850:'cinematic'}).festivalDirectorStyleV850,'cinematic'));
check('normalization style festival',()=>assert.equal(normalize({festivalDirectorStyleV850:'festival'}).festivalDirectorStyleV850,'festival'));
check('normalization invalid style',()=>assert.equal(normalize({festivalDirectorStyleV850:'bad'}).festivalDirectorStyleV850,'balanced'));
check('normalization strength cap',()=>assert.equal(normalize({festivalDirectorStrengthV850:300}).festivalDirectorStrengthV850,100));
check('normalization strength floor',()=>assert.equal(normalize({festivalDirectorStrengthV850:-20}).festivalDirectorStrengthV850,0));
check('normalization NaN default',()=>assert.equal(normalize({festivalDirectorStrengthV850:NaN}).festivalDirectorStrengthV850,65));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const camera=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
check('integration after verified FX cue',()=>assert(stage.indexOf('const festivalShowV850=planSmartFestivalShowV850')>stage.indexOf('const fxCueV810=planConcertFxV810')));
check('V850 respects V823 timeline',()=>assert(stage.includes('authoredLanesV850.includes(\'particles\')')));
check('all five effect lanes integrated',()=>{for(const lane of ['laser','led','particles','foam','transition'])assert(stage.includes(`festivalShowV850.gains.${lane}`));});
check('existing performance governor retained',()=>assert(stage.includes('fxPerfV825.gains.particles')));
check('existing camera director untouched',()=>assert(camera.includes('composeCinematicCameraDirectorV848')));
check('existing V849 seams retained',()=>assert(stage.includes('transitionV849?.active')));
check('festival instances only dimmed',()=>assert(stage.includes('Math.floor(special.co2Count*g)')&&stage.includes('Math.floor(finale.rainCount*g)')));
check('confetti wheels dimmed',()=>assert(stage.includes('Math.floor(finale.wheelCount*g)')));
check('foam prior safety retained',()=>assert(stage.includes('coordinateFestivalFoamV844')));
check('full-stage flash only dimmed',()=>assert(stage.includes('dimFestivalLaneV850(flash.opacity,g,false)')));
check('lyrics and light manual guards retained',()=>assert(stage.includes('lyricsProtected:lyricsProtectedV542')&&stage.includes('manualLighting:manualLightingV763||authoredLightsV386')));
check('UI enables director',()=>assert(ui.includes('festivalDirectorV850:e.target.checked')));
check('UI offers strength',()=>assert(ui.includes('festivalDirectorStrengthV850:+e.target.value')));
check('UI offers style',()=>assert(ui.includes("festivalDirectorStyleV850:e.target.value as ConcertFxSettingsV810['festivalDirectorStyleV850']")));
check('no extra frame loop or randomness',()=>{const src=fs.readFileSync('components/visualizer/smartFestivalShowDirectorV850.ts','utf8');assert(!src.includes('useFrame(')&&!src.includes('Math.random(')&&!src.includes('setInterval('));});
check('package lock versions agree',()=>assert.equal(require('../package.json').version,require('../package-lock.json').version));
check('gates prepend v850',()=>{const scripts=require('../package.json').scripts;for(const k of ['check:fast','check:release','build:preflight'])assert(scripts[k].includes('npm run test:v850 && npm run test:v850:types && npm run test:v849'));});
console.log(`PASS V850: ${count} smart-festival-show-director test groups`);
