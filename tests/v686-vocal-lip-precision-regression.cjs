'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planVocalTimingPrecisionV686:plan,vocalTimingRateV686:rate}=load('components/visualizer/vocalTimingPrecisionV686');
let count=0;
function test(label,fn){try{fn();count++;}catch(e){e.message=`V686 ${label}: ${e.message}`;throw e;}}
const lyrics={synced:true,lines:[{startMs:1000,endMs:1700,text:'Bitte schnell immer',words:[
 {startMs:1000,endMs:1130,text:'Bitte'},
 {startMs:1150,endMs:1270,text:'schnell'},
 {startMs:1310,endMs:1500,text:'immer'}
]}]};
const base={lyrics,effectiveTimeMs:1032,activeWord:'Bitte',playing:true,enabled:true,
 rap:true,verifiedWord:true,roleAllowed:true,manualSilent:false,manualPriority:false,
 reducedMotion:false,preserveAudioMouth:false,editedWords:[],intensity:85};
const sample=(part={},tier='high',protectedSource=false)=>plan({...base,...part},tier,protectedSource);
test('verified first short word',()=>{const c=sample();assert(c.active);assert.equal(c.wordStartMs,1000);assert.equal(c.source,'timed-word');assert(c.onset>0);assert(c.bilabial);});
test('no changes to caller',()=>{const b=structuredClone(base);sample();assert.deepEqual(base,b);});
test('repeat determinism',()=>assert.deepEqual(sample(),sample()));
test('very beginning no fabricated phoneme',()=>{const c=sample({effectiveTimeMs:1000});assert(c.active&&c.bilabial);assert(!('phoneme' in c));});
test('word end not active',()=>assert.equal(sample({effectiveTimeMs:1130}).active,false));
test('unmarked line gap',()=>assert.equal(sample({effectiveTimeMs:1140}).active,false));
test('next word verified',()=>{const c=sample({effectiveTimeMs:1160,activeWord:'schnell'});assert(c.active);assert(!c.bilabial);assert.equal(c.wordStartMs,1150);});
test('wrong activeWord fail closed',()=>assert.equal(sample({activeWord:'Falscher Song'}).active,false));
test('word boundary cannot leak to next word',()=>assert.equal(sample({effectiveTimeMs:1155,activeWord:'Bitte'}).active,false));
test('silence before text neutral',()=>assert.equal(sample({effectiveTimeMs:999}).active,false));
test('empty words neutral',()=>assert.equal(sample({activeWord:' '}).active,false));
test('missing words neutral',()=>assert.equal(sample({lyrics:{synced:true,lines:[{startMs:1000,endMs:2000,text:'a'}]}}).active,false));
test('line synced false neutral',()=>assert.equal(sample({lyrics:{...lyrics,synced:false}}).active,false));
test('null lyrics neutral',()=>assert.equal(sample({lyrics:null}).active,false));
test('high faster than balanced',()=>assert(sample().onset>sample({},'balanced').onset));
test('low neutral',()=>assert.equal(sample({},'low').active,false));
for(const input of [{playing:false},{enabled:false},{rap:false},{verifiedWord:false},{roleAllowed:false},{manualSilent:true},{manualPriority:true},{reducedMotion:true},{preserveAudioMouth:true},{intensity:0},{intensity:NaN},{intensity:Infinity},{effectiveTimeMs:-1},{effectiveTimeMs:NaN},{effectiveTimeMs:Infinity}])test('disabled '+JSON.stringify(input),()=>assert.equal(sample(input).active,false));
test('manual doc protects silent gaps',()=>assert.equal(sample({},'high',true).active,false));
test('edited word timestamp blocks exactly',()=>assert.equal(sample({editedWords:[{startMs:1000,text:'Bitte'}]}).active,false));
test('edited other word permitted',()=>assert.equal(sample({editedWords:[{startMs:1150,text:'schnell'}]}).active,true));
test('lower intensity reduces rate',()=>assert(sample().onset>sample({intensity:20}).onset));
test('finite and bounded output',()=>{for(let t=1000;t<1500;t++){const word=t<1130?'Bitte':t<1150?'':t<1270?'schnell':t<1310?'':'immer';const c=sample({effectiveTimeMs:t,activeWord:word});assert(c.onset>=0&&c.onset<=1&&c.release>=0&&c.release<=1);}});
test('release envelope near last 20ms',()=>{const c=sample({effectiveTimeMs:1120});assert(c.release>0);});
test('release not into silence',()=>assert.equal(sample({effectiveTimeMs:1700}).active,false));
test('connected second word',()=>assert(sample({effectiveTimeMs:1178,activeWord:'schnell'}).rapid));
test('no activity in long isolated word',()=>{const v={synced:true,lines:[{startMs:1000,endMs:2000,words:[{startMs:1000,endMs:1510,text:'unterwegs'}]}]};assert.equal(sample({lyrics:v,effectiveTimeMs:1050,activeWord:'unterwegs'}).active,false);});
const c=sample();
test('bilabial existing close accelerates',()=>assert(rate(c,'lipsClosed',0,.9)>1));
test('bilabial cannot invent seal with closed target',()=>assert.equal(rate(c,'lipsClosed',0,0),1));
test('bilabial no seal if target tiny',()=>assert.equal(rate(c,'lipsClosed',0,.1),1));
test('bilabial cannot force extra closure on release',()=>assert.equal(rate(c,'lipsClosed',.9,.1),1));
test('nonbilabial lipsClosed neutral',()=>assert.equal(rate(sample({effectiveTimeMs:1165,activeWord:'schnell'}),'lipsClosed',0,.8),1));
test('nonbilabial jaw acceleration',()=>assert(rate(sample({effectiveTimeMs:1165,activeWord:'schnell'}),'jaw',0,.6)>1));
test('bilabial jaw attack neutral',()=>assert.equal(rate(c,'jaw',0,.8),1));
for(const name of ['brow','cheek','smile','blink','squint','head','leftArm','rightArm','foot','lyrics'])test('no nonmouth edit '+name,()=>assert.equal(rate(c,name,0,.5),1));
for(const invalid of [NaN,Infinity,-Infinity,-.1,1.1])test('invalid current value '+invalid,()=>assert.equal(rate(c,'jaw',invalid,.4),1));
for(const invalid of [NaN,Infinity,-Infinity,-.1,1.1])test('invalid target '+invalid,()=>assert.equal(rate(c,'jaw',.3,invalid),1));
test('idle rates neutral',()=>{const idle=sample({playing:false});for(const name of ['jaw','wide','round','lipsClosed'])assert.equal(rate(idle,name,0,.8),1);});
test('does not touch interpolated targets',()=>{const target=.47,cur=.3;rate(c,'jaw',cur,target);assert.equal(target,.47);assert.equal(cur,.3);});
test('10,000 simulated frames finite and bounded',()=>{for(let i=0;i<10000;i++){const t=1000+(i%700),word=t<1130?'Bitte':t<1150?'':t<1270?'schnell':t<1310?'':'immer';const cue=sample({effectiveTimeMs:t,activeWord:word},i%3===0?'balanced':'high');for(const ch of ['jaw','wide','round','lipsClosed','brow']){const r=rate(cue,ch,(i%100)/100,((i*7)%100)/100);assert(Number.isFinite(r)&&r>=1&&r<=1.300001);}}});
test('rig integrates after existing V631',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.indexOf('planAdvancedVocalLipSyncV631(')<s.indexOf('planVocalTimingPrecisionV686('));assert(s.includes('vocalTimingRateV686(precisionV686,c,current.current[c],finalMouthTargetV644)'));});
test('source authority guards',()=>{const s=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');assert(s.includes('getLiveVisemeV644()'));assert(s.includes('getLiveVocalEnvelopeV661()'));assert(s.includes('activeStemV686.slots.includes(avatarSlot)'));assert(s.includes('authoredPriorityV499'));assert(s.includes('manualVisemeV644'));});
test('no secondary morph renderer',()=>{const s=fs.readFileSync('components/visualizer/vocalTimingPrecisionV686.ts','utf8');assert(!/useFrame\(|requestAnimationFrame|localStorage|fetch\(|Date\.now\(|Math\.random\(/.test(s));assert(!s.includes('setInterval('));});
test('package and docs',()=>{const p=require('../package.json');assert(Number(p.version.split('-v')[1])>=686);assert(p.scripts['test:quick'].includes('npm run test:v686 &&'));assert(p.scripts['check:release'].includes('npm run test:v686:types'));assert(fs.existsSync('docs/versions/V686-VOCAL-LIP-SYNC-PRECISION.md'));assert(fs.readFileSync('ARCHITECTURE.md','utf8').includes(`**Dokumentationsstand:** V${require('../package.json').version.split('-v')[1]}`));});
console.log(`PASS V686 Vocal & Lip-Sync Precision: ${count} Prüfungen einschließlich 10.000 simulierten Frames`);
