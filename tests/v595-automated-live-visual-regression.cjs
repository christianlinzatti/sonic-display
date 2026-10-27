'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),zlib=require('node:zlib');
const {spawnSync}=require('node:child_process');
const {compareLiveRegression,classifyCue,motionMaskedDifference,chooseScenario,masksForShot}=require('../scripts/v595-visual-regression.cjs');
const {renderV595Report,safeImageRef}=require('../scripts/v595-visual-regression-report.cjs');
const {run,relativePng}=require('../scripts/v595-visual-regression-cli.cjs');
let groups=0;function test(name,cb){try{cb();groups++;}catch(e){e.message=`V595 ${name}: ${e.message}`;throw e;}}
const bounds=(minX=-.3,maxX=.3,minY=-.6,maxY=.6)=>({minX,maxX,minY,maxY});
const shot=(i,changes={})=>({file:`live-${String(i).padStart(2,'0')}.png`,progressMs:1000+3000*i,actors:2,activeIndex:i,
 drawCalls:190,triangles:220000,lyricsMode:'dom-overlay',stageRect:{x:0,y:0,width:640,height:480},
 lyricRect:{x:150,y:390,width:350,height:55},coverage:{nonBackgroundFraction:.4},
 actorBounds:[{meshes:1,bounds:bounds()},{meshes:1,bounds:bounds(.4,.7,-.5,.5)}],warnings:[],
 sceneEvidence:{moment:['verse','duet','hook','drop'][i],act:'',mode:'',shot:'',genre:'deutschrap'},...changes});
const live=(changes={})=>({format:'sonic-v592-live-concert-review',status:'measured-needs-human-review',
 source:'actual-spotify-visualizer-stage',sourceTrack:'fictional-test-track',modelCount:2,progressMs:12000,
 mode:'existing-local-chromium',screen:{width:640,height:480},browser:{userAgent:'test chrome',webglVersion:2},
 frameTiming:{status:'measured',frames:200,averageFps:29,p95FrameMs:35,p99FrameMs:42},
 screenshots:[0,1,2,3].map(i=>shot(i)),...changes});
const analyze=(a=live(),b=live(),m={},reader)=>compareLiveRegression(a,b,m,reader);
function fixture(fn){const root=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v595-'));try{return fn(root);}finally{fs.rmSync(root,{recursive:true,force:true});}}
const png=(w,h,color,paint)=>{
 const pixels=Buffer.alloc((w*3+1)*h),px=Buffer.isBuffer(color)?color:Buffer.from(color);
 for(let y=0;y<h;y++){pixels[y*(w*3+1)]=0;for(let x=0;x<w;x++){
  const c=paint?.(x,y)||px,p=y*(w*3+1)+1+x*3;pixels[p]=c[0];pixels[p+1]=c[1];pixels[p+2]=c[2];}}
 const chunk=(type,data)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const crc=Buffer.alloc(4);const payload=Buffer.concat([Buffer.from(type),data]);let c=0xffffffff;
  for(const b of payload){c^=b;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;}
  crc.writeUInt32BE((c^0xffffffff)>>>0);return Buffer.concat([len,payload,crc]);};
 const hdr=Buffer.alloc(13);hdr.writeUInt32BE(w,0);hdr.writeUInt32BE(h,4);hdr[8]=8;hdr[9]=2;
 return Buffer.concat([Buffer.from('89504e470d0a1a0a','hex'),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(pixels)),chunk('IEND',Buffer.alloc(0))]);
};
const black=()=>png(640,480,[10,10,10]);
test('real V592 live-stage source required',()=>{
 for(const input of [null,{},live({status:'blocked'}),live({source:'v591-concert-scene'}),live({sourceTrack:''})])
  assert.equal(analyze(input,live()).status,'blocked');
});
test('different tracks cannot silently compare',()=>assert.equal(analyze(live(),live({sourceTrack:'another'})).status,'blocked'));
test('different screens cannot silently compare',()=>assert.equal(analyze(live(),live({screen:{width:800,height:600}})).status,'blocked'));
test('different Chromium environment cannot silently compare',()=>assert.equal(analyze(live(),live({browser:{userAgent:'different',webglVersion:2}})).status,'blocked'));
test('different GLB counts cannot silently compare',()=>assert.equal(analyze(live(),live({modelCount:3})).status,'blocked'));
test('unmatched song times do not produce green result',()=>{
 const b=live({screenshots:[0,1,2,3].map(i=>shot(i,{progressMs:20000+i*3000}))});assert.equal(analyze(live(),b).status,'blocked');
});
test('excessive per-frame time offset rejected',()=>{
 const candidate=live({screenshots:[0,1,2,3].map(i=>shot(i,{progressMs:2400+i*3000}))});
 assert.equal(analyze(live(),candidate).status,'blocked');
});
test('unchanged measured evidence requires manual review, never pass',()=>{
 const r=analyze();assert.equal(r.status,'review-required');assert.equal(r.approved,false);assert.equal(r.reviewRequired,true);assert.equal(r.checkpoints.length,4);
});
test('actual solo duet hook and drop labels are recognized',()=>{
 const r=analyze();assert.deepEqual(r.groups.map(g=>g.observations),[1,1,1,1]);assert.deepEqual(r.checkpoints.map(c=>c.kind),['solo','duet','hook','drop']);
});
test('unsupported terms never invent singer or song section',()=>{
 for(const e of [null,{}, {genre:'Deutschrap'}, {act:'festival'}, {focus:'lead'}])assert.equal(classifyCue(e),null);
});
test('real camera and show labels recognized only with literal cues',()=>{
 assert.equal(classifyCue({act:'duet'}),'duet');assert.equal(classifyCue({moment:'chorus'}),'hook');
 assert.equal(classifyCue({mode:'drop'}),'drop');assert.equal(classifyCue({moment:'verse'}),'solo');
});
test('ambiguous or absent scene labels remain unclassified',()=>{
 const r=analyze(live(),live({screenshots:[0,1,2,3].map(i=>shot(i,{sceneEvidence:{moment:''}}))}));
 assert.equal(r.unclassified,4);assert.equal(r.coverage.incomplete,true);
});
test('explicit manual annotations are separated from observed data',()=>{
 const marks={checkpoints:[{kind:'solo',progressMs:4000}]};const r=analyze(live(),live({screenshots:[0,1,2,3].map(i=>shot(i,{sceneEvidence:{moment:''}}))}),marks);
 assert.equal(r.checkpoints[1].kind,'solo');assert.equal(r.checkpoints[1].source,'manual-review-annotation');
});
test('manual annotation validates known categories and finite times',()=>{
 for(const marks of [{checkpoints:[{kind:'unknown',progressMs:1000}]},{checkpoints:[{kind:'hook',progressMs:-2}]},{checkpoints:[{kind:'solo',progressMs:NaN}]},{checkpoints:Array.from({length:17},()=>({kind:'hook',progressMs:2000}))}])
  assert.equal(analyze(live(),live(),marks).status,'blocked');
});
test('ambiguous multiple manual checkpoints rejected',()=>{
 assert.equal(analyze(live(),live(),{checkpoints:[{kind:'hook',progressMs:1000},{kind:'solo',progressMs:1100}]}).status,'blocked');
});
test('normal body animation changes do not trigger naive pixel regression',()=>{
 const a=black(),b=png(640,480,[10,10,10],(x,y)=>x>290&&x<360&&y>70&&y<340?[210,210,210]:null);
 const result=motionMaskedDifference(a,b,shot(0),shot(0),{width:640,height:480});
 assert.equal(result.status,'motion-masked-heuristic-review');assert.equal(result.changedFraction,0);
});
test('changing lyrics within measured text rectangle is motion-masked',()=>{
 const a=black(),b=png(640,480,[10,10,10],(x,y)=>x>170&&x<450&&y>404&&y<426?[250,240,240]:null);
 assert.equal(motionMaskedDifference(a,b,shot(0),shot(0),{width:640,height:480}).changedFraction,0);
});
test('real unmasked stage change is review-only rather than automatic failure',()=>{
 const a=black(),b=png(640,480,[10,10,10],(x,y)=>x<130&&y<380?[200,0,90]:null);
 const diff=motionMaskedDifference(a,b,shot(0),shot(0),{width:640,height:480});assert(diff.changedFraction>.01);
 const r=analyze(live(),live(),{},()=>b);assert.equal(r.approved,false);
});
test('different PNG dimensions are inconclusive',()=>{
 assert.equal(motionMaskedDifference(black(),png(640,481,[0,0,0]),shot(0),shot(0),{width:640,height:480}).status,'incompatible-image-dimensions');
});
test('invalid PNG is incomplete, never misclassified as a passed diff',()=>{
 const r=analyze(live(),live(),{},()=>Buffer.from('x'));assert.equal(r.checkpoints[0].pixelEvidence.status,'invalid-PNG');assert.equal(r.approved,false);
});
test('missing original PNG is not a visual pass',()=>{
 const r=analyze();assert.equal(r.coverage.missingImages,true);assert.equal(r.checkpoints[0].pixelEvidence.status,'missing-original-PNG');
});
test('repeated camera clipping flagged but one-off warning is not repeated',()=>{
 const clipShot=i=>shot(i,{actorBounds:[{meshes:1,bounds:bounds(-1.1,.3)}]});
 const r=analyze(live(),live({screenshots:[clipShot(0),clipShot(1),shot(2),shot(3)]}));
 assert(r.repeatedWarnings.some(w=>w.id==='clipped-avatar'&&w.observedFrames===2));
});
test('repeated lost lyric sync evidence flagged',()=>{
 const s=i=>shot(i,{warnings:['Lyrics nicht als synchronisiert bestätigt']});
 const r=analyze(live(),live({screenshots:[s(0),s(1),shot(2),shot(3)]}));
 assert(r.repeatedWarnings.some(w=>w.id==='missing-sync-evidence'));
});
test('real concert camera cue changes are review warnings not a visual failure',()=>{
 const shifted=live({screenshots:[0,1,2,3].map(i=>shot(i,{sceneEvidence:{moment:['verse','duet','hook','drop'][i],shot:'close-up',mode:'solo'}}))});
 const normal=live({screenshots:[0,1,2,3].map(i=>shot(i,{sceneEvidence:{moment:['verse','duet','hook','drop'][i],shot:'wide',mode:'solo'}}))});
 const r=analyze(normal,shifted);assert(r.repeatedWarnings.some(w=>w.id==='concert-cue-drift'));
 assert.equal(r.approved,false);assert.equal(r.status,'review-required');
});
test('single anomalous screenshot does not become confirmed visual regression',()=>{
 const r=analyze(live(),live({screenshots:[shot(0,{warnings:['Lyrics nicht als synchronisiert bestätigt']}),shot(1),shot(2),shot(3)]}));
 assert(!r.repeatedWarnings.some(w=>w.id==='missing-sync-evidence'));
});
test('unobserved categories cannot ever be silently passed',()=>{
 const missing=live({screenshots:[0,1,2,3].map(i=>shot(i,{sceneEvidence:null}))});
 const r=analyze(missing,missing);assert(r.groups.every(g=>g.status==='not-observed'));
});
test('HTML escapes untrusted data and retains manual review',()=>{
 const r=analyze();r.limitations.push('<script>alert(1)</script>');
 const html=renderV595Report(r,r.checkpoints.map(c=>({checkpoint:c,baselineUrl:'../b/live-00.png',candidateUrl:'../a/live-00.png'})));
 assert(html.includes('&lt;script&gt;'));assert(!html.includes('<script>alert'));assert(html.includes('Manuelle Abnahme'));
});
test('HTML forbids blocked and approved states',()=>{
 assert.throws(()=>renderV595Report({status:'blocked',format:'sonic-v595-live-visual-regression'},[]));
 assert.throws(()=>renderV595Report({...analyze(),approved:true},[]));
});
test('PNG links reject protocol/javascript and absolute URL',()=>{
 for(const v of ['javascript:alert(1)','https://evil/a.png','/etc/passwd.png','../../evil.html'])assert.equal(safeImageRef(v),null);
 assert.equal(safeImageRef('../real/live-00.png'),'../real/live-00.png');
});
test('CLI refuses missing or same-source reports',()=>fixture(root=>{
 const file=path.join(root,'report.json');fs.writeFileSync(file,JSON.stringify(live()));
 const r=spawnSync(process.execPath,['scripts/v595-visual-regression-cli.cjs',`--baseline=${file}`,`--candidate=${file}`],{cwd:process.cwd(),encoding:'utf8'});
 assert.notEqual(r.status,0);assert(r.stderr.includes('BLOCKED'));
}));
test('CLI produces real local JSON and escaped HTML, no baseline mutating',()=>fixture(root=>{
 const bp=path.join(root,'before'),cp=path.join(root,'after'),out=path.join(root,'result');fs.mkdirSync(bp);fs.mkdirSync(cp);
 const a=path.join(bp,'report.json'),b=path.join(cp,'report.json');fs.writeFileSync(a,JSON.stringify(live()));fs.writeFileSync(b,JSON.stringify(live()));
 const bytes=black();for(let i=0;i<4;i++){const name=shot(i).file;fs.writeFileSync(path.join(bp,name),bytes);fs.writeFileSync(path.join(cp,name),bytes);}
 const r=run({baseline:a,candidate:b,out});assert.equal(r.status,'review-required');assert.equal(r.coverage.covered,4);assert.equal(r.coverage.missingImages,false);
 assert(fs.existsSync(path.join(out,'report-v595.html')));assert(fs.readFileSync(path.join(out,'report-v595.html'),'utf8').includes('../before/live-00.png'));
 assert.equal(JSON.parse(fs.readFileSync(a,'utf8')).screenshots.length,4);
}));
test('program files remain report-only without source mutation or network calls',()=>{
 for(const file of ['scripts/v595-visual-regression.cjs','scripts/v595-visual-regression-cli.cjs','scripts/v595-visual-regression-report.cjs']){
  const s=fs.readFileSync(file,'utf8');for(const word of ['fetch(','spotifyApi','localStorage.setItem(','camera.position.set(','mixer.update('])
   assert(!s.includes(word),`${file}: ${word}`);
 }
});
test('V592 captures actual show labels to support V595 without synthetic staging',()=>{
 const code=fs.readFileSync('scripts/v592-live-stage-benchmark.cjs','utf8');assert(code.includes('const sceneEvidence=await evaluate'));
 assert(code.includes('sceneEvidence,lyricsPresent:s.lyricsPresent'));
});
test('package declares V595 test, regression and snapshot commands',()=>{
 const p=require('../package.json');assert.match(p.version,/^0\.1\.0-v\d+$/);assert(Number(p.version.split('-v')[1])>=595);
 for(const cmd of ['test:v595','test:v595:types','test:smoke:v595','verify:v595','benchmark:v595:regress'])assert(p.scripts[cmd],cmd);
});
console.log(`V595 PASS: ${groups} regression groups`);
