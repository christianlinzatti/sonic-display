#!/usr/bin/env node
'use strict';
/** V1127: deterministic parity and fail-closed performance budget checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1127-'));
function check(label,fn){fn();console.log('PASS V1127 '+label);}
try{
 const compiler=(()=>{try{return require.resolve('typescript/bin/tsc')}catch{return '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc'}})();
 assert(fs.existsSync(compiler),'TypeScript compiler missing; install devDependencies');
 fs.mkdirSync(path.join(tmp,'types'),{recursive:true});
 const run=spawnSync(process.execPath,[compiler,'--typeRoots',path.join(tmp,'types'),
  '-p',path.join(root,'tests/tsconfig.v1127-core.json'),'--noEmit','false',
  '--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(run.status,0,run.stdout+'\n'+run.stderr+'\n'+(run.error?.message||''));
 const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=require(path.join(tmp,'lib/arena360ShowDesignerV1040.js'));
 const {FESTIVAL_CROWD_STYLES_V1125,planFestivalCrowdLiveV1125,sampleFestivalCrowdSectorV1125}=require(path.join(tmp,'lib/aiFestivalCrowdDirectorV1125.js'));
 const {festivalCrowdSectorIndexV1127,festivalCrowdSectorLookupV1127,
   compileFestivalCrowdFrameV1127,readFestivalCrowdSectorV1127,
   NEUTRAL_FESTIVAL_FRAME_V1127}=require(path.join(tmp,'lib/arena360CrowdFrameBudgetV1127.js'));
 const TAU=Math.PI*2;
 const base=generateArenaShowPlanV1040({genre:'hard',title:'V1127 Crowd Frame',durationMs:200000});
 const make=(style='ripple',strength=45,progressMs=140000,tier='high')=>{
  const show=sampleArenaShowPlanV1040(base,{enabled:true,playing:true,reducedMotion:false,
    progressMs,durationMs:200000});
  return planFestivalCrowdLiveV1125({enabled:true,playing:true,reducedMotion:false,
   reactive:true,audienceEnabled:true,phoneSyncEnabled:true,phoneMode:'wave',
   performanceTier:tier,show,style,strength});
 };
 check('256 live configurations preserve exactly eight spatial samples',()=>{
  let configurations=0,compared=0;
  for(const style of FESTIVAL_CROWD_STYLES_V1125)
  for(const strength of [20,30,40,50])
  for(const progressMs of [6000,62000,108000,192000])
  for(const seconds of [0,1.25,3.5,12]){
    const cue=make(style,strength,progressMs),frame=compileFestivalCrowdFrameV1127(cue,seconds);
    assert(cue);assert.equal(frame.length,8);
    for(let sector=0;sector<8;sector++){
      // Two different angles inside the same sector must have identical original results.
      for(const offset of [.2,.75]){
        const angle=-Math.PI+(sector+offset)*TAU/8;
        assert.equal(festivalCrowdSectorIndexV1127(angle),sector);
        const actual=readFestivalCrowdSectorV1127(frame,sector);
        const previous=sampleFestivalCrowdSectorV1125(cue,angle,seconds);
        assert.deepEqual(actual,previous,{style,strength,progressMs,seconds,sector,offset});
        compared++;
      }
    }
    configurations++;
  }
  assert.equal(configurations,256);assert.equal(compared,4096);
 });
 check('cached audience indices match legacy sector assignment on static 3D positions',()=>{
  const audience=Array.from({length:1024},(_,i)=>{
   const angle=-Math.PI+TAU*i/1024;
   return {x:Math.cos(angle)*5,z:Math.sin(angle)*5};
  });
  const lookup=festivalCrowdSectorLookupV1127(audience);
  assert.equal(lookup.length,audience.length);
  for(let i=0;i<audience.length;i++){
   assert.equal(lookup[i],festivalCrowdSectorIndexV1127(Math.atan2(audience[i].z,audience[i].x)));
   assert(lookup[i]>=0&&lookup[i]<8);
  }
  assert.deepEqual(festivalCrowdSectorLookupV1127([{x:NaN,z:0},{x:0,z:Infinity}]),[-1,-1]);
 });
 check('negative angle and wrap-around boundaries are identical to V1125',()=>{
  const cue=make('duet');const frame=compileFestivalCrowdFrameV1127(cue,2.7);
  for(const a of [-99,-Math.PI,-2.1,-.1,0,.8,2.4,Math.PI,Math.PI*3]){
   const sector=festivalCrowdSectorIndexV1127(a);
   assert.deepEqual(readFestivalCrowdSectorV1127(frame,sector),sampleFestivalCrowdSectorV1125(cue,a,2.7));
  }
  assert.equal(festivalCrowdSectorIndexV1127(Infinity),-1);
  assert.equal(festivalCrowdSectorIndexV1127(NaN),-1);
 });
 check('no live permission, pause, manual phone, reduced motion and low GPU fail closed',()=>{
  const show=sampleArenaShowPlanV1040(base,{enabled:true,playing:true,reducedMotion:false,
    progressMs:140000,durationMs:200000});
  const input={enabled:true,playing:true,reducedMotion:false,reactive:true,
    audienceEnabled:true,phoneSyncEnabled:true,phoneMode:'wave',performanceTier:'balanced',
    show,style:'ripple',strength:40};
  for(const overrides of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
    {audienceEnabled:false},{phoneSyncEnabled:false},{phoneMode:'manual'},{performanceTier:'low'},
    {show:null},{strength:80}]){
    const cue=planFestivalCrowdLiveV1125({...input,...overrides});
    assert.equal(cue,null,JSON.stringify(overrides));
    const frame=compileFestivalCrowdFrameV1127(cue,2);
    assert.strictEqual(frame,NEUTRAL_FESTIVAL_FRAME_V1127);
    for(let sector=0;sector<8;sector++)
      assert.deepEqual(readFestivalCrowdSectorV1127(frame,sector),{light:1,rise:0,arms:0,head:0});
  }
  for(const invalid of [NaN,Infinity,-1])
    assert.strictEqual(compileFestivalCrowdFrameV1127(make(),invalid),NEUTRAL_FESTIVAL_FRAME_V1127);
 });
 check('scene and fade changes remain live without mutating source',()=>{
  const initial=make('spotlight',40,90000),other=make('spotlight',40,182000);
  const before=JSON.stringify(initial);
  const f1=compileFestivalCrowdFrameV1127(initial,4),f2=compileFestivalCrowdFrameV1127(other,4);
  assert.notDeepEqual(f1,f2);
  assert.equal(JSON.stringify(initial),before);
  const dim=compileFestivalCrowdFrameV1127({...initial,fade:.1},4);
  assert.notDeepEqual(dim,f1);
  assert.deepEqual(readFestivalCrowdSectorV1127(f1,8),{light:1,rise:0,arms:0,head:0});
  assert.deepEqual(readFestivalCrowdSectorV1127(f1,-1),{light:1,rise:0,arms:0,head:0});
 });
 check('actual renderer reuses one fixed-length frame and static lookup arrays',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/stages/ArenaAudienceV1032.tsx'),'utf8');
  assert.equal((ui.match(/compileFestivalCrowdFrameV1127\(festivalCrowdCueV1127,t\)/g)||[]).length,1);
  for(const source of ['members','phoneMembers','cheeringMembers'])
    assert(ui.includes('festivalCrowdSectorLookupV1127('+source+')'),source);
  for(const role of ['memberSectorsV1127[i]','cheeringSectorsV1127[i]','phoneSectorsV1127[i]'])
    assert(ui.includes('readFestivalCrowdSectorV1127(spatialFrameV1127,'+role+')'),role);
  assert.equal((ui.match(/planFestivalCrowdLiveV1125\(\{/g)||[]).length,1);
  assert(!ui.includes('sampleFestivalCrowdSectorV1125('),'no per-instance V1125 sample in render loop');
  assert(!ui.includes('new InstancedMesh'),'no extra GPU meshes');
  const engine=fs.readFileSync(path.join(root,'lib/arena360CrowdFrameBudgetV1127.ts'),'utf8');
  assert(!/fetch\s*\(|localStorage|setInterval|setTimeout|requestAnimationFrame|Math\.random|govee|WebGLRenderer/i.test(engine));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
console.log('PASS V1127 fixed-cost crowd frame performance');
