'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedDeutschrapLipSyncV837}=load('components/visualizer/advancedDeutschrapLipSyncV837');
const {planDeutschrapVocalV869:plan,deutschrapVocalRateV869:rate,deutschrapVocalExpressionV869:expression}=load('components/visualizer/deutschrapVocalDirectorV869');
const {planMultiArtistVocalV632}=load('components/visualizer/multiArtistVocalDirectorV632');
let total=0;
const check=(name,fn)=>{try{fn();total++}catch(e){console.error("FAILED CASE",name);e.message=`V869 ${name}: ${e.message}`;throw e;}};
const words=[{text:'Bam',startMs:1000,endMs:1210},{text:'oh',startMs:1220,endMs:1380},
 {text:'rage',startMs:1400,endMs:1630},{text:'gut',startMs:1640,endMs:1820},
 {text:'jetzt',startMs:1840,endMs:2070},{text:'Ende',startMs:2300,endMs:2650}];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[{text:words.map(w=>w.text).join(' '),startMs:980,endMs:2680,words}]};
const opt={lyrics,effectiveTimeMs:1410,activeWord:'rage',playing:true,enabled:true,reducedMotion:false,
 rap:true,verifiedWord:true,roleAllowed:true,manualSilent:false,manualPriority:false,preserveAudioMouth:false,intensity:90};
const mark=(options=opt)=>planAdvancedDeutschrapLipSyncV837(options,'high',true,false);
const ctx={tier:'high',trackId:'rap-song',slot:0,count:1,confirmedSinger:true,protectedSource:false,wordCue:mark()};
const get=(input=opt,context=ctx)=>plan(input,context);
function sceneAt(scene='adlib'){
 const cue={active:true,leadSlot:0,singingSlots:[0,1],handoffFrom:null,phase:1,startMs:900,endMs:2700,count:2};
 return planMultiArtistVocalV632({trackId:'rap-song',cueTrackId:'rap-song',timeMs:1410,playing:true,enabled:true,count:2,cue,scene});
}
check('lead rapid active',()=>{const c=get();assert(c.active);assert.equal(c.mode,'rapid-lead');assert.equal(c.evidence,'verified-word')});
check('verified bounds',()=>{assert.equal(get().wordStartMs,1400);assert.equal(get().wordEndMs,1630)});
check('only source evidence not audio',()=>assert(get().evidence!=='measured-phoneme'));
check('seek deterministic',()=>assert.deepEqual(get(),get()));
check('no mutation',()=>{const before=JSON.stringify({opt,ctx});get();assert.equal(JSON.stringify({opt,ctx}),before)});
check('lead short attack acceleration',()=>assert(rate(get(),'jaw',.2,.7)>1));
check('lead release bounded',()=>assert(rate(get({...opt,effectiveTimeMs:1610},{...ctx,wordCue:mark({...opt,effectiveTimeMs:1610})}),'jaw',.7,.2)<=1.035));
check('closure never altered by v869',()=>assert.equal(rate(get(),'lipsClosed',.1,.9),1));
check('jaw untouched when target equals current',()=>assert.equal(rate(get(),'jaw',.2,.2),1));
check('brow expression bounded',()=>assert(expression(get(),'brow',.6)>.6&&expression(get(),'brow',.6)<=.612));
check('mouth target stays untouched',()=>{for(const ch of ['jaw','wide','round','lipsClosed'])assert.equal(expression(get(),ch,.44),.44)});
check('no edits to other body channels',()=>{for(const ch of ['hips','shoulders','foot','eye','blink','smile'])assert.equal(expression(get(),ch,.44),.44)});
check('brow never exceeds unity',()=>assert.equal(expression(get(),'brow',1),1));
check('old V837 cue must be verified',()=>assert(!get(opt,{...ctx,wordCue:{...mark(),source:'none'}}).active));
check('old V837 cue must be active',()=>assert(!get(opt,{...ctx,wordCue:{...mark(),active:false}}).active));
check('invalid stale V837 bounds',()=>assert(!get(opt,{...ctx,wordCue:{...mark(),wordEndMs:1390}}).active));
check('valid flow for final word',()=>{const input={...opt,effectiveTimeMs:2570,activeWord:'Ende'};const cue=get(input,{...ctx,wordCue:mark(input)});assert.equal(cue.mode,'flow-lead')});
check('adlib explicit scene',()=>{const c=get({...opt,verifiedWord:false,activeWord:null},{...ctx,count:2,slot:1,wordCue:mark(),vocalScene:sceneAt()});assert(c.active);assert.equal(c.mode,'authored-adlib');assert.equal(c.evidence,'authored-adlib-interval');assert.equal(c.wordStartMs,-1)});
check('backing smooth only automatic mouth',()=>{const c=get(opt,{...ctx,count:2,slot:1,vocalScene:sceneAt()});assert.equal(rate(c,'jaw',.1,.3),.94);assert.equal(rate(c,'lipsClosed',.1,.3),1)});
check('backing no false mouth target',()=>{const c=get(opt,{...ctx,count:2,slot:1,vocalScene:sceneAt()});assert.equal(expression(c,'jaw',.63),.63)});
check('lead is still word verified on adlib scene',()=>{const c=get(opt,{...ctx,count:2,slot:0,vocalScene:sceneAt()});assert.equal(c.evidence,'verified-word')});
check('duet response uses existing word only',()=>{const c=get(opt,{...ctx,count:2,slot:1,vocalScene:sceneAt('duet')});assert.equal(c.mode,'duet-response')});
check('duet without a verified word disabled',()=>{const c=get({...opt,verifiedWord:false},{...ctx,count:2,slot:1,vocalScene:sceneAt('duet')});assert(!c.active)});
check('lead with no active scene in multiple avatars disabled',()=>assert(!get(opt,{...ctx,count:2}).active));
check('outgoing listener disabled',()=>{const s={...sceneAt(),role:['lead','listener']};assert(!get(opt,{...ctx,count:2,slot:1,vocalScene:s}).active)});
check('unassigned backing disabled',()=>{const s={...sceneAt(),singingSlots:[0]};assert(!get(opt,{...ctx,count:2,slot:1,vocalScene:s}).active)});
check('adlib never inferred from duet',()=>{const s=sceneAt('duet');const c=get(opt,{...ctx,count:2,slot:1,vocalScene:s});assert.notEqual(c.mode,'authored-adlib')});
check('wrong track rejected for backed multi-artist scene',()=>assert(!get(opt,{...ctx,count:2,slot:1,trackId:'another',vocalScene:sceneAt()}).active));
check('solo does not infer an adlib',()=>assert.notEqual(get().mode,'authored-adlib'));
for(const [name,change] of Object.entries({paused:{playing:false},disabled:{enabled:false},notRap:{rap:false},
 singerDenied:{roleAllowed:false},silent:{manualSilent:true},manualPriority:{manualPriority:true},
 reduced:{reducedMotion:true},audioMouth:{preserveAudioMouth:true},noIntensity:{intensity:0},
 nanStrength:{intensity:NaN},nanTime:{effectiveTimeMs:NaN},negativeTime:{effectiveTimeMs:-1}})){
 check(`${name} lead fails closed`,()=>assert(!get({...opt,...change}).active));
 check(`${name} backing fails closed`,()=>assert(!get({...opt,...change},{...ctx,count:2,slot:1,vocalScene:sceneAt()}).active));
}
for(const [name,change] of Object.entries({low:{tier:'low'},noSinger:{confirmedSinger:false},
 protectedSource:{protectedSource:true},blankTrack:{trackId:''},
 slotOut:{slot:2},negativeSlot:{slot:-1},nonintegerSlot:{slot:0.5},
 countZero:{count:0},countFive:{count:5},nonintegerCount:{count:2.5}})){
 check(`${name} lead fails closed`,()=>assert(!get(opt,{...ctx,...change}).active));
 check(`${name} backing fails closed`,()=>assert(!get(opt,{...ctx,count:2,slot:1,vocalScene:sceneAt(),...change}).active));
}
for(const [name,change] of Object.entries({wrongSceneTrack:{trackId:'old'},inactiveScene:{active:false},
 staleScene:{endMs:1410},futureScene:{startMs:1420},staleCount:{count:3},
 badEnd:{endMs:NaN},badStart:{startMs:NaN},outsideRole:{leadSlot:2},
 badMouthGain:{mouthGains:[1,NaN]},missingRole:{role:['lead']},
 duplicateSinger:{singingSlots:[0,0]},missingLead:{singingSlots:[1]}})){
 check(`${name} backing scene rejected`,()=>assert(!get(opt,{...ctx,count:2,slot:1,vocalScene:{...sceneAt(),...change}}).active));
}
const base=get();
for(const channel of ['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint','eye','root','foot']){
 check(`${channel} multiplier finite`,()=>{for(const [a,b] of [[0,1],[1,0],[.13,.41],[.85,.12],[.4,.4]]){
  const v=rate(base,channel,a,b);assert(Number.isFinite(v)&&v>=.93&&v<=1.075);
 }});
 check(`${channel} expression always bounded`,()=>{for(const v of [0,.2,.51,1]){
  const result=expression(base,channel,v);assert(Number.isFinite(result)&&result>=v&&result<=1);
 }});
}
for(const v of [NaN,Infinity,-Infinity,-1,1.2]){
 check(`rate invalid current ${v}`,()=>assert.equal(rate(base,'jaw',v,.4),1));
 check(`rate invalid target ${v}`,()=>assert.equal(rate(base,'jaw',.4,v),1));
 check(`expression invalid target ${v}`,()=>assert.equal(expression(base,'brow',v),v));
}
check('no time carry into gap',()=>{const input={...opt,effectiveTimeMs:2190,activeWord:'jetzt'};assert(!get(input,{...ctx,wordCue:mark(input)}).active)});
check('exact previous word end',()=>{const input={...opt,effectiveTimeMs:1630,activeWord:'rage'};assert(!get(input,{...ctx,wordCue:mark(input)}).active)});
check('source no new renderer/animation/morph writes',()=>{const s=fs.readFileSync(path.join(__dirname,'../components/visualizer/deutschrapVocalDirectorV869.ts'),'utf8');
 for(const banned of ['useFrame(', 'setInterval(', 'setTimeout(', 'morphTargetInfluences[', 'new AnimationClip','rotation.x +='])assert(!s.includes(banned));
});
check('integrated in existing single facial owner',()=>{const s=fs.readFileSync(path.join(__dirname,'../components/visualizer/VocalRigV368.tsx'),'utf8');
 assert(s.includes('planDeutschrapVocalV869(optionsV538'));assert(s.includes('deutschrapVocalExpressionV869(vocalCueV869,c,finalTargetV645)'));
 assert(s.includes('deutschrapVocalRateV869(vocalCueV869,c,current.current[c],finalMouthTargetV644)'));
 assert(s.includes('deutschrapLipRateV837(articulationV837,c,current.current[c],finalMouthTargetV644)'));
 assert(s.includes('protectedSource:!!protectedMouthV686||!!manualVisemeV644'));
 assert(s.includes("authoredAdlibV869?1:vocalTimingRateV686("));
 assert(s.includes("authoredAdlibV869?1:deutschrapLipRateV837("));
 assert(s.includes("authoredAdlibV869?1:rapLipFlowRateV597("));
 assert(s.includes("authoredAdlibV869?1:rapMouthRateV798("));
});
check('new test included in gates',()=>{const scripts=require('../package.json').scripts;for(const key of ['build:preflight','check:fast','check:release','prebuild']){
 assert(scripts[key].includes('npm run test:v869 && npm run test:v869:types &&'));}
 assert.equal(scripts['test:v869'],'node tests/v869-deutschrap-vocal-director-regression.cjs');
});
console.log(`PASS V869 Advanced Deutschrap Vocal Director: ${total} test groups`);
