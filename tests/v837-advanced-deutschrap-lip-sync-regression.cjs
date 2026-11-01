'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(837);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedDeutschrapLipSyncV837:plan,deutschrapLipRateV837:rate}=load('components/visualizer/advancedDeutschrapLipSyncV837');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
let total=0;
const check=(name,fn)=>{try{fn();total++;}catch(err){err.message=`V837 ${name}: ${err.message}`;throw err;}};
const words=[
 {text:'Bam',startMs:1000,endMs:1210},
 {text:'oh',startMs:1235,endMs:1475},
 {text:'rage',startMs:1500,endMs:1730},
 {text:'gut',startMs:1750,endMs:1950},
 {text:'jetzt',startMs:1980,endMs:2180},
 {text:'Ruhe',startMs:2400,endMs:2760},
];
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[{text:words.map(w=>w.text).join(' '),startMs:980,endMs:2820,words}]};
const base={lyrics,effectiveTimeMs:1514,activeWord:'rage',playing:true,enabled:true,rap:true,verifiedWord:true,reducedMotion:false,roleAllowed:true,manualSilent:false,manualPriority:false,preserveAudioMouth:false,intensity:90,section:'verse'};
const cue=(t=1514,w='rage',diff={},tier='high',verified=true,protectedSource=false)=>plan({...base,effectiveTimeMs:t,activeWord:w,...diff},tier,verified,protectedSource);
check('real timed evidence active',()=>{const a=cue();assert(a.active);assert.equal(a.source,'verified-timed-word');});
check('connected words only',()=>assert.equal(cue().mode,'connected-flow'));
check('onset evidence envelope',()=>assert(cue().onset>0));
check('end response envelope',()=>assert(cue(1690).release>0));
check('word bounds returned',()=>{assert.equal(cue().wordStartMs,1500);assert.equal(cue().wordEndMs,1730)});
check('explicit bilabial onset',()=>{const a=cue(1014,'Bam');assert.equal(a.mode,'bilabial-onset');assert(a.bilabial)});
check('nonbilabial not labeled',()=>assert.equal(cue().bilabial,false));
check('phrase release only explicit end',()=>{const a=cue(2700,'Ruhe');assert.equal(a.mode,'phrase-release');assert(a.release>0)});
check('bilabial seal only owner target',()=>{const a=cue(1014,'Bam');assert.equal(rate(a,'lipsClosed',0,0),1);assert(rate(a,'lipsClosed',0,.75)>1)});
check('nonbilabial cannot invent seal',()=>assert.equal(rate(cue(),'lipsClosed',0,.9),1));
check('existing closure must exceed minimum',()=>assert.equal(rate(cue(1014,'Bam'),'lipsClosed',0,.19),1));
check('do not speed jaw over B',()=>assert.equal(rate(cue(1014,'Bam'),'jaw',0,.8),1));
check('do not speed wide over B',()=>assert.equal(rate(cue(1014,'Bam'),'wide',0,.8),1));
check('connected jaw attack modest',()=>{const a=rate(cue(),'jaw',0,.6);assert(a>=1&&a<=1.14)});
check('connected vowel attack modest',()=>{const a=rate(cue(),'round',0,.6);assert(a>=1&&a<=1.095)});
check('phrase release gentler jaw',()=>{const a=rate(cue(2700,'Ruhe'),'jaw',.7,.2);assert(a>=.92&&a<=1)});
check('release never changes target',()=>assert.equal(typeof rate(cue(2700,'Ruhe'),'jaw',.7,.2),'number'));
for(const c of ['blink','smile','brow','cheek','squint','eye','hips','shoulders']){
 check(c+' untouched',()=>assert.equal(rate(cue(),c,0,.9),1));
}
for(const [n,d] of Object.entries({paused:{playing:false},disabled:{enabled:false},notRap:{rap:false},
 unverified:{verifiedWord:false},roleDenied:{roleAllowed:false},silent:{manualSilent:true},
 manual:{manualPriority:true},audio:{preserveAudioMouth:true},reduced:{reducedMotion:true},
 noLyrics:{lyrics:null},unsynced:{lyrics:{...lyrics,synced:false}},noWord:{activeWord:null},
 wordMismatch:{activeWord:'falsch'},negativeTime:{effectiveTimeMs:-1},nanTime:{effectiveTimeMs:NaN},
 zeroStrength:{intensity:0},nanStrength:{intensity:NaN},edited:{editedWords:[{startMs:1500,text:'rage'}]},
 expired:{effectiveTimeMs:2820},badText:{activeWord:'??'},lineOnly:{lyrics:{...lyrics,lines:[{text:'no timestamps',startMs:980,endMs:2800}]}},
 invalidStart:{lyrics:{...lyrics,lines:[{...lyrics.lines[0],words:words.map(w=>({...w,startMs:NaN}))}]}},
 })){check(n+' guard',()=>assert.equal(cue(1514,'rage',d).active,false));}
check('low tier guard',()=>assert(!cue(1514,'rage',{},'low').active));
check('explicit singer required',()=>assert(!cue(1514,'rage',{},'high',false).active));
check('manual viseme/stem source required',()=>assert(!cue(1514,'rage',{},'high',true,true).active));
check('balanced envelope lower than high',()=>assert(cue(1514,'rage',{},'balanced').onset<cue().onset));
check('deterministic seek',()=>assert.deepEqual(cue(1690),cue(1690)));
check('no word leak into silence',()=>assert(!cue(2300,'jetzt').active));
check('exact word end guard',()=>assert(!cue(1730,'rage').active));
check('invalid current guard',()=>assert.equal(rate(cue(),'jaw',NaN,.8),1));
check('invalid target guard',()=>assert.equal(rate(cue(),'jaw',0,Infinity),1));
check('out of range current guard',()=>assert.equal(rate(cue(),'jaw',-1,.8),1));
check('out of range target guard',()=>assert.equal(rate(cue(),'jaw',0,1.1),1));
check('equal targets guard',()=>assert.equal(rate(cue(),'jaw',.5,.5),1));
check('empty timeline without words',()=>assert(!cue(1514,'rage',{lyrics:{...lyrics,lines:[]}}).active));
check('inferred line end cannot be phrase release',()=>{const w=[{text:'Letzte',startMs:1000}];const l={...lyrics,lines:[{text:'Letzte',startMs:980,endMs:1480,words:w}]};assert.equal(cue(1450,'Letzte',{lyrics:l}).mode,'none');});
check('slow unconnected word guard',()=>{const w=[{text:'Einsam',startMs:1000,endMs:1600},{text:'dort',startMs:2100,endMs:2300}];const l={...lyrics,lines:[{text:'Einsam dort',startMs:980,endMs:2400,words:w}]};assert(!cue(1100,'Einsam',{lyrics:l}).active);});
check('very short word guard',()=>{const w=[{text:'ja',startMs:1000,endMs:1080},{text:'so',startMs:1090,endMs:1180}];const l={...lyrics,lines:[{text:'ja so',startMs:980,endMs:1200,words:w}]};assert(!cue(1030,'ja',{lyrics:l}).active);});
check('very long word guard',()=>{const w=[{text:'langsam',startMs:1000,endMs:1800},{text:'und',startMs:1810,endMs:1970}];const l={...lyrics,lines:[{text:'langsam und',startMs:980,endMs:2000,words:w}]};assert(!cue(1120,'langsam',{lyrics:l}).active);});
check('never mutate input',()=>{const before=JSON.stringify(base);cue();assert.equal(JSON.stringify(base),before);});
check('no new camera or animation loop',()=>{const s=read('components/visualizer/advancedDeutschrapLipSyncV837.ts');for(const no of ['useFrame(','setTimeout(','morphTargetInfluences[','new AnimationClip','rotation.x +='])assert(!s.includes(no));});
check('integrated in existing V368 renderer',()=>{const s=read('components/visualizer/VocalRigV368.tsx');assert(s.includes('planAdvancedDeutschrapLipSyncV837('));assert(s.includes('deutschrapLipRateV837(articulationV837,c,current.current[c],finalMouthTargetV644)'));});
check('existing viseme / stem guarded',()=>{const s=read('components/visualizer/VocalRigV368.tsx');assert(s.includes('!!protectedMouthV686||!!manualVisemeV644'));});
check('legacy V686 timing remains',()=>assert(read('components/visualizer/VocalRigV368.tsx').includes('vocalTimingRateV686(')));
check('legacy V597 flow remains',()=>assert(read('components/visualizer/VocalRigV368.tsx').includes('rapLipFlowRateV597(')));
check('production scripts updated',()=>{const p=require('../package.json');assert(/^0\.1\.0-v\d+$/.test(p.version));for(const k of ['build:preflight','check:fast','check:release'])assert(p.scripts[k].includes('npm run test:v837 && npm run test:v837:types &&'));});
console.log(`PASS V837 Advanced Deutschrap Lip-Sync: ${total} test groups`);
