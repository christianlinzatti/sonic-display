'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const zlib=require('node:zlib');
const {SCENARIOS,criteriaFor,blankReview,validateReview,validPng,inspectCapture,assessV696,renderHtmlV696,parseOptions,insideRoot,run}=require('../scripts/v696-production-concert-acceptance.cjs');
let tests=0,negative=0;const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v696-'));
function test(label,fn){try{fn();tests++;}catch(e){e.message=`V696 ${label}: ${e.message}`;throw e;}}
const copy=o=>JSON.parse(JSON.stringify(o));
const CRC_TABLE=Array.from({length:256},(_,i)=>{let c=i;for(let j=0;j<8;j++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
function crc32(buf){let c=0xffffffff;for(const b of buf)c=CRC_TABLE[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]),length=Buffer.alloc(4),crc=Buffer.alloc(4);
 length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(body));return Buffer.concat([length,body,crc]);}
function fixturePng(file){const header=Buffer.alloc(13);header.writeUInt32BE(1280,0);header.writeUInt32BE(800,4);header[8]=8;header[9]=6;
 const raw=Buffer.alloc(800*(1280*4+1)),idat=zlib.deflateSync(raw,{level:9});
 const out=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',idat),chunk('IEND',Buffer.alloc(0))]);
 fs.writeFileSync(file,out);}

const baseNow=Date.parse('2026-10-29T09:30:00.000Z');
function fixtureCapture(s,update={}){
 const dir=path.join(tmp,'artifacts/v696/captures',s.id);fs.mkdirSync(dir,{recursive:true});
 const screenshots=[0,1,2].map(i=>{const file=`live-0${i}.png`;fixturePng(path.join(dir,file));return {file,actors:s.actors,progressMs:10000+i*6000,
  actorBounds:Array.from({length:s.actors},()=>({meshes:2,bounds:{minX:-0.2,maxX:0.2,minY:-0.5,maxY:0.8}})),sceneEvidence:{act:i%2?'build':'verse',moment:i%2?'hook':'verse',genre:s.genre==='Deutschrap'?'deutschrap':'hardtekk',shot:'wide'},drawCalls:100};});
 const r={format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',source:'actual-spotify-visualizer-stage',
  capturedAt:'2026-10-29T09:00:00.000Z',mode:'existing-local-chromium',modelCount:s.actors,minGlb:s.actors,
  sourceTrack:s.genre==='Deutschrap'?'real-rap-track':'real-hardtekk-track',progressMs:18000,screen:{width:1280,height:800},
  frameTiming:{status:'measured',averageFps:55-s.actors*3,p95FrameMs:17+s.actors,contextLosses:0},screenshots,...update};
 fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(r));return r;
}
const inspect=()=>SCENARIOS.map(s=>inspectCapture(tmp,s,baseNow));
function filledReview(){const r=blankReview();r.reviewer='QA Operator';r.device='Windows 11 / Desktop GPU';r.browser='Chrome 155';
 r.scenarios.forEach(s=>{s.genreConfirmed=true;s.checks.forEach(c=>{c.status='pass';c.note='Am echten Song visuell bei 00:11 überprüft';c.songTimeSec=11;});});return r;}
try{
 test('exact six immutable ordered ensemble cases',()=>assert.deepEqual(SCENARIOS.map(s=>`${s.genre}/${s.actors}`),[
  'Deutschrap/1','Deutschrap/2','Deutschrap/4','Hardstyle/Hardtekk/1','Hardstyle/Hardtekk/2','Hardstyle/Hardtekk/4']));
 test('unique stable scenario IDs',()=>assert.equal(new Set(SCENARIOS.map(s=>s.id)).size,6));
 test('no invented pass in default reviews',()=>{const r=blankReview();assert(r.scenarios.every(s=>s.checks.every(c=>c.status==='pending')));});
 test('each genre has show-specific criteria',()=>{assert(criteriaFor(SCENARIOS[0]).includes('vocal-lip-sync'));assert(criteriaFor(SCENARIOS[3]).includes('kick-drop-choreography'));});
 test('multi-avatar scenarios check handoffs',()=>assert(criteriaFor(SCENARIOS[1]).includes('performer-handoffs')));
 test('four avatars check legibility',()=>assert(criteriaFor(SCENARIOS[5]).includes('four-performer-legibility')));
 test('input review validated',()=>assert.equal(validateReview(blankReview()).schema,1));
 test('filled manual review validated',()=>assert.equal(validateReview(filledReview()).reviewer,'QA Operator'));
 test('no reports => blocked for all six',()=>{const arr=inspect();assert(arr.every(x=>x.status==='blocked'));const r=assessV696(arr,blankReview());assert.equal(r.status,'blocked');assert.equal(r.approved,false);});
 test('real executable report with no data never succeeds',()=>{const r=spawnSync(process.execPath,['scripts/v696-production-concert-acceptance.cjs','--evaluate'],{cwd:root,encoding:'utf8',timeout:10000});assert.notEqual(r.status,0);});
 test('init creates review without losing modifications',()=>{const options={mode:'init',out:'artifacts/v696/acceptance'};const a=run(tmp,options);assert.equal(a.status,'created');const file=a.path;const original=fs.readFileSync(file,'utf8');
  const b=run(tmp,options);assert.equal(b.status,'existing');assert.equal(original,fs.readFileSync(file,'utf8'));});
 test('missing PNG is invalid',()=>assert.equal(validPng(path.join(tmp,'missing.png')),false));
 for(const s of SCENARIOS)test(`measured fixture for ${s.id}`,()=>{fixtureCapture(s);const cap=inspectCapture(tmp,s,baseNow);assert.equal(cap.status,'measured-needs-human-review');assert.equal(cap.metrics.modelCount,s.actors);});
 test('all six submitted captures need explicit human review',()=>{const r=assessV696(inspect(),blankReview());assert.equal(r.status,'needs-manual-review');assert.equal(r.approved,false);assert.equal(r.scenarios.length,6);});
 test('true comparative FPS calculated only for consistent tracks',()=>{const r=assessV696(inspect(),filledReview());assert.equal(r.status,'ready-for-final-signoff');assert.equal(r.approved,false);assert.equal(r.manualSignoffRequired,true);
  assert(r.comparisons.every(c=>c.comparable));assert.equal(r.comparisons[0].profiles[0].relativeP95ToSolo,1);});
 test('one unresolved checkbox blocks final review',()=>{const v=filledReview();v.scenarios[0].checks[0]={id:v.scenarios[0].checks[0].id,status:'pending',note:'',songTimeSec:null};assert.equal(assessV696(inspect(),v).status,'needs-manual-review');});
 test('one human failure indicates issues found',()=>{const v=filledReview();v.scenarios[0].checks[0].status='fail';assert.equal(assessV696(inspect(),v).status,'issues-found');});
 test('genre confirmation required',()=>{const v=filledReview();v.scenarios[0].genreConfirmed=false;assert.notEqual(assessV696(inspect(),v).status,'ready-for-final-signoff');});
 test('no reviewer or hardware blocks',()=>{const v=filledReview();v.reviewer='';assert.notEqual(assessV696(inspect(),v).status,'ready-for-final-signoff');});
 test('no fps extrapolation to Pi',()=>assert(assessV696(inspect(),blankReview()).limitations.some(x=>x.includes('Raspberry Pi'))));
 test('different tracks block comparable FPS',()=>{const s=SCENARIOS[1];fixtureCapture(s,{sourceTrack:'different-track'});const r=assessV696(inspect(),filledReview());assert.equal(r.comparisons[0].comparable,false);fixtureCapture(s);});
 test('different resolutions block comparable FPS',()=>{const s=SCENARIOS[5];fixtureCapture(s,{screen:{width:1920,height:1080}});const r=assessV696(inspect(),filledReview());assert.equal(r.comparisons[1].comparable,false);fixtureCapture(s);});
 test('different capture modes block comparable FPS',()=>{const s=SCENARIOS[5];fixtureCapture(s,{mode:'headless-local-chromium'});const r=assessV696(inspect(),filledReview());assert(!r.comparisons[1].comparable);fixtureCapture(s);});
 for(const [label,patch] of [
 ['wrong actor count',{modelCount:2}],['wrong min glb',{minGlb:2}],['fake source',{source:'test-fixture'}],
 ['not measured status',{status:'blocked'}],['no track',{sourceTrack:null}],['no frame timing',{frameTiming:{status:'missing'}}],
 ['no screenshots',{screenshots:[]}],['old report',{capturedAt:'2026-09-01T08:00:00Z'}],
 ['future report',{capturedAt:'2026-11-05T08:00:00Z'}],['wrong progress',{progressMs:0}]
 ])test(`reject ${label}`,()=>{const s=SCENARIOS[0];fixtureCapture(s,patch);assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('invalid actor mesh evidence rejected',()=>{const s=SCENARIOS[2];const r=fixtureCapture(s);r.screenshots[0].actorBounds[0].meshes=0;fixtureCapture(s,{screenshots:r.screenshots});assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('unsafe screenshot path rejected',()=>{const s=SCENARIOS[2];const r=fixtureCapture(s);r.screenshots[0].file='../evil.png';fixtureCapture(s,{screenshots:r.screenshots});assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('nonincreasing timestamps rejected',()=>{const s=SCENARIOS[2];const r=fixtureCapture(s);r.screenshots[1].progressMs=10000;fixtureCapture(s,{screenshots:r.screenshots});assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('invalid PNG headers rejected',()=>{const s=SCENARIOS[2];fixtureCapture(s);const image=path.join(tmp,'artifacts/v696/captures/rap-quartet/live-00.png');fs.writeFileSync(image,Buffer.alloc(180));assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('missing PNG rejected',()=>{const s=SCENARIOS[2];fixtureCapture(s);const image=path.join(tmp,'artifacts/v696/captures/rap-quartet/live-00.png');fs.rmSync(image);assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('tampered PNG CRC rejected',()=>{const s=SCENARIOS[2];fixtureCapture(s);const file=path.join(tmp,'artifacts/v696/captures/rap-quartet/live-00.png');const b=fs.readFileSync(file);b[32]^=0x20;fs.writeFileSync(file,b);assert(!validPng(file));assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});
 test('truncated PNG rejected',()=>{const s=SCENARIOS[2];fixtureCapture(s);const file=path.join(tmp,'artifacts/v696/captures/rap-quartet/live-00.png');fs.writeFileSync(file,fs.readFileSync(file).subarray(0,120));assert(!validPng(file));fixtureCapture(s);});
 test('invalid performer bounds rejected',()=>{const s=SCENARIOS[2];const r=fixtureCapture(s);r.screenshots[0].actorBounds[0].bounds={minX:0.9,maxX:-0.9,minY:-0.5,maxY:0.5};fixtureCapture(s,{screenshots:r.screenshots});assert.equal(inspectCapture(tmp,s,baseNow).status,'blocked');fixtureCapture(s);});

 test('review with missing scenario rejected',()=>{const v=blankReview();v.scenarios.pop();assert.throws(()=>validateReview(v));});
 test('review with duplicate scene rejected',()=>{const v=blankReview();v.scenarios[1].id=v.scenarios[0].id;assert.throws(()=>validateReview(v));});
 test('review with invented pass status rejected',()=>{const v=blankReview();v.scenarios[0].checks[0].status='autopass';assert.throws(()=>validateReview(v));});
 test('review pass requires written reason',()=>{const v=blankReview();v.scenarios[0].checks[0].status='pass';v.scenarios[0].checks[0].songTimeSec=10;assert.throws(()=>validateReview(v));});
 test('review pass requires song timestamp',()=>{const v=blankReview();v.scenarios[0].checks[0].status='pass';v.scenarios[0].checks[0].note='Echte Szene manuell überprüft';assert.throws(()=>validateReview(v));});
 test('review forbids invalid timestamps',()=>{const v=blankReview();v.scenarios[0].checks[0].songTimeSec=-1;assert.throws(()=>validateReview(v));});
 test('review rejects mismatched checklist',()=>{const v=blankReview();v.scenarios[0].checks[0].id='not-a-check';assert.throws(()=>validateReview(v));});
 test('untrusted HTML is escaped',()=>{const v=filledReview();v.reviewer='<script>alert(1)</script>';v.scenarios[0].checks[0].note='<img src=x onerror=alert(1)> echt überprüft';const html=renderHtmlV696(assessV696(inspect(),v));assert(!html.includes('<script>alert'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('<img src=x'));});
 test('output HTML contains six review sections',()=>{const h=renderHtmlV696(assessV696(inspect(),filledReview()));assert.equal((h.match(/<table>/g)||[]).length,8);assert(h.includes('Hardstyle/Hardtekk'));});
 test('unsafe command option rejected',()=>assert.throws(()=>parseOptions(['--nope'])));
 test('outside output rejected',()=>assert.throws(()=>insideRoot(tmp,'../../outside')));
 test('absolute output option rejected',()=>assert.throws(()=>parseOptions(['--out=/tmp/evil'])));
 test('unsafe traversal destination rejected',()=>assert.throws(()=>insideRoot(tmp,'../outside')));
 test('read-only source capture is protected',()=>{const o={mode:'evaluate',out:'artifacts/v696/captures/rap-solo/report'};assert.throws(()=>run(tmp,o,baseNow));});
 test('full report written without source mutation',()=>{const v=filledReview();fs.writeFileSync(path.join(tmp,'artifacts/v696/review.json'),JSON.stringify(v));const before=fs.readFileSync(path.join(tmp,'artifacts/v696/captures/rap-solo/report.json'));
  const r=run(tmp,{mode:'evaluate',out:'artifacts/v696/acceptance'},baseNow);assert.equal(r.status,'ready-for-final-signoff');assert.equal(r.approved,false);
  assert(fs.existsSync(path.join(tmp,'artifacts/v696/acceptance.html')));assert.deepEqual(before,fs.readFileSync(path.join(tmp,'artifacts/v696/captures/rap-solo/report.json')));});
 test('broken review JSON causes hard failure without rewriting',()=>{const file=path.join(tmp,'artifacts/v696/review.json');fs.writeFileSync(file,'{broken');assert.throws(()=>run(tmp,{mode:'evaluate',out:'artifacts/v696/acceptance'},baseNow));});
 test('existing review must never be overwritten by init',()=>{const file=path.join(tmp,'artifacts/v696/review.json');assert.equal(run(tmp,{mode:'init',out:'artifacts/v696/acceptance'}).status,'existing');assert.equal(fs.readFileSync(file,'utf8'),'{broken');});
 test('matrix scripts exist and use existing V592 real runner',()=>{const p=require('../package.json');for(const s of SCENARIOS){const cmd=p.scripts[`benchmark:v696:${s.id}`];assert(cmd&&cmd.includes('v592-live-stage-benchmark.cjs'));assert(cmd.includes(`--min-glb=${s.actors}`));assert(cmd.includes(`captures/${s.id}`));}});
 test('package version and fast/release chain',()=>{const p=require('../package.json');assert(/^0\.1\.0-v(?:699|700|701|702|703|70[4-9]|7[1-9]\d|[89]\d\d)$/.test(p.version));assert(p.scripts['test:quick'].includes('npm run test:v699 && npm run test:v699:types &&'));assert(p.scripts['check:release'].includes('npm run test:v699 && npm run test:v699:types &&'));});
 test('no automatic UI manipulation or fake assets in CLI',()=>{const c=fs.readFileSync(path.join(root,'scripts/v696-production-concert-acceptance.cjs'),'utf8');assert(!c.includes('spotify_access_token'));assert(!c.includes('process.env.SPOTIFY'));assert(!c.includes('automaticallyApproved:true'));});
 for(let i=0;i<12000;i++){const r=filledReview(),cases=inspect();const ix=i%6;
  if(i%3===0)cases[ix]={...cases[ix],status:'blocked'};
  else if(i%3===1)r.scenarios[ix].checks[0].status='fail';
  else r.scenarios[ix].genreConfirmed=false;
  const report=assessV696(cases,r);assert.notEqual(report.status,'ready-for-final-signoff');assert.equal(report.approved,false);negative++;
 }
 test('12,000 varied negative acceptance scenarios',()=>assert.equal(negative,12000));
 console.log(`PASS V696: ${tests} test groups, ${negative} fail-closed multi-ensemble scenarios`);
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
