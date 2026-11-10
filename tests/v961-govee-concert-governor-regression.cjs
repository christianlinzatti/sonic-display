#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(p){const out=ts.transpileModule(read(p),{fileName:p,reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(out.diagnostics?.length||0,0);const mod={exports:{}};
 vm.runInNewContext(out.outputText,{exports:mod.exports,module:mod,require(){throw Error('No runtime imports allowed');}},
  {filename:p,timeout:10000});return mod.exports;}
const v=load('lib/goveeConcertGovernorV961.ts');
const base={color:{r:10,g:40,b:70},brightness:20};
const desired={color:{r:240,g:120,b:255},brightness:96};
const defaults={enabled:true,playing:true,verified:true};
const plan=(from=base,to=desired,policy=defaults)=>v.governConcertLookV961(from,to,policy);
let tests=0;const test=(name,fn)=>{fn();tests++;console.log('PASS V961 '+name);};
test('default off maintains original V958 settings storage and schema',()=>{
 const x=load('lib/ultimateConcertRoadmapV958.ts');assert.equal(x.DEFAULT_CONCERT_V958.lightGovernorV961,false);
 assert.equal(x.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
 assert.equal(x.normalizeConcertRoadmapV958({enabled:true}).lightGovernorV961,false);
 assert.equal(x.normalizeConcertRoadmapV958({enabled:true,lightGovernorV961:true}).lightGovernorV961,true);
});
test('opt out is identity preserving',()=>assert.equal(plan(base,desired,{...defaults,enabled:false}).look,desired));
test('paused playback never changes a proposed cue',()=>assert.equal(plan(base,desired,{...defaults,playing:false}).look,desired));
test('unverified phase is untouched',()=>assert.equal(plan(base,desired,{...defaults,verified:false}).look,desired));
test('saved V912 lightshow has strict priority',()=>assert.equal(plan(base,desired,{...defaults,savedShowActive:true}).look,desired));
test('authored V354 stage retains exact requested look',()=>assert.equal(plan(base,desired,{...defaults,authoredStageActive:true}).look,desired));
test('recovering lamp uses V934 fallback unchanged',()=>assert.equal(plan(base,desired,{...defaults,recovering:true}).look,desired));
test('a fresh lamp receives a bounded initial brightness',()=>assert.equal(v.governConcertLookV961(undefined,desired,defaults).look.brightness,35));
test('higher brightness is limited to 12 percentage points per dispatch',()=>assert.equal(plan().look.brightness,32));
test('decreases never linger above group brightness cap',()=>assert.equal(plan({...base,brightness:85},{...desired,brightness:5}).look.brightness,5));
test('bounded color deltas for all channels',()=>assert.deepEqual(JSON.parse(JSON.stringify(plan().look.color)),{r:50,g:80,b:110}));
test('brightness never exceeds proposed target',()=>{for(let i=0;i<101;i++)assert.ok(plan({...base,brightness:i},{...desired,brightness:63}).look.brightness<=63);});
test('already safe cue retains original object',()=>{const to={color:{r:20,g:53,b:85},brightness:29};assert.equal(plan(base,to).look,to);});
test('repeated safe transitions converge monotonically',()=>{let from=base;for(let i=0;i<30;i++){const result=plan(from);assert.ok(result.look.brightness>=from.brightness);assert.ok(result.look.brightness<=desired.brightness);from=result.look;}assert.equal(from.brightness,96);assert.deepEqual(JSON.parse(JSON.stringify(from.color)),desired.color);});
test('invalid previous is not synthesized',()=>assert.equal(plan({color:{r:NaN,g:0,b:0},brightness:10},desired).look,desired));
test('invalid target yields identity without a LAN operation',()=>{const to={color:{r:NaN,g:2,b:3},brightness:10};assert.equal(plan(base,to).look,to);});
test('no audio or network work added to pure module',()=>{const code=read('lib/goveeConcertGovernorV961.ts');assert.doesNotMatch(code,/fetch\(|setInterval\(|setTimeout\(|new WebSocket\(|goveeBridgeRequestV909|localStorage|document\./);});
test('existing V909 sender uses the governor inside the original loop only',()=>{const s=read('components/GoveeMusicSyncV909.tsx');assert.match(s,/governConcertLookV961\(previous,(?:recoveryLookV961|voiceLookV970|syncedLookV1027|showLookV1042|roomLookV1096|coordinatedLookV1154)/);assert.match(s,/value:finalLook/);assert.match(s,/sent\.set\(ip,finalLook\)/);assert.match(s,/if\(!changedGoveeLookV911\(previous,finalLook\)\)continue/);});
test('V961 UI explicitly protects authoring and permits opt out',()=>{const s=read('components/ConcertRoadmapStudioV958.tsx');assert.match(s,/checked=\{settings\.lightGovernorV961\}/);assert.match(s,/V961: Sanfte Govee-Lichtwechsel/);assert.match(s,/V912-Lichtshows/);});
test('pre-existing Govee settings and fixtures remain untouched',()=>{const s=read('lib/ultimateConcertRoadmapV958.ts');assert.match(s,/transitionsV960:o\.transitionsV960===true/);assert.match(s,/compactFxV960:o\.compactFxV960===true/);});
test('5000 deterministic fixture/time/genre cases bounded and finite',()=>{const genres=['rap','hardtekk','hardstyle','rock'];for(let i=0;i<5000;i++){
 const from={brightness:i%101,color:{r:i%256,g:(i*3)%256,b:(i*7)%256}};
 const to={brightness:(i*11)%101,color:{r:(i*5)%256,g:(i*9)%256,b:(i*13)%256}};
 const a=plan(from,to);const b=plan(from,to);const x=a.look;
 assert.deepEqual(JSON.parse(JSON.stringify(a)),JSON.parse(JSON.stringify(b)),genres[i%4]);
 assert.ok(x.brightness>=0&&x.brightness<=to.brightness);
 for(const c of ['r','g','b'])assert.ok(x.color[c]>=0&&x.color[c]<=255&&Math.abs(x.color[c]-from.color[c])<=40);
 }});
console.log('V961 PASS '+tests+' groups and 5000 deterministic cases');
