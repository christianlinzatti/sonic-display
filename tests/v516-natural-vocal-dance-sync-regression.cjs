'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {analyzeRapPhraseV516:analyze,synchronizeRapAccentV516:accent,synchronizeRapExpressionV516:express}=load('components/visualizer/naturalDeutschrapSyncV516');
const lyrics={synced:true,lines:[
  {text:'Ich rappe rasend schnell!',startMs:1000,endMs:1820,words:[
    {text:'Ich',startMs:1000,endMs:1110},{text:'rappe',startMs:1120,endMs:1280},{text:'rasend',startMs:1310,endMs:1500},{text:'schnell!',startMs:1530,endMs:1790}]},
  {text:'Großer entspannter Hook',startMs:2300,endMs:3900,words:[
    {text:'Großer',startMs:2300,endMs:2770},{text:'entspannter',startMs:2950,endMs:3400},{text:'Hook',startMs:3560,endMs:3900}]},
  {text:'[Instrumental]',startMs:4400,endMs:5500,words:[]},
]};
const base={active:true,source:'word',confidence:'lyrics-word',lineIndex:0,wordIndex:1,role:'lead',head:.025,chest:.045,arms:.075,side:-.8};
const opts={lyrics,progressMs:1200,trackId:'track-deutschrap',slot:0,count:1,playing:true,reducedMotion:false,rap:true,authored:false,section:'verse'};
let a=accent(base,opts),p=analyze(lyrics,0,1,1200);
assert(p&&p.density==='fast'&&p.evidence==='word-timestamps');
assert(a!==base&&a.arms<base.arms*.7&&a.head>0&&a.chest>0);
assert.equal(a.side,base.side);assert.equal(a.role,base.role);assert.equal(a.lineIndex,base.lineIndex);assert.equal(a.wordIndex,base.wordIndex);
assert.deepEqual(accent(base,opts),a,'seek determinism');
const relaxed={...base,lineIndex:1,wordIndex:0};
const relaxedOpts={...opts,progressMs:2570,section:'hook'};
const r=accent(relaxed,relaxedOpts);assert(analyze(lyrics,1,0,2570).density!=='fast'&&r.arms>a.arms);
for(const off of [{playing:false},{reducedMotion:true},{rap:false},{authored:true},{trackId:''},
 {progressMs:NaN},{progressMs:-20},{progressMs:1850},{slot:5},{section:'break'},
 {count:4},{lyrics:{...lyrics,synced:false}}]){
 assert.strictEqual(accent(base,{...opts,...off}),base,`input gate: ${JSON.stringify(off)}`);
}
const cast={active:true,lineIndex:0,singingSlots:[1],handoffFrom:null,phase:1,role:'feature',style:'solo'};
assert.strictEqual(accent(base,{...opts,count:2,casting:cast,slot:0}),base,'silent lead is not promoted');
assert(accent({...base,role:'feature'},{...opts,count:2,casting:cast,slot:1}).arms<a.arms+1e-10,'authored feature retains calm rap');
const duo={...cast,singingSlots:[0,1],style:'duet'};
assert(accent(base,{...opts,count:2,casting:duo,slot:0})!==base);
assert(accent({...base,role:'duet'},{...opts,count:2,casting:duo,slot:1}).role==='duet');
const background={...base,role:'background'};assert.strictEqual(accent(background,{...opts,count:2,casting:duo}),background,'background should pass unchanged');
for(const cue of [{...base,source:'line'},{...base,active:false},{...base,confidence:'lyrics-line'},
  {...base,wordIndex:44}])assert.strictEqual(accent(cue,opts),cue);
assert(!analyze(lyrics,0,1,1285),'do not extrapolate across actual word gaps');
assert(!analyze(lyrics,0,1,2500),'no wrong line extension');
assert(!analyze(lyrics,2,0,4600),'no synthetic instrumental word');
const expression={active:true,evidence:'timed-word',headPitch:-.015,headTilt:.009,chestLean:-.009,
 leftArm:-.018,rightArm:.019,brow:.028,cheek:.022,squint:.011};
const e=express(expression,{lyrics,effectiveTimeMs:1180,section:'verse'});
assert(e.active&&e.leftArm!==expression.leftArm&&Math.abs(e.leftArm)<Math.abs(expression.leftArm));
assert(e.brow<=expression.brow&&e.cheek<=expression.cheek);
const inactive={...expression,active:false};assert.strictEqual(express(inactive,{lyrics,effectiveTimeMs:1180}),inactive);
assert.strictEqual(express(expression,{lyrics,effectiveTimeMs:1900}),expression,'gap produces no new face accent');
assert.strictEqual(express(expression,{lyrics:null,effectiveTimeMs:1180}),expression);
assert.strictEqual(express(expression,{lyrics:{...lyrics,synced:false},effectiveTimeMs:1180}),expression);
const cls=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
assert(cls.includes('synchronizeRapAccentV516(dynamicRapV583.accent,')&&cls.includes('coordinateRapDanceV526(synchronizedRapV516')&&cls.includes('refineDeutschrapGestureV538(unifiedRapV526,')&&cls.includes('correctAutomaticAccentV515(wordDanceV567,'));
assert(cls.includes("authored:avatarMotionMode==='choreography'")&&cls.includes('casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472'));
for(const file of ['gltfVocalPerformanceV492.ts','ProceduralDancerAvatarV492.tsx','VocalRigV368.tsx']){
 const content=fs.readFileSync('components/visualizer/'+file,'utf8');
 assert(content.includes('expressiveRapV510=synchronizeRapExpressionV516(expressiveRapV510,'),file);
 assert(content.includes('composeExpressiveRap')&&content.includes('authoredRoleAllowed:'),file);
}
let samples=0;
for(let i=0;i<32000;i++){
 const line=i%2,word=i%3,wordRef=lyrics.lines[line].words[word];
 const t=wordRef.startMs+Math.min(60,(wordRef.endMs-wordRef.startMs)*.25);
 const target={...base,lineIndex:line,wordIndex:word,role:i%7===0?'feature':'lead',arms:(i%101)/100*.11};
 const inputs={...opts,progressMs:t,count:i%2===0?1:4,slot:i%2===0?0:1,
   casting:i%2===0?null:{...cast,lineIndex:line,singingSlots:[1]},section:i%4===0?'hook':'verse'};
 const result=accent(target,inputs);
 assert(Number.isFinite(result.head)&&Number.isFinite(result.chest)&&Number.isFinite(result.arms));
 assert(result.arms>=0&&result.arms<=.11&&result.head>=0&&result.head<=.055&&result.chest<=.09);
 assert(result.role===target.role&&result.source===target.source&&result.lineIndex===line);
 assert(result.side===target.side,'left/right gesture assignments unchanged');
 const ex=express(expression,{lyrics,effectiveTimeMs:t});
 for(const key of ['headPitch','headTilt','chestLean','leftArm','rightArm','brow','cheek','squint'])assert(Number.isFinite(ex[key]));
 samples++;
}
const pkg=require('../package.json');assert(/^0\.1\.0-v(516|51[7-9]|5[2-9][0-9]|[6-9][0-9]{2})$/.test(pkg.version),'V516 regression must run in V516+ package');
assert(pkg.scripts['build:preflight'].includes('npm run test:v516 && npm run test:v516:types && npm run test:v515'),'V516 regression chain remains intact after newer preflight tests');
console.log(`PASS V516 Natural Vocal & Dance Synchronization: ${samples} Deutschrap/duet/chorus frames, timed words only, sealed lip channels, authored roles, manual guards, three rendering paths`);
