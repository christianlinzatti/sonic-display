'use strict';
/* Synthetic, untrusted capture metadata only. Never an actual GLB/Browser validation. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),visualDir=path.join(root,'components/visualizer');
const cached=new Map();
function load(name){if(cached.has(name))return cached.get(name);
 const file=path.join(visualDir,name+'.ts');const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const mod={exports:{}};cached.set(name,mod.exports);
 vm.runInNewContext(js,{module:mod,exports:mod.exports,require:(q)=>{if(q.startsWith('./'))return load(q.slice(2));throw Error('unexpected import '+q);},
 JSON,Date,Set,Number,String,Object,Array,Math}, {filename:file});return mod.exports;
}
const c=load('concertVisualReviewV698'),base=load('concertAcceptanceDashboardV697');
let tests=0,negative=0;const check=(label,fn)=>{try{fn();tests++;}catch(e){e.message=label+': '+e.message;throw e;}};
const copy=o=>JSON.parse(JSON.stringify(o));
const fake=(id='rap-solo',track='track-1',at='2026-10-29T10:00:00Z')=>({scenarioId:id,trackId:track,mode:'headed-local-chromium',actors:id.includes('quartet')?4:id.includes('duet')?2:1,
 width:1280,height:720,date:at,verified:false,moments:[{file:'live-00.png',timeSec:32,act:'verse',shot:'wide'},{file:'live-01.png',timeSec:40,act:'hook',shot:'close'},{file:'live-02.png',timeSec:48,act:'drop',shot:'wide'}]});
const a=c.shotRefV698(fake(),fake().moments[0]),b=c.shotRefV698(fake(),fake().moments[1]);
const draft=()=>({before:a,after:b,category:'lyrics',severity:'hoch',observation:'Lyrics verdecken Performer ab Sekunde 32.',nextStep:'Textfeld höher platzieren und erneut prüfen.',historyEntryId:null});
const stamp=1793270000000;
check('review references originate from canonical scenario and indexed moment',()=>{assert(a);assert(b);assert.equal(a.file,'live-00.png');assert.equal(a.timeSec,32);});
check('identity-safe comparison with two different moments',()=>assert.equal(c.comparableV698(a,b),true));
check('same screenshot cannot be its own comparison',()=>assert.equal(c.comparableV698(a,a),false));
check('same image name on separate captured dates can compare',()=>{const newer=c.shotRefV698(fake('rap-solo','track-1','2026-10-29T11:00:00Z'),fake().moments[0]);assert(c.comparableV698(a,newer));});
check('different tracks cannot be misrepresented as comparable',()=>{const newer=c.shotRefV698(fake('rap-solo','track-2'),fake().moments[1]);assert(!c.comparableV698(a,newer));});
check('different viewport invalid',()=>{const x={...b,width:800};assert(!c.comparableV698(a,x));});
check('different recording modes invalid',()=>{const x={...b,mode:'headless-local-chromium'};assert(!c.comparableV698(a,x));});
check('unexpected scenario never accepted',()=>assert.equal(c.shotRefV698({...fake(),scenarioId:'other'},fake().moments[0]),null));
check('unexpected moment never accepted',()=>assert.equal(c.shotRefV698(fake(),{file:'live-99.png',timeSec:10,act:'',shot:''}),null));
check('failed capture flag never generates a reference',()=>assert.equal(c.shotRefV698({...fake(),verified:true},fake().moments[0]),null));
check('empty archive decodes',()=>assert(c.decodeV698Archive(JSON.stringify(c.emptyV698Archive()))));
check('valid draft adds a bounded annotation',()=>{const result=c.addV698Annotation(c.emptyV698Archive(),draft(),stamp);assert(result);assert.equal(result.annotations.length,1);assert.equal(result.annotations[0].release,'V698');});
const valid=c.addV698Annotation(c.emptyV698Archive(),draft(),stamp);
check('explicit manual-only status never claims release',()=>{const item=valid.annotations[0];assert.equal(item.stage,'offen');assert.equal(item.evidenceVerified,false);assert.equal(item.automaticallyApproved,false);});
check('archived roundtrip exact',()=>{const raw=c.encodeV698Archive(valid);assert(raw);assert.equal(c.decodeV698Archive(raw).annotations[0].category,'lyrics');});
check('update manual stage',()=>{const a=c.updateV698Stage(valid,valid.annotations[0].id,'manuell-geprueft');assert.equal(a.annotations[0].stage,'manuell-geprueft');assert.equal(a.annotations[0].automaticallyApproved,false);});
check('invalid stage cannot be set',()=>assert.equal(c.updateV698Stage(valid,valid.annotations[0].id,'approved'),valid));
check('delete only selected annotation',()=>assert.equal(c.deleteV698Annotation(valid,valid.annotations[0].id).annotations.length,0));
check('unknown item deletion no-op length',()=>assert.equal(c.deleteV698Annotation(valid,'unknown').annotations.length,1));
check('empty notes rejected',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),observation:'Kurz'},stamp),null));
check('empty improvement rejected',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),nextStep:'Kurz'},stamp),null));
check('invalid time blocked',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),after:{...b,timeSec:Infinity}},stamp),null));
check('different track draft blocked',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),after:{...b,trackId:'other-song'}},stamp),null));
check('no same-file comparison within same capture',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),after:a},stamp),null));
check('unknown history entry ID syntax rejected',()=>assert.equal(c.addV698Annotation(c.emptyV698Archive(),{...draft(),historyEntryId:'../fake'},stamp),null));
check('valid V694-style ID linked to matching track only',()=>{const r=c.addV698Annotation(c.emptyV698Archive(),{...draft(),historyEntryId:'1793270000000-1-2'},stamp);assert(r);assert(c.matchesV694Entry(r.annotations[0],{id:'1793270000000-1-2',trackId:'track-1'}));assert(!c.matchesV694Entry(r.annotations[0],{id:'1793270000000-1-2',trackId:'track-2'}));});
check('missing history entry remains unlinked',()=>assert(!c.matchesV694Entry(valid.annotations[0],{id:'1793270000000-1-2',trackId:'track-1'})));
check('untrusted false evidence flags enforce fail-closed',()=>{const r=copy(valid);r.annotations[0].evidenceVerified=true;assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('unknown schema rejected',()=>{const r=copy(valid);r.schema=2;assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('unknown release rejected',()=>{const r=copy(valid);r.annotations[0].release='V999';assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('unknown root field rejected',()=>{const r=copy(valid);r.secret='x';assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('duplicate IDs rejected',()=>{const r=copy(valid);r.annotations.push(copy(r.annotations[0]));assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('size-bound archive rejected',()=>assert.equal(c.decodeV698Archive('X'.repeat(c.V698_MAX_BYTES+1)),null));
check('80 limit enforced',()=>{const r=copy(valid);r.annotations=Array.from({length:81},(_,i)=>({...copy(r.annotations[0]),id:`${stamp}-${i+1}`}));assert.equal(c.decodeV698Archive(JSON.stringify(r)),null);});
check('rollover at 80',()=>{const r=c.emptyV698Archive();for(let i=0;i<81;i++){const next=c.addV698Annotation(r,draft(),stamp+i);assert(next);r.annotations=next.annotations;}assert.equal(r.annotations.length,80);});
check('UI is mounted inside the V697 acceptance dashboard',()=>{const ui=fs.readFileSync(path.join(visualDir,'ConcertAcceptanceDashboardPanelV697.tsx'),'utf8');assert(ui.includes('<ConcertVisualReviewPanelV698 previews={capturePreviews} photos={photos}/>'));});
check('UI never posts private evidence to a server',()=>{const ui=fs.readFileSync(path.join(visualDir,'ConcertVisualReviewPanelV698.tsx'),'utf8');assert(!/\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b/.test(ui));assert(ui.includes('localStorage.setItem'));});
check('no manipulations of V694 localStorage',()=>{const ui=fs.readFileSync(path.join(visualDir,'ConcertVisualReviewPanelV698.tsx'),'utf8');assert(!/localStorage\.setItem\(V694_STORAGE_KEY/.test(ui));assert(!/localStorage\.removeItem\(V694_STORAGE_KEY/.test(ui));});
check('no implicit autosaving',()=>{const ui=fs.readFileSync(path.join(visualDir,'ConcertVisualReviewPanelV698.tsx'),'utf8');assert.equal((ui.match(/localStorage\.setItem\(/g)||[]).length,1);});
check('V696 manual review is untouched',()=>assert.equal(base.V697_STORAGE_KEY,'sonic.v697.acceptance.manual-review.v1'));
check('the generated app has an existing route',()=>assert(fs.readFileSync(path.join(root,'app/acceptance/page.tsx'),'utf8').includes('ConcertAcceptanceDashboardV697')));
check('not pretending image persists after reload',()=>{const ui=fs.readFileSync(path.join(visualDir,'ConcertVisualReviewPanelV698.tsx'),'utf8');assert(ui.includes('Screenshot-Bilddaten bleiben nur im Arbeitsspeicher'));});
// 12,000 distinct malicious or malformed annotation documents are deterministically rejected.
let seed=2463534242;const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
for(let i=0;i<12000;i++){
 const r=copy(valid),v=r.annotations[0];switch(rand()%16){
 case 0:v.before.file='../img.png';break;case 1:v.after.width=0;break;case 2:v.after.trackId='elsewhere';break;
 case 3:v.before.timeSec=NaN;break;case 4:v.after.mode='fake';break;case 5:v.category='secret';break;
 case 6:v.severity='approved';break;case 7:v.stage='automatisch-bestanden';break;case 8:v.observation='no';break;
 case 9:v.nextStep='no';break;case 10:v.historyEntryId='../../bad';break;case 11:v.automaticallyApproved=true;break;
 case 12:v.evidenceVerified=true;break;case 13:v.after=copy(v.before);break;case 14:v.before.scenarioId='fake';break;
 default:v.before.file='live-9999.png';break;}
 assert.equal(c.decodeV698Archive(JSON.stringify(r)),null,`invalid at ${i}`);negative++;
}
check('12k malformed archive payloads fail closed',()=>assert.equal(negative,12000));
console.log(`PASS V698: ${tests} test groups; ${negative} negative observations rejected; no browser/GLB claims`);
