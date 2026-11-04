'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const q=load('components/visualizer/concertQualityIntelligenceV901');
const a=load('components/visualizer/concertQualityAdvisorV902');
const v=load('components/visualizer/ultimateConcertExperienceV900');
const d=load('components/visualizer/aiConcertDirectorV895');
const t=load('components/visualizer/concertQualityTelemetryV826');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let checks=0;const check=(name,fn)=>{try{fn();checks++}catch(err){err.message=`V902 ${name}: ${err.message}`;throw err}};
const song=[['intro',0,12000,'opening'],['verse',12000,55000,'vocal'],['build',55000,80000,'rise'],['hook',80000,110000,'lift'],['drop',110000,150000,'impact'],['outro',150000,180000,'breath']];
const director=d.buildDirectorPlanV895({trackId:'concert-v902',durationMs:180000,source:'verified-v604',scenes:song.map(([section,startMs,endMs,intent],index)=>({index,section,startMs,endMs,intent}))});
const plan=v.buildUltimatePlanV900(director);
const cue=(ms=34000)=>v.sampleUltimateV900({plan,settings:v.DEFAULT_ULTIMATE_V900,trackId:plan.trackId,durationMs:180000,positionMs:ms,
 playing:true,autoEnabled:true,directorEnabled:true,reducedMotion:false,tier:'high'});
const live={...t.EMPTY_QUALITY_SNAPSHOT_V826,available:true,playing:true,verified:true,targetFps:60,
 fps:59,frameMs:17,p95FrameMs:19,sampleCount:35,pressure:.12,status:'healthy'};
const make=(patch={})=>({trackId:'concert-v902',durationMs:180000,positionMs:34000,playing:true,reducedMotion:false,
 autoEnabled:true,directorEnabled:true,ultimateEnabled:true,plan,cue:cue(),renderer:live,
 cameraEnabled:true,danceEnabled:true,lightsEnabled:true,ledEnabled:true,fxEnabled:true,
 lyricsGuard:true,cameraLyricsGuard:true,danceFootGuard:true,energyExpected:false,...patch});
const report=patch=>q.evaluateConcertQualityV901(make(patch));
const settings=(patch={})=>({ultimate:{enabled:true,intensity:65,protectLyrics:true},
 camera:{enabled:true,intensity:55,protectLyrics:true},
 dance:{enabled:true,intensity:55,protectFootwork:true},
 laser:{enabled:true,intensity:70},particles:{enabled:true,intensity:75},spotlights:{enabled:true,intensity:70},...patch});
const adv=(r=report(),s=settings())=>a.adviseConcertV902(r,s);
const critical=()=>report({renderer:{...live,status:'critical',fps:24,frameMs:41,p95FrameMs:80,pressure:.85}});
const warning=()=>report({renderer:{...live,status:'warning',fps:39,frameMs:27,p95FrameMs:48,pressure:.4}});
const noOpt=()=>report({renderer:null});
check('verified scenes',()=>assert.equal(plan.source,'verified-v604'));
check('healthy no proposals',()=>assert.equal(adv().proposals.length,0));
check('nothing silently applied',()=>{const cfg=settings(),snap=JSON.stringify(cfg);adv(critical(),cfg);assert.equal(JSON.stringify(cfg),snap)});
check('missing live frames no fx suggestion',()=>assert(!adv(noOpt()).proposals.some(x=>x.field==='intensity')));
check('critical creates fx and light suggestions',()=>assert.deepEqual(adv(critical()).proposals.map(x=>x.target),['particles','laser','spotlights','camera']));
check('healthy frame with high p95 proposes camera',()=>assert(adv(report({renderer:{...live,p95FrameMs:51}})).proposals.some(x=>x.target==='camera')));
check('warnings bounded to 8',()=>assert(adv(critical()).proposals.length<=8));
check('diagnostic only does not overwrite settings',()=>{const s=settings();const x=adv(critical(),s);assert.equal(s.particles.intensity,75);assert.equal(x.proposals[0].before,75)});
check('particles decrease',()=>assert.equal(adv(critical()).proposals.find(x=>x.target==='particles').after,55));
check('laser decrease',()=>assert.equal(adv(critical()).proposals.find(x=>x.target==='laser').after,55));
check('spotlight decrease',()=>assert.equal(adv(critical()).proposals.find(x=>x.target==='spotlights').after,60));
check('camera decrease',()=>assert.equal(adv(critical()).proposals.find(x=>x.target==='camera').after,45));
check('warning does not require critical',()=>assert(adv(warning()).proposals.length>0));
check('high pressure accepts healthy status',()=>assert(adv(report({renderer:{...live,pressure:.87}})).proposals.some(x=>x.target==='laser')));
check('no fps optimization when invalid frame count',()=>assert(!adv(report({renderer:{...live,status:'critical',sampleCount:0}})).proposals.some(x=>x.field==='intensity')));
for(const mode of ['paused','disabled','no-evidence']){check(`mode ${mode} no proposals`,()=>{
 let r={...critical(),mode}; assert.deepEqual(a.adviseConcertV902(r,settings()).proposals,[]);
});}
for(const [key,patch] of [['pause',{playing:false}],['auto off',{autoEnabled:false}],['V900 off',{ultimateEnabled:false}],['wrong id',{trackId:'other'}],
 ['unverified',{plan:{...plan,source:'unavailable'}}],['reduced motion',{reducedMotion:true}]])
 check(`gated ${key}`,()=>assert.equal(adv(report(patch)).proposals.length,0));
for(const target of ['particles','laser','spotlights','camera']){
 check(`disabled ${target} never suggested`,()=>assert(!adv(critical(),settings({[target]:{enabled:false,intensity:80}})).proposals.some(x=>x.target===target)));
 check(`zero ${target} never increased`,()=>assert(!adv(critical(),settings({[target]:{enabled:true,intensity:0}})).proposals.some(x=>x.target===target)));
 check(`minimum ${target} never increased`,()=>assert(!adv(critical(),settings({[target]:{enabled:true,intensity:30}})).proposals.some(x=>x.target===target)));
 check(`nan ${target} rejected`,()=>assert(!adv(critical(),settings({[target]:{enabled:true,intensity:NaN}})).proposals.some(x=>x.target===target)));
 check(`string ${target} rejected`,()=>assert(!adv(critical(),settings({[target]:{enabled:true,intensity:'99'}})).proposals.some(x=>x.target===target)));
 check(`max ${target} bounded`,()=>{const rec=adv(critical(),settings({[target]:{enabled:true,intensity:100}})).proposals.find(x=>x.target===target);assert(rec&&rec.after>=0&&rec.after<=100)});
}
check('foot guard suggested only when disabled',()=>{const x=adv(report({danceFootGuard:false}),settings({dance:{enabled:true,protectFootwork:false}}));assert(x.proposals.some(p=>p.id==='foot-v899'&&p.after===true))});
check('foot guard not revived when dance disabled',()=>{const x=adv(report({danceFootGuard:false}),settings({dance:{enabled:false,protectFootwork:false}}));assert(!x.proposals.some(p=>p.target==='dance'))});
check('lyrics guard V900 suggested',()=>{const x=adv(report({lyricsGuard:false}),settings({ultimate:{enabled:true,protectLyrics:false}}));assert(x.proposals.some(p=>p.id==='lyrics-v900'))});
check('lyrics camera guard suggested',()=>{const x=adv(report({cameraLyricsGuard:false}),settings({camera:{enabled:true,protectLyrics:false}}));assert(x.proposals.some(p=>p.id==='lyrics-v897'))});
check('lyrics guard does not enable disabled camera',()=>{const x=adv(report({cameraLyricsGuard:false}),settings({camera:{enabled:false,protectLyrics:false}}));assert(!x.proposals.some(p=>p.target==='camera'))});
check('lyrics guard outside lyric scene absent',()=>{const r=report({positionMs:125000,cue:cue(125000),lyricsGuard:false});assert(!adv(r,settings({ultimate:{enabled:true,protectLyrics:false}})).proposals.some(p=>p.id==='lyrics-v900'))});
check('no energy beat inference',()=>{const x=adv(report({energyExpected:true,renderer:null}));assert(!x.proposals.some(p=>p.id.includes('energy')))});
check('reason field explains actual frame evidence',()=>{const p=adv(critical()).proposals[0];assert(p.why.includes('FPS')&&p.why.includes('nicht songbezogen'))});
check('expected does not guarantee performance',()=>assert(adv(critical()).proposals.every(x=>!x.expected.includes('FPS +'))));
check('no song identifiers in export',()=>{const str=a.exportConcertAdviceV902(critical(),adv(critical()));assert(!str.includes('concert-v902'));assert(!str.includes('trackId'))});
check('preview export cannot be mistaken for applied',()=>{const str=a.exportConcertAdviceV902(critical(),adv(critical()));assert(str.includes('Preview only'));assert.equal(JSON.parse(str).type,'manual-advisor-preview')});
check('first recommendation requires second action',()=>{const x=adv(critical()).proposals[0];assert.equal(x.target,'particles');assert.equal(x.before,75);assert.equal(x.after,55)});
check('confirmed patch exact value',()=>{const x=adv(critical()).proposals[0];assert.deepEqual(a.confirmConcertAdviceV902(x,critical(),settings()),{target:'particles',field:'intensity',before:75,value:55})});
check('null not confirmed',()=>assert.equal(a.confirmConcertAdviceV902(null,critical(),settings()),null));
check('same value changed invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902(x,critical(),settings({particles:{enabled:true,intensity:65}})),null)});
check('effect manually disabled invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902(x,critical(),settings({particles:{enabled:false,intensity:75}})),null)});
check('scene change invalidates',()=>{const x=adv(critical()).proposals[0];const r=critical();assert.equal(a.confirmConcertAdviceV902(x,{...r,sceneIndex:r.sceneIndex+1},settings()),null)});
check('pause invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902(x,report({playing:false}),settings()),null)});
check('warning disappears invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902(x,report(),settings()),null)});
check('reduced motion invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902(x,report({reducedMotion:true}),settings()),null)});
check('tampered target invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902({...x,target:'ultimate'},critical(),settings()),null)});
check('tampered value invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902({...x,after:99},critical(),settings()),null)});
check('tampered before invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902({...x,before:99},critical(),settings()),null)});
check('tampered finding invalidates',()=>{const x=adv(critical()).proposals[0];assert.equal(a.confirmConcertAdviceV902({...x,findingId:'unknown'},critical(),settings()),null)});
check('stale lyrics protection proposal invalidates',()=>{const s=settings({camera:{enabled:true,protectLyrics:false}}),r=report({cameraLyricsGuard:false});const x=adv(r,s).proposals.find(p=>p.id==='lyrics-v897');assert(x);assert.equal(a.confirmConcertAdviceV902(x,r,settings({camera:{enabled:true,protectLyrics:true}})),null)});
check('all patches have strict allowlisted target',()=>{const allowed=['ultimate','camera','dance','laser','particles','spotlights'];for(const p of adv(critical()).proposals)assert(allowed.includes(p.target))});
check('no automatic applies in pure core',()=>assert(!read('components/visualizer/concertQualityAdvisorV902.ts').includes('localStorage')));
check('render components do not poll',()=>assert(!read('components/visualizer/ConcertQualityAdvisorPanelV902.tsx').includes('setInterval')));
check('only explicit confirm button',()=>{const s=read('components/visualizer/ConcertQualityAdvisorPanelV902.tsx');assert(s.includes('Diese Änderung bestätigen'));assert(s.includes('Vorschau anzeigen'))});
check('guarded setters check before values',()=>{const s=read('components/visualizer/LiveFxDeckV881.tsx');assert(s.includes('s.intensity===before'));assert(s.includes('s.protectFootwork===before'))});
check('export no hidden pending state',()=>{const data=JSON.parse(a.exportConcertAdviceV902(critical(),adv(critical())));assert(!('applied' in data))});
// Multiple deterministic settings sweeps; all proposals must be reductions or protective true.
for(let i=0;i<1100;i++)check(`deterministic sweep ${i}`,()=>{
 const s=settings({particles:{enabled:i%7!==0,intensity:i%101},laser:{enabled:i%11!==0,intensity:(i*3)%101},
 spotlights:{enabled:i%5!==0,intensity:(i*7)%101},camera:{enabled:i%4!==0,intensity:(i*9)%101,protectLyrics:true}});
 const r=i%3===0?warning():i%3===1?critical():report({renderer:null});
 const x=adv(r,s),y=adv(r,s);
 assert.deepEqual(x,y);assert(x.proposals.length<=8);
 for(const p of x.proposals){assert(p.sceneIndex>=0);assert.equal(s[p.target].enabled,true);
  assert.equal(p.before,s[p.target][p.field]);
  if(p.field==='intensity'){assert.equal(typeof p.after,'number');assert(p.after<p.before);assert(p.after>=0&&p.after<=100)}
  else assert.equal(p.after,true);
  assert(a.confirmConcertAdviceV902(p,r,s));}
});
// Verified transitions throughout a song; no unknown sections, no active synthesis.
for(let ms=0;ms<180000;ms+=977)check(`song ${ms}`,()=>{
 const r=report({positionMs:ms,cue:cue(ms),renderer:{...live,status:'critical',fps:20,p95FrameMs:80}});
 assert.equal(r.mode,'active');
 const x=adv(r,settings());assert.equal(x.state,'ready');assert(x.proposals.every(y=>y.sceneIndex===r.sceneIndex));
});
for(const [file,needle] of [
 ['components/visualizer/LiveFxDeckV881.tsx','onApplyAdvice={applyAdvisorV902}'],
 ['components/visualizer/ConcertQualityIntelligencePanelV901.tsx','<ConcertQualityAdvisorPanelV902'],
 ['components/visualizer/ConcertQualityAdvisorPanelV902.tsx','confirmConcertAdviceV902'],
 ['components/visualizer/concertQualityAdvisorV902.ts','confirmConcertAdviceV902'],
 ['.github/workflows/v832-continuous-validation.yml','test:v902'],
 ['scripts/verify-v902-windows.ps1','verify:v902:focused'],
 ['ARCHITECTURE.md','**Dokumentationsstand:** V908'],
 ['README.md','Automatic Concert Quality Advisor'],
 ['V902-AUTOMATIC-CONCERT-QUALITY-ADVISOR-README.md','V902'],
 ['V902-VERIFICATION.md','V902']
])check(`wiring ${file}`,()=>assert(read(file).includes(needle)));
check('pkg and lock correct',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert.match(pkg.version,/^0\.1\.0-v(?:902|903|904|905|906|907|908)$/);assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);assert(pkg.scripts['verify:v902:focused'].includes('verify:v901:focused'))});
console.log(`PASS V902 Automatic Concert Quality Advisor: ${checks} checks`);
